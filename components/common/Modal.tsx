"use client"

import React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ModalProps {
  title: string
  description?: string
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

export function Modal({
  title,
  description,
  isOpen,
  onClose,
  onConfirm,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  children,
  className,
  showCloseButton = true,
  size = "md",
}: ModalProps) {
  // Size classes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-[95vw] w-[95vw]",
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={cn(sizeClasses[size], className)}
        onInteractOutside={(e) => e.preventDefault()} // Prevent closing when clicking outside
      >
        <DialogHeader className="relative">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
          {showCloseButton && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </DialogHeader>

        <div className="py-4">{children}</div>

        {(onConfirm || onClose) && (
          <DialogFooter className="flex justify-end gap-2">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                {cancelText}
              </Button>
            )}
            {onConfirm && (
              <Button onClick={onConfirm}>
                {confirmText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
