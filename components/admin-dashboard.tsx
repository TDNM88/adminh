"use client"

import React, { useState, useEffect } from "react"
import { 
  Bell, 
  Home, 
  Users, 
  History, 
  Clock, 
  Download, 
  Upload, 
  Settings as SettingsIcon,
  Search,
  Edit as EditIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { UserMenu } from "@/components/user-menu"
import { CustomersPage } from "@/components/customers-page"
import { SettingsPage as SettingsPageComponent } from "@/components/settings-page"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { formatDateTime } from "@/lib/date-utils"
import { useToast } from "@/components/ui/use-toast"

// Type definitions
type PageType = "dashboard" | "customers" | "order-history" | "trading-sessions" | "deposit-requests" | "withdrawal-requests" | "settings"
type SessionStatusType = "pending" | "active" | "completed" | "cancelled"
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

interface TradingSession {
  id: string
  startTime: Date | string
  endTime: Date | string
  status: SessionStatusType
  result?: "Lên" | "Xuống" | string
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

interface Order {
  id: string
  userId: string
  username: string
  type: OrderType
  amount: number
  createdAt: Date | string
  status: OrderStatusType
  result?: OrderResultType
  sessionId?: string
  notes?: string
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

// Helper function to render status badge
function renderStatusBadge(status: OrderStatusType | SessionStatusType | DepositStatusType | WithdrawalStatusType) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Đang chờ</Badge>
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
    case "active":
      return <Badge className="bg-blue-100 text-blue-800">Đang hoạt động</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

// Helper function to format date string
function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
  )
}

// Order History Page Component
function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<OrderType | "all">("all")
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusType | "all">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/orders?page=${currentPage}&limit=10`)
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const data = await response.json()
        
        // Kiểm tra xem data.orders có tồn tại và là một mảng không
        if (!data || !data.orders || !Array.isArray(data.orders)) {
          console.error('API response does not contain valid orders array:', data)
          setOrders([])
          setTotalPages(1)
          setCurrentPage(1)
          return
        }
        
        const transformedData: Order[] = data.orders.map((order: any) => ({
          id: order._id || order.id,
          userId: order.userId,
          username: order.username,
          type: order.type,
          amount: order.amount,
          createdAt: new Date(order.createdAt),
          status: order.status,
          result: order.result,
          sessionId: order.sessionId,
          notes: order.notes
        }))
        setOrders(transformedData)
        setTotalPages(data.totalPages || 1)
        setCurrentPage(data.currentPage || 1)
      } catch (err) {
        setError(`Lỗi khi tải dữ liệu: ${err instanceof Error ? err.message : 'Unknown error'}`)
        console.error('Error fetching orders:', err)
        setOrders([]) // Đặt mảng rỗng khi có lỗi
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [currentPage])

  // Filter orders based on search query, type, and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.username.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = selectedType === "all" || order.type === selectedType
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Handle order status update
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatusType) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
      toast({
        title: "Cập nhật thành công",
        description: `Trạng thái giao dịch ${orderId} đã được cập nhật thành ${newStatus}.`
      })
    } catch (err) {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật trạng thái: ${err instanceof Error ? err.message : 'Unknown error'}`
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Lịch sử giao dịch</h2>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Tìm kiếm theo mã giao dịch, tên người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px]"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={selectedType} onValueChange={(value) => setSelectedType(value as OrderType | "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Loại giao dịch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="bet">Đặt cược</SelectItem>
              <SelectItem value="deposit">Nạp tiền</SelectItem>
              <SelectItem value="withdrawal">Rút tiền</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OrderStatusType | "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Đang chờ</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã giao dịch</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Kết quả</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Đang tải...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-destructive">{error}</TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Không có giao dịch nào</TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.username}</TableCell>
                  <TableCell>
                    {order.type === "bet" ? "Đặt cược" : 
                     order.type === "deposit" ? "Nạp tiền" : "Rút tiền"}
                  </TableCell>
                  <TableCell>{formatCurrency(order.amount)}</TableCell>
                  <TableCell>{formatDateTime(new Date(order.createdAt))}</TableCell>
                  <TableCell>{renderStatusBadge(order.status)}</TableCell>
                  <TableCell>{order.result || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {order.status === "pending" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleUpdateStatus(order.id, "completed")}
                          >
                            Duyệt
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive border-destructive"
                            onClick={() => handleUpdateStatus(order.id, "cancelled")}
                          >
                            Từ chối
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon">
                        <EditIcon className="h-4 w-4" />
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
        <div className="text-sm text-muted-foreground">
          Hiển thị {filteredOrders.length} / {orders.length} giao dịch
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Trước
          </Button>
          <span className="text-sm">
            Trang {currentPage} / {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  )
}

