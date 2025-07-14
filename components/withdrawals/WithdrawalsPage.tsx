"use client"

import React, { useState, useEffect } from "react"
import { WithdrawalTable } from "./WithdrawalTable"
import { WithdrawalDetailModal } from "./WithdrawalDetailModal"
import { CardWrapper } from "@/components/common/CardWrapper"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/common/DateRangePicker"
import { SearchFilter } from "@/components/common/SearchFilter"
import { WithdrawalRequest } from "@/types"
import { apiRequest, handleApiError, showSuccessToast } from "@/utils/apiUtils"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function WithdrawalsPage() {
  // State
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null)
  
  const { toast } = useToast()

  // Filter options
  const filterOptions = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chờ xử lý" },
    { id: "processing", label: "Đang xử lý" },
    { id: "approved", label: "Đã duyệt" },
    { id: "rejected", label: "Từ chối" },
  ]

  // Fetch withdrawals
  const fetchWithdrawals = async () => {
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
        withdrawals: WithdrawalRequest[]
        totalPages: number
      }>(`/admin/withdrawals?${params.toString()}`)
      
      if (response.success && response.data) {
        setWithdrawals(response.data.withdrawals)
        setTotalPages(response.data.totalPages)
      } else {
        throw new Error(response.error || "Failed to fetch withdrawals")
      }
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách yêu cầu rút tiền")
      setWithdrawals([])
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchWithdrawals()
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

  // Handle view withdrawal details
  const handleViewWithdrawal = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal)
    setIsDetailModalOpen(true)
  }

  // Handle approve withdrawal
  const handleApproveWithdrawal = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal)
    setConfirmAction("approve")
    setIsConfirmDialogOpen(true)
  }

  // Handle reject withdrawal
  const handleRejectWithdrawal = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal)
    setConfirmAction("reject")
    setIsConfirmDialogOpen(true)
  }

  // Handle confirm action
  const handleConfirmAction = async () => {
    if (!selectedWithdrawal || !confirmAction) return
    
    try {
      let response
      
      if (confirmAction === "approve") {
        response = await apiRequest(`/admin/withdrawals/${selectedWithdrawal._id}/approve`, {
          method: "PATCH"
        })
        
        if (response.success) {
          showSuccessToast("Đã duyệt yêu cầu rút tiền thành công")
          // Update local state
          setWithdrawals(withdrawals.map(withdrawal => {
            if (withdrawal._id === selectedWithdrawal._id) {
              return { ...withdrawal, status: "approved" }
            }
            return withdrawal
          }))
        } else {
          throw new Error(response.error || "Failed to approve withdrawal")
        }
      } else if (confirmAction === "reject") {
        // For rejection, we'll open the modal to add a note
        setIsDetailModalOpen(true)
      }
    } catch (error) {
      handleApiError(error, `Không thể ${confirmAction === "approve" ? "duyệt" : "từ chối"} yêu cầu rút tiền`)
    } finally {
      setIsConfirmDialogOpen(false)
    }
  }

  // Handle withdrawal status change from modal
  const handleWithdrawalStatusChange = (withdrawalId: string, newStatus: string, note?: string) => {
    // Update local state
    setWithdrawals(withdrawals.map(withdrawal => {
      if (withdrawal._id === withdrawalId) {
        return { 
          ...withdrawal, 
          status: newStatus,
          adminNote: note || withdrawal.adminNote
        }
      }
      return withdrawal
    }))
    
    // Close modal
    setIsDetailModalOpen(false)
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Yêu cầu rút tiền</h1>
        <div className="flex items-center gap-2">
          <DateRangePicker
            date={dateRange}
            onChange={handleDateRangeChange}
          />
          <Button variant="outline" size="icon" onClick={fetchWithdrawals}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <SearchFilter
          placeholder="Tìm kiếm theo mã yêu cầu, người dùng..."
          onSearch={handleSearch}
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={handleFilterChange}
          className="w-full max-w-md"
        />
      </div>

      <CardWrapper>
        <WithdrawalTable
          withdrawals={withdrawals}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onView={handleViewWithdrawal}
          onApprove={handleApproveWithdrawal}
          onReject={handleRejectWithdrawal}
        />
      </CardWrapper>

      {/* Detail Modal */}
      <WithdrawalDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        withdrawal={selectedWithdrawal}
        onStatusChange={handleWithdrawalStatusChange}
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "approve" 
                ? "Duyệt yêu cầu rút tiền" 
                : "Từ chối yêu cầu rút tiền"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "approve"
                ? "Bạn có chắc chắn muốn duyệt yêu cầu rút tiền này? Số tiền sẽ được trừ khỏi tài khoản người dùng."
                : "Bạn có chắc chắn muốn từ chối yêu cầu rút tiền này? Vui lòng cung cấp lý do từ chối."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {confirmAction === "approve" ? "Duyệt" : "Tiếp tục"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
