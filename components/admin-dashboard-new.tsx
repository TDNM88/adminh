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
import { addMinutes } from "date-fns"
import { formatDateTime, formatDateOnly } from "@/lib/date-utils";

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

// Helper function to format date
function formatDate(date: Date): string {
  return formatDateTime(date)
}

// Helper function to render status badge
function renderStatusBadge(status: string): React.ReactNode {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default"
  
  switch (status) {
    case "completed":
      variant = "default"
      break
    case "pending":
      variant = "secondary"
      break
    case "cancelled":
      variant = "destructive"
      break
    default:
      variant = "outline"
  }
  
  return <Badge variant={variant}>{status}</Badge>
}

// Helper function to format date string
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

type SessionStatusType = "pending" | "completed" | "cancelled"
type OrderType = "bet" | "deposit" | "withdrawal"
type OrderResultType = "win" | "lose" | "draw"
type OrderStatusType = "pending" | "completed" | "cancelled"
type WithdrawalStatusType = "pending" | "completed" | "cancelled"
type DepositStatusType = "pending" | "completed" | "cancelled"

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
  balance: {
    available: number
    frozen: number
  }
  verification: {
    verified: boolean
    cccdFront?: boolean
    cccdBack?: boolean
  }
  verified: boolean
  cccdFront?: boolean
  cccdBack?: boolean
}

// SessionStatusType already defined above
// "pending" | "active" | "completed" | "cancelled"

// Define DateRangeType to match the Calendar component's expected type
interface DateRangeType {
  from: Date | undefined
  to: Date | undefined
}

// OrderType already defined above
// "bet" | "deposit" | "withdrawal" | "bonus" | "admin-adjustment"
// OrderResultType already defined above
// "win" | "lose" | "pending" | "cancelled"
// OrderStatusType already defined above
// "pending" | "completed" | "cancelled"
// WithdrawalStatusType already defined above
// "pending" | "completed" | "cancelled"
// DepositStatusType already defined above
// "pending" | "completed" | "cancelled"

// Thời gian mặc định cho mỗi phiên giao dịch (giây)
const SESSION_DURATION = 60; // 3 minutes in seconds

// Hàm tạo ID phiên giao dịch mới
function generateFormattedSessionId(): string {
  const timestamp = Date.now();
  return `SES-${timestamp.toString().substring(timestamp.toString().length - 6)}`;
}

// Alias for backward compatibility
const generateSessionId = generateFormattedSessionId;

interface TradingSession {
  id: string
  startTime: Date | string
  endTime: Date | string
  status: SessionStatusType
  result?: "up" | "down" | "LÊN" | "XUỐNG" | "Lên" | "Xuống" | string
  totalBet: number
  totalWin: number
  participantCount: number
  nextSessionId?: string
  createdAt?: string | Date
  updatedAt?: string | Date
  session: string
  isWin?: boolean
  progress?: number
}

// Dashboard Page Component
export function DashboardPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số người dùng
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu tháng này
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(12500000)}</div>
            <p className="text-xs text-muted-foreground">
              +5% so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Yêu cầu nạp tiền chờ xử lý
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              -2 so với hôm qua
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Yêu cầu rút tiền chờ xử lý
            </CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +3 so với hôm qua
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tổng quan giao dịch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border rounded">
              <p className="text-sm text-muted-foreground">Biểu đồ giao dịch sẽ hiển thị ở đây</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1 flex justify-between">
                  <p className="text-sm">user123 đã nạp tiền</p>
                  <p className="text-sm text-muted-foreground">2 phút trước</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-yellow-500" />
                <div className="flex-1 flex justify-between">
                  <p className="text-sm">user456 đã yêu cầu rút tiền</p>
                  <p className="text-sm text-muted-foreground">15 phút trước</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1 flex justify-between">
                  <p className="text-sm">Phiên giao dịch SES-001 đã kết thúc</p>
                  <p className="text-sm text-muted-foreground">30 phút trước</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                <div className="flex-1 flex justify-between">
                  <p className="text-sm">Yêu cầu rút tiền của user789 đã bị từ chối</p>
                  <p className="text-sm text-muted-foreground">1 giờ trước</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Customers Page Component