// Trading Sessions Page Component
function TradingSessionsPage() {
  // Định nghĩa kiểu dữ liệu cho session để đảm bảo tính nhất quán
  interface SessionData {
    id: any;
    _id: string;
    sessionId: string;
    result?: 'UP' | 'DOWN' | 'Lên' | 'Xuống';
    startTime: string;
    endTime: string;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    totalBet?: number;
    totalWin?: number;
    participantCount?: number;
  }
  
  // Sử dụng kiểu SessionStatusType được định nghĩa ở cấp độ toàn cục
  
  // Hàm để xác định class cho badge trạng thái
  const getStatusBadgeClass = (status: SessionStatusType, totalBet: number) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return totalBet > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Khai báo các biến state và hooks
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [autoGeneratedResults, setAutoGeneratedResults] = useState<boolean>(false)
  const { toast } = useToast()

  // Hàm kiểm tra và chuyển đổi dữ liệu thành mảng an toàn
  const ensureArray = (data: any): SessionData[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (data.data && data.data.sessions && Array.isArray(data.data.sessions)) {
      return data.data.sessions.map((session: any) => ({
        ...session,
        id: session._id || session.id || session.sessionId,
        status: session.status || 'pending'
      }))
    }
    if (data.sessions && Array.isArray(data.sessions)) return data.sessions
    return []
  }

  // Format session ID as YYMMDDHHMM using GMT+7 timezone
  const formatSessionId = (date: Date): string => {
    // Adjust to GMT+7 timezone
    const gmtPlus7Date = new Date(date.getTime());
    
    const year = gmtPlus7Date.getFullYear().toString().slice(2); // YY
    const month = String(gmtPlus7Date.getMonth() + 1).padStart(2, '0'); // MM
    const day = String(gmtPlus7Date.getDate()).padStart(2, '0'); // DD
    const hours = String(gmtPlus7Date.getHours()).padStart(2, '0'); // HH
    const minutes = String(gmtPlus7Date.getMinutes()).padStart(2, '0'); // MM
    
    return `${year}${month}${day}${hours}${minutes}`;
  }

  // Generate mock sessions with the required format
  const generateMockSessions = () => {
    setLoading(true);
    setError(null);
    
    // Use the current time for session generation (2025-07-14 15:49:33 GMT+7)
    // This is the fixed time from the metadata
    const now = new Date(2025, 6, 14, 15, 49, 33); // Updated current time from metadata
    
    // Adjust to the start of the current minute (giây 00)
    const currentSessionTime = new Date(now);
    currentSessionTime.setSeconds(0, 0); // Set seconds to 00 and milliseconds to 000
    
    // Create current session
    const currentId = formatSessionId(currentSessionTime);
    const currentSessionEnd = new Date(currentSessionTime);
    currentSessionEnd.setMinutes(currentSessionEnd.getMinutes() + 1);
    currentSessionEnd.setSeconds(0, 0); // Next minute at exactly 00 seconds

    const currentSessionObj: SessionData = {
      id: currentId,
      _id: currentId,
      sessionId: currentId,
      startTime: currentSessionTime.toISOString(), // Starts at giây 00
      endTime: new Date(currentSessionTime.getTime() + 59000).toISOString(), // Ends at giây 59
      status: 'active',
      totalBet: Math.floor(Math.random() * 10000000) + 1000000,
      totalWin: 0,
      participantCount: Math.floor(Math.random() * 50) + 10
    };

    // Create future sessions (29 sessions)
    const futureSessions: SessionData[] = [];
    for (let i = 1; i <= 29; i++) {
      const sessionTime = new Date(currentSessionTime);
      sessionTime.setMinutes(sessionTime.getMinutes() + i);
      sessionTime.setSeconds(0, 0); // Set seconds to 00 and milliseconds to 000
      
      const sessionEnd = new Date(sessionTime);
      sessionEnd.setSeconds(59, 999); // Set to giây 59 of the same minute
      
      const sessionId = formatSessionId(sessionTime);
      
      futureSessions.push({
        id: sessionId,
        _id: sessionId,
        sessionId: sessionId,
        startTime: sessionTime.toISOString(),
        endTime: sessionEnd.toISOString(),
        status: 'pending',
        totalBet: 0,
        totalWin: 0,
        participantCount: 0
      });
    }

    // Set current session and all sessions (current + future)
    setCurrentSession(currentSessionObj);
    setSessions([currentSessionObj, ...futureSessions]);
    
    // Calculate remaining seconds in the current minute
    // Since we want to count down from the actual seconds of the current minute to giây 59
    const currentTime = new Date(2025, 6, 14, 15, 49, 33); // Updated current time from metadata
    const secondsInCurrentMinute = currentTime.getSeconds();
    const remainingSeconds = 60 - secondsInCurrentMinute;
    
    setCountdown(remainingSeconds); // Start countdown from remaining seconds in the current minute
    setLoading(false);
  }

  useEffect(() => {
    // Generate mock data instead of fetching from API
    generateMockSessions();
    
    // Set up countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev !== null && prev <= 0) {
          // When countdown reaches 0, regenerate sessions to simulate a new session
          generateMockSessions();
          // Return 59 for the next minute's countdown (giây 00 đến giây 59)
          return 59;
        }
        return prev !== null ? prev - 1 : 59;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Filter sessions based on search query and status
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || session.status === selectedStatus as SessionStatusType
    return matchesSearch && matchesStatus
  })

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Handle session status update
  const handleUpdateStatus = async (sessionId: string, newStatus: SessionStatusType) => {
    try {
      const response = await fetch(`/api/admin/trading-sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      setSessions((prevSessions) => prevSessions.map(session => 
        session.id === sessionId ? { ...session, status: newStatus } : session
      ))
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession({ ...currentSession, status: newStatus } as SessionData)
      }
      toast({
        title: "Cập nhật thành công",
        description: `Trạng thái phiên ${sessionId} đã được cập nhật thành ${newStatus}.`
      })
    } catch (err) {
      toast({
        title: "Lỗi",
        description: `Không thể cập nhật trạng thái: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Home className="h-4 w-4" />
        <span>/</span>
        <span>Phiên giao dịch</span>
      </div>

      {/* Current Session Display */}
      <div className="flex justify-center mb-8">
        <Card className="w-80 text-center">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="text-lg font-semibold">
                Phiên: {currentSession ? currentSession.id : "N/A"}
              </div>
              <div className="text-3xl font-bold text-red-500">
                {countdown !== null ? `00:${String(countdown).padStart(2, '0')}` : "N/A"}
              </div>
              <div className="text-sm">
                Kết quả:{" "}
                <span className="font-semibold text-green-600">
                  {currentSession && currentSession.result ? currentSession.result : "Chờ kết quả"}
                </span>
              </div>
              <div className="text-sm">
                Trạng thái: {currentSession ? renderStatusBadge(currentSession.status) : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Tìm kiếm theo ID phiên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px]"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select 
            value={selectedStatus} 
            onValueChange={(value) => setSelectedStatus(value as SessionStatusType | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Đang chờ</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Session History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Lịch sử phiên</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phiên</TableHead>
                <TableHead>Kết quả</TableHead>
                <TableHead>Thời gian bắt đầu</TableHead>
                <TableHead>Thời gian kết thúc</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tổng đặt cược</TableHead>
                <TableHead>Tổng thắng</TableHead>
                <TableHead>Số người tham gia</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-destructive">{error}</TableCell>
                </TableRow>
              ) : filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">Không có phiên giao dịch nào</TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.id}</TableCell>
                    <TableCell>
                      {session.result ? (
                        <Badge
                          variant={(session.result === "UP" || session.result === "Lên") ? "default" : "destructive"}
                          className={
                            (session.result === "UP" || session.result === "Lên")
                              ? "bg-green-500 text-white hover:bg-green-500"
                              : "bg-red-500 text-white hover:bg-red-500"
                          }
                        >
                          {session.result}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(new Date(session.startTime))}</TableCell>
                    <TableCell>{formatDateTime(new Date(session.endTime))}</TableCell>
                    <TableCell>
                      <Badge variant={session.status === 'pending' ? 'secondary' : 'default'} className={getStatusBadgeClass(session.status, session.totalBet || 0)}>
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(session.totalBet || 0)}</TableCell>
                    <TableCell>{session.totalWin ? formatCurrency(session.totalWin) : "-"}</TableCell>
                    <TableCell>{session.participantCount || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {session.status === "pending" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleUpdateStatus(session.id, "completed" as SessionStatusType)}
                            >
                              Hoàn thành
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-destructive border-destructive"
                              onClick={() => handleUpdateStatus(session.id, "cancelled" as SessionStatusType)}
                            >
                              Hủy
                            </Button>
                          </>
                        )}
                        {session.status === "active" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleUpdateStatus(session.id, "completed" as SessionStatusType)}
                          >
                            Kết thúc
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <EditIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Hiển thị {filteredSessions.length} / {sessions.length} phiên giao dịch
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Trước
          </Button>
          <span className="text-sm">
            Trang {currentPage} / {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  )

  // Hàm này không cần thiết và có thể gây lỗi
  // Removed unused function comment
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
              <TableCell>{formatDateTime(new Date())}</TableCell>
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
              <TableCell>{formatDateTime(new Date(Date.now() - 30 * 60 * 1000))}</TableCell>
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
              <TableCell>{formatDateTime(new Date(Date.now() - 120 * 60 * 1000))}</TableCell>
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
  )
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
              <TableCell>{formatDateTime(new Date())}</TableCell>
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
              <TableCell>{formatDateTime(new Date(Date.now() - 45 * 60 * 1000))}</TableCell>
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
              <TableCell>{formatDateTime(new Date(Date.now() - 180 * 60 * 1000))}</TableCell>
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
  )
}

