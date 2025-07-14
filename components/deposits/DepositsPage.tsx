"use client"

import React, { useState, useEffect } from "react"
import { DepositTable } from "./DepositTable"
import { DepositDetailModal } from "./DepositDetailModal"
import { CardWrapper } from "@/components/common/CardWrapper"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/common/DateRangePicker"
import { SearchFilter } from "@/components/common/SearchFilter"
import { DepositRequest } from "@/types"
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

export function DepositsPage() {
  // State
  const [deposits, setDeposits] = useState<DepositRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null)
  
  const { toast } = useToast()

  // Filter options
  const filterOptions = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chờ xử lý" },
    { id: "approved", label: "Đã duyệt" },
    { id: "rejected", label: "Từ chối" },
  ]

  // Fetch deposits
  const fetchDeposits = async () => {
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
        deposits: DepositRequest[]
        totalPages: number
      }>(`/admin/deposits?${params.toString()}`)
      
      if (response.success && response.data) {
        setDeposits(response.data.deposits)
        setTotalPages(response.data.totalPages)
      } else {
        throw new Error(response.error || "Failed to fetch deposits")
      }
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách yêu cầu nạp tiền")
      setDeposits([])
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchDeposits()
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

  // Handle view deposit details
  const handleViewDeposit = (deposit: DepositRequest) => {
    setSelectedDeposit(deposit)
    setIsDetailModalOpen(true)
  }

  // Handle approve deposit
  const handleApproveDeposit = (deposit: DepositRequest) => {
    setSelectedDeposit(deposit)
    setConfirmAction("approve")
    setIsConfirmDialogOpen(true)
  }

  // Handle reject deposit
  const handleRejectDeposit = (deposit: DepositRequest) => {
    setSelectedDeposit(deposit)
    setConfirmAction("reject")
    setIsConfirmDialogOpen(true)
  }

  // Handle confirm action
  const handleConfirmAction = async () => {
    if (!selectedDeposit || !confirmAction) return
    
    try {
      let response
      
      if (confirmAction === "approve") {
        response = await apiRequest(`/admin/deposits/${selectedDeposit._id}/approve`, {
          method: "PATCH"
        })
        
        if (response.success) {
          showSuccessToast("Đã duyệt yêu cầu nạp tiền thành công")
          // Update local state
          setDeposits(deposits.map(deposit => {
            if (deposit._id === selectedDeposit._id) {
              return { ...deposit, status: "approved" }
            }
            return deposit
          }))
        } else {
          throw new Error(response.error || "Failed to approve deposit")
        }
      } else if (confirmAction === "reject") {
        // For rejection, we'll open the modal to add a note
        setIsDetailModalOpen(true)
      }
    } catch (error) {
      handleApiError(error, `Không thể ${confirmAction === "approve" ? "duyệt" : "từ chối"} yêu cầu nạp tiền`)
    } finally {
      setIsConfirmDialogOpen(false)
    }
  }

  // Handle deposit status change from modal
  const handleDepositStatusChange = (depositId: string, newStatus: string, note?: string) => {
    // Update local state
    setDeposits(deposits.map(deposit => {
      if (deposit._id === depositId) {
        return { 
          ...deposit, 
          status: newStatus,
          adminNote: note || deposit.adminNote
        }
      }
      return deposit
    }))
    
    // Close modal
    setIsDetailModalOpen(false)
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Yêu cầu nạp tiền</h1>
        <div className="flex items-center gap-2">
          <DateRangePicker
            date={dateRange}
            onChange={handleDateRangeChange}
          />
          <Button variant="outline" size="icon" onClick={fetchDeposits}>
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
        <DepositTable
          deposits={deposits}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onView={handleViewDeposit}
          onApprove={handleApproveDeposit}
          onReject={handleRejectDeposit}
        />
      </CardWrapper>

      {/* Detail Modal */}
      <DepositDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        deposit={selectedDeposit}
        onStatusChange={handleDepositStatusChange}
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "approve" 
                ? "Duyệt yêu cầu nạp tiền" 
                : "Từ chối yêu cầu nạp tiền"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "approve"
                ? "Bạn có chắc chắn muốn duyệt yêu cầu nạp tiền này? Số tiền sẽ được cộng vào tài khoản người dùng."
                : "Bạn có chắc chắn muốn từ chối yêu cầu nạp tiền này? Vui lòng cung cấp lý do từ chối."}
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
