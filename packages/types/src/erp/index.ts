// ─── Enums ────────────────────────────────────────────────────────────────────

export enum BookingStatus {
  PROVISIONAL = 'PROVISIONAL',
  CONFIRMED = 'CONFIRMED',
  AGREEMENT_PENDING = 'AGREEMENT_PENDING',
  AGREEMENT_DONE = 'AGREEMENT_DONE',
  REGISTERED = 'REGISTERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentMethod {
  ONLINE = 'ONLINE',
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  CHEQUE = 'CHEQUE',
  DEMAND_DRAFT = 'DEMAND_DRAFT',
  CASH = 'CASH',
  UPI = 'UPI',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

// ─── Booking ──────────────────────────────────────────────────────────────────

export interface Booking {
  id: string
  bookingNumber: string
  unitId: string
  projectId: string
  buyerId: string
  brokerId?: string
  agentId?: string
  status: BookingStatus
  totalAmount: number
  discountAmount?: number
  gstAmount: number
  finalAmount: number
  bookingAmount: number
  bookingDate: string
  agreementDate?: string
  registrationDate?: string
  possessionDate?: string
  paymentSchedule?: PaymentScheduleItem[]
  documents?: BookingDocument[]
  remarks?: string
  cancelledAt?: string
  cancellationReason?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentScheduleItem {
  id: string
  bookingId: string
  milestoneId?: string
  milestone: string
  percentage: number
  amount: number
  dueDate: string
  demandLetterDate?: string
  paidDate?: string
  paidAmount?: number
  status: 'PENDING' | 'DEMAND_RAISED' | 'PAID' | 'OVERDUE'
}

export interface BookingDocument {
  id: string
  bookingId: string
  type: 'BOOKING_FORM' | 'ALLOTMENT_LETTER' | 'AGREEMENT_COPY' | 'DEMAND_LETTER' | 'RECEIPT' | 'NOC' | 'OTHER'
  name: string
  url: string
  isCustomerVisible: boolean
  uploadedAt: string
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface Payment {
  id: string
  paymentNumber: string
  bookingId: string
  scheduleItemId?: string
  amount: number
  gstAmount: number
  tdsAmount?: number
  totalAmount: number
  status: PaymentStatus
  method: PaymentMethod
  gatewayOrderId?: string
  gatewayPaymentId?: string
  gatewaySignature?: string
  chequeNumber?: string
  bankName?: string
  transactionRef?: string
  paidAt?: string
  receiptUrl?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

// ─── Demand Letter ────────────────────────────────────────────────────────────

export interface DemandLetter {
  id: string
  bookingId: string
  scheduleItemId: string
  letterNumber: string
  amount: number
  gstAmount: number
  totalAmount: number
  dueDate: string
  issuedAt: string
  pdfUrl: string
  status: 'ISSUED' | 'VIEWED' | 'PAID' | 'OVERDUE'
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export interface ProjectBudget {
  id: string
  projectId: string
  fiscalYear: string
  totalBudget: number
  sanctionedBudget: number
  spentAmount: number
  committedAmount: number
  forecastAmount: number
  heads: BudgetHead[]
  createdAt: string
  updatedAt: string
}

export interface BudgetHead {
  id: string
  budgetId: string
  name: string
  category: 'CIVIL' | 'ELECTRICAL' | 'PLUMBING' | 'FINISHING' | 'EXTERNAL' | 'ADMIN' | 'OTHER'
  allocatedAmount: number
  spentAmount: number
  committedAmount: number
  varianceAmount: number
  variancePercentage: number
}

export interface Expenditure {
  id: string
  projectId: string
  budgetHeadId: string
  description: string
  amount: number
  gstAmount: number
  totalAmount: number
  vendorId?: string
  invoiceNumber?: string
  invoiceDate: string
  paymentStatus: PaymentStatus
  paidAt?: string
  approvedBy?: string
  receipts?: string[]
  createdAt: string
}
