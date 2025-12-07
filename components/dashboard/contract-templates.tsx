"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, Sparkles, Loader2 } from "lucide-react"

const templates = [
  {
    id: "1",
    name: "Venue Rental Agreement",
    description: "Standard venue rental contract with customizable terms",
    category: "Venue",
    popular: true,
  },
  {
    id: "2",
    name: "Cancellation Addendum",
    description: "Add-on to modify existing cancellation terms",
    category: "Amendment",
    popular: true,
  },
  {
    id: "3",
    name: "Catering Services Contract",
    description: "Full catering agreement with menu and pricing",
    category: "Catering",
    popular: false,
  },
  {
    id: "4",
    name: "Photography Agreement",
    description: "Photographer services and usage rights",
    category: "Photography",
    popular: false,
  },
  {
    id: "5",
    name: "Vendor Agreement",
    description: "General contract for third-party vendors",
    category: "Vendor",
    popular: false,
  },
  {
    id: "6",
    name: "Force Majeure Addendum",
    description: "Add protection for unforeseen circumstances",
    category: "Amendment",
    popular: true,
  },
]

export function ContractTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [formData, setFormData] = useState({
    partyA: "",
    partyB: "",
    eventDate: "",
    venue: "",
    amount: "",
  })

  const handleGenerate = async () => {
    setGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setGenerating(false)
    // In production, this would trigger a download
    alert("Contract generated! Download will start automatically.")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    {template.popular && <Badge variant="secondary">Popular</Badge>}
                  </div>
                  <h3 className="font-medium text-foreground mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <Badge variant="outline" className="mt-2">
                    {template.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate Contract
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTemplate ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Fill in the details to generate your {templates.find((t) => t.id === selectedTemplate)?.name}
                </p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="partyA">Your Name / Company</Label>
                    <Input
                      id="partyA"
                      value={formData.partyA}
                      onChange={(e) => setFormData({ ...formData, partyA: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partyB">Other Party</Label>
                    <Input
                      id="partyB"
                      value={formData.partyB}
                      onChange={(e) => setFormData({ ...formData, partyB: e.target.value })}
                      placeholder="The Grand Hotel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Contract Amount</Label>
                    <Input
                      id="amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="$15,000"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleGenerate} disabled={generating} className="flex-1">
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Generate PDF
                      </>
                    )}
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a template to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
