import type { FileMetadata } from '../shared'

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  APPROVED = 'APPROVED',
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
  CONSTRUCTION_COMPLETED = 'CONSTRUCTION_COMPLETED',
  POSSESSION_STARTED = 'POSSESSION_STARTED',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

export enum MilestoneStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  ON_HOLD = 'ON_HOLD',
}

export enum QualityCheckStatus {
  PENDING = 'PENDING',
  PASS = 'PASS',
  FAIL = 'FAIL',
  REWORK_REQUIRED = 'REWORK_REQUIRED',
  REWORK_DONE = 'REWORK_DONE',
}

export enum UnitStatus {
  AVAILABLE = 'AVAILABLE',
  HOLD = 'HOLD',
  BOOKED = 'BOOKED',
  AGREEMENT_DONE = 'AGREEMENT_DONE',
  REGISTERED = 'REGISTERED',
  POSSESSION_GIVEN = 'POSSESSION_GIVEN',
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  orgId: string
  name: string
  slug: string
  description?: string
  status: ProjectStatus
  reraNumber?: string
  totalArea: number // sq ft (total site area)
  builtUpArea?: number
  numberOfTowers: number
  numberOfUnits: number
  address: {
    line1: string
    city: string
    state: string
    pincode: string
    latitude?: number
    longitude?: number
  }
  startDate: string
  expectedCompletionDate: string
  actualCompletionDate?: string
  coverImage?: string
  amenities: string[]
  phases?: ProjectPhase[]
  towers?: Tower[]
  createdAt: string
  updatedAt: string
}

export interface ProjectPhase {
  id: string
  projectId: string
  name: string
  description?: string
  status: ProjectStatus
  startDate: string
  endDate: string
  towers?: Tower[]
}

// ─── Tower / Floor / Unit ─────────────────────────────────────────────────────

export interface Tower {
  id: string
  projectId: string
  phaseId?: string
  name: string
  numberOfFloors: number
  numberOfUnitsPerFloor: number
  totalUnits: number
  status: ProjectStatus
  floors?: Floor[]
}

export interface Floor {
  id: string
  towerId: string
  floorNumber: number
  label: string // "Ground Floor", "1st Floor" etc.
  units?: Unit[]
}

export interface Unit {
  id: string
  floorId: string
  unitNumber: string
  bhkType: string
  area: number // sqft
  carpetArea?: number
  builtUpArea?: number
  superBuiltUpArea?: number
  facing?: string
  status: UnitStatus
  basePrice: number
  floorRisePremium?: number
  facingPremium?: number
  finalPrice?: number
  amenities?: string[]
  floorPlanUrl?: string
  booking?: {
    buyerName: string
    bookingDate: string
  }
}

// ─── Milestone ────────────────────────────────────────────────────────────────

export interface Milestone {
  id: string
  projectId: string
  phaseId?: string
  name: string
  description?: string
  status: MilestoneStatus
  plannedStartDate: string
  plannedEndDate: string
  actualStartDate?: string
  actualEndDate?: string
  completionPercentage: number
  linkedPaymentPercentage?: number // % of payment due on this milestone
  dependencies?: string[] // milestone IDs
  createdAt: string
  updatedAt: string
}

// ─── Progress Update ──────────────────────────────────────────────────────────

export interface ProgressUpdate {
  id: string
  projectId: string
  milestoneId?: string
  title: string
  description: string
  completionPercentage: number
  media: FileMetadata[]
  postedBy: string
  postedAt: string
  isVisibleToBuyers: boolean
}

// ─── Daily Site Report ────────────────────────────────────────────────────────

export interface DailySiteReport {
  id: string
  projectId: string
  reportDate: string
  preparedBy: string
  weather?: string
  totalLabour: number
  labourBreakdown?: { trade: string; count: number }[]
  workDone: string
  materialsUsed?: { material: string; quantity: number; unit: string }[]
  equipmentUsed?: string[]
  issues?: string
  media: FileMetadata[]
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED'
  submittedAt?: string
  approvedBy?: string
  approvedAt?: string
}

// ─── Quality Check ────────────────────────────────────────────────────────────

export interface QualityCheck {
  id: string
  projectId: string
  activity: string
  location: string
  checklistItems: QualityCheckItem[]
  overallStatus: QualityCheckStatus
  inspectedBy: string
  inspectedAt: string
  remarks?: string
  media: FileMetadata[]
  ncrId?: string
}

export interface QualityCheckItem {
  id: string
  description: string
  status: 'PASS' | 'FAIL' | 'NA'
  remarks?: string
}
