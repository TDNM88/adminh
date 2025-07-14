import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { isAuthenticated } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request) {
  try {
    // Xác thực quyền admin
    const isAdmin = await isAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 403 });
    }

    const data = await request.json();
    const { userId, status, rejectionReason } = data;

    if (!userId || !status) {
      return NextResponse.json(
        { message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'verified', 'rejected', 'suspended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Trạng thái không hợp lệ' },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    if (!db) {
      throw new Error('Không thể kết nối đến cơ sở dữ liệu');
    }

    const updateData: any = {
      'status.customerStatus': status,
    };

    // Nếu từ chối, lưu lý do từ chối
    if (status === 'rejected' && rejectionReason) {
      updateData['status.rejectionReason'] = rejectionReason;
    }

    // Nếu đã xác minh, đánh dấu ID card đã xác minh
    if (status === 'verified') {
      updateData['idCard.verified'] = true;
    }

    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { message: 'Không tìm thấy người dùng' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Đã cập nhật trạng thái khách hàng thành ${status}`,
      user: result
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái khách hàng:', error);
    return NextResponse.json(
      { message: 'Lỗi server: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
