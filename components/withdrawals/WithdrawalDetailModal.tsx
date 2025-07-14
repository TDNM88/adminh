"use client"

import React, { useState } from "react"
import { Modal } from "@/components/common/Modal"
import { WithdrawalRequest } from "@/types"
import { formatDate, formatCurrency } from "@/utils/formatUtils"
import { StatusBadge } from "@/components/common/StatusBadge"
import { User, Hash, Wallet, CalendarClock, Building, CreditCard, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { apiRequest, handleApiError, showSuccessToast } from "@/utils/apiUtils"

interface WithdrawalDetailModalProps {
  isOpen: boolean
  onClose: () => void
  withdrawal: WithdrawalRequest | null
  onStatusChange?: (withdrawalId: string, newStatus: string, note?: string) => void
}

export function WithdrawalDetailModal({
  isOpen,
  onClose,
  withdrawal,
  onStatusChange,
}: WithdrawalDetailModalProps) {
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  if (!withdrawal) return null
  
  // Get status variant and label
  const getStatusInfo = () => {
    let variant: "default" | "success" | "warning" | "destructive" | "active" | "inactive" = "default"
    let label = withdrawal.status || "Chờ xử lý"
    
    switch (withdrawal.status) {
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
      case "processing":
        variant = "default"
        label = "Đang xử lý"
        break
      default:
        variant = "default"
        label = withdrawal.status || "Chờ xử lý"
    }
    
    return { label, variant }
  }
  
  // Handle approve withdrawal
  const handleApprove = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const response = await apiRequest(`/admin/withdrawals/${withdrawal._id}/approve`, {
        method: "PATCH",
        body: { note }
      })
      
      if (response.success) {
        showSuccessToast("Đã duyệt yêu cầu rút tiền thành công")
        if (onStatusChange) {
          onStatusChange(withdrawal._id, "approved", note)
        }
      } else {
        throw new Error(response.error || "Failed to approve withdrawal")
      }
    } catch (error) {
      handleApiError(error, "Không thể duyệt yêu cầu rút tiền")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle reject withdrawal
  const handleReject = async () => {
    if (isSubmitting) return
    
    if (!note) {
      handleApiError("Vui lòng nhập lý do từ chối", "Không thể từ chối yêu cầu")
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await apiRequest(`/admin/withdrawals/${withdrawal._id}/reject`, {
        method: "PATCH",
        body: { note }
      })
      
      if (response.success) {
        showSuccessToast("Đã từ chối yêu cầu rút tiền")
        if (onStatusChange) {
          onStatusChange(withdrawal._id, "rejected", note)
        }
      } else {
        throw new Error(response.error || "Failed to reject withdrawal")
      }
    } catch (error) {
      handleApiError(error, "Không thể từ chối yêu cầu rút tiền")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle mark as processing
  const handleMarkProcessing = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const response = await apiRequest(`/admin/withdrawals/${withdrawal._id}/processing`, {
        method: "PATCH",
        body: { note }
      })
      
      if (response.success) {
        showSuccessToast("Đã chuyển trạng thái sang đang xử lý")
        if (onStatusChange) {
          onStatusChange(withdrawal._id, "processing", note)
        }
      } else {
        throw new Error(response.error || "Failed to update withdrawal status")
      }
    } catch (error) {
      handleApiError(error, "Không thể cập nhật trạng thái yêu cầu")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const { label: statusLabel, variant: statusVariant } = getStatusInfo()
  
  return (
    <Modal
      title="Chi tiết yêu cầu rút tiền"
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
              <div className="font-medium">{withdrawal.requestId}</div>
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
              <div className="font-medium">{withdrawal.username || withdrawal.userId}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Thời gian</div>
              <div className="font-medium">{formatDate(withdrawal.createdAt)}</div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border rounded-md bg-muted/30">
          <div className="text-sm text-muted-foreground mb-2">Số tiền</div>
          <div className="text-2xl font-bold">{formatCurrency(withdrawal.amount)}</div>
        </div>
        
        <div className="space-y-4">
          <div className="text-sm font-medium">Thông tin ngân hàng</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Ngân hàng</div>
                <div className="font-medium">{withdrawal.bankName}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Số tài khoản</div>
                <div className="font-medium">{withdrawal.accountNumber}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Chủ tài khoản</div>
              <div className="font-medium">{withdrawal.accountName}</div>
            </div>
          </div>
        </div>
        
        {withdrawal.note && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm font-medium">Ghi chú của người dùng</div>
            </div>
            <div className="p-3 border rounded-md bg-muted/30">
              {withdrawal.note}
            </div>
          </div>
        )}
        
        {withdrawal.status === "pending" && (
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
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={handleMarkProcessing}
                disabled={isSubmitting}
              >
                Đang xử lý
              </Button>
              <Button 
                className=""
                onClick={handleApprove}
                disabled={isSubmitting}
              >
                Duyệt yêu cầu
              </Button>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-destructive text-destructive hover:bg-destructive/10"
              onClick={handleReject}
              disabled={isSubmitting}
            >
              Từ chối
            </Button>
          </div>
        )}
        
        {withdrawal.adminNote && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm font-medium">Ghi chú của admin</div>
            </div>
            <div className="p-3 border rounded-md bg-muted/30">
              {withdrawal.adminNote}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
