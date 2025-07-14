import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { isAuthenticated } from '@/lib/auth';
import Transaction, { TransactionStatus } from '@/models/Transaction';
import { updateUserBalance } from '@/lib/balanceUtils';

/**
 * GET /api/admin/deposits
 * Retrieves a paginated list of deposit requests with filtering and search capabilities
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate admin
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const cookies = cookieHeader.split(';').reduce((cookies, cookie) => {
      const [name, value] = cookie.split('=').map(c => c.trim());
      cookies[name] = value;
      return cookies;
    }, {} as Record<string, string>);

    if (cookies['admin-session'] !== 'authenticated') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    const db = await getMongoDb();

    // Parse query parameters
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));
    const status = url.searchParams.get('status') as TransactionStatus | 'all' | null;
    const search = url.searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = { type: 'deposit' };
    
    if (status && status !== 'all') {
      filter.status = status as TransactionStatus;
    }
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { 'bankDetails.accountNumber': { $regex: search, $options: 'i' } },
        { transactionCode: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count and paginated results in parallel
    const [total, deposits] = await Promise.all([
      db.collection('transactions').countDocuments(filter),
      db.collection('transactions')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        deposits,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching deposits:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Lỗi khi tải danh sách yêu cầu nạp tiền',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/deposits
 * Updates the status of a deposit request (approve/reject)
 */
export async function PUT(req: NextRequest) {
  let session: any = null;
  try {
    // Authenticate admin
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const cookies = cookieHeader.split(';').reduce((cookies, cookie) => {
      const [name, value] = cookie.split('=').map(c => c.trim());
      cookies[name] = value;
      return cookies;
    }, {} as Record<string, string>);

    if (cookies['admin-session'] !== 'authenticated') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await getMongoDb();
    const mongoClient = (db as any).s.db.client; // Access the MongoDB client
    session = mongoClient.startSession();
    await session.startTransaction();

    // Parse and validate request body
    const body = await req.json();
    const { transactionId, status, note } = body as {
      transactionId: string;
      status: 'approved' | 'rejected' | 'cancelled';
      note?: string;
    };

    if (!transactionId || !status) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Missing required fields: transactionId and status are required' 
        },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid status. Must be one of: approved, rejected, cancelled' 
        },
        { status: 400 }
      );
    }

    // Get the transaction with proper type checking
    const transaction = await db.collection('transactions').findOne({
      _id: new ObjectId(transactionId),
      type: 'deposit',
      status: 'pending' // Only allow updating pending transactions
    });

    if (!transaction) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Deposit request not found or already processed' 
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = {
      status,
      updatedAt: new Date(),
      processedAt: new Date(),
      processedBy: new ObjectId('admin-id-placeholder'), // TODO: Replace with actual admin ID from session
      ...(note && { note })
    };

    // Update transaction status
    await db.collection('transactions').updateOne(
      { _id: transaction._id },
      { $set: updateData },
      { session }
    );

    // If approved, update user balance using the utility function
    if (status === 'approved') {
      const balanceResult = await updateUserBalance(
        transaction.userId.toString(),
        transaction.amount,
        'deposit',
        session
      );

      if (!balanceResult.success) {
        throw new Error(`Failed to update user balance: ${balanceResult.error}`);
      }
    }

    // Commit the transaction
    await session.commitTransaction();
    return NextResponse.json({
      success: true,
      message: `Deposit request ${status} successfully`,
      data: {
        transactionId: transaction._id,
        status,
        processedAt: updateData.processedAt
      }
    });
  } catch (error) {
    // Abort transaction on error
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error updating deposit status:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to update deposit status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
