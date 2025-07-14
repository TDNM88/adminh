"use client"

import React from "react"
import { Column, DataTable } from "@/components/common/DataTable"
import { Pagination } from "@/components/common/Pagination"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ActionButtons } from "@/components/common/ActionButtons"
import { WithdrawalRequest } from "@/types"
import { formatDate, formatCurrency } from "@/utils/formatUtils"

interface WithdrawalTableProps {
  withdrawals: WithdrawalRequest[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onView: (withdrawal: WithdrawalRequest) => void
  onApprove: (withdrawal: WithdrawalRequest) => void
  onReject: (withdrawal: WithdrawalRequest) => void
}

export function WithdrawalTable({
  withdrawals,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onApprove,
  onReject,
}: WithdrawalTableProps) {
  const columns: Column<WithdrawalRequest>[] = [
    {
      id: "requestId",
      header: "Mã yêu cầu",
      cell: (withdrawal) => <span className="font-medium">{withdrawal.requestId}</span>,
    },
    {
      id: "username",
      header: "Người dùng",
      cell: (withdrawal) => withdrawal.username || withdrawal.userId,
    },
    {
      id: "amount",
      header: "Số tiền",
      cell: (withdrawal) => formatCurrency(withdrawal.amount),
    },
    {
      id: "bankInfo",
      header: "Thông tin ngân hàng",
      cell: (withdrawal) => (
        <div className="flex flex-col">
          <span>{withdrawal.bankName}</span>
          <span className="text-xs text-muted-foreground">{withdrawal.accountNumber}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: (withdrawal) => {
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
        
        return <StatusBadge status={label} variant={variant} />
      },
    },
    {
      id: "createdAt",
      header: "Thời gian",
      cell: (withdrawal) => formatDate(withdrawal.createdAt),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: (withdrawal) => {
        // Only show approve/reject buttons for pending withdrawals
        if (withdrawal.status === "pending") {
          return (
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => onApprove(withdrawal)}
              >
                Duyệt
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => onReject(withdrawal)}
              >
                Từ chối
              </Button>
              <ActionButtons
                onView={() => onView(withdrawal)}
                compact
                hideEdit
                hideDelete
              />
            </div>
          )
        }
        
        // For non-pending withdrawals, just show view button
        return (
          <ActionButtons
            onView={() => onView(withdrawal)}
            compact
            hideEdit
            hideDelete
          />
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={withdrawals}
        isLoading={isLoading}
        emptyMessage="Không tìm thấy yêu cầu rút tiền nào"
      />

      <div className="flex items-center justify-center mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}

// Button component for the table actions
function Button({
  children,
  onClick,
  className,
  variant = "default",
  size = "default",
}: {
  children: React.ReactNode
  onClick: () => void
  className?: string
  variant?: "default" | "outline"
  size?: "default" | "sm"
}) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
        disabled:pointer-events-none disabled:opacity-50
        ${variant === "outline" ? "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground" : "bg-primary text-primary-foreground shadow hover:bg-primary/90"}
        ${size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-4 py-2 text-sm"}
        ${className}
      `}
    >
      {children}
    </button>
  )
}
