"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoralHeader } from "@/components/moral-header"
import { MoralFooter } from "@/components/moral-footer"
import { FrameworkDistributionChart } from "@/components/framework-distribution-chart"
import { MoralFrameworkBadge } from "@/components/moral-framework-badge"
import { FRAMEWORK_INFO, type MoralFramework } from "@/lib/moral-framework-utils"
import { fetchDilemmas } from "../actions/dilemma-actions"
import type { DilemmaWithOptions } from "@/types/database"
import { Loader2 } from "lucide-react"

export default function AnalysisPage() {
  const [dilemmas, setDilemmas] = useState<DilemmaWithOptions[]>([])
  const [loading, setLoading] = useState(true)
  const [frameworkDistribution, setFrameworkDistribution] = useState<Record<MoralFramework, number>>({
    DEO: 0,
    CON: 0,
    UTL: 0,
    REL: 0,
    MIXED: 0,
    UNKNOWN: 0,
  })

  useEffect(() => {
    const loadDilemmas = async () => {
      try {
        const dilemmasData = await fetchDilemmas()
        setDilemmas(dilemmasData)

        // Calculate framework distribution
        const distribution: Record<MoralFramework, number> = {
          DEO: 0,
          CON: 0,
          UTL: 0,
          REL: 0,
          MIXED: 0,
          UNKNOWN: 0,
        }

        dilemmasData.forEach((dilemma) => {
          if (dilemma.aiResponse?.framework) {
            const framework = dilemma.aiResponse.framework as MoralFramework
            distribution[framework] = (distribution[framework] || 0) + 1
          } else {
            distribution.UNKNOWN++
          }
        })

        setFrameworkDistribution(distribution)
        setLoading(false)
      } catch (error) {
        console.error("Error loading dilemmas:", error)
        setLoading(false)
      }
    }

    loadDilemmas()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <MoralHeader />

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  AI Ethical Framework Analysis
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl">
                  Explore how GPT-4o approaches moral dilemmas through different ethical frameworks
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-gray-600 animate-spin mb-4" />
                <p className="text-lg text-gray-600">Loading analysis data...</p>
              </div>
            ) : (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="dilemmas">Dilemma Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ethical Framework Distribution</CardTitle>
                      <CardDescription>
                        Analysis of which ethical frameworks GPT-4o tends to use in its reasoning
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FrameworkDistributionChart distribution={frameworkDistribution} />

                      <div className="mt-8 space-y-6">
                        <h3 className="text-xl font-bold">Understanding Ethical Frameworks</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          {Object.values(FRAMEWORK_INFO).map((info) => (
                            <div key={info.code} className="p-4 rounded-lg border">
                              <div className="flex items-center gap-2 mb-2">
                                <MoralFrameworkBadge framework={info.code as MoralFramework} showInfo={false} />
                                <h4 className="font-bold">{info.name}</h4>
                              </div>
                              <p className="text-sm text-gray-600">{info.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Implications for AI Ethics</CardTitle>
                      <CardDescription>What this analysis reveals about AI ethical reasoning</CardDescription>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                      <p>
                        The distribution of ethical frameworks used by GPT-4o provides insight into how large language
                        models approach moral reasoning. This analysis reveals several key patterns:
                      </p>

                      <ul>
                        <li>
                          <strong>Framework Preferences:</strong> GPT-4o shows tendencies toward certain ethical
                          frameworks over others, which may reflect biases in its training data or the way ethical
                          reasoning is typically structured in written texts.
                        </li>
                        <li>
                          <strong>Consistency vs. Context:</strong> The model sometimes applies different frameworks to
                          similar dilemmas, suggesting it may be sensitive to subtle contextual differences or that its
                          ethical reasoning isn't fully consistent.
                        </li>
                        <li>
                          <strong>Human Alignment:</strong> Comparing the AI's framework choices with human preferences
                          helps us understand where AI ethics might diverge from human moral intuitions.
                        </li>
                      </ul>

                      <p>
                        This analysis is valuable for AI alignment research, helping to ensure that AI systems reason
                        about ethical questions in ways that align with human values and moral frameworks.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="dilemmas" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Dilemma-Specific Analysis</CardTitle>
                      <CardDescription>
                        Examine which ethical frameworks GPT-4o applies to specific moral dilemmas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        {dilemmas.map((dilemma) => (
                          <div key={dilemma.id} className="p-6 rounded-lg border">
                            <h3 className="text-xl font-bold mb-2">{dilemma.title}</h3>
                            <p className="text-gray-600 mb-4">{dilemma.description}</p>

                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                              <p className="text-sm">{dilemma.scenario}</p>
                            </div>

                            {dilemma.aiResponse ? (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">AI's Ethical Framework:</h4>
                                  <MoralFrameworkBadge
                                    framework={(dilemma.aiResponse.framework as MoralFramework) || "UNKNOWN"}
                                  />
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">AI's Choice:</h4>
                                  <p className="text-gray-700">
                                    {dilemma.options.find((o) => o.id === dilemma.aiResponse?.option_id)?.text ||
                                      "Unknown option"}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-2">AI's Reasoning:</h4>
                                  <p className="text-sm text-gray-600">{dilemma.aiResponse.reasoning}</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">No AI response available for this dilemma.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </section>
      </main>

      <MoralFooter />
    </div>
  )
}
