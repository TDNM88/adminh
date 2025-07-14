import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { isAuthenticated } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * GET /api/admin/bets
 * Retrieves a paginated list of bets with filtering and search capabilities
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate admin
    const auth = await isAuthenticated();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    const db = await getMongoDb();

    // Parse query parameters
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));
    const status = url.searchParams.get('status');
    const direction = url.searchParams.get('direction');
    const sessionId = url.searchParams.get('sessionId');
    const userId = url.searchParams.get('userId');
    const search = url.searchParams.get('search') || '';
    const fromDate = url.searchParams.get('from');
    const toDate = url.searchParams.get('to');
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (direction && direction !== 'all') {
      filter.direction = direction;
    }
    
    if (sessionId) {
      filter.sessionId = new ObjectId(sessionId);
    }
    
    if (userId) {
      filter.userId = new ObjectId(userId);
    }
    
    if (search) {
      // Try to match ObjectId if the search looks like one
      if (/^[0-9a-fA-F]{24}$/.test(search)) {
        filter.$or = [
          { _id: new ObjectId(search) },
          { userId: new ObjectId(search) },
          { sessionId: new ObjectId(search) }
        ];
      } else {
        // Otherwise search by username or bet amount
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { amount: isNaN(parseFloat(search)) ? undefined : parseFloat(search) }
        ].filter(Boolean);
      }
    }
    
    // Date range filter
    if (fromDate || toDate) {
      filter.createdAt = {};
      
      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }
      
      if (toDate) {
        const toDateObj = new Date(toDate);
        toDateObj.setHours(23, 59, 59, 999); // End of the day
        filter.createdAt.$lte = toDateObj;
      }
    }

    // Get total count and paginated results in parallel
    const [total, bets] = await Promise.all([
      db.collection('bets').countDocuments(filter),
      db.collection('bets')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()
    ]);

    const totalPages = Math.ceil(total / limit);
    
    // Format the bets to convert ObjectId to string
    const formattedBets = bets.map(bet => ({
      ...bet,
      _id: bet._id.toString(),
      userId: bet.userId.toString(),
      sessionId: bet.sessionId.toString()
    }));

    return NextResponse.json({
      success: true,
      data: {
        bets: formattedBets,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch bets',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/bets
 * Updates a bet's status (e.g., marking it as won or lost)
 */
export async function PUT(req: NextRequest) {
  let session: any = null;
  try {
    // Authenticate admin
    const auth = await isAuthenticated();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await getMongoDb();
    const mongoClient = (db as any).s.db.client; // Access the MongoDB client
    session = mongoClient.startSession();
    await session.startTransaction();

    // Parse and validate request body
    const body = await req.json();
    const { betId, status, note } = body as {
      betId: string;
      status: 'won' | 'lost' | 'cancelled' | 'pending';
      note?: string;
    };

    if (!betId || !status) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Missing required fields: betId and status are required' 
        },
        { status: 400 }
      );
    }

    if (!['won', 'lost', 'cancelled', 'pending'].includes(status)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid status. Must be one of: won, lost, cancelled, pending' 
        },
        { status: 400 }
      );
    }

    // Get the bet
    const bet = await db.collection('bets').findOne({
      _id: new ObjectId(betId)
    });

    if (!bet) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Bet not found' 
        },
        { status: 404 }
      );
    }

    // Get the user
    const user = await db.collection('users').findOne({
      _id: bet.userId
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: 'User not found' 
        },
        { status: 404 }
      );
    }

    // Prepare update data for bet
    const updateData = {
      status,
      updatedAt: new Date(),
      ...(note && { note })
    };

    // Update bet status
    await db.collection('bets').updateOne(
      { _id: bet._id },
      { $set: updateData },
      { session }
    );

    // If status is changing and it's won, update user balance
    if (bet.status !== 'won' && status === 'won') {
      // Calculate winnings (e.g., 2x the bet amount)
      const winnings = bet.amount * 2;
      
      // Update user balance
      await db.collection('users').updateOne(
        { _id: user._id },
        { 
          $inc: { 'balance.available': winnings },
          $set: { updatedAt: new Date() }
        },
        { session }
      );
      
      // Create transaction record for the winnings
      await db.collection('transactions').insertOne({
        userId: user._id,
        type: 'bet_win',
        amount: winnings,
        status: 'completed',
        betId: bet._id,
        createdAt: new Date(),
        description: `Winning from bet #${bet._id}`
      }, { session });
    }
    
    // If status is changing from won to something else, reverse the winnings
    if (bet.status === 'won' && status !== 'won') {
      // Calculate winnings that need to be reversed
      const winnings = bet.amount * 2;
      
      // Update user balance
      await db.collection('users').updateOne(
        { _id: user._id },
        { 
          $inc: { 'balance.available': -winnings },
          $set: { updatedAt: new Date() }
        },
        { session }
      );
      
      // Create transaction record for the reversal
      await db.collection('transactions').insertOne({
        userId: user._id,
        type: 'bet_win_reversal',
        amount: -winnings,
        status: 'completed',
        betId: bet._id,
        createdAt: new Date(),
        description: `Reversal of winnings from bet #${bet._id}`
      }, { session });
    }

    // Commit the transaction
    await session.commitTransaction();
    return NextResponse.json({
      success: true,
      message: `Bet status updated to ${status} successfully`,
      data: {
        betId: bet._id.toString(),
        status,
        updatedAt: updateData.updatedAt
      }
    });
  } catch (error) {
    // Abort transaction on error
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error updating bet status:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to update bet status',
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
