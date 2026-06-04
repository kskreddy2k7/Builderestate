import type { FileMetadata } from '../shared'

// ─── CONTRACTOR ───────────────────────────────────────────────────────────────

export enum WorkOrderStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CERTIFIED = 'CERTIFIED',
  CANCELLED = 'CANCELLED',
}

export interface WorkOrder {
  id: string
  projectId: string
  contractorId: string
  title: string
  scope: string
  startDate: string
  endDate: string
  contractValue: number
  retentionPercentage: number
  status: WorkOrderStatus
  milestones?: WorkOrderMilestone[]
  bills?: RABill[]
  createdAt: string
  updatedAt: string
}

export interface WorkOrderMilestone {
  id: string
  workOrderId: string
  description: string
  percentage: number
  amount: number
  completedAt?: string
  status: 'PENDING' | 'COMPLETED' | 'APPROVED'
}

export interface RABill {
  id: string
  workOrderId: string
  billNumber: string
  billDate: string
  grossAmount: number
  retentionAmount: number
  previouslyPaid: number
  currentDue: number
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'CERTIFIED' | 'PAID'
  certifiedBy?: string
  certifiedAt?: string
  paidAt?: string
}

export interface LaborAttendance {
  id: string
  projectId: string
  contractorId: string
  date: string
  entries: { trade: string; present: number; absent: number }[]
  totalPresent: number
  submittedBy: string
  submittedAt: string
}

// ─── MATERIALS ────────────────────────────────────────────────────────────────

export enum OrderStatus {
  DRAFT = 'DRAFT',
  RFQ_SENT = 'RFQ_SENT',
  QUOTED = 'QUOTED',
  PO_ISSUED = 'PO_ISSUED',
  CONFIRMED = 'CONFIRMED',
  DISPATCHED = 'DISPATCHED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  GRN_DONE = 'GRN_DONE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Supplier {
  id: string
  userId: string
  companyName: string
  gstin: string
  categories: string[]
  rating: number
  totalOrders: number
  onTimeDelivery: number // percentage
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  bankDetails?: { bankName: string; accountNumber: string; ifsc: string }
  createdAt: string
}

export interface Product {
  id: string
  supplierId: string
  name: string
  sku: string
  category: string
  subCategory?: string
  specifications: Record<string, string>
  unit: string
  moq: number
  leadTimeDays: number
  basePrice: number
  gstRate: number
  images: string[]
  isActive: boolean
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  projectId: string
  supplierId: string
  status: OrderStatus
  items: POItem[]
  totalAmount: number
  gstAmount: number
  finalAmount: number
  deliveryAddress: string
  expectedDeliveryDate: string
  actualDeliveryDate?: string
  termsAndConditions?: string
  createdAt: string
}

export interface POItem {
  id: string
  poId: string
  productId: string
  productName: string
  quantity: number
  unit: string
  unitPrice: number
  gstRate: number
  totalAmount: number
  receivedQuantity?: number
}

// ─── SITE ENGINEER ────────────────────────────────────────────────────────────

export enum InspectionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  PASS = 'PASS',
  FAIL = 'FAIL',
  CONDITIONAL_PASS = 'CONDITIONAL_PASS',
}

export interface Inspection {
  id: string
  projectId: string
  activity: string
  location: string
  tower?: string
  floor?: number
  unit?: string
  scheduledDate: string
  conductedDate?: string
  inspector: string
  status: InspectionStatus
  checklistItems: InspectionItem[]
  testResults?: TestResult[]
  media: FileMetadata[]
  remarks?: string
  ncrIds?: string[]
  approvalId?: string
  createdAt: string
}

export interface InspectionItem {
  id: string
  category: string
  description: string
  standard: string
  result: 'PASS' | 'FAIL' | 'NA' | 'PENDING'
  remarks?: string
}

export interface NCReport {
  id: string
  ncrNumber: string
  inspectionId: string
  projectId: string
  issuedTo: string // contractorId
  description: string
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL'
  dueDate: string
  status: 'OPEN' | 'UNDER_REVIEW' | 'RECTIFIED' | 'CLOSED' | 'DISPUTED'
  rootCause?: string
  correctiveAction?: string
  preventiveAction?: string
  beforeMedia: FileMetadata[]
  afterMedia: FileMetadata[]
  closedAt?: string
  closedBy?: string
  createdAt: string
}

export interface TestResult {
  id: string
  projectId: string
  inspectionId?: string
  testType: string // "Concrete cube", "Soil compaction", etc.
  sampleId: string
  location: string
  date: string
  result: string
  unit: string
  standardValue: string
  status: 'PASS' | 'FAIL'
  labName?: string
  certificateUrl?: string
}

// ─── BUYER PORTAL ─────────────────────────────────────────────────────────────

export interface Complaint {
  id: string
  complaintNumber: string
  bookingId: string
  raisedBy: string
  category: string
  subject: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  assignedTo?: string
  resolvedAt?: string
  resolutionNote?: string
  media?: FileMetadata[]
  updates?: ComplaintUpdate[]
  slaDeadline: string
  createdAt: string
}

export interface ComplaintUpdate {
  id: string
  complaintId: string
  message: string
  updatedBy: string
  isInternal: boolean
  createdAt: string
}

export interface SnagItem {
  id: string
  bookingId: string
  unit: string
  description: string
  location: string
  status: 'OPEN' | 'IN_PROGRESS' | 'FIXED' | 'ACCEPTED'
  raisedAt: string
  fixedAt?: string
  beforePhoto?: string
  afterPhoto?: string
}

// ─── AI ────────────────────────────────────────────────────────────────────────

export interface CostEstimateRequest {
  city: string
  state: string
  area: number // sqft
  specifications: 'ECONOMY' | 'STANDARD' | 'PREMIUM' | 'LUXURY'
  buildingType: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED'
  floors: number
  basementRequired: boolean
  parkingRequired: boolean
}

export interface CostEstimate {
  id: string
  request: CostEstimateRequest
  minCost: number
  maxCost: number
  avgCost: number
  breakdown: { head: string; percentage: number; amount: number }[]
  confidence: number // 0-100
  validUntil: string
  createdAt: string
}

export interface PropertyValuation {
  id: string
  propertyId?: string
  address: string
  area: number
  type: string
  estimatedValue: number
  pricePerSqft: number
  comparables: { address: string; price: number; area: number; distance: number }[]
  marketTrend: 'RISING' | 'STABLE' | 'DECLINING'
  confidence: number
  validAt: string
}

export interface RiskFlag {
  id: string
  projectId: string
  type: 'BUDGET_OVERRUN' | 'SCHEDULE_DELAY' | 'QUALITY_FAILURE' | 'LEGAL_ISSUE' | 'SAFETY_CONCERN'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  detectedAt: string
  resolvedAt?: string
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_POSITIVE'
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export interface PlatformAnalytics {
  period: { from: string; to: string }
  users: { total: number; active: number; newThisPeriod: number }
  properties: { total: number; active: number; verified: number }
  bookings: { total: number; value: number; newThisPeriod: number }
  projects: { total: number; active: number; completed: number }
  revenue: { gmv: number; platformFee: number }
  topCities: { city: string; bookings: number }[]
}
