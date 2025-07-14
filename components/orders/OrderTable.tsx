"use client"

import React from "react"
import { Column, DataTable } from "@/components/common/DataTable"
import { Pagination } from "@/components/common/Pagination"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ActionButtons } from "@/components/common/ActionButtons"
import { Order } from "@/types"
import { formatDate, formatCurrency } from "@/utils/formatUtils"
import { ArrowDown, ArrowUp } from "lucide-react"

interface OrderTableProps {
  orders: Order[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onView: (order: Order) => void
}

export function OrderTable({
  orders,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onView,
}: OrderTableProps) {
  const columns: Column<Order>[] = [
    {
      id: "orderId",
      header: "Mã lệnh",
      cell: (order) => <span className="font-medium">{order.orderId}</span>,
    },
    {
      id: "username",
      header: "Người dùng",
      cell: (order) => order.username || order.userId,
    },
    {
      id: "session",
      header: "Phiên",
      cell: (order) => order.session,
    },
    {
      id: "amount",
      header: "Số tiền",
      cell: (order) => formatCurrency(order.amount),
    },
    {
      id: "prediction",
      header: "Dự đoán",
      cell: (order) => {
        if (order.prediction === "up") {
          return (
            <div className="flex items-center text-green-600">
              <ArrowUp className="h-4 w-4 mr-1" />
              <span>Tăng</span>
            </div>
          )
        } else {
          return (
            <div className="flex items-center text-red-600">
              <ArrowDown className="h-4 w-4 mr-1" />
              <span>Giảm</span>
            </div>
          )
        }
      },
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: (order) => {
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
        
        return <StatusBadge status={label} variant={variant} />
      },
    },
    {
      id: "createdAt",
      header: "Thời gian",
      cell: (order) => formatDate(order.createdAt),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: (order) => (
        <ActionButtons
          onView={() => onView(order)}
          compact
          hideEdit
          hideDelete
        />
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        emptyMessage="Không tìm thấy lệnh nào"
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
