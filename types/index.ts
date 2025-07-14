// Type definitions for the admin dashboard

// Session status type
export type SessionStatusType = 'upcoming' | 'active' | 'completed' | 'cancelled'

// Trading session interface
export interface TradingSession {
  id: string
  startTime: Date | string
  endTime: Date | string
  status: SessionStatusType
  result: "up" | "down" | "LÊN" | "XUỐNG" | "Lên" | "Xuống" | string
  createdAt?: string | Date
  updatedAt?: string | Date
  session: string
  isWin?: boolean
  progress?: number
}

// Customer interface
export interface Customer {
  _id?: string
  id?: string
  username: string
  fullName?: string
  email?: string
  phone?: string
  address: string
  idNumber: string
  dateOfBirth: any
  notes: string
  referralCode: string
  vipLevel: number
  role: string
  status?: string
  active?: boolean
  betLocked?: boolean
  withdrawLocked?: boolean
  balanceAvailable?: number
  balanceFrozen?: number
  balance?: {
    available: number
    frozen: number
  }
  verified: boolean
  cccdFront?: boolean
  cccdBack?: boolean
  cccdFrontImage?: string
  cccdBackImage?: string
  createdAt?: Date | string
  lastLogin?: Date | string
}

// Order interface
export interface Order {
  id?: string | null | undefined
  _id: string
  userId: string
  username?: string
  session: string
  type: 'BUY' | 'SELL'
  amount: number
  price: number
  total: number
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
  createdAt: Date | string
  updatedAt?: Date | string
  result?: 'WIN' | 'LOSE'
  profit?: number
  time?: string
}

// Bank account interface
export interface BankAccount {
  bankName: string
  accountNumber: string
  accountName: string
  accountHolder?: any
}

// Withdrawal request interface
export interface WithdrawalRequest {
  _id: string
  userId: string
  username?: string
  amount: number
  bankAccount: BankAccount
  status: 'PENDING' | 'COMPLETED' | 'REJECTED' | 'PROCESSING'
  createdAt: Date | string
  updatedAt?: Date | string
  completedAt?: Date | string
  rejectedAt?: Date | string
  rejectionReason?: string
  adminNote?: string
  note?: string
  processedAt?: Date | string | React.JSX.Element
}

// Deposit request interface
export interface DepositRequest {
  _id: string
  userId: string
  username?: string
  amount: number
  receivedAmount?: number
  status: 'pending' | 'approved' | 'rejected'
  bankAccount?: BankAccount
  bankName?: string
  accountNumber?: string
  accountName?: string
  transactionImage?: string
  note?: string
  notes?: string
  adminNote?: string
  adminId?: string
  adminName?: string
  createdAt: Date | string
  updatedAt?: Date | string
  processedAt?: Date | string
}

// Legacy deposit request interface (keeping for backward compatibility)
export interface RequestStatus extends DepositRequest {}

// Order history filter interface
export interface OrderHistoryFilter {
  startDate?: Date | string
  endDate?: Date | string
  status?: string
  type?: string
  username?: string
}

// Date range interface
export interface CustomDateRange {
  from?: Date
  to?: Date
}

// User form data interface
export interface UserFormData {
  username: string
  fullName: string
  email: string
  phone: string
  address: string
  idNumber: string
  dateOfBirth: string
  balanceAvailable: number
  balanceFrozen: number
  status: string
  betLocked: boolean
  withdrawLocked: boolean
  notes: string
  referralCode: string
  vipLevel: number
  role: string
  verified: boolean
  cccdFront: boolean
  cccdBack: boolean
  password: string
  cccdFrontImage: string
  cccdBackImage: string
}

// Customer form data interface
export interface CustomerFormData {
  username: string
  fullName?: string
  email?: string
  phone?: string
  address?: string
  idNumber?: string
  dob?: string
  referralCode?: string
  active?: boolean
  betLocked?: boolean
  withdrawLocked?: boolean
  verified?: boolean
  cccdFrontVerified?: boolean
  cccdBackVerified?: boolean
  role?: string
  notes?: string
  balance?: {
    available: number
    frozen: number
  }
  available: number
  frozen: number
}

// File with preview interface
export interface FileWithPreview extends File {
  preview?: string
}

// Settings interface
export interface Settings {
  bankInfo: {
    bankName: string
    accountNumber: string
    accountName: string
  }
  limits: {
    minDeposit: number
    maxDeposit: number
    minWithdrawal: number
    maxWithdrawal: number
  }
  cskh: {
    zaloLink: string
    telegramLink: string
  }
}
