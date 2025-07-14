"use client"

import React from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CardWrapperProps {
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  footerClassName?: string
  isLoading?: boolean
}

export function CardWrapper({
  title,
  description,
  icon,
  footer,
  children,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  isLoading = false,
}: CardWrapperProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || description || icon) && (
        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", headerClassName)}>
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("pt-4", contentClassName)}>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          children
        )}
      </CardContent>
      {footer && <CardFooter className={cn("border-t bg-muted/50 px-6 py-3", footerClassName)}>{footer}</CardFooter>}
    </Card>
  )
}
