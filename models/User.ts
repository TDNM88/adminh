import mongoose, { Document, Schema } from 'mongoose';

export type CustomerStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface IUserBalance {
  available: number;
  frozen: number;
  updatedAt: Date;
}

export interface IUser extends Document {
  username: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  balance: IUserBalance;
  status: {
    active: boolean;
    verified: boolean;
    lastLogin?: Date;
    customerStatus: CustomerStatus;
    rejectionReason?: string;
  };
  verification?: {
    token: string;
    expires: Date;
  };
  idCard?: {
    frontImage: string;
    backImage: string;
    uploadedAt: Date;
    verified: boolean;
  };
  bank?: {
    name: string;
    accountNumber: string;
    accountHolder: string;
    verified: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    balance: {
      available: { type: Number, default: 0 },
      frozen: { type: Number, default: 0 },
      updatedAt: { type: Date, default: Date.now }
    },
    status: {
      active: { type: Boolean, default: true },
      verified: { type: Boolean, default: false },
      lastLogin: { type: Date },
      customerStatus: { 
        type: String, 
        enum: ['pending', 'verified', 'rejected', 'suspended'], 
        default: 'pending' 
      },
      rejectionReason: { type: String },
    },
    verification: {
      token: String,
      expires: Date,
    },
    idCard: {
      frontImage: { type: String },
      backImage: { type: String },
      uploadedAt: { type: Date },
      verified: { type: Boolean, default: false },
    },
    bank: {
      name: { type: String },
      accountNumber: { type: String },
      accountHolder: { type: String },
      verified: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default UserModel;
