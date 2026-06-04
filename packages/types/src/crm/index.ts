// ─── Enums ────────────────────────────────────────────────────────────────────

export enum LeadStage {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  INTERESTED = 'INTERESTED',
  SITE_VISIT_SCHEDULED = 'SITE_VISIT_SCHEDULED',
  SITE_VISIT_DONE = 'SITE_VISIT_DONE',
  NEGOTIATION = 'NEGOTIATION',
  BOOKED = 'BOOKED',
  LOST = 'LOST',
  JUNK = 'JUNK',
}

export enum LeadSource {
  PORTAL = 'PORTAL',
  REFERRAL = 'REFERRAL',
  WALK_IN = 'WALK_IN',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  NEWSPAPER = 'NEWSPAPER',
  HOARDING = 'HOARDING',
  CAMPAIGN = 'CAMPAIGN',
  CHANNEL_PARTNER = 'CHANNEL_PARTNER',
  COLD_CALL = 'COLD_CALL',
  OTHER = 'OTHER',
}

export enum CommissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  INVOICED = 'INVOICED',
  PAID = 'PAID',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

export enum ActivityType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  MEETING = 'MEETING',
  SITE_VISIT = 'SITE_VISIT',
  FOLLOW_UP = 'FOLLOW_UP',
  NOTE = 'NOTE',
  STAGE_CHANGE = 'STAGE_CHANGE',
  DOCUMENT_SHARED = 'DOCUMENT_SHARED',
}

// ─── Lead ─────────────────────────────────────────────────────────────────────

export interface Lead {
  id: string
  name: string
  email?: string
  phone: string
  alternatePhone?: string
  source: LeadSource
  stage: LeadStage
  score: number // 0-100
  budget?: { min: number; max: number }
  preferredLocations?: string[]
  preferredBhk?: string[]
  propertyId?: string
  projectId?: string
  assignedTo: string // brokerId
  teamId?: string
  orgId: string
  activities?: LeadActivity[]
  siteVisits?: SiteVisit[]
  notes?: string
  nextFollowUpDate?: string
  lostReason?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
}

export interface LeadActivity {
  id: string
  leadId: string
  type: ActivityType
  title: string
  description?: string
  outcome?: string
  doneBy: string
  doneAt: string
  nextAction?: string
  nextActionDate?: string
  attachments?: string[]
}

export interface SiteVisit {
  id: string
  leadId: string
  projectId: string
  scheduledAt: string
  conductedAt?: string
  conductedBy: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  feedback?: string
  rating?: number
  interestedUnits?: string[]
}

// ─── Commission ───────────────────────────────────────────────────────────────

export interface Commission {
  id: string
  bookingId: string
  brokerId: string
  agentId?: string
  amount: number
  gstAmount: number
  tdsAmount: number
  netPayable: number
  percentage: number
  status: CommissionStatus
  approvedBy?: string
  approvedAt?: string
  invoiceNumber?: string
  invoiceUrl?: string
  paidAt?: string
  paymentReference?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export interface Customer {
  id: string
  userId: string
  orgId: string // broker org
  name: string
  email: string
  phone: string
  pan?: string
  aadhaar?: string
  address?: {
    line1: string
    city: string
    state: string
    pincode: string
  }
  occupation?: string
  annualIncome?: number
  leads?: Lead[]
  bookings?: string[]
  documents?: CustomerDocument[]
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface CustomerDocument {
  id: string
  customerId: string
  type: 'PAN' | 'AADHAAR' | 'PASSPORT' | 'FORM_16' | 'BANK_STATEMENT' | 'SALARY_SLIP' | 'OTHER'
  name: string
  url: string
  uploadedAt: string
  verifiedAt?: string
}
