"use server"

import { createClient } from "@/lib/supabase/server"
import { generateAIResponse } from "./openai-actions"
import { analyzeMoralFramework } from "@/lib/moral-framework-utils"
import type { DilemmaWithOptions, UserResponse, ConsistencyScore } from "@/types/database"

export async function fetchDilemmas() {
  const supabase = createClient()

  // Fetch dilemmas with their options
  const { data: dilemmas, error } = await supabase
    .from("dilemmas")
    .select(
      `
      id,
      title,
      description,
      scenario,
      options:dilemma_options(
        id,
        option_id,
        text,
        description,
        percentage
      )
    `,
    )
    .order("id")

  if (error) {
    console.error("Error fetching dilemmas:", error)
    return []
  }

  // Fetch AI responses for each dilemma
  const dilemmasWithAI = await Promise.all(
    dilemmas.map(async (dilemma) => {
      const { data: aiResponses } = await supabase
        .from("ai_responses")
        .select("*")
        .eq("dilemma_id", dilemma.id)
        .order("created_at", { ascending: false })
        .limit(1)

      return {
        ...dilemma,
        aiResponse: aiResponses && aiResponses.length > 0 ? aiResponses[0] : null,
      }
    }),
  )

  return dilemmasWithAI as DilemmaWithOptions[]
}

export async function saveUserResponse(response: UserResponse) {
  const supabase = createClient()

  // Check if a response already exists for this session and dilemma
  const { data: existingResponses, error: fetchError } = await supabase
    .from("user_responses")
    .select("*")
    .eq("session_id", response.session_id)
    .eq("dilemma_id", response.dilemma_id)

  if (fetchError) {
    console.error("Error checking for existing response:", fetchError)
    return { success: false, error: fetchError.message }
  }

  // If a response exists, update it; otherwise, insert a new one
  if (existingResponses && existingResponses.length > 0) {
    const { error: updateError } = await supabase
      .from("user_responses")
      .update({
        option_id: response.option_id,
        reasoning: response.reasoning,
      })
      .eq("id", existingResponses[0].id)

    if (updateError) {
      console.error("Error updating response:", updateError)
      return { success: false, error: updateError.message }
    }
  } else {
    const { error: insertError } = await supabase.from("user_responses").insert([response])

    if (insertError) {
      console.error("Error saving response:", insertError)
      return { success: false, error: insertError.message }
    }
  }

  return { success: true }
}

export async function saveConsistencyScore(score: ConsistencyScore) {
  const supabase = createClient()

  // Check if a score already exists for this session
  const { data: existingScores, error: fetchError } = await supabase
    .from("consistency_scores")
    .select("*")
    .eq("session_id", score.session_id)

  if (fetchError) {
    console.error("Error checking for existing score:", fetchError)
    return { success: false, error: fetchError.message }
  }

  // If a score exists, update it; otherwise, insert a new one
  if (existingScores && existingScores.length > 0) {
    const { error: updateError } = await supabase
      .from("consistency_scores")
      .update({
        human_score: score.human_score,
        ai_score: score.ai_score,
      })
      .eq("id", existingScores[0].id)

    if (updateError) {
      console.error("Error updating score:", updateError)
      return { success: false, error: updateError.message }
    }
  } else {
    const { error: insertError } = await supabase.from("consistency_scores").insert([score])

    if (insertError) {
      console.error("Error saving score:", insertError)
      return { success: false, error: insertError.message }
    }
  }

  return { success: true }
}

export async function fetchUserResponses(sessionId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("user_responses").select("*").eq("session_id", sessionId)

  if (error) {
    console.error("Error fetching user responses:", error)
    return []
  }

  return data || []
}

