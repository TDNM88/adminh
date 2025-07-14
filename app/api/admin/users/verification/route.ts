import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { isAuthenticated } from '@/lib/auth';
import { ObjectId } from 'mongodb';

/**
 * PUT /api/admin/users/verification
 * Updates a user's verification status (admin only)
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
    const { userId, verified, cccdFront, cccdBack, note } = body;
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Missing required field: userId' 
        },
        { status: 400 }
      );
    }
    
    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await getMongoDb();
    
    // Get current user data
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) }
    );
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData: any = { updatedAt: new Date() };
    
    if (verified !== undefined) {
      updateData['verification.verified'] = verified;
    }
    
    if (cccdFront !== undefined) {
      updateData['verification.cccdFront'] = cccdFront;
    }
    
    if (cccdBack !== undefined) {
      updateData['verification.cccdBack'] = cccdBack;
    }
    
    // Update user verification status
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );
    
    // Create notification for the user
    if (verified !== undefined && verified !== user.verification?.verified) {
      const notificationMessage = verified
        ? 'Tài khoản của bạn đã được xác minh thành công'
        : 'Trạng thái xác minh tài khoản của bạn đã bị hủy';
      
      await db.collection('notifications').insertOne({
        userId: new ObjectId(userId),
        type: 'verification',
        message: notificationMessage,
        read: false,
        createdAt: new Date(),
        ...(note && { note })
      });
    }
    
    // Get updated user data
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );
    
    return NextResponse.json({
      success: true,
      message: 'User verification status updated successfully',
      data: {
        ...updatedUser,
        _id: updatedUser?._id.toString()
      }
    });
  } catch (error) {
    console.error('Error updating user verification status:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to update user verification status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
