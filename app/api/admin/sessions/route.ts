import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { isAuthenticated } from '@/lib/auth';

/**
 * GET /api/admin/sessions
 * Retrieves a paginated list of trading sessions with filtering and search capabilities
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
    const status = url.searchParams.get('status') || 'all';
    const search = url.searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { sessionId: { $regex: search, $options: 'i' } },
        { result: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count and paginated results in parallel
    const [total, sessions] = await Promise.all([
      db.collection('sessions').countDocuments(filter),
      db.collection('sessions')
        .find(filter)
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()
    ]);

    const totalPages = Math.ceil(total / limit);

    // Calculate progress for each session
    const now = new Date();
    const sessionsWithProgress = sessions.map(session => {
      const startTime = new Date(session.startTime);
      const endTime = new Date(session.endTime);
      
      let progress = 0;
      let status = 'upcoming';
      
      if (now < startTime) {
        status = 'upcoming';
        progress = 0;
      } else if (now > endTime) {
        status = 'completed';
        progress = 100;
      } else {
        status = 'active';
        const totalDuration = endTime.getTime() - startTime.getTime();
        const elapsed = now.getTime() - startTime.getTime();
        progress = Math.min(100, Math.floor((elapsed / totalDuration) * 100));
      }
      
      return {
        ...session,
        _id: session._id.toString(),
        progress,
        status,
        startTime: session.startTime?.toISOString(),
        endTime: session.endTime?.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        sessions: sessionsWithProgress,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch trading sessions',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/sessions
 * Creates a new trading session
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate admin
    const auth = await isAuthenticated();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { startTime, endTime, result } = body;

    if (!startTime || !endTime) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Missing required fields: startTime and endTime are required' 
        },
        { status: 400 }
      );
    }

    // Format session ID (YYYYMMDDHHMM)
    const start = new Date(startTime);
    const sessionId = start.getFullYear() +
      String(start.getMonth() + 1).padStart(2, '0') +
      String(start.getDate()).padStart(2, '0') +
      String(start.getHours()).padStart(2, '0') +
      String(start.getMinutes()).padStart(2, '0');

    // Connect to database
    const db = await getMongoDb();

    // Check if session with this ID already exists
    const existingSession = await db.collection('sessions').findOne({ sessionId });
    if (existingSession) {
      return NextResponse.json(
        { 
          success: false,
          message: 'A session with this start time already exists' 
        },
        { status: 400 }
      );
    }

    // Create new session
    const session = {
      sessionId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'upcoming',
      result: result || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result2 = await db.collection('sessions').insertOne(session);

    return NextResponse.json({
      success: true,
      message: 'Trading session created successfully',
      data: {
        sessionId,
        _id: result2.insertedId.toString()
      }
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to create trading session',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/sessions
 * Updates a trading session (e.g., to set the result)
 */
export async function PUT(req: NextRequest) {
  try {
    // Authenticate admin
    const auth = await isAuthenticated();
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { sessionId, result } = body;

    if (!sessionId) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Missing required field: sessionId' 
        },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getMongoDb();

    // Find the session
    const session = await db.collection('sessions').findOne({ 
      $or: [
        { _id: ObjectId.isValid(sessionId) ? new ObjectId(sessionId) : null },
        { sessionId }
      ]
    });

    if (!session) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Session not found' 
        },
        { status: 404 }
      );
    }

    // Update the session
    const updateData: any = {
      updatedAt: new Date()
    };

    if (result !== undefined) {
      updateData.result = result;
    }

    await db.collection('sessions').updateOne(
      { _id: session._id },
      { $set: updateData }
    );

    // If the session is completed and result is set, update all related bets
    const now = new Date();
    const endTime = new Date(session.endTime);
    
    if (now > endTime && result !== undefined) {
      // Update all bets related to this session
      await db.collection('bets').updateMany(
        { sessionId: session.sessionId, status: 'active' },
        { 
          $set: { 
            status: 'completed',
            result: result,
            isWin: function() {
              // This is a placeholder - in MongoDB you'd use an aggregation pipeline
              // with $cond to determine if each bet is a win based on its type and the result
              return false;
            },
            updatedAt: new Date()
          } 
        }
      );
      
      // In a real implementation, you would need to calculate wins/losses
      // and update user balances accordingly
    }

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully'
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
