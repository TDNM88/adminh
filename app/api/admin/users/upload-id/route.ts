import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { isAuthenticated } from '@/lib/auth';
import { MongoClient } from 'mongodb';

// Kết nối đến MongoDB
async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'final-app');
  return { client, db };
}

// Xử lý tải lên ảnh CMND/CCCD
export async function POST(request: NextRequest) {
  try {
    // Kiểm tra xác thực
    const isAdmin = await isAuthenticated();
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Không có quyền truy cập' },
        { status: 403 }
      );
    }

    // Xử lý form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as string;

    if (!file || !userId || !type) {
      return NextResponse.json(
        { message: 'Thiếu thông tin cần thiết' },
        { status: 400 }
      );
    }

    if (!['front', 'back'].includes(type)) {
      return NextResponse.json(
        { message: 'Loại ảnh không hợp lệ' },
        { status: 400 }
      );
    }

    // Kiểm tra định dạng file
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Chỉ chấp nhận file hình ảnh' },
        { status: 400 }
      );
    }

    // Đọc dữ liệu file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tạo tên file duy nhất
    const uniqueId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}-${type}-${uniqueId}.${fileExtension}`;
    
    // Đường dẫn lưu file
    const publicDir = join(process.cwd(), 'public');
    const uploadsDir = join(publicDir, 'uploads', 'id-cards');
    const filePath = join(uploadsDir, fileName);
    
    // Lưu file vào thư mục uploads
    await writeFile(filePath, buffer);
    
    // Đường dẫn tương đối để lưu vào database
    const relativePath = `/uploads/id-cards/${fileName}`;
    
    // Cập nhật thông tin trong database
    const { db } = await connectToDatabase();
    
    const updateField = type === 'front' 
      ? { 'verification.cccdFront': true, 'verification.cccdFrontImage': relativePath }
      : { 'verification.cccdBack': true, 'verification.cccdBackImage': relativePath };
    
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateField }
    );

    return NextResponse.json({
      message: 'Tải lên thành công',
      imageUrl: relativePath
    });
    
  } catch (error) {
    console.error('Lỗi khi tải lên ảnh:', error);
    return NextResponse.json(
      { message: 'Lỗi khi xử lý tải lên ảnh' },
      { status: 500 }
    );
  }
}
