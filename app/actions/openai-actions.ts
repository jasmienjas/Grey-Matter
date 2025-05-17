"use server"

import { OpenAI } from "openai"
import { v4 as uuidv4 } from "uuid"

// Initialize OpenAI client - this will only run on the server since this is a server action file
let openai: OpenAI | null = null

// Only initialize the client when this code runs on the server
if (typeof window === "undefined") {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  } catch (error) {
    console.error("Error initializing OpenAI client:", error)
  }
}

export async function generateAIResponse(prompt: string) {
  const requestId = uuidv4().substring(0, 8)
  console.log(`[${requestId}] Server Action: generateAIResponse called`)
  console.log(`[${requestId}] Prompt length: ${prompt.length}`)
  console.log(`[${requestId}] Prompt preview: ${prompt.substring(0, 100)}...`)

  try {
    // Check if OpenAI client was initialized successfully
    if (!openai) {
      console.error(`[${requestId}] OpenAI client was not initialized`)
      return {
        success: false,
        error: "OpenAI client initialization failed. Please check server logs.",
        requestId,
      }
    }

    console.log(`[${requestId}] Calling OpenAI API directly from server action`)

    const startTime = Date.now()
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that analyzes moral dilemmas and provides ethical reasoning. For each dilemma, provide unique, thoughtful analysis that considers multiple ethical frameworks. Your reasoning must be specific to the dilemma details. Avoid generic responses.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 1000,
      presence_penalty: 0.6,
      frequency_penalty: 0.6,
    })
    const endTime = Date.now()

    console.log(`[${requestId}] OpenAI API call completed in ${endTime - startTime}ms`)

    const text = response.choices[0].message.content || ""
    console.log(`[${requestId}] Response length: ${text.length}`)
    console.log(`[${requestId}] Response preview: ${text.substring(0, 100)}...`)

    return {
      success: true,
      text,
      model: "gpt-4o",
      requestId,
    }
  } catch (error: any) {
    console.error(`[${requestId}] Error calling OpenAI API:`, error)

    // Provide detailed error information
    return {
      success: false,
      error: error.message || "Unknown error",
      errorType: error.name,
      errorCode: error.code,
      requestId,
    }
  }
}
