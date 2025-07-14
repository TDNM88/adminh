"use client"

import React, { useState, useEffect } from "react"
import { 
  Edit as EditIcon,
  Trash2,
  Search,
  Loader2,
  X as XIcon,
  FileImage,
  RefreshCcw as RefreshCcwIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Pencil as PencilIcon,
  Trash as TrashIcon,
  Image as ImageIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast, useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { formatDateTime, formatDateOnly } from "@/lib/date-utils"

import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,  
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

// Helper function for ISO date format needed for API calls
function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Helper function to format currency
function formatCurrency(amount: number, useCurrencySymbol: boolean = true): string {
  return new Intl.NumberFormat('vi-VN', { 
    style: useCurrencySymbol ? 'currency' : 'decimal',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount)
}

// Helper function to format date string
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Type definitions
interface Customer {
  _id?: string
  id?: string
  username: string
  fullName?: string
  email?: string
  phone?: string
  balance?: {
    available: number
    frozen: number
  }
  available?: number
  frozen?: number
  status?: {
    active: boolean
    betLocked: boolean
    withdrawLocked: boolean
  }
  active?: boolean
  betLocked?: boolean
  withdrawLocked?: boolean
  verification?: {
    verified: boolean
    cccdFront?: boolean
    cccdBack?: boolean
  }
  verified?: boolean
  cccdFront?: boolean
  cccdBack?: boolean
  cccdFrontImage?: string | null
  cccdBackImage?: string | null
  createdAt?: string | Date
  lastLogin?: string | Date
  role?: string
  address?: string
  idNumber?: string
  dateOfBirth?: Date | string
  notes?: string
  referralCode?: string
  vipLevel?: number
}

interface CustomerFormData {
  username: string
  fullName?: string
  email?: string
  phone?: string
  address?: string
  idNumber?: string
  dateOfBirth?: string
  referralCode?: string
  notes?: string
  vipLevel?: number
  role?: string
  active: boolean
  betLocked: boolean
  withdrawLocked: boolean
  available: number
  frozen: number
  verified: boolean
  cccdFront?: boolean
  cccdBack?: boolean
}

// Customers Page Component
export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    active: true,
    betLocked: false,
    withdrawLocked: false,
    available: 0,
    frozen: 0,
    verified: false,
    cccdFront: false,
    cccdBack: false,
    address: "",
    idNumber: "",
    dateOfBirth: "",
    notes: "",
    referralCode: "",
    vipLevel: 0,
    role: "user"
  });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedVerification, setSelectedVerification] = useState("all");
  
  const [cccdFrontFile, setCccdFrontFile] = useState<File | null>(null);
  const [cccdBackFile, setCccdBackFile] = useState<File | null>(null);
  const [cccdFrontPreview, setCccdFrontPreview] = useState<string | null>(null);
  const [cccdBackPreview, setCccdBackPreview] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Filter customers based on search query and filters
  const filteredCustomers = customers.filter(customer => {
    // Search query filter
    const matchesSearch = 
      customer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.fullName && customer.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.phone && customer.phone.includes(searchQuery));
    
    // Status filter
    const matchesStatus = 
      selectedStatus === "all" ||
      (selectedStatus === "active" && customer.status?.active) ||
      (selectedStatus === "inactive" && !customer.status?.active) ||
      (selectedStatus === "betLocked" && customer.status?.betLocked) ||
      (selectedStatus === "withdrawLocked" && customer.status?.withdrawLocked);
    
    // Verification filter
    const matchesVerification = 
      selectedVerification === "all" ||
      (selectedVerification === "verified" && customer.verification?.verified) ||
      (selectedVerification === "unverified" && !customer.verification?.verified);
    
    return matchesSearch && matchesStatus && matchesVerification;
  });
  
  // Fetch customers from API
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users?page=${currentPage}&search=${searchQuery}&status=${selectedStatus}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      
      // Transform API data to match our Customer interface
      const transformedCustomers: Customer[] = data.users.map((user: any) => ({
        id: user._id,
        _id: user._id,
        username: user.username,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        balance: user.balance || { available: 0, frozen: 0 },
        status: user.status || { active: true, betLocked: false, withdrawLocked: false },
        verification: user.verification || { verified: false, cccdFront: false, cccdBack: false },
        cccdFrontImage: user.verification?.cccdFrontImage || null,
        cccdBackImage: user.verification?.cccdBackImage || null,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        role: user.role || 'user',
        address: user.address || '',
        idNumber: user.idNumber || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
        notes: user.notes || '',
        referralCode: user.referralCode || '',
        vipLevel: user.vipLevel || 0
      }));
      
      setCustomers(transformedCustomers);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load customers on component mount and when filters change
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchQuery, selectedStatus]);
  
  const handleEditCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    setFormData({
      username: customer.username,
      fullName: customer.fullName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      active: customer.status?.active || false,
      betLocked: customer.status?.betLocked || false,
      withdrawLocked: customer.status?.withdrawLocked || false,
      available: customer.balance?.available || 0,
      frozen: customer.balance?.frozen || 0,
      verified: customer.verification?.verified || false,
      cccdFront: customer.verification?.cccdFront || false,
      cccdBack: customer.verification?.cccdBack || false,
      address: customer.address || "",
      idNumber: customer.idNumber || "",
      dateOfBirth: customer.dateOfBirth ? 
        (typeof customer.dateOfBirth === 'string' ? 
          customer.dateOfBirth : 
          formatDateString(customer.dateOfBirth)
        ) : "",
      notes: customer.notes || "",
      referralCode: customer.referralCode || "",
      vipLevel: customer.vipLevel || 0,
      role: customer.role || "user"
    });
    
    // Set CCCD image previews if available
    setCccdFrontPreview(customer.cccdFrontImage || null);
    setCccdBackPreview(customer.cccdBackImage || null);
    
    setIsEditModalOpen(true);
  };
  
  const handleSaveCustomer = async () => {
    if (!currentCustomer) return;
    
    try {
      // First upload any new CCCD images if they exist
      let frontImagePath = cccdFrontPreview;
      let backImagePath = cccdBackPreview;
      
      if (cccdFrontFile) {
        const frontImageData = await uploadCCCDImage(cccdFrontFile, currentCustomer.id || '', 'front');
        frontImagePath = frontImageData.imagePath;
      }
      
      if (cccdBackFile) {
        const backImageData = await uploadCCCDImage(cccdBackFile, currentCustomer.id || '', 'back');
        backImagePath = backImageData.imagePath;
      }
      
      // Prepare user data for update
      const userData = {
        id: currentCustomer.id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        status: {
          active: formData.active,
          betLocked: formData.betLocked,
          withdrawLocked: formData.withdrawLocked
        },
        balance: {
          available: formData.available,
          frozen: formData.frozen
        },
        verification: {
          verified: formData.verified,
          cccdFront: formData.cccdFront,
          cccdBack: formData.cccdBack,
          cccdFrontImage: frontImagePath,
          cccdBackImage: backImagePath
        },
        address: formData.address,
        idNumber: formData.idNumber,
        dateOfBirth: formData.dateOfBirth,
        notes: formData.notes,
        referralCode: formData.referralCode,
        vipLevel: formData.vipLevel,
        role: formData.role
      };
      
      // Send update to API
      const response = await fetch(`/api/admin/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      // Update the customer in the local state
      const updatedCustomers = customers.map(c => {
        if (c.id === currentCustomer.id) {
          return {
            ...c,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            status: {
              active: formData.active,
              betLocked: formData.betLocked,
              withdrawLocked: formData.withdrawLocked
            },
            balance: {
              available: formData.available,
              frozen: formData.frozen
            },
            verification: {
              verified: formData.verified,
              cccdFront: formData.cccdFront,
              cccdBack: formData.cccdBack
            },
            cccdFrontImage: frontImagePath,
            cccdBackImage: backImagePath,
            address: formData.address,
            idNumber: formData.idNumber,
            dateOfBirth: formData.dateOfBirth,
            notes: formData.notes,
            referralCode: formData.referralCode,
            vipLevel: formData.vipLevel,
            role: formData.role
          };
        }
        return c;
      });
      
      setCustomers(updatedCustomers);
      setIsEditModalOpen(false);
      
      // Show success toast
      toast({
        title: "Cập nhật thành công",
        description: `Thông tin của ${formData.username} đã được cập nhật.`,
      });
      
      // Reset form and file states
      setCurrentCustomer(null);
      setCccdFrontFile(null);
      setCccdBackFile(null);
      setCccdFrontPreview(null);
      setCccdBackPreview(null);
      
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin người dùng",
        variant: "destructive"
      });
    }
  };
  
  // Helper function to upload CCCD images
  const uploadCCCDImage = async (file: File, userId: string, type: 'front' | 'back') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('type', type);
    
    const response = await fetch('/api/admin/users/upload-id', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upload ${type} image`);
    }
    
    return response.json();
  };
  
  const handleDeleteCustomer = (id: string) => {
    setCustomerToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    try {
      // Send delete request to API
      const response = await fetch(`/api/admin/users?id=${customerToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      // Remove the customer from the list
      const updatedCustomers = customers.filter(c => c.id !== customerToDelete);
      setCustomers(updatedCustomers);
      
      // Show success toast
      toast({
        title: "Xóa thành công",
        description: "Người dùng đã được xóa khỏi hệ thống.",
      });
      
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };
  
  const handleCccdFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCccdFrontFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCccdFrontPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCccdBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCccdBackFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCccdBackPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveCccdFront = () => {
    setCccdFrontFile(null);
    setCccdFrontPreview(null);
  };
  
  const handleRemoveCccdBack = () => {
    setCccdBackFile(null);
    setCccdBackPreview(null);
  };
  
  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Render UI
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý khách hàng</CardTitle>
          <CardDescription>
            Xem và quản lý thông tin khách hàng trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and filter controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Đã khóa</SelectItem>
                <SelectItem value="betLocked">Khóa đặt cược</SelectItem>
                <SelectItem value="withdrawLocked">Khóa rút tiền</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedVerification} onValueChange={setSelectedVerification}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Xác thực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="verified">Đã xác thực</SelectItem>
                <SelectItem value="unverified">Chưa xác thực</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchCustomers()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcwIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Customers table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên đăng nhập</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Số dư</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Xác thực</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="mt-2 text-sm text-muted-foreground">Đang tải dữ liệu...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <p className="text-muted-foreground">Không tìm thấy khách hàng nào</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id || customer._id}>
                      <TableCell className="font-medium">{customer.username}</TableCell>
                      <TableCell>{customer.fullName || "--"}</TableCell>
                      <TableCell>{customer.email || "--"}</TableCell>
                      <TableCell>{customer.phone || "--"}</TableCell>
                      <TableCell>
                        {formatCurrency(customer.balance?.available || 0)}
                      </TableCell>
                      <TableCell>
                        {customer.status?.active ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Đã khóa
                          </Badge>
                        )}
                        {customer.status?.betLocked && (
                          <Badge variant="outline" className="ml-1 bg-amber-50 text-amber-700 border-amber-200">
                            Khóa đặt cược
                          </Badge>
                        )}
                        {customer.status?.withdrawLocked && (
                          <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-700 border-blue-200">
                            Khóa rút tiền
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.verification?.verified ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Đã xác thực
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Chưa xác thực
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <EditIcon className="h-4 w-4" />
                            <span className="sr-only">Chỉnh sửa</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCustomer(customer.id || customer._id || "")}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Xóa</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage <= 1 || isLoading}
              >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages || isLoading}
              >
                Sau
                <ChevronRightIcon className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Edit Customer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin khách hàng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi tiết của khách hàng {formData.username}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
              
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  value={formData.username}
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="idNumber">Số CMND/CCCD</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="referralCode">Mã giới thiệu</Label>
                <Input
                  id="referralCode"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
                />
              </div>
            </div>
            
            {/* Account Status and Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Trạng thái tài khoản</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Hoạt động</Label>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="betLocked">Khóa đặt cược</Label>
                <Switch
                  id="betLocked"
                  checked={formData.betLocked}
                  onCheckedChange={(checked) => setFormData({...formData, betLocked: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="withdrawLocked">Khóa rút tiền</Label>
                <Switch
                  id="withdrawLocked"
                  checked={formData.withdrawLocked}
                  onCheckedChange={(checked) => setFormData({...formData, withdrawLocked: checked})}
                />
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="text-lg font-medium">Thông tin tài chính</h3>
              
              <div className="space-y-2">
                <Label htmlFor="available">Số dư khả dụng</Label>
                <Input
                  id="available"
                  type="number"
                  value={formData.available}
                  onChange={(e) => setFormData({...formData, available: Number(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frozen">Số dư đóng băng</Label>
                <Input
                  id="frozen"
                  type="number"
                  value={formData.frozen}
                  onChange={(e) => setFormData({...formData, frozen: Number(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vipLevel">Cấp VIP</Label>
                <Input
                  id="vipLevel"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.vipLevel}
                  onChange={(e) => setFormData({...formData, vipLevel: Number(e.target.value)})}
                />
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="text-lg font-medium">Xác thực</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="verified">Đã xác thực</Label>
                <Switch
                  id="verified"
                  checked={formData.verified}
                  onCheckedChange={(checked) => setFormData({...formData, verified: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="cccdFront">Xác thực CCCD mặt trước</Label>
                <Switch
                  id="cccdFront"
                  checked={formData.cccdFront}
                  onCheckedChange={(checked) => setFormData({...formData, cccdFront: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="cccdBack">Xác thực CCCD mặt sau</Label>
                <Switch
                  id="cccdBack"
                  checked={formData.cccdBack}
                  onCheckedChange={(checked) => setFormData({...formData, cccdBack: checked})}
                />
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="text-lg font-medium">Quyền hạn</h3>
              
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({...formData, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Người dùng</SelectItem>
                    <SelectItem value="moderator">Quản trị viên</SelectItem>
                    <SelectItem value="admin">Quản trị cấp cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          {/* CCCD/CMND Image Management */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Ảnh CMND/CCCD</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Front Image */}
              <div className="space-y-2">
                <Label>Mặt trước CMND/CCCD</Label>
                <div className="border rounded-md p-4">
                  {cccdFrontPreview ? (
                    <div className="relative">
                      <img 
                        src={cccdFrontPreview} 
                        alt="CCCD mặt trước" 
                        className="w-full h-auto rounded-md" 
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveCccdFront}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <FileImage className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">Chưa có ảnh mặt trước</p>
                      <Label
                        htmlFor="cccd-front-upload"
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                      >
                        Tải lên ảnh mặt trước
                      </Label>
                      <Input
                        id="cccd-front-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCccdFrontChange}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Back Image */}
              <div className="space-y-2">
                <Label>Mặt sau CMND/CCCD</Label>
                <div className="border rounded-md p-4">
                  {cccdBackPreview ? (
                    <div className="relative">
                      <img 
                        src={cccdBackPreview} 
                        alt="CCCD mặt sau" 
                        className="w-full h-auto rounded-md" 
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveCccdBack}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <FileImage className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-4">Chưa có ảnh mặt sau</p>
                      <Label
                        htmlFor="cccd-back-upload"
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
                      >
                        Tải lên ảnh mặt sau
                      </Label>
                      <Input
                        id="cccd-back-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCccdBackChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveCustomer}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCustomer} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
