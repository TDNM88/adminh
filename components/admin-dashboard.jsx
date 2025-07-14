"use client";

import React, { useState, useEffect } from "react";
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
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Dashboard Page Component
export function DashboardPage() {
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
  );
}

// Customers Page Component
export function CustomersPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số dư</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">user123</TableCell>
              <TableCell>Nguyễn Văn A</TableCell>
              <TableCell>user123@example.com</TableCell>
              <TableCell>1.000.000đ</TableCell>
              <TableCell><Badge>Hoạt động</Badge></TableCell>
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

// Order History Page Component
export function OrderHistoryPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Lịch sử giao dịch</h2>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Đơn hàng</TableHead>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Loại lệnh</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">ORD-001</TableCell>
              <TableCell>user123</TableCell>
              <TableCell>100.000đ</TableCell>
              <TableCell><Badge>Mua</Badge></TableCell>
              <TableCell><Badge variant="outline">Hoàn thành</Badge></TableCell>
              <TableCell>12/07/2025 15:30</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Deposits Page Component
export function DepositsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Quản lý nạp tiền</h2>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">DEP-001</TableCell>
              <TableCell>user123</TableCell>
              <TableCell>500.000đ</TableCell>
              <TableCell><Badge variant="outline">Chờ xử lý</Badge></TableCell>
              <TableCell>12/07/2025 15:30</TableCell>
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

// Withdrawals Page Component
export function WithdrawalsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Quản lý rút tiền</h2>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">WTH-001</TableCell>
              <TableCell>user123</TableCell>
              <TableCell>300.000đ</TableCell>
              <TableCell><Badge variant="outline">Chờ xử lý</Badge></TableCell>
              <TableCell>12/07/2025 15:30</TableCell>
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
export function SessionsPage() {
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
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">SES-001</TableCell>
              <TableCell>12/07/2025 15:00</TableCell>
              <TableCell>12/07/2025 15:03</TableCell>
              <TableCell><Badge>Hoàn thành</Badge></TableCell>
              <TableCell>Tăng</TableCell>
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

// Main AdminDashboard component that's imported in app/page.tsx
export function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="customers">Khách hàng</TabsTrigger>
          <TabsTrigger value="deposits">Nạp tiền</TabsTrigger>
          <TabsTrigger value="withdrawals">Rút tiền</TabsTrigger>
          <TabsTrigger value="orders">Lịch sử giao dịch</TabsTrigger>
          <TabsTrigger value="sessions">Phiên giao dịch</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <DashboardPage />
        </TabsContent>
        <TabsContent value="customers">
          <CustomersPage />
        </TabsContent>
        <TabsContent value="deposits">
          <DepositsPage />
        </TabsContent>
        <TabsContent value="withdrawals">
          <WithdrawalsPage />
        </TabsContent>
        <TabsContent value="orders">
          <OrderHistoryPage />
        </TabsContent>
        <TabsContent value="sessions">
          <SessionsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
