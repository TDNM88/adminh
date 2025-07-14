import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { isAuthenticated } from '@/lib/auth';

// API để tạo yêu cầu nạp tiền mới
export async function POST(req: NextRequest) {
  try {
    // Xác thực người dùng
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ message: 'Bạn cần đăng nhập' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { amount } = body;

    if (!amount) {
      return NextResponse.json({ message: 'Vui lòng nhập số tiền' }, { status: 400 });
    }

    // Kết nối DB
    const db = await getMongoDb();

    // Get user ID from session (this is a placeholder - you'll need to implement proper session handling)
    // For now, we'll use a placeholder user ID
    const userId = 'user_id_placeholder';
    
    // Lấy thông tin người dùng
    const userData = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!userData) {
      return NextResponse.json({ message: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    // Lấy cài đặt hệ thống để kiểm tra giới hạn nạp tiền
    const settings = await db.collection('settings').findOne({});
    if (settings && amount < settings.depositLimits.min) {
      return NextResponse.json({ 
        message: `Số tiền nạp tối thiểu là ${settings.depositLimits.min.toLocaleString()} đ` 
      }, { status: 400 });
    }

    if (settings && amount > settings.depositLimits.max) {
      return NextResponse.json({ 
        message: `Số tiền nạp tối đa là ${settings.depositLimits.max.toLocaleString()} đ` 
      }, { status: 400 });
    }

    // Tạo yêu cầu nạp tiền mới
    const deposit = {
      user: new ObjectId(userId),
      amount: Number(amount),
      status: 'pending',
      proofImage: '', // Empty string since we removed file upload
      bankInfo: settings?.bankDetails?.[0] || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('deposits').insertOne(deposit);

    // Gửi thông báo cho admin (có thể triển khai sau)
    // TODO: Gửi thông báo cho admin qua socket hoặc email

    return NextResponse.json({
      message: 'Yêu cầu nạp tiền đã được gửi',
      depositId: result.insertedId
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating deposit request:', error);
    return NextResponse.json({ message: 'Đã xảy ra lỗi khi tạo yêu cầu nạp tiền' }, { status: 500 });
  }
}
