"use client"

import { useState, useEffect } from "react"
import {
  Home,
  Users,
  History,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  Settings,
  Bell,
  HelpCircle,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { UserMenu } from "@/components/user-menu"
import { useToast } from "@/hooks/use-toast"

type PageType =
  | "dashboard"
  | "customers"
  | "order-history"
  | "trading-sessions"
  | "deposit-requests"
  | "withdrawal-requests"
  | "settings"

const menuItems = [
  {
    id: "dashboard" as PageType,
    title: "Dashboard",
    icon: Home,
  },
  {
    id: "customers" as PageType,
    title: "Khách hàng",
    icon: Users,
  },
  {
    id: "order-history" as PageType,
    title: "Lịch sử đặt lệnh",
    icon: History,
  },
  {
    id: "trading-sessions" as PageType,
    title: "Phiên giao dịch",
    icon: TrendingUp,
  },
  {
    id: "deposit-requests" as PageType,
    title: "Yêu cầu nạp tiền",
    icon: ArrowUpCircle,
  },
  {
    id: "withdrawal-requests" as PageType,
    title: "Yêu cầu rút tiền",
    icon: ArrowDownCircle,
  },
  {
    id: "settings" as PageType,
    title: "Cài đặt",
    icon: Settings,
  },
]

// Dashboard Page Component
function DashboardPage() {
  const [startDate, setStartDate] = useState("2025-01-06")
  const [endDate, setEndDate] = useState("2025-01-29")
  const [stats, setStats] = useState({
    newAccounts: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalBalance: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [newUsers, setNewUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/dashboard-stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentOrders(data.recentOrders)
        setNewUsers(data.newUsers)
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu dashboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Home className="h-4 w-4" />
        <span>/</span>
        <span>Dashboard</span>
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Thời gian</span>
          <div className="flex items-center gap-2">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-32 h-8" />
            <span>-</span>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-32 h-8" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStartDate("2025-01-06")
              setEndDate("2025-01-29")
            }}
          >
            Đặt lại
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={fetchDashboardData}>
            Áp dụng
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tài khoản mới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.newAccounts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng tiền nạp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalDeposits)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng tiền rút</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalWithdrawals)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng số dư</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.totalBalance)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Lệnh mới</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Phiên</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Kết quả</TableHead>
                <TableHead>Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order: any, index) => (
                <TableRow key={index}>
                  <TableCell className="text-teal-500 font-medium">{order.username}</TableCell>
                  <TableCell>{order.roundId}</TableCell>
                  <TableCell>
                    <Badge
                      variant={order.direction === "up" ? "default" : "destructive"}
                      className={
                        order.direction === "up"
                          ? "bg-green-500 text-white hover:bg-green-500"
                          : "bg-red-500 text-white hover:bg-red-500"
                      }
                    >
                      {order.direction === "up" ? "Lên" : "Xuống"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(order.amount)}</TableCell>
                  <TableCell
                    className={order.profit >= 0 ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}
                  >
                    {order.profit >= 0 ? "+" : ""}
                    {formatCurrency(order.profit)}
                  </TableCell>
                  <TableCell className="text-gray-600">{new Date(order.createdAt).toLocaleString("vi-VN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Users Table */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Người dùng mới</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Tên đăng nhập</TableHead>
                <TableHead>Tiền</TableHead>
                <TableHead>Ip login</TableHead>
                <TableHead>Vai trò</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newUsers.map((user: any, index) => (
                <TableRow key={index}>
                  <TableCell className="text-teal-500 font-medium">{user.name || user.username}</TableCell>
                  <TableCell className="text-teal-500">{user.username}</TableCell>
                  <TableCell>{formatCurrency(Number.parseFloat(user.balance || "0"))}</TableCell>
                  <TableCell className="text-gray-600">{user.lastLoginIp || ""}</TableCell>
                  <TableCell>Khách hàng</TableCell>
                </TableRow>
              ))}
              {newUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                    Không có người dùng mới
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Customers Page Component
function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchCustomers()
  }, [searchTerm, statusFilter, currentPage, pageSize])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        search: searchTerm,
        status: statusFilter,
      })
      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.users)
        setTotalPages(data.totalPages || Math.ceil(data.total / pageSize))
        setTotalCustomers(data.total || data.users.length)
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khách hàng",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          isActive: !currentStatus,
        }),
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Cập nhật trạng thái người dùng thành công",
        })
        fetchCustomers()
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái người dùng",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return

    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Xóa người dùng thành công",
        })
        fetchCustomers()
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Home className="h-4 w-4" />
        <span>/</span>
        <span>Khách hàng</span>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Label>Tìm kiếm</Label>
          <Input
            placeholder="Tìm theo username, email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label>Trạng thái</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearchTerm("")
            setStatusFilter("all")
          }}
        >
          Đặt lại
        </Button>
        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={fetchCustomers}>
          Áp dụng
        </Button>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Danh sách khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên đăng nhập</TableHead>
                <TableHead>Số dư</TableHead>
                <TableHead>Ip login</TableHead>
                <TableHead>Thông tin xác minh</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer: any) => (
                <TableRow key={customer.id}>
                  <TableCell className="text-teal-400 font-medium">{customer.username}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        Số dư:{" "}
                        <span className="font-semibold">{formatCurrency(Number.parseFloat(customer.balance))}</span>
                      </div>
                      <div>
                        Số dư đông băng: <span className="font-semibold">0</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{customer.lastLoginIp || ""}</TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>{customer.name || "Họ tên"}</div>
                      <div>CCCD mặt trước:</div>
                      <div>CCCD mặt sau:</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span>Trạng thái:</span>
                        <div className="flex items-center">
                          <button
                            onClick={() => handleToggleUserStatus(customer.id, customer.isActive)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              customer.isActive ? "bg-green-500" : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                customer.isActive ? "translate-x-4" : "translate-x-0.5"
                              }`}
                            ></div>
                          </button>
                          <span className={`ml-2 text-xs ${customer.isActive ? "text-green-600" : "text-gray-500"}`}>
                            {customer.isActive ? "Hoạt động" : "Không hoạt động"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Xác minh:</span>
                        <div className="flex items-center">
                          <button
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors bg-gray-300`}
                          >
                            <div
                              className={`inline-block h-4 w-4 transform rounded-full bg-white translate-x-0.5`}
                            ></div>
                          </button>
                          <span className={`ml-2 text-xs text-gray-500`}>Chưa xác minh</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Khóa cược:</span>
                        <div className="flex items-center">
                          <button
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors bg-gray-300`}
                          >
                            <div
                              className={`inline-block h-4 w-4 transform rounded-full bg-white translate-x-0.5`}
                            ></div>
                          </button>
                          <span className={`ml-2 text-xs text-gray-500`}>Không</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Khóa rút:</span>
                        <div className="flex items-center">
                          <button
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors bg-gray-300`}
                          >
                            <div
                              className={`inline-block h-4 w-4 transform rounded-full bg-white translate-x-0.5`}
                            ></div>
                          </button>
                          <span className={`ml-2 text-xs text-gray-500`}>Không</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="p-1 bg-transparent hover:bg-blue-50"
                        title="Chỉnh sửa khách hàng"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="p-1 bg-transparent hover:bg-red-50"
                        onClick={() => handleDeleteUser(customer.id)}
                        title="Xóa khách hàng"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>
            Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCustomers)} của{" "}
            {totalCustomers} khách hàng
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Số dòng mỗi trang:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value: string) => {
                setPageSize(Number.parseInt(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {pageNum}
                </Button>
              )
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="px-2">...</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Order History Page Component
function OrderHistoryPage() {
  const [customerFilter, setCustomerFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState("2025-01-06")
  const [endDate, setEndDate] = useState("2025-01-29")
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/trades")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.trades)
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải lịch sử đặt lệnh",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Home className="h-4 w-4" />
        <span>/</span>
        <span>Lịch sử đặt lệnh</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Label>Khách hàng</Label>
          <Input
            placeholder="Tên khách hàng"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label>Trạng thái</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="up">Lên</SelectItem>
              <SelectItem value="down">Xuống</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label>Thời gian</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
          <span>-</span>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCustomerFilter("")
            setStatusFilter("all")
            setStartDate("2025-01-06")
            setEndDate("2025-01-29")
          }}
        >
          Đặt lại
        </Button>
        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={fetchOrders}>
          Áp dụng
        </Button>
      </div>

      {/* Order History Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Phiên</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Kết quả</TableHead>
                <TableHead>Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="text-teal-500 font-medium">{order.username}</TableCell>
                  <TableCell>{order.roundId}</TableCell>
                  <TableCell>
                    <Badge
                      variant={order.direction === "up" ? "default" : "destructive"}
                      className={
                        order.direction === "up"
                          ? "bg-green-500 text-white hover:bg-green-500"
                          : "bg-red-500 text-white hover:bg-red-500"
                      }
                    >
                      {order.direction === "up" ? "Lên" : "Xuống"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(Number.parseFloat(order.amount))}</TableCell>
                  <TableCell
                    className={
                      Number.parseFloat(order.profit) >= 0
                        ? "text-green-500 font-semibold"
                        : "text-red-500 font-semibold"
                    }
                  >
                    {Number.parseFloat(order.profit) >= 0 ? "+" : ""}
                    {formatCurrency(Number.parseFloat(order.profit))}
                  </TableCell>
                  <TableCell className="text-gray-600">{new Date(order.createdAt).toLocaleString("vi-VN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Trading Sessions Page Component
function TradingSessionsPage() {
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [countdown, setCountdown] = useState(59)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) {
          fetchSessions() // Refresh sessions when countdown reaches 0
          return 59
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/trading-sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions)
        setCurrentSession(data.currentSession)
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải phiên giao dịch",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>
  }

  return (
    <div>
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
                Phiên: {currentSession ? (currentSession as any).roundId : "N/A"}
              </div>
              <div className="text-3xl font-bold text-red-500">{countdown}s</div>
              <div className="text-sm">
                Kết quả:{" "}
                <span className="font-semibold text-green-600">
                  {currentSession ? (currentSession as any).result || "Chờ kết quả" : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session: any, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{session.roundId}</TableCell>
                  <TableCell>
                    <Badge
                      variant={session.result === "Lên" ? "default" : "destructive"}
                      className={
                        session.result === "Lên"
                          ? "bg-green-500 text-white hover:bg-green-500"
                          : "bg-red-500 text-white hover:bg-red-500"
                      }
                    >
                      {session.result}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{new Date(session.startTime).toLocaleString("vi-VN")}</TableCell>
                  <TableCell className="text-gray-600">{new Date(session.endTime).toLocaleString("vi-VN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Deposit Requests Page Component
function DepositRequestsPage() {
  const [customerFilter, setCustomerFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState("2025-01-06")
  const [endDate, setEndDate] = useState("2025-01-29")
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDeposits()
  }, [])

  const fetchDeposits = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/transactions?type=deposit")
      if (response.ok) {
        const data = await response.json()
        setDeposits(data.transactions)
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nạp tiền",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveDeposit = async (transactionId: number) => {
    try {
      const response = await fetch("/api/admin/transactions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          status: "completed",
        }),
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Phê duyệt nạp tiền thành công",
        })
        fetchDeposits()
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể phê duyệt nạp tiền",
        variant: "destructive",
      })
    }
  }

  const handleRejectDeposit = async (transactionId: number) => {
    try {
      const response = await fetch("/api/admin/transactions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          status: "failed",
        }),
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Từ chối nạp tiền thành công",
        })
        fetchDeposits()
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể từ chối nạp tiền",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Home className="h-4 w-4" />
        <span>/</span>
        <span>Yêu cầu nạp tiền</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Label>Khách hàng</Label>
          <Input
            placeholder="Khách hàng"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="completed">Đã duyệt</SelectItem>
              <SelectItem value="failed">Từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
          <span>-</span>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCustomerFilter("")
            setStatusFilter("all")
            setStartDate("2025-01-06")
            setEndDate("2025-01-29")
          }}
        >
          Đặt lại
        </Button>
        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={fetchDeposits}>
          Áp dụng
        </Button>
      </div>

      {/* Deposit Requests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>THỜI GIAN</TableHead>
                <TableHead>KHÁCH HÀNG</TableHead>
                <TableHead>SỐ TIỀN</TableHead>
                <TableHead>TRẠNG THÁI</TableHead>
                <TableHead>ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.map((deposit: any) => (
                <TableRow key={deposit.id}>
                  <TableCell>{new Date(deposit.createdAt).toLocaleString("vi-VN")}</TableCell>
                  <TableCell className="text-teal-500">{deposit.username}</TableCell>
                  <TableCell>{formatCurrency(Number.parseFloat(deposit.amount))}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        deposit.status === "completed"
                          ? "default"
                          : deposit.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className={
                        deposit.status === "completed"
                          ? "bg-green-500 text-white"
                          : deposit.status === "pending"
                            ? "bg-orange-400 text-white"
                            : "bg-red-500 text-white"
                      }
                    >
                      {deposit.status === "completed"
                        ? "Đã duyệt"
                        : deposit.status === "pending"
                          ? "Chờ duyệt"
                          : "Từ chối"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {deposit.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleApproveDeposit(deposit.id)}
                        >
                          Phê duyệt
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRejectDeposit(deposit.id)}>
                          Từ chối
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Withdrawal Requests Page Component
function WithdrawalRequestsPage() {
  const [customerFilter, setCustomerFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState("2025-01-06")
  const [endDate, setEndDate] = useState("2025-01-29")
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/transactions?type=withdrawal")
      if (response.ok) {
        const data = await response.json()
        setWithdrawals(data.transactions)
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách rút tiền",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveWithdrawal = async (transactionId: number) => {
    try {
      const response = await fetch("/api/admin/transactions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          status: "completed",
        }),
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Phê duyệt rút tiền thành công",
        })
        fetchWithdrawals()
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể phê duyệt rút tiền",
        variant: "destructive",
      })
    }
  }

  const handleRejectWithdrawal = async (transactionId: number) => {
    try {
      const response = await fetch("/api/admin/transactions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          status: "failed",
        }),
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Từ chối rút tiền thành công",
        })
        fetchWithdrawals()
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể từ chối rút tiền",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Home className="h-4 w-4" />
        <span>/</span>
        <span>Yêu cầu rút tiền</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Label>Khách hàng</Label>
          <Input
            placeholder="Khách hàng"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label>Trạng thái</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="completed">Đã duyệt</SelectItem>
              <SelectItem value="failed">Từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label>Thời gian</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
          <span>-</span>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCustomerFilter("")
            setStatusFilter("all")
            setStartDate("2025-01-06")
            setEndDate("2025-01-29")
          }}
        >
          Đặt lại
        </Button>
        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={fetchWithdrawals}>
          Áp dụng
        </Button>
      </div>

      {/* Withdrawal Requests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal: any) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>{new Date(withdrawal.createdAt).toLocaleString("vi-VN")}</TableCell>
                  <TableCell className="text-teal-500">{withdrawal.username}</TableCell>
                  <TableCell>{formatCurrency(Number.parseFloat(withdrawal.amount))}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        withdrawal.status === "completed"
                          ? "default"
                          : withdrawal.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className={
                        withdrawal.status === "completed"
                          ? "bg-green-500 text-white"
                          : withdrawal.status === "pending"
                            ? "bg-orange-400 text-white"
                            : "bg-red-500 text-white"
                      }
                    >
                      {withdrawal.status === "completed"
                        ? "Đã duyệt"
                        : withdrawal.status === "pending"
                          ? "Chờ duyệt"
                          : "Từ chối"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {withdrawal.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleApproveWithdrawal(withdrawal.id)}
                        >
                          Phê duyệt
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRejectWithdrawal(withdrawal.id)}>
                          Từ chối
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// Settings Page Component
function SettingsPage() {
  const [bankName, setBankName] = useState("ABBANK")
  const [accountNumber, setAccountNumber] = useState("0387473721")
  const [accountHolder, setAccountHolder] = useState("VU VAN MIEN")
  const [minDeposit, setMinDeposit] = useState("100000")
  const [minWithdrawal, setMinWithdrawal] = useState("100000")
  const [minTrade, setMinTrade] = useState("100000")
  const [cskh, setCskh] = useState("https://t.me/DICHVUCSKHLS")
  const { toast } = useToast()

  const handleSave = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bankName,
          accountNumber,
          accountHolder,
          minDeposit: Number.parseInt(minDeposit),
          minWithdrawal: Number.parseInt(minWithdrawal),
          minTrade: Number.parseInt(minTrade),
          cskh,
        }),
      })

      if (response.ok) {
        toast({
          title: "Thành công",
          description: "Cài đặt đã được lưu",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu cài đặt",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Home className="h-4 w-4" />
        <span>/</span>
        <span>Cài đặt</span>
      </div>

      <div className="max-w-2xl">
        {/* Bank Information Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Thông tin ngân hàng nạp tiền</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tên ngân hàng</Label>
                <Input value={bankName} onChange={(e) => setBankName(e.target.value)} />
              </div>
              <div>
                <Label>Số tài khoản</Label>
                <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Chủ tài khoản</Label>
              <Input value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Deposit/Withdrawal Limits Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cấu hình nạp rút</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Số tiền nạp tối thiểu</Label>
                <Input value={minDeposit} onChange={(e) => setMinDeposit(e.target.value)} />
              </div>
              <div>
                <Label>Số tiền rút tối thiểu</Label>
                <Input value={minWithdrawal} onChange={(e) => setMinWithdrawal(e.target.value)} />
              </div>
              <div>
                <Label>Số tiền đặt lệnh tối thiểu</Label>
                <Input value={minTrade} onChange={(e) => setMinTrade(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CSKH Link Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div>
              <Label>Link CSKH</Label>
              <Input value={cskh} onChange={(e) => setCskh(e.target.value)} className="mb-4" />
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
                Lưu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AppSidebar({
  currentPage,
  setCurrentPage,
}: { currentPage: PageType; setCurrentPage: (page: PageType) => void }) {
  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPage === item.id}
                    className={currentPage === item.id ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                  >
                    <button
                      onClick={() => setCurrentPage(item.id)}
                      className="flex items-center gap-3 w-full text-left"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard")

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />
      case "customers":
        return <CustomersPage />
      case "order-history":
        return <OrderHistoryPage />
      case "trading-sessions":
        return <TradingSessionsPage />
      case "deposit-requests":
        return <DepositRequestsPage />
      case "withdrawal-requests":
        return <WithdrawalRequestsPage />
      case "settings":
        return <SettingsPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <div className="flex-1">
          {/* Header */}
          <header className="bg-slate-700 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                <SidebarTrigger className="text-white hover:bg-slate-600" />
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-white hover:bg-slate-600">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-slate-600">
                  <HelpCircle className="h-5 w-5" />
                </Button>
                <UserMenu />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6">{renderCurrentPage()}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}