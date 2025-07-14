import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Xác thực người dùng
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Lấy tham số phân trang từ query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Kết nối DB
    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Lấy danh sách nạp tiền của người dùng
    const deposits = await db.collection('deposits')
      .find({ user: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Lấy tổng số bản ghi để phân trang
    const total = await db.collection('deposits')
      .countDocuments({ user: new ObjectId(userId) });

    return NextResponse.json({
      data: deposits,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching deposit history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function for auth
async function auth() {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return { userId: null };
  
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  const user = await verifyToken(token);
  
  return { userId: user?.id || null };
}
