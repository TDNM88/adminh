"use client"

import React, { useState, useEffect, ReactNode, Key } from "react"
import { 
  Bell, 
  HelpCircle, 
  Home, 
  Users, 
  History, 
  Clock, 
  Download, 
  Upload, 
  Settings as SettingsIcon,
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
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { UserMenu } from "@/components/user-menu"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { toast, useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { formatDateTime, formatDateOnly } from "@/lib/date-utils";
// Helper function for ISO date format needed for API calls
function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Helper function to format currency values
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount)
}

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

// Type definitions
type PageType = "dashboard" | "customers" | "order-history" | "trading-sessions" | "deposit-requests" | "withdrawal-requests" | "settings"

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
    cccdFrontImage?: string
    cccdBackImage?: string
  }
  verified?: boolean
  cccdFront?: boolean
  cccdBack?: boolean
  cccdFrontImage?: string
  cccdBackImage?: string
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
  status?: {
    active: boolean
    betLocked: boolean
    withdrawLocked: boolean
  }
  balance?: {
    available: number
    frozen: number
  }
  verification?: {
    verified: boolean
    cccdFront?: boolean
    cccdBack?: boolean
  }
}

type SessionStatusType = "active" | "completed" | "cancelled" | "upcoming" | string

// Define DateRangeType to match the Calendar component's expected type
type DateRangeType = {
  from: Date | undefined
  to: Date | undefined
}

type OrderType = "BUY" | "SELL"
type OrderResultType = "WIN" | "LOSE"
type OrderStatusType = "PENDING" | "COMPLETED" | "CANCELLED"
type WithdrawalStatusType = "PENDING" | "COMPLETED" | "REJECTED"
type DepositStatusType = "pending" | "approved" | "rejected"

// Thời gian mặc định cho mỗi phiên giao dịch (giây)
const SESSION_DURATION = 60; // 3 minutes in seconds

// Hàm tạo ID phiên giao dịch mới   
const generateFormattedSessionId = (): string => {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `S${timestamp.slice(0, 8)}${random}`;
};

// Alias for backward compatibility
const generateSessionId = generateFormattedSessionId;

interface TradingSession {
  id: string;
  startTime: Date | string;
  endTime: Date | string;
  status: SessionStatusType;
  result?: "up" | "down" | "LÊN" | "XUỐNG" | "Lên" | "Xuống" | string;
  totalBet: number;
  totalWin: number;
  participantCount: number;
  nextSessionId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  session: string;
  isWin?: boolean;
  progress?: number;
}

interface Customer {
  address?: string;
  idNumber?: string;
  dateOfBirth?: Date | string;
  notes?: string;
  referralCode?: string;
  vipLevel?: number;
  role?: string;
  _id?: string;
  id?: string;
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
  createdAt?: Date | string;
  lastLogin?: Date | string;
  balance?: {
    available: number;
    frozen: number;
  };
  available?: number;
  frozen?: number;
  status?: {
    active: boolean;
    betLocked: boolean;
    withdrawLocked: boolean;
  };
  active?: boolean;
  betLocked?: boolean;
  withdrawLocked?: boolean;
  verification?: {
    verified: boolean;
    cccdFront?: boolean;
    cccdBack?: boolean;
    cccdFrontImage?: string;
    cccdBackImage?: string;
  };
  verified?: boolean;
}

interface Order {
  id: Key | null | undefined;
  session: ReactNode;
  user: ReactNode;
  time: string;
  _id: string;
  userId: string;
  username?: string;
  type: OrderType;
  amount: number;
  price: number;
  total: number;
  status: OrderStatusType;
  createdAt: Date | string;
  updatedAt?: Date | string;
  result?: OrderResultType;
  profit?: number;
}

interface WithdrawalRequest {
  _id: string;
  userId: string;
  username?: string;
  amount: number;
  bankAccount: BankAccount;
  status: WithdrawalStatusType;
  createdAt: Date | string;
  updatedAt?: Date | string;
  completedAt?: Date | string;
  rejectedAt?: Date | string;
  rejectionReason?: string;
  receivedAmount?: number;
  processedAt?: Date | string;
}

