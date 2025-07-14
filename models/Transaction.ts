import mongoose, { Document, Schema } from 'mongoose';

export type TransactionType = 'deposit' | 'withdrawal';
export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface ITransaction extends Document {
  transactionId: string;
  userId: mongoose.Types.ObjectId;
  username: string;
  type: TransactionType;
  amount: number;
  receivedAmount?: number; // For withdrawals after fees
  status: TransactionStatus;
  note?: string;
  transactionCode?: string; // For deposits
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    branch?: string;
  };
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    transactionId: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    username: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ['deposit', 'withdrawal'], 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true,
      min: 0
    },
    receivedAmount: { 
      type: Number,
      min: 0
    },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'cancelled'], 
      default: 'pending' 
    },
    note: { 
      type: String 
    },
    transactionCode: { 
      type: String 
    },
    bankDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      accountHolder: { type: String },
      branch: { type: String }
    },
    processedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    processedAt: { 
      type: Date 
    }
  },
  {
    timestamps: true
  }
);

// Generate transaction ID before saving
transactionSchema.pre<ITransaction>('save', function(next) {
  if (this.isNew) {
    const prefix = this.type === 'deposit' ? 'NAP' : 'RUT';
    const timestamp = new Date().getTime();
    this.transactionId = `${prefix}-${this.username}-${timestamp}`;
    
    // For withdrawals, set receivedAmount = amount by default
    if (this.type === 'withdrawal' && !this.receivedAmount) {
      this.receivedAmount = this.amount;
    }
  }
  next();
});

// Create and export the model
const TransactionModel = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);
export default TransactionModel;
