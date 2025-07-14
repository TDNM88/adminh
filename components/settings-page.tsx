"use client"

import React, { useState } from "react"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

// Settings Page Component
export function SettingsPage() {
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
