"use client"

import React, { useState, useEffect } from "react"
import { OrderTable } from "./OrderTable"
import { OrderDetailModal } from "./OrderDetailModal"
import { CardWrapper } from "@/components/common/CardWrapper"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/common/DateRangePicker"
import { SearchFilter } from "@/components/common/SearchFilter"
import { Order } from "@/types"
import { apiRequest, handleApiError } from "@/utils/apiUtils"
import { RefreshCw } from "lucide-react"

export function OrderHistoryPage() {
  // State
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>("all")

  // Filter options
  const filterOptions = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chờ xử lý" },
    { id: "completed", label: "Hoàn thành" },
    { id: "win", label: "Thắng" },
    { id: "lose", label: "Thua" },
    { id: "cancelled", label: "Đã hủy" },
  ]

  // Fetch orders
  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      // Build query parameters
      const params = new URLSearchParams()
      params.append("page", currentPage.toString())
      
      if (searchQuery) {
        params.append("search", searchQuery)
      }
      
      if (dateRange.from) {
        params.append("startDate", dateRange.from.toISOString())
      }
      
      if (dateRange.to) {
        params.append("endDate", dateRange.to.toISOString())
      }
      
      if (selectedFilter !== "all") {
        params.append("status", selectedFilter)
      }
      
      const response = await apiRequest<{
        orders: Order[]
        totalPages: number
      }>(`/admin/orders?${params.toString()}`)
      
      if (response.success && response.data) {
        setOrders(response.data.orders)
        setTotalPages(response.data.totalPages)
      } else {
        throw new Error(response.error || "Failed to fetch orders")
      }
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách lệnh")
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchOrders()
  }, [currentPage, searchQuery, dateRange, selectedFilter])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page on new search
  }

  // Handle date range change
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range)
    setCurrentPage(1) // Reset to first page on new date range
  }

  // Handle filter change
  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId)
    setCurrentPage(1) // Reset to first page on new filter
  }

  // Handle view order details
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  // Handle order status change
  const handleOrderStatusChange = (orderId: string, newStatus: string) => {
    // Update local state
    setOrders(orders.map(order => {
      if (order._id === orderId) {
        return { ...order, status: newStatus }
      }
      return order
    }))
    
    // Close modal
    setIsDetailModalOpen(false)
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lịch sử lệnh</h1>
        <div className="flex items-center gap-2">
          <DateRangePicker
            date={dateRange}
            onChange={handleDateRangeChange}
          />
          <Button variant="outline" size="icon" onClick={fetchOrders}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <SearchFilter
          placeholder="Tìm kiếm theo mã lệnh, người dùng..."
          onSearch={handleSearch}
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={handleFilterChange}
          className="w-full max-w-md"
        />
      </div>

      <CardWrapper>
        <OrderTable
          orders={orders}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onView={handleViewOrder}
        />
      </CardWrapper>

      {/* Detail Modal */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedOrder}
        onStatusChange={handleOrderStatusChange}
      />
    </div>
  )
}
