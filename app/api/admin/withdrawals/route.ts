import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { isAuthenticated } from '@/lib/auth';
import Transaction, { TransactionStatus } from '@/models/Transaction';
import { updateUserBalance } from '@/lib/balanceUtils';

/**
 * GET /api/admin/withdrawals
 * Retrieves a paginated list of withdrawal requests with filtering and search capabilities
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
    const filter: any = { type: 'withdrawal' };
    
    if (status && status !== 'all') {
      filter.status = status;
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
    const [total, withdrawals] = await Promise.all([
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
        withdrawals,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch withdrawal requests',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/withdrawals
 * Updates the status of a withdrawal request (approve/reject/process)
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

    try {
      const db = await getMongoDb();
      const mongoClient = (db as any).s.db.client; // Access the MongoDB client
      const session = mongoClient.startSession();
      await session.startTransaction();

      // Parse and validate request body
      const body = await req.json();
      const { transactionId, status, note } = body as {
        transactionId: string;
        status: 'approved' | 'rejected' | 'processing';
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

      if (!['approved', 'rejected', 'processing'].includes(status)) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Invalid status. Must be one of: approved, rejected, processing' 
          },
          { status: 400 }
        );
      }

      // Get the transaction with proper type checking
      const transaction = await db.collection('transactions').findOne({
        _id: new ObjectId(transactionId),
        type: 'withdrawal',
        status: 'pending' // Only allow updating pending transactions
      });

      if (!transaction) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Withdrawal request not found or already processed' 
          },
          { status: 404 }
        );
      }

      // Prepare update data
      const updateData = {
        status,
        updatedAt: new Date(),
        processedAt: new Date(),
        processedBy: new ObjectId('000000000000000000000001'), // TODO: Replace with actual admin ID from session
        ...(note && { note })
      };

      // Update transaction status
      await db.collection('transactions').updateOne(
        { _id: transaction._id },
        { $set: updateData },
        { session }
      );

      // If rejected, refund the user's balance using the utility function
      if (status === 'rejected') {
        const balanceResult = await updateUserBalance(
          transaction.userId.toString(),
          transaction.amount,
          'deposit', // Using deposit type to add back the amount
          session
        );

        if (!balanceResult.success) {
          throw new Error(`Failed to refund user balance: ${balanceResult.error}`);
        }
      }

      // Create notification for user
      const notificationMessage = 
        status === 'processing' ? 'Your withdrawal request is being processed' :
        status === 'approved' ? 'Your withdrawal request has been approved' :
        'Your withdrawal request has been rejected';

      await db.collection('notifications').insertOne({
        user: new ObjectId(transaction.userId),
        type: 'withdrawal',
        message: notificationMessage,
        read: false,
        createdAt: new Date()
      }, { session });

      // Commit the transaction
      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message: `Withdrawal request ${status} successfully`,
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
        await session.endSession();
      }

      console.error('Error updating withdrawal status:', error);
      return NextResponse.json(
        { 
          success: false,
          message: 'Failed to update withdrawal status',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  } catch (error) {
    console.error('Error in withdrawal status update:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to process withdrawal status update',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
