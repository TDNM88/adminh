import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { isAuthenticated } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * PUT /api/admin/users/balance
 * Updates a user's balance (admin only)
 */
export async function PUT(req: NextRequest) {
  let session: any = null;
  try {
    // Authenticate admin
    const auth = await isAuthenticated();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { userId, availableBalance, frozenBalance, note } = body;
    
    if (!userId || (availableBalance === undefined && frozenBalance === undefined)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Missing required fields: userId and at least one balance field are required' 
        },
        { status: 400 }
      );
    }
    
    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getMongoDb();
    const mongoClient = (db as any).s.db.client; // Access the MongoDB client
    session = mongoClient.startSession();
    await session.startTransaction();
    
    // Get current user data
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { session }
    );
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Calculate balance changes
    const currentAvailable = user.balance?.available || 0;
    const currentFrozen = user.balance?.frozen || 0;
    
    const newAvailable = availableBalance !== undefined ? availableBalance : currentAvailable;
    const newFrozen = frozenBalance !== undefined ? frozenBalance : currentFrozen;
    
    const availableDiff = newAvailable - currentAvailable;
    const frozenDiff = newFrozen - currentFrozen;
    
    // Update user balance
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          'balance.available': newAvailable,
          'balance.frozen': newFrozen,
          updatedAt: new Date()
        }
      },
      { session }
    );
    
    // Create transaction record for the balance adjustment
    if (availableDiff !== 0 || frozenDiff !== 0) {
      await db.collection('transactions').insertOne({
        userId: new ObjectId(userId),
        type: 'admin_adjustment',
        amount: availableDiff !== 0 ? availableDiff : frozenDiff,
        status: 'completed',
        createdAt: new Date(),
        processedAt: new Date(),
        processedBy: new ObjectId('admin-id-placeholder'), // TODO: Replace with actual admin ID
        description: note || 'Admin balance adjustment',
        balanceChange: {
          available: availableDiff,
          frozen: frozenDiff
        }
      }, { session });
    }
    
    // Commit the transaction
    await session.commitTransaction();
    
    return NextResponse.json({
      success: true,
      message: 'User balance updated successfully',
      data: {
        userId,
        balance: {
          available: newAvailable,
          frozen: newFrozen
        },
        previousBalance: {
          available: currentAvailable,
          frozen: currentFrozen
        },
        change: {
          available: availableDiff,
          frozen: frozenDiff
        }
      }
    });
  } catch (error) {
    // Abort transaction on error
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error updating user balance:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to update user balance',
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
