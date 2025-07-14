import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { isAuthenticated } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * GET /api/admin/bets/stats
 * Retrieves statistics about bets for the admin dashboard
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
    
    // Get current date and previous dates for comparison
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Parse query parameters
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    
    // Build filter based on session ID if provided
    const filter: any = {};
    if (sessionId) {
      filter.sessionId = new ObjectId(sessionId);
    }
    
    // Execute all queries in parallel for better performance
    const [
      totalBets,
      totalBetAmount,
      betsToday,
      betAmountToday,
      winningBets,
      losingBets,
      pendingBets,
      betsByDirection
    ] = await Promise.all([
      // Total bets count
      db.collection('bets').countDocuments(filter),
      
      // Total bet amount
      db.collection('bets').aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray().then(result => result[0]?.total || 0),
      
      // Bets placed today
      db.collection('bets').countDocuments({
        ...filter,
        createdAt: { $gte: today }
      }),
      
      // Bet amount today
      db.collection('bets').aggregate([
        { $match: { ...filter, createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray().then(result => result[0]?.total || 0),
      
      // Winning bets
      db.collection('bets').countDocuments({
        ...filter,
        status: 'won'
      }),
      
      // Losing bets
      db.collection('bets').countDocuments({
        ...filter,
        status: 'lost'
      }),
      
      // Pending bets
      db.collection('bets').countDocuments({
        ...filter,
        status: 'pending'
      }),
      
      // Bets by direction (up/down)
      db.collection('bets').aggregate([
        { $match: filter },
        { $group: { _id: '$direction', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
      ]).toArray().then(result => {
        const upBets = result.find(item => item._id === 'up') || { count: 0, amount: 0 };
        const downBets = result.find(item => item._id === 'down') || { count: 0, amount: 0 };
        return { up: upBets, down: downBets };
      })
    ]);
    
    // Calculate win rate
    const completedBets = winningBets + losingBets;
    const winRate = completedBets > 0 ? (winningBets / completedBets) * 100 : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        totalBets,
        totalBetAmount,
        betsToday,
        betAmountToday,
        winningBets,
        losingBets,
        pendingBets,
        winRate: parseFloat(winRate.toFixed(2)),
        betsByDirection
      }
    });
  } catch (error) {
    console.error('Error fetching bet statistics:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch bet statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
