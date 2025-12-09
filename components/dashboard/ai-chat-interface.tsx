"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, FileText, Sparkles, Loader2 } from "lucide-react"
import { useContractStore } from "@/lib/contract-store"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const suggestedQuestions = [
  "What are the hidden fees in my contract?",
  "Is the cancellation policy risky?",
  "Compare my venue contracts",
  "What's the total cost for 150 guests?",
  "Explain the liability clause",
  "How can I negotiate better terms?",
]

export function AIChatInterface() {
  const searchParams = useSearchParams()
  const contractId = searchParams.get("contractId")
  const initialQuestion = searchParams.get("question")

  const { contracts } = useContractStore()
  const contract = contractId ? contracts.get(contractId) : null

  const contractContext = contract
    ? `
Current Contract: ${contract.name}
Venue: ${contract.venue}
Base Price: ${contract.basePrice}
Total Value: ${contract.totalValue}
Risk Score: ${contract.riskScore}/10

Hidden Fees:
${contract.hiddenFees.map((f) => `- ${f.name}: ${f.amount} (${f.severity} severity)`).join("\n")}

Risks:
${contract.risks.map((r) => `- ${r.title}: ${r.description}`).join("\n")}

Positives:
${contract.positives.map((p) => `- ${p}`).join("\n")}

Summary: ${contract.summary}
`
    : "User is analyzing wedding venue contracts."

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: contract
        ? `Hello! I'm your AI contract assistant. I've loaded the analysis for **${contract.name}**.\n\nThis contract has a risk score of **${contract.riskScore}/10** with ${contract.hiddenFees.length} hidden fees detected.\n\nHow can I help you understand this contract better?`
        : "Hello! I'm your AI contract assistant powered by GPT-4. I can help you:\n\n• **Analyze hidden fees** in your contracts\n• **Assess risks** and concerning clauses\n• **Compare venues** side by side\n• **Suggest negotiations** for better terms\n• **Calculate costs** based on guest count\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasAskedInitialQuestion = useRef(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (initialQuestion && !hasAskedInitialQuestion.current) {
      hasAskedInitialQuestion.current = true
      handleSend(initialQuestion)
    }
  }, [initialQuestion])

  const handleSend = async (message?: string) => {
    const userMessage = message || input
    if (!userMessage.trim()) return

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          contractContext,
        }),
      })

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.error || "Sorry, I couldn't process that request.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex gap-4">
        <Card className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={contract ? `Ask about ${contract.name}...` : "Ask about your contracts..."}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        <div className="hidden lg:flex flex-col w-80 gap-4">
          {contract && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Current Contract
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">{contract.name}</p>
                  <p className="text-muted-foreground">{contract.venue}</p>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Score:</span>
                    <span
                      className={
                        contract.riskScore >= 7
                          ? "text-destructive"
                          : contract.riskScore >= 4
                            ? "text-warning"
                            : "text-success"
                      }
                    >
                      {contract.riskScore}/10
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Value:</span>
                    <span className="font-medium">{contract.totalValue}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Suggested Questions
              </h3>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2 px-3 text-sm"
                    onClick={() => handleSend(question)}
                    disabled={isLoading}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                AI Capabilities
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Hidden fee detection</p>
                <p>• Risk assessment</p>
                <p>• Contract comparison</p>
                <p>• Negotiation strategies</p>
                <p>• Cost calculations</p>
                <p>• Clause explanations</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
