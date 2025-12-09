import { NextResponse } from "next/server"

const USD_TO_INR_RATE = 83

function convertToINR(usdAmount: string): string {
  const numericMatch = usdAmount.match(/[\d,]+(?:\.\d{2})?/)
  if (!numericMatch) return usdAmount
  const usdValue = Number.parseFloat(numericMatch[0].replace(/,/g, ""))
  if (isNaN(usdValue)) return usdAmount
  const inrValue = Math.round(usdValue * USD_TO_INR_RATE)
  return `₹${inrValue.toLocaleString("en-IN")}`
}

export async function POST(req: Request) {
  try {
    const { contract } = await req.json()

    if (!contract) {
      return Response.json({ error: "No contract data provided" }, { status: 400 })
    }

    // Generate HTML content for PDF - Updated to show INR
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Contract Analysis Report - ${contract.name}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; }
    h1 { color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .badge-risk-high { background: #fee2e2; color: #dc2626; }
    .badge-risk-medium { background: #fef3c7; color: #d97706; }
    .badge-risk-low { background: #d1fae5; color: #059669; }
    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
    .summary-card { background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .summary-card h3 { margin: 0 0 10px 0; font-size: 14px; color: #6b7280; }
    .summary-card .value { font-size: 24px; font-weight: bold; color: #111827; }
    .fee-item { display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .fee-high { border-left: 4px solid #dc2626; }
    .fee-medium { border-left: 4px solid #d97706; }
    .fee-low { border-left: 4px solid #6b7280; }
    .risk-item { padding: 12px; margin-bottom: 10px; border-radius: 6px; }
    .risk-high { background: #fee2e2; border-left: 4px solid #dc2626; }
    .risk-medium { background: #fef3c7; border-left: 4px solid #d97706; }
    .risk-low { background: #f3f4f6; border-left: 4px solid #6b7280; }
    .positive-item { display: flex; align-items: center; padding: 8px 0; }
    .positive-item::before { content: "✓"; color: #10b981; margin-right: 10px; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
    .currency-note { background: #f0fdf4; padding: 10px 15px; border-radius: 6px; font-size: 12px; color: #166534; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Contract Analysis Report</h1>
      <p><strong>${contract.name}</strong> - ${contract.venue}</p>
      <p>Analyzed on ${contract.uploadedAt}</p>
    </div>
    <div>
      <span class="badge ${contract.riskScore >= 7 ? "badge-risk-high" : contract.riskScore >= 4 ? "badge-risk-medium" : "badge-risk-low"}">
        Risk Score: ${contract.riskScore}/10
      </span>
    </div>
  </div>

  <div class="currency-note">
    All prices are displayed in Indian Rupees (₹) for your convenience.
  </div>

  <h2>Summary</h2>
  <p>${contract.summary}</p>

  <div class="summary-grid">
    <div class="summary-card">
      <h3>Base Price</h3>
      <div class="value">${convertToINR(contract.basePrice)}</div>
    </div>
    <div class="summary-card">
      <h3>Estimated Total</h3>
      <div class="value">${convertToINR(contract.totalValue)}</div>
    </div>
    <div class="summary-card">
      <h3>Hidden Fees Found</h3>
      <div class="value">${contract.hiddenFees?.length || 0}</div>
    </div>
    <div class="summary-card">
      <h3>Risk Factors</h3>
      <div class="value">${contract.risks?.length || 0}</div>
    </div>
  </div>

  <h2>Hidden Fees Breakdown</h2>
  ${
    contract.hiddenFees?.length > 0
      ? contract.hiddenFees
          .map(
            (fee: any) => `
    <div class="fee-item fee-${fee.severity}">
      <div>
        <strong>${fee.name}</strong>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">${fee.description}</p>
      </div>
      <div style="font-weight: bold; color: ${fee.severity === "high" ? "#dc2626" : fee.severity === "medium" ? "#d97706" : "#374151"}">
        ${convertToINR(fee.amount)}
      </div>
    </div>
  `,
          )
          .join("")
      : "<p>No hidden fees detected.</p>"
  }

  <h2>Risk Analysis</h2>
  ${
    contract.risks?.length > 0
      ? contract.risks
          .map(
            (risk: any) => `
    <div class="risk-item risk-${risk.severity}">
      <strong>${risk.title}</strong> <span class="badge badge-risk-${risk.severity}">${risk.severity}</span>
      <p style="margin: 8px 0 0 0;">${risk.description}</p>
    </div>
  `,
          )
          .join("")
      : "<p>No significant risks identified.</p>"
  }

  <h2>Positive Aspects</h2>
  ${
    contract.positives?.length > 0
      ? contract.positives
          .map(
            (positive: string) => `
    <div class="positive-item">${positive}</div>
  `,
          )
          .join("")
      : "<p>No notable positives identified.</p>"
  }

  ${
    contract.negotiationSuggestions?.length > 0
      ? `
  <h2>Negotiation Suggestions</h2>
  ${contract.negotiationSuggestions
    .map(
      (suggestion: any) => `
    <div class="risk-item risk-${suggestion.priority}">
      <strong>${suggestion.clause}</strong>
      <p style="margin: 8px 0 0 0;">${suggestion.suggestion}</p>
    </div>
  `,
    )
    .join("")}
  `
      : ""
  }

  <div class="footer">
    <p>Generated by ContractScan - AI-Powered Contract Analysis</p>
    <p>This report is for informational purposes only and does not constitute legal advice.</p>
  </div>
</body>
</html>
`

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="contract-analysis-${contract.id}.html"`,
      },
    })
  } catch (error) {
    console.error("PDF export error:", error)
    return Response.json(
      { error: "Failed to export PDF", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
