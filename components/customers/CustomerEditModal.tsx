"use client"

import React, { useState, useEffect } from "react"
import { Modal } from "@/components/common/Modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle2, Loader2, FileImage, X, Upload } from "lucide-react"
import { Customer, UserFormData } from "@/types"
import { formatDate } from "@/utils/formatUtils"
import { uploadFile } from "@/utils/apiUtils"
import { toast } from "@/hooks/use-toast"
import { ImageUpload } from "./ImageUpload"

interface CustomerEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: UserFormData) => void
  customer: Customer | null
}

export function CustomerEditModal({
  isOpen,
  onClose,
  onSave,
  customer,
}: CustomerEditModalProps) {
  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    idNumber: "",
    dateOfBirth: "",
    balanceAvailable: 0,
    balanceFrozen: 0,
    status: "active",
    betLocked: false,
    withdrawLocked: false,
    notes: "",
    referralCode: "",
    vipLevel: 0,
    role: "user",
    verified: false,
    cccdFront: false,
    cccdBack: false,
    password: "",
    cccdFrontImage: "",
    cccdBackImage: "",
  })

  // Image upload state
  const [frontImageFile, setFrontImageFile] = useState<File | null>(null)
  const [backImageFile, setBackImageFile] = useState<File | null>(null)
  const [frontImagePreview, setFrontImagePreview] = useState<string>("")
  const [backImagePreview, setBackImagePreview] = useState<string>("")
  const [isUploadingFront, setIsUploadingFront] = useState(false)
  const [isUploadingBack, setIsUploadingBack] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // Initialize form data when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        username: customer.username || "",
        fullName: customer.fullName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        idNumber: customer.idNumber || "",
        dateOfBirth: customer.dateOfBirth ? formatDate(customer.dateOfBirth, "yyyy-MM-dd") : "",
        balanceAvailable: customer.balanceAvailable || customer.balance?.available || 0,
        balanceFrozen: customer.balanceFrozen || customer.balance?.frozen || 0,
        status: customer.active ? "active" : "inactive",
        betLocked: customer.betLocked || false,
        withdrawLocked: customer.withdrawLocked || false,
        notes: customer.notes || "",
        referralCode: customer.referralCode || "",
        vipLevel: customer.vipLevel || 0,
        role: customer.role || "user",
        verified: customer.verified || false,
        cccdFront: !!customer.cccdFront,
        cccdBack: !!customer.cccdBack,
        password: "",
        cccdFrontImage: customer.cccdFrontImage || "",
        cccdBackImage: customer.cccdBackImage || "",
      })

      // Set image previews if available
      if (customer.cccdFrontImage) {
        setFrontImagePreview(customer.cccdFrontImage)
      }
      if (customer.cccdBackImage) {
        setBackImagePreview(customer.cccdBackImage)
      }
    }
  }, [customer])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle switch changes
  const handleSwitchChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }))
  }

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn tệp hình ảnh",
          variant: "destructive",
        })
        return
      }
      
      // Set file and preview
      if (type === 'front') {
        setFrontImageFile(file)
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setFrontImagePreview(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      } else {
        setBackImageFile(file)
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setBackImagePreview(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  // Handle image upload
  const handleImageUpload = async (type: 'front' | 'back') => {
    if (!customer?._id) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin khách hàng",
        variant: "destructive",
      })
      return
    }
    
    const file = type === 'front' ? frontImageFile : backImageFile
    if (!file) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tệp hình ảnh",
        variant: "destructive",
      })
      return
    }
    
    try {
      // Set loading state
      if (type === 'front') {
        setIsUploadingFront(true)
      } else {
        setIsUploadingBack(true)
      }
      
      // Upload file
      const response = await uploadFile(
        "/admin/users/upload-id",
        file,
        {
          userId: customer._id,
          type: type === 'front' ? 'cccdFront' : 'cccdBack',
        }
      )
      
      if (response.success && response.data) {
        // Update form data with new image path
        if (type === 'front') {
          setFormData((prev) => ({
            ...prev,
            cccdFrontImage: response.data.imagePath,
            cccdFront: true,
          }))
        } else {
          setFormData((prev) => ({
            ...prev,
            cccdBackImage: response.data.imagePath,
            cccdBack: true,
          }))
        }
        
        toast({
          title: "Thành công",
          description: `Đã tải lên ảnh ${type === 'front' ? 'mặt trước' : 'mặt sau'} CCCD/CMND`,
        })
      } else {
        throw new Error(response.error || "Tải lên thất bại")
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi tải lên hình ảnh",
        variant: "destructive",
      })
    } finally {
      // Reset loading state
      if (type === 'front') {
        setIsUploadingFront(false)
      } else {
        setIsUploadingBack(false)
      }
    }
  }

  // Handle form submission
  const handleSubmit = () => {
    onSave(formData)
  }

  // Handle removing an image
  const handleRemoveImage = (type: 'front' | 'back') => {
    if (type === 'front') {
      setFrontImageFile(null)
      setFrontImagePreview("")
      setFormData((prev) => ({
        ...prev,
        cccdFrontImage: "",
        cccdFront: false,
      }))
    } else {
      setBackImageFile(null)
      setBackImagePreview("")
      setFormData((prev) => ({
        ...prev,
        cccdBackImage: "",
        cccdBack: false,
      }))
    }
  }

  return (
    <Modal
      title="Chỉnh sửa thông tin khách hàng"
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      showCloseButton={true}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="verification">Xác minh</TabsTrigger>
          <TabsTrigger value="financial">Tài chính</TabsTrigger>
          <TabsTrigger value="account">Tài khoản</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled
              />
              <p className="text-xs text-muted-foreground">Không thể thay đổi tên đăng nhập</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ tên</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="idNumber">Số CMND/CCCD</Label>
              <Input
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralCode">Mã giới thiệu</Label>
            <Input
              id="referralCode"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium">Trạng thái xác minh</span>
              <span className="text-sm text-muted-foreground">
                Xác minh danh tính người dùng
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="verified"
                checked={formData.verified}
                onCheckedChange={(checked) => handleSwitchChange("verified", checked)}
              />
              <Label htmlFor="verified">
                {formData.verified ? "Đã xác minh" : "Chưa xác minh"}
              </Label>
            </div>
          </div>

          <Separator />

          {/* CCCD/CMND Front Image */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Ảnh mặt trước CMND/CCCD</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="cccdFront"
                  checked={formData.cccdFront}
                  onCheckedChange={(checked) => handleSwitchChange("cccdFront", checked)}
                />
                <Label htmlFor="cccdFront">
                  {formData.cccdFront ? "Đã xác minh" : "Chưa xác minh"}
                </Label>
              </div>
            </div>

            <ImageUpload
              imageUrl={frontImagePreview || formData.cccdFrontImage}
              onFileChange={(e) => handleFileChange(e, 'front')}
              onUpload={() => handleImageUpload('front')}
              onRemove={() => handleRemoveImage('front')}
              isUploading={isUploadingFront}
              label="Chọn ảnh mặt trước CMND/CCCD"
            />
          </div>

          <Separator />

          {/* CCCD/CMND Back Image */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Ảnh mặt sau CMND/CCCD</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="cccdBack"
                  checked={formData.cccdBack}
                  onCheckedChange={(checked) => handleSwitchChange("cccdBack", checked)}
                />
                <Label htmlFor="cccdBack">
                  {formData.cccdBack ? "Đã xác minh" : "Chưa xác minh"}
                </Label>
              </div>
            </div>

            <ImageUpload
              imageUrl={backImagePreview || formData.cccdBackImage}
              onFileChange={(e) => handleFileChange(e, 'back')}
              onUpload={() => handleImageUpload('back')}
              onRemove={() => handleRemoveImage('back')}
              isUploading={isUploadingBack}
              label="Chọn ảnh mặt sau CMND/CCCD"
            />
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="balanceAvailable">Số dư khả dụng</Label>
              <Input
                id="balanceAvailable"
                name="balanceAvailable"
                type="number"
                value={formData.balanceAvailable}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balanceFrozen">Số dư đóng băng</Label>
              <Input
                id="balanceFrozen"
                name="balanceFrozen"
                type="number"
                value={formData.balanceFrozen}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vipLevel">Cấp VIP</Label>
            <Select
              value={formData.vipLevel.toString()}
              onValueChange={(value) => handleSelectChange("vipLevel", value)}
            >
              <SelectTrigger id="vipLevel">
                <SelectValue placeholder="Chọn cấp VIP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">VIP 0</SelectItem>
                <SelectItem value="1">VIP 1</SelectItem>
                <SelectItem value="2">VIP 2</SelectItem>
                <SelectItem value="3">VIP 3</SelectItem>
                <SelectItem value="4">VIP 4</SelectItem>
                <SelectItem value="5">VIP 5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium">Khóa đặt cược</span>
              <span className="text-sm text-muted-foreground">
                Ngăn người dùng đặt cược
              </span>
            </div>
            <Switch
              id="betLocked"
              checked={formData.betLocked}
              onCheckedChange={(checked) => handleSwitchChange("betLocked", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium">Khóa rút tiền</span>
              <span className="text-sm text-muted-foreground">
                Ngăn người dùng rút tiền
              </span>
            </div>
            <Switch
              id="withdrawLocked"
              checked={formData.withdrawLocked}
              onCheckedChange={(checked) => handleSwitchChange("withdrawLocked", checked)}
            />
          </div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái tài khoản</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Vai trò</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleSelectChange("role", value)}
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
            <Label htmlFor="password">Đặt lại mật khẩu</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Để trống nếu không thay đổi"
            />
            <p className="text-xs text-muted-foreground">
              Nhập mật khẩu mới nếu muốn đặt lại mật khẩu cho người dùng
            </p>
          </div>

          {customer && (
            <>
              <div className="space-y-2">
                <Label>Ngày tạo tài khoản</Label>
                <div className="p-2 border rounded-md bg-muted">
                  {customer.createdAt ? formatDate(customer.createdAt) : "N/A"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Đăng nhập gần nhất</Label>
                <div className="p-2 border rounded-md bg-muted">
                  {customer.lastLogin ? formatDate(customer.lastLogin) : "N/A"}
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button onClick={handleSubmit}>
          Lưu thay đổi
        </Button>
      </div>
    </Modal>
  )
}