// Settings Page Component
function SettingsPage() {
  const [sessionDuration, setSessionDuration] = useState(60) // Default value
  const [minBet, setMinBet] = useState(10000)
  const [minDeposit, setMinDeposit] = useState(100000)
  const [minWithdrawal, setMinWithdrawal] = useState(100000)
  const [sessionTimeout, setSessionTimeout] = useState(30)
  const { toast } = useToast()

  const handleSaveSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionDuration,
          minBet,
          minDeposit,
          minWithdrawal,
          sessionTimeout
        })
      })
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      toast({
        title: "Cập nhật thành công",
        description: "Cài đặt hệ thống đã được lưu."
      })
    } catch (err) {
      toast({
        title: "Lỗi",
        description: `Không thể lưu cài đặt: ${err instanceof Error ? err.message : 'Unknown error'}`
      })
    }
  }

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
                <Input 
                  id="session-duration" 
                  type="number" 
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-bet">Số tiền đặt cược tối thiểu</Label>
                <Input 
                  id="min-bet" 
                  type="number" 
                  value={minBet}
                  onChange={(e) => setMinBet(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="auto-session" />
              <Label htmlFor="auto-session">Tự động tạo phiên mới</Label>
            </div>
            <Button onClick={handleSaveSettings}>Lưu cài đặt</Button>
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
                <Input 
                  id="min-deposit" 
                  type="number" 
                  value={minDeposit}
                  onChange={(e) => setMinDeposit(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-withdrawal">Số tiền rút tối thiểu</Label>
                <Input 
                  id="min-withdrawal" 
                  type="number" 
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(Number(e.target.value))}
                />
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
            <Button onClick={handleSaveSettings}>Lưu cài đặt</Button>
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
              <Input 
                id="session-timeout" 
                type="number" 
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
              />
            </div>
            <Button onClick={handleSaveSettings}>Lưu cài đặt</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main AdminDashboard Component
export const AdminDashboard = () => {
  const [activePage, setActivePage] = useState<PageType>("dashboard")

  return (
    <div className="flex min-h-screen">
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
            {activePage === "trading-sessions" && <TradingSessionsPage />}
            {activePage === "deposit-requests" && <DepositRequestsPage />}
            {activePage === "withdrawal-requests" && <WithdrawalRequestsPage />}
            {activePage === "settings" && <SettingsPageComponent />}
          </main>
        </div>
      </SidebarProvider>
    </div>
  )
}