export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "1",
      username: "user123",
      fullName: "Nguyễn Văn A",
      email: "user123@example.com",
      phone: "0901234567",
      balance: { available: 1000000, frozen: 0 },
      status: { active: true, betLocked: false, withdrawLocked: false },
      verification: { verified: true, cccdFront: true, cccdBack: true },
      createdAt: new Date("2023-01-15"),
      lastLogin: new Date("2023-06-10"),
      role: "user",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      idNumber: "123456789012",
      dateOfBirth: new Date("1990-05-15"),
      notes: "Khách hàng VIP",
      referralCode: "REF123",
      vipLevel: 2
    },
    {
      id: "2",
      username: "user456",
      fullName: "Trần Thị B",
      email: "user456@example.com",
      phone: "0909876543",
      balance: { available: 500000, frozen: 100000 },
      status: { active: true, betLocked: true, withdrawLocked: false },
      verification: { verified: true, cccdFront: true, cccdBack: false },
      createdAt: new Date("2023-02-20"),
      lastLogin: new Date("2023-06-09"),
      role: "user",
      address: "456 Đường XYZ, Quận 2, TP.HCM",
      idNumber: "098765432109",
      dateOfBirth: new Date("1995-10-20"),
      notes: "",
      referralCode: "REF456",
      vipLevel: 1
    },
    {
      id: "3",
      username: "user789",
      fullName: "Lê Văn C",
      email: "user789@example.com",
      phone: "0912345678",
      balance: { available: 2000000, frozen: 0 },
      status: { active: false, betLocked: false, withdrawLocked: true },
      verification: { verified: false, cccdFront: false, cccdBack: false },
      createdAt: new Date("2023-03-10"),
      lastLogin: new Date("2023-05-15"),
      role: "user",
      address: "789 Đường DEF, Quận 3, TP.HCM",
      idNumber: "",
      dateOfBirth: new Date("1988-12-05"),
      notes: "Tài khoản bị khóa do vi phạm điều khoản",
      referralCode: "REF789",
      vipLevel: 0
    }
  ]);
  
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
  
  const handleSaveCustomer = () => {
    if (!currentCustomer) return;
    
    // Update the customer in the list
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
            cccdBack: formData.cccdBack,
            cccdFrontImage: cccdFrontPreview || c.cccdFrontImage,
            cccdBackImage: cccdBackPreview || c.cccdBackImage
          },
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
  };
  
  const handleDeleteCustomer = (id: string) => {
    setCustomerToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteCustomer = () => {
    if (!customerToDelete) return;
    
    // Remove the customer from the list
    const updatedCustomers = customers.filter(c => c.id !== customerToDelete);
    setCustomers(updatedCustomers);
    
    // Show success toast
    toast({
      title: "Xóa thành công",
      description: "Người dùng đã được xóa khỏi hệ thống.",
    });
    
    setIsDeleteDialogOpen(false);
    setCustomerToDelete(null);
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
  
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Tìm kiếm theo tên, email, số điện thoại..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px]"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Xác minh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="verified">Đã xác minh</SelectItem>
              <SelectItem value="unverified">Chưa xác minh</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Customers Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số dư</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Xác minh</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.username}</TableCell>
                <TableCell>{customer.fullName}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{formatCurrency(customer.balance?.available || 0)}</TableCell>
                <TableCell>
                  {customer.status?.active ? (
                    <Badge>Hoạt động</Badge>
                  ) : (
                    <Badge variant="destructive">Đã khóa</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {customer.verification?.verified ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Đã xác minh
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Chưa xác minh
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditCustomer(customer)}>
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteCustomer(customer.id || "")}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Edit Customer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chi tiết cho người dùng {formData.username}
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
                <Label htmlFor="fullName">Họ tên</Label>
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
        
        {/* Account Status & Financial Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Trạng thái tài khoản</h3>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="active" 
              checked={formData.active} 
              onCheckedChange={(checked) => setFormData({...formData, active: checked})} 
            />
            <Label htmlFor="active">Tài khoản hoạt động</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="betLocked" 
              checked={formData.betLocked} 
              onCheckedChange={(checked) => setFormData({...formData, betLocked: checked})} 
            />
            <Label htmlFor="betLocked">Khóa đặt cược</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="withdrawLocked" 
              checked={formData.withdrawLocked} 
              onCheckedChange={(checked) => setFormData({...formData, withdrawLocked: checked})} 
            />
            <Label htmlFor="withdrawLocked">Khóa rút tiền</Label>
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
            <Select 
              value={(formData.vipLevel || 0).toString()} 
              onValueChange={(value) => setFormData({...formData, vipLevel: Number(value)})}
            >
              <SelectTrigger id="vipLevel">
                <SelectValue placeholder="Chọn cấp VIP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Không VIP</SelectItem>
                <SelectItem value="1">VIP 1</SelectItem>
                <SelectItem value="2">VIP 2</SelectItem>
                <SelectItem value="3">VIP 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator className="my-4" />
          
          <h3 className="text-lg font-medium">Xác minh danh tính</h3>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="verified" 
                  checked={formData.verified} 
                  onCheckedChange={(checked) => setFormData({...formData, verified: checked})} 
                />
                <Label htmlFor="verified">Đã xác minh</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="cccdFront" 
                  checked={formData.cccdFront} 
                  onCheckedChange={(checked) => setFormData({...formData, cccdFront: checked})} 
                />
                <Label htmlFor="cccdFront">Xác minh mặt trước CCCD</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="cccdBack" 
                  checked={formData.cccdBack} 
                  onCheckedChange={(checked) => setFormData({...formData, cccdBack: checked})} 
                />
                <Label htmlFor="cccdBack">Xác minh mặt sau CCCD</Label>
              </div>
              
              {/* CCCD Image Upload */}
              <div className="space-y-4 mt-4">
                <h4 className="font-medium">Ảnh CMND/CCCD</h4>
                
                {/* Front Image */}
                <div className="space-y-2">
                  <Label>Mặt trước</Label>
                  <div className="border rounded-md p-4">
                    {cccdFrontPreview ? (
                      <div className="relative">
                        <img 
                          src={cccdFrontPreview} 
                          alt="CCCD Front" 
                          className="max-h-40 rounded-md mx-auto"
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-0 right-0 h-6 w-6"
                          onClick={handleRemoveCccdFront}
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4">
                        <FileImage className="h-10 w-10 text-muted-foreground mb-2" />
                        <Label 
                          htmlFor="cccdFrontUpload" 
                          className="cursor-pointer text-sm text-primary hover:underline"
                        >
                          Tải lên ảnh mặt trước
                        </Label>
                        <Input 
                          id="cccdFrontUpload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleCccdFrontChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Back Image */}
                <div className="space-y-2">
                  <Label>Mặt sau</Label>
                  <div className="border rounded-md p-4">
                    {cccdBackPreview ? (
                      <div className="relative">
                        <img 
                          src={cccdBackPreview} 
                          alt="CCCD Back" 
                          className="max-h-40 rounded-md mx-auto"
                        />
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-0 right-0 h-6 w-6"
                          onClick={handleRemoveCccdBack}
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4">
                        <FileImage className="h-10 w-10 text-muted-foreground mb-2" />
                        <Label 
                          htmlFor="cccdBackUpload" 
                          className="cursor-pointer text-sm text-primary hover:underline"
                        >
                          Tải lên ảnh mặt sau
                        </Label>
                        <Input 
                          id="cccdBackUpload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleCccdBackChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="space-y-4 py-4">
            <h3 className="text-lg font-medium">Thông tin bổ sung</h3>
            
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({...formData, role: value})}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Người dùng</SelectItem>
                  <SelectItem value="moderator">Điều hành viên</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea 
                id="notes" 
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSaveCustomer}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Người dùng này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCustomer} className="bg-destructive text-destructive-foreground">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Order History Page Component
function OrderHistoryPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Lịch sử giao dịch</h2>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Giao dịch</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">TRX-001</TableCell>
              <TableCell>user123</TableCell>
              <TableCell>Đặt cược</TableCell>
              <TableCell>{formatCurrency(100000)}</TableCell>
              <TableCell>{formatDate(new Date())}</TableCell>
              <TableCell>{renderStatusBadge("completed")}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <EditIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">TRX-002</TableCell>
              <TableCell>user456</TableCell>
              <TableCell>Nạp tiền</TableCell>
              <TableCell>{formatCurrency(500000)}</TableCell>
              <TableCell>{formatDate(addMinutes(new Date(), -30))}</TableCell>
              <TableCell>{renderStatusBadge("completed")}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <EditIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">TRX-003</TableCell>
              <TableCell>user789</TableCell>
              <TableCell>Rút tiền</TableCell>
              <TableCell>{formatCurrency(200000)}</TableCell>
              <TableCell>{formatDate(addMinutes(new Date(), -60))}</TableCell>
              <TableCell>{renderStatusBadge("pending")}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <EditIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Sessions Page Component
function SessionsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Quản lý phiên giao dịch</h2>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Phiên</TableHead>
              <TableHead>Thời gian bắt đầu</TableHead>
              <TableHead>Thời gian kết thúc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Kết quả</TableHead>
              <TableHead>Tổng đặt cược</TableHead>
              <TableHead>Tổng thắng</TableHead>
              <TableHead>Số người tham gia</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">SES-001</TableCell>
              <TableCell>{formatDate(new Date())}</TableCell>
              <TableCell>{formatDate(addMinutes(new Date(), 3))}</TableCell>
              <TableCell>{renderStatusBadge("completed")}</TableCell>
              <TableCell>Tăng</TableCell>
              <TableCell>{formatCurrency(5000000)}</TableCell>
              <TableCell>{formatCurrency(3000000)}</TableCell>
              <TableCell>12</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <EditIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">SES-002</TableCell>
              <TableCell>{formatDate(addMinutes(new Date(), -10))}</TableCell>
              <TableCell>{formatDate(addMinutes(new Date(), -7))}</TableCell>
              <TableCell>{renderStatusBadge("completed")}</TableCell>
              <TableCell>Giảm</TableCell>
              <TableCell>{formatCurrency(3500000)}</TableCell>
              <TableCell>{formatCurrency(2100000)}</TableCell>
              <TableCell>8</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <EditIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">SES-003</TableCell>
              <TableCell>{formatDate(addMinutes(new Date(), 5))}</TableCell>
              <TableCell>{formatDate(addMinutes(new Date(), 8))}</TableCell>
              <TableCell>{renderStatusBadge("pending")}</TableCell>
              <TableCell>-</TableCell>
              <TableCell>{formatCurrency(2100000)}</TableCell>
              <TableCell>-</TableCell>
              <TableCell>5</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <EditIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Deposit Requests Page Component
function DepositRequestsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Quản lý yêu cầu nạp tiền</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Tìm kiếm theo tên người dùng, mã giao dịch..."
            className="w-[300px]"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Đang chờ</SelectItem>
              <SelectItem value="completed">Đã hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã giao dịch</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Phương thức</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">DEP-001</TableCell>
              <TableCell>user123</TableCell>
              <TableCell>{formatCurrency(1000000)}</TableCell>
              <TableCell>Chuyển khoản ngân hàng</TableCell>
              <TableCell>{formatDate(new Date())}</TableCell>
              <TableCell>{renderStatusBadge("pending")}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Duyệt</Button>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive">Từ chối</Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">DEP-002</TableCell>
              <TableCell>user456</TableCell>
              <TableCell>{formatCurrency(2000000)}</TableCell>
              <TableCell>Ví điện tử</TableCell>
              <TableCell>{formatDate(addMinutes(new Date(), -30))}</TableCell>
              <TableCell>{renderStatusBadge("completed")}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <EditIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">DEP-003</TableCell>
              <TableCell>user789</TableCell>
              <TableCell>{formatCurrency(500000)}</TableCell>
              <TableCell>Thẻ cào</TableCell>
              <TableCell>{formatDate(addMinutes(new Date(), -120))}</TableCell>
              <TableCell>{renderStatusBadge("cancelled")}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <EditIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Withdrawal Requests Page Component
function WithdrawalRequestsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Quản lý yêu cầu rút tiền</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Tìm kiếm theo tên người dùng, mã giao dịch..."
            className="w-[300px]"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Đang chờ</SelectItem>
              <SelectItem value="completed">Đã hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã giao dịch</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Phương thức</TableHead>
              <TableHead>Thông tin nhận tiền</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">WD-001</TableCell>
              <TableCell>user123</TableCell>
              <TableCell>{formatCurrency(500000)}</TableCell>
              <TableCell>Chuyển khoản ngân hàng</TableCell>
              <TableCell>Ngân hàng ABC - 123456789</TableCell>
              <TableCell>{formatDate(new Date())}</TableCell>
              <TableCell>{renderStatusBadge("pending")}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Duyệt</Button>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive">Từ chối</Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">WD-002</TableCell>
              <TableCell>user456</TableCell>
              <TableCell>{formatCurrency(1000000)}</TableCell>
              <TableCell>Ví điện tử</TableCell>
              <TableCell>Ví XYZ - 0987654321</TableCell>
              <TableCell>{formatDate(addMinutes(new Date(), -45))}</TableCell>
              <TableCell>{renderStatusBadge("completed")}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <EditIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">WD-003</TableCell>
              <TableCell>user789</TableCell>
              <TableCell>{formatCurrency(2000000)}</TableCell>
              <TableCell>Chuyển khoản ngân hàng</TableCell>
              <TableCell>Ngân hàng DEF - 987654321</TableCell>
              <TableCell>{formatDate(addMinutes(new Date(), -180))}</TableCell>
              <TableCell>{renderStatusBadge("cancelled")}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <EditIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Settings Page Component
function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Cài đặt hệ thống</h2>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt phiên giao dịch</CardTitle>
            <CardDescription>Cấu hình thời gian và các thông số cho phiên giao dịch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-duration">Thời gian mỗi phiên (giây)</Label>
                <Input id="session-duration" type="number" defaultValue={SESSION_DURATION} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-bet">Số tiền đặt cược tối thiểu</Label>
                <Input id="min-bet" type="number" defaultValue={10000} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="auto-session" />
              <Label htmlFor="auto-session">Tự động tạo phiên mới</Label>
            </div>
            <Button>Lưu cài đặt</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cài đặt thanh toán</CardTitle>
            <CardDescription>Cấu hình phương thức thanh toán và các thông số liên quan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-deposit">Số tiền nạp tối thiểu</Label>
                <Input id="min-deposit" type="number" defaultValue={100000} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-withdrawal">Số tiền rút tối thiểu</Label>
                <Input id="min-withdrawal" type="number" defaultValue={100000} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phương thức thanh toán được hỗ trợ</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="bank-transfer" defaultChecked />
                  <Label htmlFor="bank-transfer">Chuyển khoản ngân hàng</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="e-wallet" defaultChecked />
                  <Label htmlFor="e-wallet">Ví điện tử</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="card" defaultChecked />
                  <Label htmlFor="card">Thẻ cào</Label>
                </div>
              </div>
            </div>
            <Button>Lưu cài đặt</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cài đặt bảo mật</CardTitle>
            <CardDescription>Cấu hình các thông số bảo mật cho hệ thống</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="require-verification" defaultChecked />
              <Label htmlFor="require-verification">Yêu cầu xác minh danh tính để rút tiền</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="require-2fa" />
              <Label htmlFor="require-2fa">Bắt buộc xác thực 2 lớp cho admin</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Thời gian hết hạn phiên đăng nhập (phút)</Label>
              <Input id="session-timeout" type="number" defaultValue={30} />
            </div>
            <Button>Lưu cài đặt</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// No need to re-export components that are already exported

// Main AdminDashboard Component
export const AdminDashboard = () => {
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
            <Button
              variant={activePage === "trading-sessions" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActivePage("trading-sessions")}
            >
              <Clock className="mr-2 h-4 w-4" />
              Phiên giao dịch
            </Button>
            <Button
              variant={activePage === "deposit-requests" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActivePage("deposit-requests")}
            >
              <Download className="mr-2 h-4 w-4" />
              Yêu cầu nạp tiền
            </Button>
            <Button
              variant={activePage === "withdrawal-requests" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActivePage("withdrawal-requests")}
            >
              <Upload className="mr-2 h-4 w-4" />
              Yêu cầu rút tiền
            </Button>
            <Button
              variant={activePage === "settings" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActivePage("settings")}
            >
              <SettingsIcon className="mr-2 h-4 w-4" />
              Cài đặt
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
                {activePage === "trading-sessions" && "Phiên giao dịch"}
                {activePage === "deposit-requests" && "Yêu cầu nạp tiền"}
                {activePage === "withdrawal-requests" && "Yêu cầu rút tiền"}
                {activePage === "settings" && "Cài đặt"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
              <UserMenu />
            </div>
          </header>
          <main>
            {activePage === "dashboard" && <DashboardPage />}
            {activePage === "customers" && <CustomersPage />}
            {activePage === "order-history" && <OrderHistoryPage />}
            {activePage === "trading-sessions" && <SessionsPage />}
            {activePage === "deposit-requests" && <DepositRequestsPage />}
            {activePage === "withdrawal-requests" && <WithdrawalRequestsPage />}
            {activePage === "settings" && <SettingsPage />}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}