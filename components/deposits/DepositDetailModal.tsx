"use client"

import React, { useState } from "react"
import { Modal } from "@/components/common/Modal"
import { DepositRequest } from "@/types"
import { formatDate, formatCurrency } from "@/utils/formatUtils"
import { StatusBadge } from "@/components/common/StatusBadge"
import { User, Hash, Wallet, CalendarClock, Building, CreditCard, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { apiRequest, handleApiError, showSuccessToast } from "@/utils/apiUtils"
import Image from "next/image"

interface DepositDetailModalProps {
  isOpen: boolean
  onClose: () => void
  deposit: DepositRequest | null
  onStatusChange?: (depositId: string, newStatus: string, note?: string) => void
}

export function DepositDetailModal({
  isOpen,
  onClose,
  deposit,
  onStatusChange,
}: DepositDetailModalProps) {
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  if (!deposit) return null
  
  // Get status variant and label
  const getStatusInfo = () => {
    let variant: "default" | "success" | "warning" | "destructive" | "active" | "inactive" = "default"
    let label = deposit.status || "Chờ xử lý"
    
    switch (deposit.status) {
      case "pending":
        variant = "warning"
        label = "Chờ xử lý"
        break
      case "approved":
        variant = "success"
        label = "Đã duyệt"
        break
      case "rejected":
        variant = "destructive"
        label = "Từ chối"
        break
      default:
        variant = "default"
        label = deposit.status || "Chờ xử lý"
    }
    
    return { label, variant }
  }
  
  // Handle approve deposit
  const handleApprove = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const response = await apiRequest(`/admin/deposits/${deposit._id}/approve`, {
        method: "PATCH",
        body: { note }
      })
      
      if (response.success) {
        showSuccessToast("Đã duyệt yêu cầu nạp tiền thành công")
        if (onStatusChange) {
          onStatusChange(deposit._id, "approved", note)
        }
      } else {
        throw new Error(response.error || "Failed to approve deposit")
      }
    } catch (error) {
      handleApiError(error, "Không thể duyệt yêu cầu nạp tiền")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle reject deposit
  const handleReject = async () => {
    if (isSubmitting) return
    
    if (!note) {
      handleApiError("Vui lòng nhập lý do từ chối", "Không thể từ chối yêu cầu")
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await apiRequest(`/admin/deposits/${deposit._id}/reject`, {
        method: "PATCH",
        body: { note }
      })
      
      if (response.success) {
        showSuccessToast("Đã từ chối yêu cầu nạp tiền")
        if (onStatusChange) {
          onStatusChange(deposit._id, "rejected", note)
        }
      } else {
        throw new Error(response.error || "Failed to reject deposit")
      }
    } catch (error) {
      handleApiError(error, "Không thể từ chối yêu cầu nạp tiền")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const { label: statusLabel, variant: statusVariant } = getStatusInfo()
  
  return (
    <Modal
      title="Chi tiết yêu cầu nạp tiền"
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton={true}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Mã yêu cầu</div>
              <div className="font-medium">{deposit.requestId}</div>
            </div>
          </div>
          <StatusBadge status={statusLabel} variant={statusVariant} />
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Người dùng</div>
              <div className="font-medium">{deposit.username || deposit.userId}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Thời gian</div>
              <div className="font-medium">{formatDate(deposit.createdAt)}</div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border rounded-md bg-muted/30">
          <div className="text-sm text-muted-foreground mb-2">Số tiền</div>
          <div className="text-2xl font-bold">{formatCurrency(deposit.amount)}</div>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm font-medium">Thông tin ngân hàng</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Ngân hàng</div>
                <div className="font-medium">{deposit.bankName}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Số tài khoản</div>
                <div className="font-medium">{deposit.accountNumber}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Chủ tài khoản</div>
              <div className="font-medium">{deposit.accountName}</div>
            </div>
          </div>
        </div>
        
        {deposit.transactionImage && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Ảnh giao dịch</div>
            <div className="border rounded-md overflow-hidden">
              <div className="aspect-[3/2] relative">
                <Image
                  src={deposit.transactionImage.startsWith("data:") 
                    ? deposit.transactionImage 
                    : `/uploads/transactions/${deposit.transactionImage.split('/').pop()}`}
                  alt="Transaction Image"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        )}
        
        {deposit.note && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm font-medium">Ghi chú</div>
            </div>
            <div className="p-3 border rounded-md bg-muted/30">
              {deposit.note}
            </div>
          </div>
        )}
        
        {deposit.status === "pending" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                placeholder="Nhập ghi chú hoặc lý do từ chối..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                onClick={handleReject}
                disabled={isSubmitting}
              >
                Từ chối
              </Button>
              <Button 
                className="flex-1"
                onClick={handleApprove}
                disabled={isSubmitting}
              >
                Duyệt yêu cầu
              </Button>
            </div>
          </div>
        )}
        
        {deposit.adminNote && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm font-medium">Ghi chú của admin</div>
            </div>
            <div className="p-3 border rounded-md bg-muted/30">
              {deposit.adminNote}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
