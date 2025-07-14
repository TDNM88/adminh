import { getMongoDb } from './mongodb';
import { ObjectId } from 'mongodb';

export interface BalanceUpdateResult {
  success: boolean;
  newBalance?: number;
  error?: string;
}

export async function updateUserBalance(
  userId: string,
  amount: number,
  type: 'deposit' | 'withdraw' | 'freeze' | 'unfreeze',
  session?: any
): Promise<BalanceUpdateResult> {
  const db = await getMongoDb();
  
  try {
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { session }
    );

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const currentAvailable = user.balance?.available || 0;
    const currentFrozen = user.balance?.frozen || 0;
    
    let update: any = {};
    
    switch (type) {
      case 'deposit':
        update = {
          'balance.available': currentAvailable + amount,
          'balance.updatedAt': new Date()
        };
        break;
        
      case 'withdraw':
        if (currentAvailable < amount) {
          return { 
            success: false, 
            error: 'Insufficient available balance' 
          };
        }
        update = {
          'balance.available': currentAvailable - amount,
          'balance.updatedAt': new Date()
        };
        break;
        
      case 'freeze':
        if (currentAvailable < amount) {
          return { 
            success: false, 
            error: 'Insufficient available balance to freeze' 
          };
        }
        update = {
          'balance.available': currentAvailable - amount,
          'balance.frozen': currentFrozen + amount,
          'balance.updatedAt': new Date()
        };
        break;
        
      case 'unfreeze':
        if (currentFrozen < amount) {
          return { 
            success: false, 
            error: 'Insufficient frozen balance to unfreeze' 
          };
        }
        update = {
          'balance.available': currentAvailable + amount,
          'balance.frozen': currentFrozen - amount,
          'balance.updatedAt': new Date()
        };
        break;
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: update },
      { session }
    );

    if (result.modifiedCount === 0) {
      return { success: false, error: 'Failed to update balance' };
    }

    return { 
      success: true, 
      newBalance: type === 'deposit' 
        ? currentAvailable + amount 
        : type === 'withdraw' 
          ? currentAvailable - amount
          : currentAvailable
    };
  } catch (error) {
    console.error('Error updating user balance:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
