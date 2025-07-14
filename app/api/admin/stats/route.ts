import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const client = await clientPromise;
    const db = client.db();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Create date filter if dates are provided
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Create date filter for transactions if dates are provided
    const transactionDateFilter = Object.keys(dateFilter).length > 0 
      ? { createdAt: dateFilter } 
      : {};

    // Get all statistics in parallel
    const [
      totalUsers,
      activeUsers,
      depositsResult,
      withdrawalsResult,
      balanceResult,
      newUsersCount
    ] = await Promise.all([
      // Total users count
      db.collection('users').countDocuments(),
      
      // Active users count
      db.collection('users').countDocuments({ 'status.active': true }),
      
      // Total deposits amount
      db.collection('transactions')
        .aggregate([
          { 
            $match: { 
              type: 'deposit', 
              status: 'completed',
              ...transactionDateFilter
            }
          },
          { 
            $group: { 
              _id: null, 
              total: { $sum: '$amount' } 
            } 
          }
        ])
        .toArray(),
      
      // Total withdrawals amount
      db.collection('transactions')
        .aggregate([
          { 
            $match: { 
              type: 'withdrawal', 
              status: 'completed',
              ...transactionDateFilter
            }
          },
          { 
            $group: { 
              _id: null, 
              total: { $sum: '$amount' } 
            } 
          }
        ])
        .toArray(),
      
      // Total balance (sum of all users' available balance)
      db.collection('users')
        .aggregate([
          { 
            $group: { 
              _id: null, 
              total: { $sum: '$balance.available' } 
            } 
          }
        ])
        .toArray(),
      
      // New users in the last 7 days
      db.collection('users')
        .countDocuments({
          createdAt: { 
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
          }
        })
    ]);

    // Extract totals from aggregation results
    const totalDeposits = depositsResult[0]?.total || 0;
    const totalWithdrawals = withdrawalsResult[0]?.total || 0;
    const totalBalance = balanceResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data: {
        newUsers: newUsersCount,
        totalDeposits,
        totalWithdrawals,
        totalUsers,
        activeUsers,
        totalBalance
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
