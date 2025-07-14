"use client"

import React, { useState, useEffect } from "react"
import { CustomerTable } from "./CustomerTable"
import { CustomerEditModal } from "./CustomerEditModal"
import { CardWrapper } from "@/components/common/CardWrapper"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/common/DateRangePicker"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Customer, UserFormData } from "@/types"
import { apiRequest, handleApiError, showSuccessToast } from "@/utils/apiUtils"
import { Plus, RefreshCw } from "lucide-react"

export function CustomersPage() {
  // State
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

  // Fetch customers
  const fetchCustomers = async () => {
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
      
      const response = await apiRequest<{
        customers: Customer[]
        totalPages: number
      }>(`/admin/customers?${params.toString()}`)
      
      if (response.success && response.data) {
        setCustomers(response.data.customers)
        setTotalPages(response.data.totalPages)
      } else {
        throw new Error(response.error || "Failed to fetch customers")
      }
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách khách hàng")
      setCustomers([])
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchCustomers()
  }, [currentPage, searchQuery, dateRange])

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

  // Handle edit customer
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsEditModalOpen(true)
  }

  // Handle delete customer
  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer)
    setIsDeleteDialogOpen(true)
  }

  // Handle status toggle
  const handleStatusToggle = async (userId: string, field: 'active' | 'betLocked' | 'withdrawLocked') => {
    try {
      const customer = customers.find(c => c._id === userId)
      if (!customer) return
      
      const currentValue = field === 'active' ? customer.active : 
                          field === 'betLocked' ? customer.betLocked : 
                          customer.withdrawLocked
      
      const response = await apiRequest(`/admin/customers/${userId}/toggle-status`, {
        method: "PATCH",
        body: {
          field,
          value: !currentValue
        }
      })
      
      if (response.success) {
        // Update local state
        setCustomers(customers.map(c => {
          if (c._id === userId) {
            if (field === 'active') {
              return { ...c, active: !c.active }
            } else if (field === 'betLocked') {
              return { ...c, betLocked: !c.betLocked }
            } else {
              return { ...c, withdrawLocked: !c.withdrawLocked }
            }
          }
          return c
        }))
        
        showSuccessToast(`Đã cập nhật trạng thái ${field} thành công`)
      } else {
        throw new Error(response.error || "Failed to update status")
      }
    } catch (error) {
      handleApiError(error, "Không thể cập nhật trạng thái")
    }
  }

  // Handle save customer
  const handleSaveCustomer = async (formData: UserFormData) => {
    if (!selectedCustomer?._id) return
    
    try {
      const response = await apiRequest(`/admin/customers/${selectedCustomer._id}`, {
        method: "PUT",
        body: {
          ...formData,
          active: formData.status === "active"
        }
      })
      
      if (response.success) {
        // Update local state
        setCustomers(customers.map(c => {
          if (c._id === selectedCustomer._id) {
            return {
              ...c,
              ...formData,
              active: formData.status === "active"
            }
          }
          return c
        }))
        
        setIsEditModalOpen(false)
        showSuccessToast("Đã cập nhật thông tin khách hàng thành công")
      } else {
        throw new Error(response.error || "Failed to update customer")
      }
    } catch (error) {
      handleApiError(error, "Không thể cập nhật thông tin khách hàng")
    }
  }

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!customerToDelete?._id) return
    
    try {
      const response = await apiRequest(`/admin/customers/${customerToDelete._id}`, {
        method: "DELETE"
      })
      
      if (response.success) {
        // Update local state
        setCustomers(customers.filter(c => c._id !== customerToDelete._id))
        
        setIsDeleteDialogOpen(false)
        setCustomerToDelete(null)
        showSuccessToast("Đã xóa khách hàng thành công")
      } else {
        throw new Error(response.error || "Failed to delete customer")
      }
    } catch (error) {
      handleApiError(error, "Không thể xóa khách hàng")
    }
  }

  // Handle add new customer
  const handleAddNewCustomer = () => {
    setSelectedCustomer(null)
    setIsEditModalOpen(true)
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
        <div className="flex items-center gap-2">
          <DateRangePicker
            date={dateRange}
            onChange={handleDateRangeChange}
          />
          <Button variant="outline" size="icon" onClick={fetchCustomers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleAddNewCustomer}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm khách hàng
          </Button>
        </div>
      </div>

      <CardWrapper>
        <CustomerTable
          customers={customers}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
          onStatusToggle={handleStatusToggle}
        />
      </CardWrapper>

      {/* Edit Modal */}
      <CustomerEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khách hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khách hàng {customerToDelete?.username}? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
