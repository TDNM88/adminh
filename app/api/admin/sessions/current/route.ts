import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { isAuthenticated } from '@/lib/auth';

/**
 * GET /api/admin/sessions/current
 * Retrieves the current active trading session
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
    
    // Get current time
    const now = new Date();
    
    // Find active session (where now is between startTime and endTime)
    const session = await db.collection('sessions').findOne({
      startTime: { $lte: now },
      endTime: { $gte: now }
    });
    
    if (!session) {
      // If no active session found, find the next upcoming session
      const upcomingSession = await db.collection('sessions')
        .find({ startTime: { $gt: now } })
        .sort({ startTime: 1 })
        .limit(1)
        .toArray();
      
      if (upcomingSession.length > 0) {
        const session = upcomingSession[0];
        return NextResponse.json({
          success: true,
          session: {
            ...session,
            _id: session._id.toString(),
            status: 'upcoming',
            progress: 0,
            startTime: session.startTime?.toISOString(),
            endTime: session.endTime?.toISOString(),
          }
        });
      }
      
      // If no upcoming session either, return null
      return NextResponse.json({
        success: true,
        session: null
      });
    }
    
    // Calculate progress percentage
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    const totalDuration = endTime.getTime() - startTime.getTime();
    const elapsed = now.getTime() - startTime.getTime();
    const progress = Math.min(100, Math.floor((elapsed / totalDuration) * 100));
    
    return NextResponse.json({
      success: true,
      session: {
        ...session,
        _id: session._id.toString(),
        status: 'active',
        progress,
        startTime: session.startTime?.toISOString(),
        endTime: session.endTime?.toISOString(),
      }
    });
  } catch (error) {
    console.error('Error fetching current session:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch current trading session',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
