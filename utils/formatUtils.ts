import { format, isValid, parseISO } from "date-fns"
import { vi } from "date-fns/locale"

/**
 * Format a currency value with Vietnamese formatting
 * @param value - The number to format
 * @param currency - The currency symbol (default: "₫")
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = "₫"): string {
  if (value === undefined || value === null) return "0 " + currency
  
  return new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + " " + currency
}

/**
 * Format a date string with proper error handling
 * @param dateString - Date string or Date object
 * @param formatStr - Format string (default: "dd/MM/yyyy HH:mm:ss")
 * @returns Formatted date string or placeholder for invalid dates
 */
export function formatDate(
  dateString: string | Date | undefined | null,
  formatStr: string = "dd/MM/yyyy HH:mm:ss"
): string {
  if (!dateString) return "N/A"

  try {
    let date: Date
    
    if (typeof dateString === "string") {
      // Try to parse ISO string
      date = parseISO(dateString)
      
      // If parsing failed, try creating a new Date
      if (!isValid(date)) {
        date = new Date(dateString)
      }
    } else {
      date = dateString
    }
    
    // Check if date is valid
    if (!isValid(date)) {
      return "N/A"
    }
    
    return format(date, formatStr, { locale: vi })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "N/A"
  }
}

/**
 * Format a time string (HH:MM:SS)
 * @param dateString - Date string or Date object
 * @returns Formatted time string
 */
export function formatTime(
  dateString: string | Date | undefined | null
): string {
  return formatDate(dateString, "HH:mm:ss")
}

/**
 * Format a date range for display
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export function formatDateRange(
  startDate: Date | string | undefined | null,
  endDate: Date | string | undefined | null
): string {
  if (!startDate && !endDate) return "N/A"
  
  const formattedStart = startDate ? formatDate(startDate, "dd/MM/yyyy") : "N/A"
  const formattedEnd = endDate ? formatDate(endDate, "dd/MM/yyyy") : "N/A"
  
  return `${formattedStart} - ${formattedEnd}`
}

/**
 * Parse a currency string to a number
 * @param amountStr - Currency string to parse
 * @returns Parsed number or 0 if invalid
 */
export function parseCurrency(amountStr: string): number {
  if (!amountStr) return 0
  
  // Remove currency symbol and non-numeric characters except decimal point
  const cleanedStr = amountStr.replace(/[^\d.-]/g, "")
  const parsedAmount = parseFloat(cleanedStr)
  
  return isNaN(parsedAmount) ? 0 : parsedAmount
}

/**
 * Format a phone number to Vietnamese format
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ""
  
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, "")
  
  // Format as Vietnamese phone number
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")
  }
  
  return phone
}