interface OrderHistoryFilter {
  startDate?: Date | string;
  endDate?: Date | string;
  status?: string;
  type?: string;
  username?: string;
}

interface CustomDateRange {
  from: Date;
  to: Date;
}

interface CustomerFormData {
  username: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  idNumber?: string;
  dob?: string;
  referralCode?: string;
  active?: boolean;
  betLocked?: boolean;
  withdrawLocked?: boolean;
  verified?: boolean;
  cccdFrontVerified?: boolean;
  cccdBackVerified?: boolean;
  role?: string;
  notes?: string;
  balance?: {
    available: number;
    frozen: number;
  };
}

interface FileWithPreview extends File {
  preview?: string;
}

interface BankAccount {
  accountHolder: any;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface RequestStatus {
  _id: string;
  userId: string;
  username?: string;
  amount: number;
  receivedAmount?: number;
  status: DepositStatusType;
  bankAccount?: BankAccount;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  requestDate?: Date | string;
  processedDate?: Date | string;
  processedAt?: Date | string;
  note?: string;
  notes?: string;
  adminId?: string;
  adminName?: string;
  createdAt?: Date | string;
  type: string;
}

// Định nghĩa kiểu trạng thái yêu cầu
type RequestStatusType = "pending" | "approved" | "rejected";

// Dashboard Page Component
function DashboardPage() {
  const [recentSessions, setRecentSessions] = useState<TradingSession[]>([])
  const [newUsers, setNewUsers] = useState<Customer[]>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchRecentSessions()
    fetchNewUsers()
  }, [])

  // Fetch recent trading sessions
  const fetchRecentSessions = async () => {
    try {
      setIsLoadingSessions(true)
      const response = await fetch('/api/admin/sessions?limit=10')
      if (!response.ok) {
        throw new Error('Failed to fetch recent sessions')
      }
      const data = await response.json()
      setRecentSessions(data.sessions || [])
      setIsLoadingSessions(false)
    } catch (error) {
      console.error('Error fetching recent sessions:', error)
      setIsLoadingSessions(false)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu phiên giao dịch gần đây',
        variant: 'destructive',
      })
    }
  }

  // Fetch new users
  const fetchNewUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const response = await fetch('/api/admin/users?limit=5&sort=createdAt:desc')
      if (!response.ok) {
        throw new Error('Failed to fetch new users')
      }
      const data = await response.json()
      setNewUsers(data.users || [])
      setIsLoadingUsers(false)
    } catch (error) {
      console.error('Error fetching new users:', error)
      setIsLoadingUsers(false)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu người dùng mới',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180 từ tháng trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số tiền nạp</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.234.000đ</div>
            <p className="text-xs text-muted-foreground">+19% từ tháng trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số tiền rút</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573.000đ</div>
            <p className="text-xs text-muted-foreground">+201 từ tháng trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số phiên giao dịch</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 từ tháng trước</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// DashboardPage is already defined above

function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewImageDialogOpen, setIsViewImageDialogOpen] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)
  const [viewImageUrl, setViewImageUrl] = useState<string>('')  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const pageSize = 10

  // Khai báo hàm fetchCustomers ở cấp component để có thể sử dụng trong các hàm khác
  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      params.append('page', currentPage.toString())
      params.append('pageSize', pageSize.toString())
      
      const response = await fetch(`/api/admin/users?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch customers')
      
      const data = await response.json()
      setCustomers(data.users || [])
      setTotalPages(data.totalPages || 1)
      setTotalCustomers(data.totalCount || 0)
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách khách hàng',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Lấy dữ liệu từ form
    const username = (document.getElementById('username') as HTMLInputElement).value
    const fullName = (document.getElementById('fullName') as HTMLInputElement).value
    const email = (document.getElementById('email') as HTMLInputElement).value
    const phone = (document.getElementById('phone') as HTMLInputElement).value
    const address = (document.getElementById('address') as HTMLInputElement).value
    const idNumber = (document.getElementById('idNumber') as HTMLInputElement).value
    const dob = (document.getElementById('dob') as HTMLInputElement).value
    const referralCode = (document.getElementById('referralCode') as HTMLInputElement).value
    const notes = (document.getElementById('notes') as HTMLTextAreaElement).value
    const vipLevel = parseInt((document.getElementById('vipLevel') as HTMLInputElement).value) || 0
    const role = (document.getElementById('role') as HTMLSelectElement).value
    
    // Lấy trạng thái
    const active = (document.getElementById('active') as HTMLInputElement).checked
    const betLocked = (document.getElementById('betLocked') as HTMLInputElement).checked
    const withdrawLocked = (document.getElementById('withdrawLocked') as HTMLInputElement).checked
    
    // Lấy số dư
    const available = parseFloat((document.getElementById('available') as HTMLInputElement).value) || 0
    const frozen = parseFloat((document.getElementById('frozen') as HTMLInputElement).value) || 0
    
    // Lấy trạng thái xác minh
    const verified = (document.getElementById('verified') as HTMLInputElement).checked
    const cccdFront = (document.getElementById('cccdFront') as HTMLInputElement).checked
    const cccdBack = (document.getElementById('cccdBack') as HTMLInputElement).checked
    
    // Tạo đối tượng dữ liệu để gửi lên server
    const userData = {
      _id: currentCustomer?._id || currentCustomer?.id,
      username,
      fullName,
      email,
      phone,
      address,
      idNumber,
      dob: dob ? new Date(dob).toISOString() : undefined,
      referralCode,
      notes,
      vipLevel,
      role,
      status: {
        active,
        betLocked,
        withdrawLocked
      },
      balance: {
        available,
        frozen
      },
      verification: {
        verified,
        cccdFront,
        cccdBack,
        cccdFrontImage: currentCustomer?.verification?.cccdFrontImage || currentCustomer?.cccdFrontImage,
        cccdBackImage: currentCustomer?.verification?.cccdBackImage || currentCustomer?.cccdBackImage
      }
    }
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      
      if (response.ok) {
        toast({
          title: "Cập nhật thành công",
          description: "Thông tin khách hàng đã được cập nhật"
        })
        setIsEditDialogOpen(false)
        // Tải lại danh sách khách hàng
        fetchCustomers()
      } else {
        const errorData = await response.json()
        toast({
          title: "Lỗi",
          description: errorData.message || "Không thể cập nhật thông tin khách hàng",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating customer:", error)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi cập nhật thông tin khách hàng",
        variant: "destructive"
      })
    }
  }
  
  const confirmDeleteCustomer = async () => {
    if (!currentCustomer) return
    
    try {
      const response = await fetch(`/api/admin/users?id=${currentCustomer._id || currentCustomer.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast({
          title: "Xóa thành công",
          description: "Khách hàng đã được xóa khỏi hệ thống"
        })
        setIsDeleteDialogOpen(false)
        // Tải lại danh sách khách hàng
        fetchCustomers()
      } else {
        const errorData = await response.json()
        toast({
          title: "Lỗi",
          description: errorData.message || "Không thể xóa khách hàng",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi xóa khách hàng",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/admin/users?search=${searchTerm}&page=${currentPage}&pageSize=${pageSize}`)
        if (!response.ok) {
          throw new Error('Failed to fetch customers')
        }
        const data = await response.json()
        setCustomers(data.users || [])
        setTotalPages(data.totalPages || 1)
        setTotalCustomers(data.totalCount || 0)
      } catch (error) {
        console.error('Error fetching customers:', error)
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu khách hàng",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [searchTerm, currentPage, pageSize])

  // ...

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý khách hàng</h1>
      
      {/* ... */}
      
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <form className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm khách hàng..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
            <Button
              onClick={() => {
                setSearchTerm('')
                setCurrentPage(1)
              }}
              variant="outline"
              size="sm"
            >
              <RefreshCcwIcon className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên đăng nhập</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Số dư</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Xác minh</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer._id || customer.id}>
                    <TableCell>{customer.username}</TableCell>
                    <TableCell>{customer.fullName}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>
                          Khả dụng: {formatCurrency(customer.balance?.available || customer.available || 0)}
                        </span>
                        <span>
                          Đóng băng: {formatCurrency(customer.balance?.frozen || customer.frozen || 0)}
                        </span>
                        {(customer.vipLevel && customer.vipLevel > 0) && (
                          <span className="text-amber-500 font-medium">
                            VIP {customer.vipLevel}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={customer.status?.active || customer.active ? "default" : "destructive"}
                          className="w-fit"
                        >
                          {customer.status?.active || customer.active ? "Hoạt động" : "Tạm khóa"}
                        </Badge>
                        {(customer.status?.betLocked || customer.betLocked) && (
                          <Badge variant="outline" className="w-fit">
                            Khóa cược
                          </Badge>
                        )}
                        {(customer.status?.withdrawLocked || customer.withdrawLocked) && (
                          <Badge variant="outline" className="w-fit">
                            Khóa rút
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={customer.verification?.verified || customer.verified ? "outline" : "secondary"}
                          className="w-fit"
                        >
                          {customer.verification?.verified || customer.verified ? "Đã xác minh" : "Chưa xác minh"}
                        </Badge>
                        <div className="flex gap-1 mt-1">
                          {(customer.verification?.cccdFrontImage || customer.cccdFrontImage) && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setViewImageUrl(customer.verification?.cccdFrontImage || customer.cccdFrontImage || '')
                                setIsViewImageDialogOpen(true)
                              }}
                            >
                              <ImageIcon className="h-3 w-3" />
                            </Button>
                          )}
                          {(customer.verification?.cccdBackImage || customer.cccdBackImage) && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setViewImageUrl(customer.verification?.cccdBackImage || customer.cccdBackImage || '')
                                setIsViewImageDialogOpen(true)
                              }}
                            >
                              <ImageIcon className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setCurrentCustomer(customer)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                          onClick={() => {
                            setCurrentCustomer(customer)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                      Không tìm thấy khách hàng nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin khách hàng</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin chi tiết của khách hàng. Nhấn Lưu khi hoàn tất.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Tên đăng nhập
              </Label>
              <Input
                id="username"
                defaultValue={currentCustomer?.username}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right">
                Họ và tên
              </Label>
              <Input
                id="fullName"
                defaultValue={currentCustomer?.fullName || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                defaultValue={currentCustomer?.email || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Số điện thoại
              </Label>
              <Input
                id="phone"
                defaultValue={currentCustomer?.phone || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Địa chỉ
              </Label>
              <Input
                id="address"
                defaultValue={currentCustomer?.address || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="idNumber" className="text-right">
                Số CMND/CCCD
              </Label>
              <Input
                id="idNumber"
                defaultValue={currentCustomer?.idNumber || ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dateOfBirth" className="text-right">
                Ngày sinh
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                defaultValue={currentCustomer?.dateOfBirth ? new Date(currentCustomer.dateOfBirth).toISOString().split('T')[0] : ''}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="referralCode" className="text-right">
                Mã giới thiệu
              </Label>
              <Input
                id="referralCode"
                defaultValue={currentCustomer?.referralCode || ''}
                className="col-span-3"
              />
            </div>

            <h3 className="text-lg font-medium mt-4">Trạng thái tài khoản</h3>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Vai trò
              </Label>
              <Select defaultValue={currentCustomer?.role || 'user'}>
                <SelectTrigger id="role" className="col-span-3">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Người dùng</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                  <SelectItem value="moderator">Điều hành viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Trạng thái</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    defaultChecked={currentCustomer?.status?.active || currentCustomer?.active}
                  />
                  <Label htmlFor="active">Hoạt động</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="betLocked"
                    defaultChecked={currentCustomer?.status?.betLocked || currentCustomer?.betLocked}
                  />
                  <Label htmlFor="betLocked">Khóa đặt cược</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="withdrawLocked"
                    defaultChecked={currentCustomer?.status?.withdrawLocked || currentCustomer?.withdrawLocked}
                  />
                  <Label htmlFor="withdrawLocked">Khóa rút tiền</Label>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium mt-4">Thông tin tài chính</h3>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="availableBalance" className="text-right">
                Số dư khả dụng
              </Label>
              <Input
                id="availableBalance"
                type="number"
                defaultValue={currentCustomer?.balance?.available || currentCustomer?.available || 0}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frozenBalance" className="text-right">
                Số dư đóng băng
              </Label>
              <Input
                id="frozenBalance"
                type="number"
                defaultValue={currentCustomer?.balance?.frozen || currentCustomer?.frozen || 0}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vipLevel" className="text-right">
                Cấp độ VIP
              </Label>
              <Input
                id="vipLevel"
                type="number"
                min="0"
                max="10"
                defaultValue={currentCustomer?.vipLevel || 0}
                className="col-span-3"
              />
            </div>

            <h3 className="text-lg font-medium mt-4">Thông tin xác minh</h3>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Xác minh</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="verified"
                    defaultChecked={currentCustomer?.verification?.verified || currentCustomer?.verified}
                  />
                  <Label htmlFor="verified">Đã xác minh</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cccdFront"
                    defaultChecked={currentCustomer?.verification?.cccdFront || currentCustomer?.cccdFront}
                  />
                  <Label htmlFor="cccdFront">CCCD mặt trước</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="cccdBack"
                    defaultChecked={currentCustomer?.verification?.cccdBack || currentCustomer?.cccdBack}
                  />
                  <Label htmlFor="cccdBack">CCCD mặt sau</Label>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4 mt-2">
              <Label className="text-right mt-2">Ảnh CCCD</Label>
              <div className="col-span-3 space-y-4">
                <div>
                  <p className="mb-2 font-medium">Mặt trước:</p>
                  {currentCustomer?.verification?.cccdFrontImage || currentCustomer?.cccdFrontImage ? (
                    <div className="relative">
                      <img 
                        src={currentCustomer?.verification?.cccdFrontImage || currentCustomer?.cccdFrontImage} 
                        alt="CCCD mặt trước" 
                        className="max-w-[300px] border rounded-md" 
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2" 
                        onClick={() => {
                          if (currentCustomer?.verification?.cccdFrontImage || currentCustomer?.cccdFrontImage) {
                            setViewImageUrl(currentCustomer?.verification?.cccdFrontImage || currentCustomer?.cccdFrontImage || '');
                            setIsViewImageDialogOpen(true);
                          }
                        }}
                      >
                        Xem ảnh
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Chưa có ảnh</p>
                  )}
                  <div className="mt-2">
                    <Input
                      id="cccdFrontImageUpload"
                      type="file"
                      accept="image/*"
                      className="max-w-[300px]"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2" 
                      onClick={async () => {
                        const fileInput = document.getElementById('cccdFrontImageUpload') as HTMLInputElement;
                        if (fileInput?.files?.length) {
                          const formData = new FormData();
                          formData.append('file', fileInput.files[0]);
                          formData.append('userId', currentCustomer?._id || currentCustomer?.id || '');
                          formData.append('type', 'front');
                          
                          try {
                            toast({
                              title: "Đang tải lên...",
                              description: "Vui lòng đợi trong giây lát",
                            });
                            
                            const response = await fetch('/api/admin/users/upload-id', {
                              method: 'POST',
                              body: formData,
                            });
                            
                            if (response.ok) {
                              const data = await response.json();
                              toast({
                                title: "Tải lên thành công",
                                description: "Ảnh CCCD mặt trước đã được cập nhật",
                              });
                              // Cập nhật state nếu cần
                            } else {
                              toast({
                                title: "Lỗi",
                                description: "Không thể tải lên ảnh. Vui lòng thử lại sau.",
                                variant: "destructive",
                              });
                            }
                          } catch (error) {
                            toast({
                              title: "Lỗi",
                              description: "Đã xảy ra lỗi khi tải lên ảnh",
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                    >
                      Tải lên
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="mb-2 font-medium">Mặt sau:</p>
                  {currentCustomer?.verification?.cccdBackImage || currentCustomer?.cccdBackImage ? (
                    <div className="relative">
                      <img 
                        src={currentCustomer?.verification?.cccdBackImage || currentCustomer?.cccdBackImage} 
                        alt="CCCD mặt sau" 
                        className="max-w-[300px] border rounded-md" 
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2" 
                        onClick={() => {
                          if (currentCustomer?.verification?.cccdBackImage || currentCustomer?.cccdBackImage) {
                            setViewImageUrl(currentCustomer?.verification?.cccdBackImage || currentCustomer?.cccdBackImage || '');
                            setIsViewImageDialogOpen(true);
                          }
                        }}
                      >
                        Xem ảnh
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Chưa có ảnh</p>
                  )}
                  <div className="mt-2">
                    <Input
                      id="cccdBackImageUpload"
                      type="file"
                      accept="image/*"
                      className="max-w-[300px]"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2" 
                      onClick={async () => {
                        const fileInput = document.getElementById('cccdBackImageUpload') as HTMLInputElement;
                        if (fileInput?.files?.length) {
                          const formData = new FormData();
                          formData.append('file', fileInput.files[0]);
                          formData.append('userId', currentCustomer?._id || currentCustomer?.id || '');
                          formData.append('type', 'back');
                          
                          try {
                            toast({
                              title: "Đang tải lên...",
                              description: "Vui lòng đợi trong giây lát",
                            });
                            
                            const response = await fetch('/api/admin/users/upload-id', {
                              method: 'POST',
                              body: formData,
                            });
                            
                            if (response.ok) {
                              const data = await response.json();
                              toast({
                                title: "Tải lên thành công",
                                description: "Ảnh CCCD mặt sau đã được cập nhật",
                              });
                              // Cập nhật state nếu cần
                            } else {
                              toast({
                                title: "Lỗi",
                                description: "Không thể tải lên ảnh. Vui lòng thử lại sau.",
                                variant: "destructive",
                              });
                            }
                          } catch (error) {
                            toast({
                              title: "Lỗi",
                              description: "Đã xảy ra lỗi khi tải lên ảnh",
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                    >
                      Tải lên
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mt-4">Thông tin bổ sung</h3>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right">
                Ghi chú
              </Label>
              <Textarea
                id="notes"
                defaultValue={currentCustomer?.notes || ''}
                className="col-span-3"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Thời gian</Label>
              <div className="col-span-3 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Ngày tạo:</span> {currentCustomer?.createdAt ? new Date(currentCustomer.createdAt).toLocaleString() : 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Đăng nhập cuối:</span> {currentCustomer?.lastLogin ? new Date(currentCustomer.lastLogin).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditSubmit}>Lưu thay đổi</Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khách hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khách hàng này? Hành động này không thể hoàn tác.
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

      {/* View Image Dialog */}
      <Dialog open={isViewImageDialogOpen} onOpenChange={setIsViewImageDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Xem ảnh CCCD/CMND</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-4">
            {viewImageUrl && (
              <img src={viewImageUrl} alt="CCCD/CMND" className="max-w-full max-h-[70vh] object-contain" />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewImageDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Order History Page Component
function OrderHistoryPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("") // pending, completed, cancelled
  const [dateRange, setDateRange] = useState<DateRangeType>({
    from: undefined,
    to: undefined,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const pageSize = 10

  // Fetch orders with filters
  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      // Add filters to params
      if (searchTerm) params.append('username', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (dateRange.from) params.append('from', formatISODate(dateRange.from))
      if (dateRange.to) params.append('to', formatISODate(dateRange.to))
      
      // Add pagination
      params.append('page', currentPage.toString())
      params.append('pageSize', pageSize.toString())
      
      const response = await fetch(`/api/admin/orders?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      
      const data = await response.json()
      setOrders(data.orders || [])
      setTotalPages(data.totalPages || 1)
      setTotalOrders(data.totalCount || 0)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách đơn hàng',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch orders when filters or pagination changes
  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter])

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page
    fetchOrders()
  }

  // Handle date range change
  const handleDateRangeChange = (range: DateRangeType) => {
    setDateRange(range)
    if (range.from && range.to) {
      setCurrentPage(1) // Reset to first page when filter changes
      fetchOrders()
    }
  }

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  // Handle reset filters
  const handleResetFilters = () => {
    setSearchTerm("")
    setStatusFilter("")
    setDateRange({ from: undefined, to: undefined })
    setCurrentPage(1)
    fetchOrders()
  }

  // Get status badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default'
      case 'pending':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Get status display text
  const getStatusDisplayText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Hoàn thành'
      case 'pending':
        return 'Chờ xử lý'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return status
    }
  }

  // Get order type display text
  const getOrderTypeDisplayText = (type: string) => {
    switch (type.toLowerCase()) {
      case 'buy':
        return 'Mua'
      case 'sell':
        return 'Bán'
      default:
        return type
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lịch sử đơn hàng</h2>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <form onSubmit={handleSearch} className="flex space-x-2 col-span-2">
          <Input
            placeholder="Tìm theo tên đăng nhập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={handleResetFilters}
          >
            <RefreshCcwIcon className="h-4 w-4" />
          </Button>
        </form>

        <div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange.from && dateRange.to ? (
                  <span>
                    {formatDateOnly(dateRange.from)} - {formatDateOnly(dateRange.to)}
                  </span>
                ) : (
                  <span>Chọn khoảng thời gian</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => handleDateRangeChange(range as DateRangeType || { from: undefined, to: undefined } as DateRangeType)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border rounded-md">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64">
            <p className="text-muted-foreground">Không có đơn hàng nào</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Đơn hàng</TableHead>
                  <TableHead>Tên đăng nhập</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Loại lệnh</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian tạo</TableHead>
                  <TableHead>Thời gian cập nhật</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">{order._id}</TableCell>
                    <TableCell>{order.username}</TableCell>
                    <TableCell>{formatCurrency(order.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={order.type.toLowerCase() === 'buy' ? 'default' : 'secondary'}>
                        {getOrderTypeDisplayText(order.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {getStatusDisplayText(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateTime(new Date(order.createdAt))}</TableCell>
                    <TableCell>
                      {order.updatedAt ? formatDateTime(new Date(order.updatedAt)) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-2 border-t">
              <div className="text-sm text-muted-foreground">
                Hiển thị <span className="font-medium">{orders.length}</span> / {totalOrders} đơn hàng
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <div className="text-sm">
                  Trang {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export { DashboardPage, CustomersPage, OrderHistoryPage };

export function AdminDashboard() {
  const [activePage, setActivePage] = useState<PageType>("dashboard")

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <SidebarProvider>
        <div className="hidden lg:flex flex-col w-64 border-r bg-background">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <Button
              variant={activePage === "dashboard" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActivePage("dashboard")}
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activePage === "customers" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActivePage("customers")}
            >
              <Users className="mr-2 h-4 w-4" />
              Quản lý người dùng
            </Button>
            <Button
              variant={activePage === "order-history" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActivePage("order-history")}
            >
              <History className="mr-2 h-4 w-4" />
              Lịch sử giao dịch
            </Button>
          </nav>
        </div>
        <div className="flex flex-col flex-1">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="lg:hidden">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Home className="h-4 w-4" />
              </Button>
            </SidebarTrigger>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                {activePage === "dashboard" && "Dashboard"}
                {activePage === "customers" && "Quản lý người dùng"}
                {activePage === "order-history" && "Lịch sử giao dịch"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            {activePage === "dashboard" && <DashboardPage />}
            {activePage === "customers" && <CustomersPage />}
            {activePage === "order-history" && <OrderHistoryPage />}
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}

