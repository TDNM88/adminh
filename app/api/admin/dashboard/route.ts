import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { isAuthenticated } from '@/lib/auth';

/**
 * GET /api/admin/dashboard
 * Retrieves summary data for the admin dashboard
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
    
    // Execute all queries in parallel for better performance
    const [
      totalUsers,
      newUsersToday,
      activeUsersToday,
      totalDeposits,
      depositsToday,
      totalWithdrawals,
      withdrawalsToday,
      pendingWithdrawals,
      totalBets,
      betsToday,
      activeSessions
    ] = await Promise.all([
      // Total registered users
      db.collection('users').countDocuments(),
      
      // New users registered today
      db.collection('users').countDocuments({
        createdAt: { $gte: today }
      }),
      
      // Active users today (users who logged in today)
      db.collection('users').countDocuments({
        lastLoginAt: { $gte: today }
      }),
      
      // Total deposits amount
      db.collection('deposits').aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray().then(result => result[0]?.total || 0),
      
      // Deposits today
      db.collection('deposits').aggregate([
        { $match: { status: 'completed', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray().then(result => result[0]?.total || 0),
      
      // Total withdrawals amount
      db.collection('withdrawals').aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray().then(result => result[0]?.total || 0),
      
      // Withdrawals today
      db.collection('withdrawals').aggregate([
        { $match: { status: 'completed', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).toArray().then(result => result[0]?.total || 0),
      
      // Pending withdrawals
      db.collection('withdrawals').countDocuments({ status: 'pending' }),
      
      // Total bets
      db.collection('bets').countDocuments(),
      
      // Bets placed today
      db.collection('bets').countDocuments({
        createdAt: { $gte: today }
      }),
      
      // Active trading sessions
      db.collection('sessions').countDocuments({
        startTime: { $lte: now },
        endTime: { $gte: now }
      })
    ]);

    // Calculate profit (deposits - withdrawals)
    const totalProfit = totalDeposits - totalWithdrawals;
    const profitToday = depositsToday - withdrawalsToday;
    
    // Get recent activities (last 10 deposits, withdrawals, and user registrations)
    const [recentDeposits, recentWithdrawals, recentUsers] = await Promise.all([
      db.collection('deposits')
        .find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray()
        .then(deposits => deposits.map(deposit => ({
          ...deposit,
          _id: deposit._id.toString(),
          userId: deposit.userId.toString(),
          type: 'deposit'
        }))),
        
      db.collection('withdrawals')
        .find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray()
        .then(withdrawals => withdrawals.map(withdrawal => ({
          ...withdrawal,
          _id: withdrawal._id.toString(),
          userId: withdrawal.userId.toString(),
          type: 'withdrawal'
        }))),
        
      db.collection('users')
        .find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .project({ username: 1, fullName: 1, email: 1, createdAt: 1 })
        .toArray()
        .then(users => users.map(user => ({
          ...user,
          _id: user._id.toString(),
          type: 'user_registration'
        })))
    ]);
    
    // Combine and sort recent activities
    const recentActivities = [...recentDeposits, ...recentWithdrawals, ...recentUsers]
      .sort((a, b) => new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime())
      .slice(0, 10);
    
    return NextResponse.json({
      success: true,
      data: {
        stats: {
          users: {
            total: totalUsers,
            newToday: newUsersToday,
            activeToday: activeUsersToday
          },
          financial: {
            totalDeposits,
            depositsToday,
            totalWithdrawals,
            withdrawalsToday,
            pendingWithdrawals,
            totalProfit,
            profitToday
          },
          bets: {
            total: totalBets,
            today: betsToday
          },
          sessions: {
            active: activeSessions
          }
        },
        recentActivities
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
