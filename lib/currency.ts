// Currency conversion utilities for displaying costs in Indian Rupees

// Exchange rate: 1 USD = 83 INR (approximate)
export const USD_TO_INR_RATE = 83

/**
 * Convert a USD amount string (e.g., "$15,000" or "15000") to INR formatted string
 * Also handles amounts already in INR (starting with ₹)
 */
export function convertToINR(usdAmount: string | undefined | null): string {
  if (!usdAmount) return "Not specified"

  // If it's already in INR format, return as-is
  if (usdAmount.includes("₹")) {
    return usdAmount
  }

  // If it says "Not specified" or similar, return as-is
  if (
    usdAmount.toLowerCase().includes("not specified") ||
    usdAmount.toLowerCase().includes("see contract") ||
    usdAmount.toLowerCase().includes("variable")
  ) {
    return usdAmount
  }

  // If it's a percentage, return as-is
  if (usdAmount.includes("%") && !usdAmount.includes("$")) {
    return usdAmount
  }

  // Extract numeric value from string
  const numericMatch = usdAmount.match(/[\d,]+(?:\.\d{2})?/)
  if (!numericMatch) return usdAmount

  const numericValue = Number.parseFloat(numericMatch[0].replace(/,/g, ""))
  if (isNaN(numericValue)) return usdAmount

  // Only convert if it has a $ sign (USD)
  if (usdAmount.includes("$") || usdAmount.toLowerCase().includes("usd")) {
    const inrValue = Math.round(numericValue * USD_TO_INR_RATE)
    return formatINR(inrValue)
  }

  // If no currency symbol, assume it's already the correct value
  // Format it with INR symbol
  return formatINR(Math.round(numericValue))
}

/**
 * Convert a numeric USD value to INR
 */
export function usdToInr(usdValue: number): number {
  return Math.round(usdValue * USD_TO_INR_RATE)
}

/**
 * Format a number as INR currency string with Indian numbering format
 */
export function formatINR(value: number): string {
  if (value === 0) return "₹0"
  return `₹${value.toLocaleString("en-IN")}`
}

/**
 * Parse a currency string and return the numeric value in INR
 * Handles both USD ($) and INR (₹) formats
 */
export function parseCurrencyValue(amount: string | undefined | null): number {
  if (!amount) return 0

  // Handle percentage values
  if (amount.includes("%") && !amount.match(/[\d,]+(?:\.\d{2})?.*₹|₹.*[\d,]+/)) {
    return 0 // Return 0 for pure percentages
  }

  // If already in INR
  if (amount.includes("₹")) {
    const numericMatch = amount.match(/[\d,]+(?:\.\d{2})?/)
    if (!numericMatch) return 0
    return Number.parseFloat(numericMatch[0].replace(/,/g, "")) || 0
  }

  // Handle USD amounts - these need conversion
  const numericMatch = amount.match(/[\d,]+(?:\.\d{2})?/)
  if (!numericMatch) return 0
  const numericValue = Number.parseFloat(numericMatch[0].replace(/,/g, "")) || 0

  // If there's a $ sign, convert to INR
  if (amount.includes("$") || amount.toLowerCase().includes("usd")) {
    return numericValue * USD_TO_INR_RATE
  }

  // Otherwise return as-is (assume it's already in INR or a base number)
  return numericValue
}