export async function getOrCreateAIResponse(dilemmaId: string, options: any[], forceRegenerate = false) {
  const supabase = createClient()

  // If not forcing regeneration, check if we already have a response
  if (!forceRegenerate) {
    const { data: existingResponses, error: fetchError } = await supabase
      .from("ai_responses")
      .select("*")
      .eq("dilemma_id", dilemmaId)
      .order("created_at", { ascending: false })
      .limit(1)

    if (!fetchError && existingResponses && existingResponses.length > 0) {
      console.log(`Using existing AI response for dilemma ${dilemmaId}`)
      return existingResponses[0]
    }
  }

  // Generate a new response
  console.log(`Generating new AI response for dilemma ${dilemmaId}`)

  try {
    // Fetch the dilemma details
    const { data: dilemma, error: dilemmaError } = await supabase
      .from("dilemmas")
      .select("*")
      .eq("id", dilemmaId)
      .single()

    if (dilemmaError || !dilemma) {
      console.error(`Error fetching dilemma ${dilemmaId}:`, dilemmaError)
      throw new Error(`Failed to fetch dilemma: ${dilemmaError?.message || "Unknown error"}`)
    }

    // Prepare the prompt for the AI
    const prompt = `
      You are analyzing a moral dilemma. Please provide your reasoning and choose one of the options.
      
      Dilemma: ${dilemma.title}
      
      Description: ${dilemma.description}
      
      Scenario: ${dilemma.scenario}
      
      Options:
      ${options.map((option, index) => `${index + 1}. ${option.text}: ${option.description || ""}`).join("\n")}
      
      First, provide your ethical reasoning for this dilemma in 3-5 sentences. Consider different ethical frameworks like deontology, consequentialism, utilitarianism, and relational ethics.
      
      Then, clearly state which option you choose by writing "I choose option X" where X is the number of your chosen option.
    `

    // Call the OpenAI API
    const aiResponse = await generateAIResponse(prompt)

    if (!aiResponse.success) {
      console.error(`Error generating AI response for dilemma ${dilemmaId}:`, aiResponse.error)
      throw new Error(`Failed to generate AI response: ${aiResponse.error || "Unknown error"}`)
    }

    // Parse the response to extract the chosen option
    const responseText = aiResponse.text
    let chosenOptionIndex = -1

    // Look for "I choose option X" pattern
    const choiceMatch = responseText.match(/I choose option (\d+)/i)
    if (choiceMatch && choiceMatch[1]) {
      chosenOptionIndex = Number.parseInt(choiceMatch[1], 10) - 1 // Convert to zero-based index
    } else {
      // Fallback: look for option numbers in the text
      for (let i = 0; i < options.length; i++) {
        const optionNumber = i + 1
        const optionRegex = new RegExp(`option ${optionNumber}\\b|option${optionNumber}\\b|#${optionNumber}\\b`, "i")
        if (optionRegex.test(responseText)) {
          chosenOptionIndex = i
          break
        }
      }
    }

    // If we still couldn't determine the option, use a fallback
    if (chosenOptionIndex < 0 || chosenOptionIndex >= options.length) {
      console.warn(`Could not determine chosen option for dilemma ${dilemmaId}, using random option`)
      chosenOptionIndex = Math.floor(Math.random() * options.length)
    }

    const chosenOption = options[chosenOptionIndex]

    // Analyze the moral framework used in the response
    const framework = analyzeMoralFramework(responseText)

    // Calculate a consistency score (this is a placeholder - in a real app, you'd use a more sophisticated algorithm)
    const consistencyScore = Math.floor(Math.random() * 21) + 80 // 80-100 range

    // Save the response to the database
    const { data: savedResponse, error: saveError } = await supabase
      .from("ai_responses")
      .insert([
        {
          dilemma_id: dilemmaId,
          option_id: chosenOption.option_id,
          reasoning: responseText,
          consistency_score: consistencyScore,
          framework: framework,
        },
      ])
      .select()
      .single()

    if (saveError) {
      console.error(`Error saving AI response for dilemma ${dilemmaId}:`, saveError)
      throw new Error(`Failed to save AI response: ${saveError.message}`)
    }

    return savedResponse
  } catch (error) {
    console.error(`Error in getOrCreateAIResponse for dilemma ${dilemmaId}:`, error)

    // Create a fallback response
    return {
      dilemma_id: dilemmaId,
      option_id: options[0].option_id, // Default to first option
      reasoning: "[FALLBACK RESPONSE] The AI was unable to analyze this dilemma due to an error.",
      consistency_score: 75, // Default consistency score
      framework: "UNKNOWN",
    }
  }
}

export async function getCommunityPercentages(dilemmaId: string) {
  const supabase = createClient()

  // Get total responses for this dilemma
  const { count: totalCount, error: countError } = await supabase
    .from("user_responses")
    .select("*", { count: "exact", head: true })
    .eq("dilemma_id", dilemmaId)

  if (countError) {
    console.error("Error getting total count:", countError)
    return []
  }

  if (!totalCount || totalCount === 0) {
    // If no responses, return empty array
    return []
  }

  // Get count by option
  const { data: optionCounts, error: optionError } = await supabase
    .from("user_responses")
    .select("option_id, count")
    .eq("dilemma_id", dilemmaId)
    .group("option_id")

  if (optionError) {
    console.error("Error getting option counts:", optionError)
    return []
  }

  // Calculate percentages
  return optionCounts.map((item) => ({
    option_id: item.option_id,
    percentage: Math.round((item.count / totalCount) * 100),
  }))
}
