"use client"

import React from "react"
import { Modal } from "@/components/common/Modal"
import { Order } from "@/types"
import { formatDate, formatCurrency } from "@/utils/formatUtils"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ArrowDown, ArrowUp, Clock, User, Hash, Wallet, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { apiRequest, handleApiError, showSuccessToast } from "@/utils/apiUtils"

interface OrderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
  onStatusChange?: (orderId: string, newStatus: string) => void
}

export function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onStatusChange,
}: OrderDetailModalProps) {
  if (!order) return null
  
  // Get status variant and label
  const getStatusInfo = () => {
    let variant: "default" | "success" | "warning" | "destructive" | "active" | "inactive" = "default"
    let label = order.status || "Chờ xử lý"
    
    switch (order.status) {
      case "pending":
        variant = "warning"
        label = "Chờ xử lý"
        break
      case "completed":
        variant = "success"
        label = "Hoàn thành"
        break
      case "cancelled":
        variant = "destructive"
        label = "Đã hủy"
        break
      case "win":
        variant = "success"
        label = "Thắng"
        break
      case "lose":
        variant = "destructive"
        label = "Thua"
        break
      default:
        variant = "default"
        label = order.status || "Chờ xử lý"
    }
    
    return { label, variant }
  }
  
  // Handle cancel order
  const handleCancelOrder = async () => {
    try {
      const response = await apiRequest(`/admin/orders/${order._id}/cancel`, {
        method: "PATCH"
      })
      
      if (response.success) {
        showSuccessToast("Đã hủy lệnh thành công")
        if (onStatusChange) {
          onStatusChange(order._id, "cancelled")
        }
      } else {
        throw new Error(response.error || "Failed to cancel order")
      }
    } catch (error) {
      handleApiError(error, "Không thể hủy lệnh")
    }
  }
  
  // Handle complete order
  const handleCompleteOrder = async (result: "win" | "lose") => {
    try {
      const response = await apiRequest(`/admin/orders/${order._id}/complete`, {
        method: "PATCH",
        body: { result }
      })
      
      if (response.success) {
        showSuccessToast(`Đã cập nhật kết quả lệnh thành ${result === "win" ? "thắng" : "thua"}`)
        if (onStatusChange) {
          onStatusChange(order._id, result)
        }
      } else {
        throw new Error(response.error || "Failed to complete order")
      }
    } catch (error) {
      handleApiError(error, "Không thể cập nhật kết quả lệnh")
    }
  }
  
  const { label: statusLabel, variant: statusVariant } = getStatusInfo()
  
  return (
    <Modal
      title="Chi tiết lệnh"
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
              <div className="text-sm text-muted-foreground">Mã lệnh</div>
              <div className="font-medium">{order.orderId}</div>
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
              <div className="font-medium">{order.username || order.userId}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Phiên</div>
              <div className="font-medium">{order.session}</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Số tiền</div>
              <div className="font-medium">{formatCurrency(order.amount)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">Thời gian</div>
              <div className="font-medium">{formatDate(order.createdAt)}</div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border rounded-md bg-muted/30">
          <div className="text-sm text-muted-foreground mb-2">Dự đoán</div>
          {order.prediction === "up" ? (
            <div className="flex items-center text-green-600">
              <ArrowUp className="h-5 w-5 mr-2" />
              <span className="text-lg font-bold">Tăng</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <ArrowDown className="h-5 w-5 mr-2" />
              <span className="text-lg font-bold">Giảm</span>
            </div>
          )}
        </div>
        
        {order.status === "pending" && (
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium">Cập nhật kết quả</div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => handleCompleteOrder("win")}
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Thắng
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => handleCompleteOrder("lose")}
              >
                <ArrowDown className="h-4 w-4 mr-2" />
                Thua
              </Button>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-destructive text-destructive hover:bg-destructive/10"
              onClick={handleCancelOrder}
            >
              Hủy lệnh
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
