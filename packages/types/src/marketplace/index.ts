import type { Address, FileMetadata, PaginationQuery, VerificationStatus } from '../shared'

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum PropertyType {
  LAND = 'LAND',
  HOUSE = 'HOUSE',
  APARTMENT = 'APARTMENT',
  VILLA = 'VILLA',
  PLOT = 'PLOT',
  COMMERCIAL = 'COMMERCIAL',
}

export enum PropertyStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SOLD = 'SOLD',
  RENTED = 'RENTED',
  INACTIVE = 'INACTIVE',
}

export enum FurnishingStatus {
  UNFURNISHED = 'UNFURNISHED',
  SEMI_FURNISHED = 'SEMI_FURNISHED',
  FULLY_FURNISHED = 'FULLY_FURNISHED',
}

export enum TransactionType {
  NEW_BOOKING = 'NEW_BOOKING',
  RESALE = 'RESALE',
  RENTAL = 'RENTAL',
}

export enum Facing {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',
  NORTH_EAST = 'NORTH_EAST',
  NORTH_WEST = 'NORTH_WEST',
  SOUTH_EAST = 'SOUTH_EAST',
  SOUTH_WEST = 'SOUTH_WEST',
}

export enum BHKType {
  STUDIO = 'STUDIO',
  ONE_BHK = '1BHK',
  TWO_BHK = '2BHK',
  THREE_BHK = '3BHK',
  FOUR_BHK = '4BHK',
  FIVE_PLUS_BHK = '5+BHK',
}

// ─── Property ─────────────────────────────────────────────────────────────────

export interface Property {
  id: string
  title: string
  slug: string
  description: string
  type: PropertyType
  status: PropertyStatus
  transactionType: TransactionType
  listedBy: string // userId
  orgId?: string
  address: Address
  price: number
  pricePerSqft?: number
  area: number // sqft
  areaSqmtr?: number
  bhkType?: BHKType
  bathrooms?: number
  balconies?: number
  facing?: Facing
  floorNumber?: number
  totalFloors?: number
  furnishingStatus?: FurnishingStatus
  reraNumber?: string
  reraStatus?: VerificationStatus
  possessionDate?: string
  ageOfProperty?: number // years
  amenities: string[]
  media: PropertyMedia[]
  documents: PropertyDocument[]
  verificationStatus: VerificationStatus
  verifiedAt?: string
  viewCount: number
  enquiryCount: number
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export interface PropertyMedia {
  id: string
  propertyId: string
  url: string
  thumbnailUrl?: string
  type: 'IMAGE' | 'VIDEO' | 'FLOOR_PLAN' | 'VIRTUAL_TOUR'
  caption?: string
  isPrimary: boolean
  order: number
}

export interface PropertyDocument {
  id: string
  propertyId: string
  name: string
  type: 'TITLE_DEED' | 'RERA' | 'FLOOR_PLAN' | 'BROCHURE' | 'NOC' | 'OTHER'
  url: string
  isPublic: boolean
  uploadedAt: string
}

// ─── Enquiry ──────────────────────────────────────────────────────────────────

export interface PropertyEnquiry {
  id: string
  propertyId: string
  name: string
  email: string
  phone: string
  message?: string
  budget?: number
  source: string
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'CLOSED'
  assignedTo?: string
  createdAt: string
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface PropertySearchQuery extends PaginationQuery {
  type?: PropertyType
  transactionType?: TransactionType
  city?: string
  state?: string
  pincode?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  bhkType?: BHKType[]
  amenities?: string[]
  furnishingStatus?: FurnishingStatus
  reraVerified?: boolean
  lat?: number
  lng?: number
  radiusKm?: number
}

export interface PropertySearchResult {
  items: Property[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    facets: {
      types: Record<string, number>
      priceRanges: { label: string; count: number }[]
      locations: { city: string; count: number }[]
    }
  }
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreatePropertyDto {
  title: string
  description: string
  type: PropertyType
  transactionType: TransactionType
  address: Address
  price: number
  area: number
  bhkType?: BHKType
  bathrooms?: number
  balconies?: number
  facing?: Facing
  floorNumber?: number
  totalFloors?: number
  furnishingStatus?: FurnishingStatus
  reraNumber?: string
  possessionDate?: string
  amenities?: string[]
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {
  status?: PropertyStatus
}
