import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { isAuthenticated } from '@/lib/auth';

/**
 * GET /api/admin/settings
 * Retrieves system settings for the admin dashboard
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
    
    // Get settings from database
    const settings = await db.collection('settings').findOne({ type: 'system' });
    
    // If no settings found, return default settings
    if (!settings) {
      const defaultSettings = {
        type: 'system',
        maintenance: {
          enabled: false,
          message: 'Hệ thống đang bảo trì. Vui lòng quay lại sau.'
        },
        trading: {
          enabled: true,
          minBet: 10000,
          maxBet: 10000000,
          feePercentage: 2
        },
        withdrawal: {
          enabled: true,
          minAmount: 100000,
          maxAmount: 50000000,
          processingTime: '24 giờ'
        },
        deposit: {
          enabled: true,
          minAmount: 100000,
          maxAmount: 100000000
        },
        notification: {
          welcomeMessage: 'Chào mừng bạn đến với hệ thống của chúng tôi!',
          depositSuccess: 'Nạp tiền thành công: {amount}',
          withdrawalSuccess: 'Rút tiền thành công: {amount}',
          betSuccess: 'Đặt cược thành công: {amount}'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return NextResponse.json({
        success: true,
        settings: defaultSettings,
        isDefault: true
      });
    }
    
    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Updates system settings (admin only)
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
    const { maintenance, trading, withdrawal, deposit, notification } = body;
    
    // Validate required fields
    if (!maintenance && !trading && !withdrawal && !deposit && !notification) {
      return NextResponse.json(
        { 
          success: false,
          message: 'At least one settings category must be provided' 
        },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getMongoDb();
    
    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (maintenance) {
      updateData.maintenance = maintenance;
    }
    
    if (trading) {
      updateData.trading = trading;
    }
    
    if (withdrawal) {
      updateData.withdrawal = withdrawal;
    }
    
    if (deposit) {
      updateData.deposit = deposit;
    }
    
    if (notification) {
      updateData.notification = notification;
    }
    
    // Update settings in database
    const result = await db.collection('settings').updateOne(
      { type: 'system' },
      { $set: updateData },
      { upsert: true }
    );
    
    // Get updated settings
    const updatedSettings = await db.collection('settings').findOne({ type: 'system' });
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to update settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
