"use client"

import React, { useState } from "react"
import { Column, DataTable } from "@/components/common/DataTable"
import { Pagination } from "@/components/common/Pagination"
import { SearchFilter } from "@/components/common/SearchFilter"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ActionButtons } from "@/components/common/ActionButtons"
import { Customer } from "@/types"
import { formatDate, formatCurrency } from "@/utils/formatUtils"

interface CustomerTableProps {
  customers: Customer[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onSearch: (query: string) => void
  onEdit: (customer: Customer) => void
  onDelete: (customer: Customer) => void
  onStatusToggle: (userId: string, field: 'active' | 'betLocked' | 'withdrawLocked') => void
}

export function CustomerTable({
  customers,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onSearch,
  onEdit,
  onDelete,
  onStatusToggle,
}: CustomerTableProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const columns: Column<Customer>[] = [
    {
      id: "username",
      header: "Tên đăng nhập",
      cell: (customer) => <span className="font-medium">{customer.username}</span>,
    },
    {
      id: "fullName",
      header: "Họ tên",
      cell: (customer) => customer.fullName || "N/A",
    },
    {
      id: "phone",
      header: "Số điện thoại",
      cell: (customer) => customer.phone || "N/A",
    },
    {
      id: "balance",
      header: "Số dư",
      cell: (customer) => formatCurrency(customer.balanceAvailable || customer.balance?.available || 0),
    },
    {
      id: "status",
      header: "Trạng thái",
      cell: (customer) => (
        <div className="flex flex-col gap-1">
          <StatusBadge 
            status={customer.active ? "Hoạt động" : "Không hoạt động"} 
            variant={customer.active ? "active" : "inactive"}
          />
          {customer.betLocked && (
            <StatusBadge status="Khóa đặt cược" variant="warning" />
          )}
          {customer.withdrawLocked && (
            <StatusBadge status="Khóa rút tiền" variant="warning" />
          )}
        </div>
      ),
    },
    {
      id: "verified",
      header: "Xác minh",
      cell: (customer) => (
        <StatusBadge 
          status={customer.verified ? "Đã xác minh" : "Chưa xác minh"} 
          variant={customer.verified ? "success" : "warning"}
        />
      ),
    },
    {
      id: "createdAt",
      header: "Ngày tạo",
      cell: (customer) => formatDate(customer.createdAt, "dd/MM/yyyy"),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: (customer) => (
        <ActionButtons
          onEdit={() => onEdit(customer)}
          onDelete={() => onDelete(customer)}
          compact
        />
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Danh sách khách hàng</h2>
        <SearchFilter
          placeholder="Tìm kiếm theo tên đăng nhập, họ tên..."
          onSearch={handleSearch}
        />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        emptyMessage="Không tìm thấy khách hàng nào"
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
