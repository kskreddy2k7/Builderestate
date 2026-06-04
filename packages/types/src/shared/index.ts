// ─── Common Enums ─────────────────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  BUILDER = 'BUILDER',
  BROKER = 'BROKER',
  BUYER = 'BUYER',
  CONTRACTOR = 'CONTRACTOR',
  SITE_ENGINEER = 'SITE_ENGINEER',
  SUPPLIER = 'SUPPLIER',
  AGENT = 'AGENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum OrgType {
  BUILDER = 'BUILDER',
  BROKERAGE = 'BROKERAGE',
  CONTRACTOR = 'CONTRACTOR',
  SUPPLIER = 'SUPPLIER',
  INDIVIDUAL = 'INDIVIDUAL',
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
  timestamp: string
  path: string
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginationQuery {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
}

// ─── File / Media ─────────────────────────────────────────────────────────────

export enum FileType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  DOCUMENT = 'DOCUMENT',
  SPREADSHEET = 'SPREADSHEET',
  DRAWING = 'DRAWING',
  OTHER = 'OTHER',
}

export interface FileMetadata {
  id: string
  originalName: string
  storedName: string
  mimeType: string
  size: number
  url: string
  type: FileType
  uploadedBy: string
  uploadedAt: string
}

export interface UploadedFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  buffer: Buffer
}

// ─── Notifications ────────────────────────────────────────────────────────────

export enum NotificationType {
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_DUE = 'PAYMENT_DUE',
  DEMAND_LETTER = 'DEMAND_LETTER',
  MILESTONE_COMPLETED = 'MILESTONE_COMPLETED',
  PROGRESS_UPDATE = 'PROGRESS_UPDATE',
  LEAD_ASSIGNED = 'LEAD_ASSIGNED',
  SITE_VISIT_SCHEDULED = 'SITE_VISIT_SCHEDULED',
  INSPECTION_SCHEDULED = 'INSPECTION_SCHEDULED',
  NCR_RAISED = 'NCR_RAISED',
  NCR_CLOSED = 'NCR_CLOSED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  COMPLAINT_RAISED = 'COMPLAINT_RAISED',
  COMPLAINT_RESOLVED = 'COMPLAINT_RESOLVED',
  DELIVERY_DISPATCHED = 'DELIVERY_DISPATCHED',
  DELIVERY_COMPLETED = 'DELIVERY_COMPLETED',
  COMMISSION_APPROVED = 'COMMISSION_APPROVED',
  PROPERTY_VERIFIED = 'PROPERTY_VERIFIED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  WHATSAPP = 'WHATSAPP',
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
  channels: NotificationChannel[]
  isRead: boolean
  readAt?: string
  createdAt: string
}

// ─── Address ──────────────────────────────────────────────────────────────────

export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country: string
  latitude?: number
  longitude?: number
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  ipAddress: string
  userAgent: string
  createdAt: string
}

// ─── Date Range ───────────────────────────────────────────────────────────────

export interface DateRange {
  from: string
  to: string
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export type Currency = 'INR'

export interface Money {
  amount: number
  currency: Currency
}
