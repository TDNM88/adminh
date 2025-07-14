"use client"

import React from "react"
import { Column, DataTable } from "@/components/common/DataTable"
import { Pagination } from "@/components/common/Pagination"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ActionButtons } from "@/components/common/ActionButtons"
import { DepositRequest } from "@/types"
import { formatDate, formatCurrency } from "@/utils/formatUtils"

interface DepositTableProps {
  deposits: DepositRequest[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onView: (deposit: DepositRequest) => void
  onApprove: (deposit: DepositRequest) => void
  onReject: (deposit: DepositRequest) => void
}

export function DepositTable({
  deposits,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onApprove,
  onReject,
}: DepositTableProps) {
  const columns: Column<DepositRequest>[] = [
    {
      id: "requestId",
      header: "Mã yêu cầu",
      cell: (deposit) => <span className="font-medium">{deposit.requestId}</span>,
    },
    {
      id: "username",
      header: "Người dùng",
      cell: (deposit) => deposit.username || deposit.userId,
    },
    {
      id: "amount",
      header: "Số tiền",
      cell: (deposit) => formatCurrency(deposit.amount),
    },
    {
      id: "bankInfo",
      header: "Thông tin ngân hàng",
      cell: (deposit) => (
        <div className="flex flex-col">
          <span>{deposit.bankName}</span>
          <span className="text-xs text-muted-foreground">{deposit.accountNumber}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: (deposit) => {
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
        
        return <StatusBadge status={label} variant={variant} />
      },
    },
    {
      id: "createdAt",
      header: "Thời gian",
      cell: (deposit) => formatDate(deposit.createdAt),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: (deposit) => {
        // Only show approve/reject buttons for pending deposits
        if (deposit.status === "pending") {
          return (
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => onApprove(deposit)}
              >
                Duyệt
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => onReject(deposit)}
              >
                Từ chối
              </Button>
              <ActionButtons
                onView={() => onView(deposit)}
                compact
                hideEdit
                hideDelete
              />
            </div>
          )
        }
        
        // For non-pending deposits, just show view button
        return (
          <ActionButtons
            onView={() => onView(deposit)}
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
        data={deposits}
        isLoading={isLoading}
        emptyMessage="Không tìm thấy yêu cầu nạp tiền nào"
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
