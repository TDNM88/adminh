import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { isAuthenticated } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * GET /api/admin/sessions/[id]
 * Retrieves detailed information about a specific trading session
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate admin
    const auth = await isAuthenticated();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = params.id;
    
    // Validate ObjectId format
    if (!ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getMongoDb();
    
    // Get session details
    const session = await db.collection('sessions').findOne({
      _id: new ObjectId(sessionId)
    });
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Get bets for this session
    const bets = await db.collection('bets')
      .find({ sessionId: new ObjectId(sessionId) })
      .toArray();
    
    // Calculate session statistics
    const totalBets = bets.length;
    const totalBetAmount = bets.reduce((sum, bet) => sum + (bet.amount || 0), 0);
    
    const upBets = bets.filter(bet => bet.direction === 'up');
    const downBets = bets.filter(bet => bet.direction === 'down');
    
    const totalUpAmount = upBets.reduce((sum, bet) => sum + (bet.amount || 0), 0);
    const totalDownAmount = downBets.reduce((sum, bet) => sum + (bet.amount || 0), 0);
    
    // Calculate current progress if session is active
    const now = new Date();
    let progress = 0;
    
    if (session.startTime <= now && session.endTime >= now) {
      const totalDuration = session.endTime.getTime() - session.startTime.getTime();
      const elapsed = now.getTime() - session.startTime.getTime();
      progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    } else if (now > session.endTime) {
      progress = 100;
    }
    
    // Format the response
    const sessionDetails = {
      ...session,
      _id: session._id.toString(),
      bets: {
        total: totalBets,
        totalAmount: totalBetAmount,
        up: {
          count: upBets.length,
          amount: totalUpAmount
        },
        down: {
          count: downBets.length,
          amount: totalDownAmount
        }
      },
      progress: parseFloat(progress.toFixed(2))
    };
    
    return NextResponse.json({
      success: true,
      session: sessionDetails
    });
  } catch (error) {
    console.error('Error fetching session details:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch session details',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/sessions/[id]
 * Updates a specific trading session
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate admin
    const auth = await isAuthenticated();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = params.id;
    
    // Validate ObjectId format
    if (!ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { name, startPrice, endPrice, startTime, endTime, status } = body;
    
    // Validate required fields
    if (!name || startPrice === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Connect to database
    const db = await getMongoDb();
    
    // Check if session exists
    const existingSession = await db.collection('sessions').findOne({
      _id: new ObjectId(sessionId)
    });
    
    if (!existingSession) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData = {
      name,
      startPrice,
      ...(endPrice !== undefined && { endPrice }),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      ...(status && { status }),
      updatedAt: new Date()
    };
    
    // Update session
    await db.collection('sessions').updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: updateData }
    );
    
    // Get updated session
    const updatedSession = await db.collection('sessions').findOne({
      _id: new ObjectId(sessionId)
    });
    
    return NextResponse.json({
      success: true,
      message: 'Session updated successfully',
      session: {
        ...updatedSession,
        _id: updatedSession?._id.toString()
      }
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to update session',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
