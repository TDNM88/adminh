"use client"

import React, { useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileImage, Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  imageUrl: string
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUpload: () => void
  onRemove: () => void
  isUploading: boolean
  label: string
}

export function ImageUpload({
  imageUrl,
  onFileChange,
  onUpload,
  onRemove,
  isUploading,
  label,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      {imageUrl ? (
        <div className="relative border rounded-md overflow-hidden">
          <div className="aspect-[3/2] relative">
            <Image
              src={imageUrl.startsWith("data:") ? imageUrl : `/uploads/id-cards/${imageUrl.split('/').pop()}`}
              alt="ID Card"
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={onRemove}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-primary/50 transition-colors"
          onClick={handleButtonClick}
        >
          <FileImage className="h-10 w-10 mb-2" />
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs mt-1">Nhấp để chọn hoặc kéo thả tệp</p>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept="image/*"
      />

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleButtonClick}
          disabled={isUploading}
        >
          <FileImage className="h-4 w-4 mr-2" />
          Chọn ảnh
        </Button>
        
        {imageUrl && imageUrl.startsWith("data:") && (
          <Button
            type="button"
            className="w-full"
            onClick={onUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tải lên...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Tải lên
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
