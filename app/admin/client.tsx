"use client"

import { useState, useEffect } from "react"
import { AdminDashboard } from "@/components/admin-dashboard"
import { Loader2 } from "lucide-react"

// Định nghĩa kiểu dữ liệu cho dashboard
type DashboardData = {
  customers: any[]
  depositRequests: any[]
  withdrawalRequests: any[]
  trades: any[]
  accountSummary: {
    totalAccounts: number
    totalBalance: number
    totalDeposits: number
    totalWithdrawals: number
  }
}

export default function AdminDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Khai báo biến để lưu trữ dữ liệu
        let customersData: any[] = []
        let depositsData: any[] = []
        let withdrawalsData: any[] = []
        let tradesData: any[] = []
        let summaryData = {
          totalAccounts: 0,
          totalBalance: 0,
          totalDeposits: 0,
          totalWithdrawals: 0
        }
        
        // Fetch customers data
        try {
          const customersResponse = await fetch('/api/admin/users')
          if (customersResponse.ok) {
            const data = await customersResponse.json()
            console.log('User data response:', data)
            customersData = Array.isArray(data) ? data : data.users || []
            if (!Array.isArray(customersData)) {
              console.error('Dữ liệu khách hàng không phải là mảng:', data)
              customersData = []
            }
          }
        } catch (err) {
          console.error('Lỗi khi tải dữ liệu khách hàng:', err)
        }
        
        // Fetch deposit requests
        try {
          const depositsResponse = await fetch('/api/admin/deposits')
          if (depositsResponse.ok) {
            const data = await depositsResponse.json()
            console.log('Deposits data response:', data)
            depositsData = Array.isArray(data) ? data : data.deposits || []
            if (!Array.isArray(depositsData)) {
              console.error('Dữ liệu nạp tiền không phải là mảng:', data)
              depositsData = []
            }
          }
        } catch (err) {
          console.error('Lỗi khi tải dữ liệu nạp tiền:', err)
        }
        
        // Fetch withdrawal requests
        try {
          const withdrawalsResponse = await fetch('/api/admin/withdrawals')
          if (withdrawalsResponse.ok) {
            const data = await withdrawalsResponse.json()
            console.log('Withdrawals data response:', data)
            withdrawalsData = Array.isArray(data) ? data : data.withdrawals || []
            if (!Array.isArray(withdrawalsData)) {
              console.error('Dữ liệu rút tiền không phải là mảng:', data)
              withdrawalsData = []
            }
          }
        } catch (err) {
          console.error('Lỗi khi tải dữ liệu rút tiền:', err)
        }
        
        // Fetch trades/orders
        try {
          const tradesResponse = await fetch('/api/admin/orders')
          if (tradesResponse.ok) {
            const data = await tradesResponse.json()
            console.log('Orders data response:', data)
            tradesData = Array.isArray(data) ? data : data.orders || []
            if (!Array.isArray(tradesData)) {
              console.error('Dữ liệu đơn hàng không phải là mảng:', data)
              tradesData = []
            }
          }
        } catch (err) {
          console.error('Lỗi khi tải dữ liệu đơn hàng:', err)
        }
        
        // Fetch account summary - thử dashboard endpoint trước
        try {
          const summaryResponse = await fetch('/api/admin/dashboard')
          if (summaryResponse.ok) {
            const data = await summaryResponse.json()
            console.log('Dashboard data response:', data)
            summaryData = data.summary || {
              totalAccounts: customersData.length,
              totalBalance: customersData.reduce((sum, c) => sum + (c.balance?.available || 0), 0),
              totalDeposits: depositsData.reduce((sum, d) => sum + (d.amount || 0), 0),
              totalWithdrawals: withdrawalsData.reduce((sum, w) => sum + (w.amount || 0), 0)
            }
          }
        } catch (err) {
          console.error('Lỗi khi tải dữ liệu tổng quan:', err)
          // Tạo dữ liệu tổng quan từ các dữ liệu đã có
          summaryData = {
            totalAccounts: customersData.length,
            totalBalance: customersData.reduce((sum, c) => sum + (c.balance?.available || 0), 0),
            totalDeposits: depositsData.reduce((sum, d) => sum + (d.amount || 0), 0),
            totalWithdrawals: withdrawalsData.reduce((sum, w) => sum + (w.amount || 0), 0)
          }
        }
        
        // Combine all data
        setData({
          customers: customersData,
          depositRequests: depositsData,
          withdrawalRequests: withdrawalsData,
          trades: tradesData,
          accountSummary: summaryData
        })
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu dashboard:', err)
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-lg font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-lg">
          <h3 className="text-lg font-medium mb-2">Đã xảy ra lỗi</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  // Fallback to empty data structure if API calls fail but don't trigger error state
  const dashboardData = data || {
    customers: [],
    depositRequests: [],
    withdrawalRequests: [],
    accountSummary: {
      totalAccounts: 0,
      totalBalance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0
    },
    trades: []
  }

  return <AdminDashboard data={dashboardData} />
}
