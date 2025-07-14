import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { isAuthenticated } from '@/lib/auth';
import { ObjectId, ClientSession } from 'mongodb';
import { cookies } from 'next/headers';

interface User {
  _id: ObjectId;
  balance: {
    available: number;
    frozen: number;
  };
  // Add other user properties as needed
  [key: string]: any; // Allow additional properties
}

interface Trade {
  userId: ObjectId;
  sessionId: string;
  direction: string;
  amount: number;
  asset: string;
  status: 'pending' | 'completed' | 'cancelled';
  profit: number;
  result: 'win' | 'lose' | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(req: Request) {
  try {
    // Check if user is authenticated via session cookie
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { sessionId, direction, amount, asset } = await req.json();
    
    if (!sessionId || !direction || !amount || !asset) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Get MongoDB client and database instance
    const client = await clientPromise;
    const db = client.db();
    
    // Get the first user for now (replace with actual session-based user lookup)
    const user = await db.collection<User>('users').findOne({});
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Check user balance
    if (!user.balance || user.balance.available < amount) {
      return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
    }

    // Create new trade
    const trade = {
      userId: user._id,
      sessionId,
      direction,
      amount: Number(amount),
      asset,
      status: 'pending' as const,
      profit: 0,
      result: null as 'win' | 'lose' | null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Start a new session for the transaction
    const session = client.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Deduct from available balance and add to frozen
        const updateResult = await db.collection<User>('users').updateOne(
          { _id: user._id },
          { 
            $inc: { 
              'balance.available': -amount,
              'balance.frozen': amount
            } 
          },
          { session }
        );

        if (updateResult.matchedCount === 0) {
          throw new Error('Failed to update user balance');
        }

        // Save the trade
        await db.collection<Trade>('trades').insertOne(trade, { session });
      });
    } finally {
      await session.endSession();
    }

    // Create a new trade response with a new ID
    const tradeResponse = {
      ...trade,
      _id: new ObjectId().toHexString(),
      userId: user._id.toHexString()
    };

    return NextResponse.json({ 
      success: true, 
      trade: tradeResponse
    });

  } catch (error) {
    console.error('Error placing trade:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
