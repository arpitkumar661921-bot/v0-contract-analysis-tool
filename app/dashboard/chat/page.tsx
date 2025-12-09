"use client"

import { Suspense } from "react"
import { AIChatInterface } from "@/components/dashboard/ai-chat-interface"

function ChatContent() {
  return <AIChatInterface />
}

export default function ChatPage() {
  return (
    <div className="space-y-6 h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Contract Assistant</h1>
        <p className="text-muted-foreground">Ask questions about your contracts and get instant AI-powered answers</p>
      </div>
      <Suspense fallback={<div className="flex items-center justify-center py-20">Loading chat...</div>}>
        <ChatContent />
      </Suspense>
    </div>
  )
}
