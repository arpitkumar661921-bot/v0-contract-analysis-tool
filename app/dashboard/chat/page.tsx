import { AIChatInterface } from "@/components/dashboard/ai-chat-interface"

export default function ChatPage() {
  return (
    <div className="space-y-6 h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Contract Assistant</h1>
        <p className="text-muted-foreground">Ask questions about your contracts and get instant AI-powered answers</p>
      </div>
      <AIChatInterface />
    </div>
  )
}
