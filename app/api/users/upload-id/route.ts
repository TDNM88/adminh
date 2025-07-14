import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { isAuthenticated } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Đảm bảo thư mục uploads tồn tại
const uploadDir = join(process.cwd(), 'public', 'uploads', 'id-cards');

// Tạo thư mục nếu chưa tồn tại
import { existsSync, mkdirSync } from 'fs';
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

export async function POST(request: Request) {
  try {
    // Xác thực người dùng
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 401 });
    }

    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const frontImage = formData.get('frontImage') as File;
    const backImage = formData.get('backImage') as File;

    if (!userId || !frontImage || !backImage) {
      return NextResponse.json(
        { message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Tạo tên file duy nhất
    const frontImageName = `${uuidv4()}-${frontImage.name}`;
    const backImageName = `${uuidv4()}-${backImage.name}`;
    
    // Lưu file vào thư mục public
    const frontImagePath = join(uploadDir, frontImageName);
    const backImagePath = join(uploadDir, backImageName);

    // Chuyển đổi file thành buffer và lưu
    const frontImageBuffer = Buffer.from(await frontImage.arrayBuffer());
    const backImageBuffer = Buffer.from(await backImage.arrayBuffer());

    await Promise.all([
      writeFile(frontImagePath, frontImageBuffer),
      writeFile(backImagePath, backImageBuffer),
    ]);

    // Lưu đường dẫn vào database
    const db = await getMongoDb();
    if (!db) {
      throw new Error('Không thể kết nối đến cơ sở dữ liệu');
    }

    const userObjectId = new ObjectId(userId);
    const updatedUser = await db.collection('users').findOneAndUpdate(
      { _id: userObjectId },
      {
        $set: {
          'idCard': {
            frontImage: `/uploads/id-cards/${frontImageName}`,
            backImage: `/uploads/id-cards/${backImageName}`,
            uploadedAt: new Date(),
            verified: false
          },
          'status.customerStatus': 'pending' // Chuyển trạng thái về chờ xác minh
        }
      },
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Tải lên ảnh CMND/CCCD thành công',
      user: updatedUser
    });

  } catch (error) {
    console.error('Lỗi khi tải lên ảnh CMND/CCCD:', error);
    return NextResponse.json(
      { message: 'Lỗi server: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Xác thực quyền admin
    const isAdmin = await isAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: 'Thiếu thông tin người dùng' },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    if (!db) {
      throw new Error('Không thể kết nối đến cơ sở dữ liệu');
    }

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { idCard: 1 } }
    );

    if (!user) {
      return NextResponse.json(
        { message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      idCard: user.idCard || null
    });

  } catch (error) {
    console.error('Lỗi khi lấy thông tin ảnh CMND/CCCD:', error);
    return NextResponse.json(
      { message: 'Lỗi server: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
