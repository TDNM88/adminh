import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { isAuthenticated } from '@/lib/auth';

/**
 * GET /api/admin/activities
 * Retrieves recent user activities for the admin dashboard
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
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const activityType = url.searchParams.get('type');
    
    // Get recent activities from different collections
    const [recentLogins, recentDeposits, recentWithdrawals, recentBets, recentRegistrations] = await Promise.all([
      // Recent logins
      db.collection('loginHistory')
        .find({})
        .sort({ timestamp: -1 })
        .limit(activityType === 'login' ? limit : Math.floor(limit / 5))
        .toArray()
        .then(logins => logins.map(login => ({
          ...login,
          _id: login._id.toString(),
          userId: login.userId?.toString(),
          type: 'login',
          timestamp: login.timestamp || login.createdAt
        }))),
      
      // Recent deposits
      db.collection('transactions')
        .find({ type: 'deposit', status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(activityType === 'deposit' ? limit : Math.floor(limit / 5))
        .toArray()
        .then(deposits => deposits.map(deposit => ({
          ...deposit,
          _id: deposit._id.toString(),
          userId: deposit.userId?.toString(),
          type: 'deposit',
          timestamp: deposit.createdAt
        }))),
      
      // Recent withdrawals
      db.collection('transactions')
        .find({ type: 'withdrawal', status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(activityType === 'withdrawal' ? limit : Math.floor(limit / 5))
        .toArray()
        .then(withdrawals => withdrawals.map(withdrawal => ({
          ...withdrawal,
          _id: withdrawal._id.toString(),
          userId: withdrawal.userId?.toString(),
          type: 'withdrawal',
          timestamp: withdrawal.createdAt
        }))),
      
      // Recent bets
      db.collection('bets')
        .find({})
        .sort({ createdAt: -1 })
        .limit(activityType === 'bet' ? limit : Math.floor(limit / 5))
        .toArray()
        .then(bets => bets.map(bet => ({
          ...bet,
          _id: bet._id.toString(),
          userId: bet.userId?.toString(),
          sessionId: bet.sessionId?.toString(),
          type: 'bet',
          timestamp: bet.createdAt
        }))),
      
      // Recent user registrations
      db.collection('users')
        .find({})
        .sort({ createdAt: -1 })
        .limit(activityType === 'registration' ? limit : Math.floor(limit / 5))
        .project({ username: 1, fullName: 1, email: 1, createdAt: 1 })
        .toArray()
        .then(users => users.map(user => ({
          ...user,
          _id: user._id.toString(),
          type: 'registration',
          timestamp: user.createdAt
        })))
    ]);
    
    // Combine all activities or filter by type
    let activities;
    
    if (activityType) {
      switch (activityType) {
        case 'login':
          activities = recentLogins;
          break;
        case 'deposit':
          activities = recentDeposits;
          break;
        case 'withdrawal':
          activities = recentWithdrawals;
          break;
        case 'bet':
          activities = recentBets;
          break;
        case 'registration':
          activities = recentRegistrations;
          break;
        default:
          activities = [
            ...recentLogins,
            ...recentDeposits,
            ...recentWithdrawals,
            ...recentBets,
            ...recentRegistrations
          ];
      }
    } else {
      activities = [
        ...recentLogins,
        ...recentDeposits,
        ...recentWithdrawals,
        ...recentBets,
        ...recentRegistrations
      ];
    }
    
    // Sort by timestamp and limit
    activities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    
    return NextResponse.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch activities',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
