/**
 * API utility functions for making requests to the backend
 */

import { toast } from "@/hooks/use-toast"

// Base API URL - can be configured based on environment
const API_BASE_URL = "/api"

// API request options interface
interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  body?: any
  credentials?: RequestCredentials
  cache?: RequestCache
}

// API response interface
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Make an API request with error handling
 * @param endpoint - API endpoint (without base URL)
 * @param options - Request options
 * @returns Promise with response data
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    // Prepare request options
    const requestOptions: RequestInit = {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: options.credentials || "include",
      cache: options.cache || "no-cache",
    }

    // Add body if present
    if (options.body) {
      requestOptions.body = JSON.stringify(options.body)
    }

    // Make the request
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    const response = await fetch(url, requestOptions)
    
    // Parse JSON response
    const data = await response.json()
    
    // Check for error status codes
    if (!response.ok) {
      throw new Error(data.error || data.message || "API request failed")
    }
    
    return {
      success: true,
      data,
      message: data.message,
    }
  } catch (error: any) {
    console.error(`API Error (${endpoint}):`, error)
    
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    }
  }
}

/**
 * Upload a file to the API
 * @param endpoint - API endpoint for file upload
 * @param file - File to upload
 * @param additionalData - Additional form data to include
 * @returns Promise with response data
 */
export async function uploadFile<T = any>(
  endpoint: string,
  file: File,
  additionalData: Record<string, any> = {}
): Promise<ApiResponse<T>> {
  try {
    // Create form data
    const formData = new FormData()
    formData.append("file", file)
    
    // Add additional data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value)
    })
    
    // Make the request
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    })
    
    // Parse JSON response
    const data = await response.json()
    
    // Check for error status codes
    if (!response.ok) {
      throw new Error(data.error || data.message || "File upload failed")
    }
    
    return {
      success: true,
      data,
      message: data.message,
    }
  } catch (error: any) {
    console.error(`Upload Error (${endpoint}):`, error)
    
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    }
  }
}

/**
 * Handle API errors and display toast notifications
 * @param error - Error object or message
 * @param fallbackMessage - Fallback error message
 */
export function handleApiError(error: any, fallbackMessage: string = "Đã xảy ra lỗi"): void {
  const errorMessage = error?.error || error?.message || fallbackMessage
  
  toast({
    title: "Lỗi",
    description: errorMessage,
    variant: "destructive",
  })
  
  console.error("API Error:", error)
}

/**
 * Show success toast notification
 * @param message - Success message
 */
export function showSuccessToast(message: string): void {
  toast({
    title: "Thành công",
    description: message,
    variant: "default",
  })
}
