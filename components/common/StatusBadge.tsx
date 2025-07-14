"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusVariant = 
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "pending"
  | "completed"
  | "cancelled"
  | "rejected"
  | "approved"
  | "active"
  | "inactive"

interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
  className?: string
  children?: React.ReactNode
}

export function StatusBadge({
  status,
  variant,
  className,
  children,
}: StatusBadgeProps) {
  // Determine variant based on status if not explicitly provided
  const resolvedVariant = variant || getVariantFromStatus(status)
  
  // Get appropriate styling based on variant
  const variantStyles = getVariantStyles(resolvedVariant)
  
  return (
    <Badge className={cn(variantStyles, className)}>
      {children || status}
    </Badge>
  )
}

// Helper function to determine variant from status string
function getVariantFromStatus(status: string): StatusVariant {
  const normalizedStatus = status.toLowerCase()
  
  if (["success", "completed", "approved", "active", "win"].some(s => normalizedStatus.includes(s))) {
    return "success"
  }
  
  if (["warning", "pending", "waiting"].some(s => normalizedStatus.includes(s))) {
    return "warning"
  }
  
  if (["danger", "error", "failed", "rejected", "cancelled", "inactive", "lose"].some(s => normalizedStatus.includes(s))) {
    return "danger"
  }
  
  if (["info", "information"].some(s => normalizedStatus.includes(s))) {
    return "info"
  }
  
  return "default"
}

// Helper function to get styling based on variant
function getVariantStyles(variant: StatusVariant): string {
  switch (variant) {
    case "success":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "warning":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    case "danger":
      return "bg-red-100 text-red-800 hover:bg-red-100"
    case "info":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-100"
    case "rejected":
      return "bg-red-100 text-red-800 hover:bg-red-100"
    case "approved":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "active":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "inactive":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}
