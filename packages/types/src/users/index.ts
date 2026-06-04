import type { Address, OrgType, UserRole, UserStatus, VerificationStatus } from '../shared'

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  status: UserStatus
  isEmailVerified: boolean
  isPhoneVerified: boolean
  roles: UserRole[]
  orgId?: string
  org?: Organization
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  name: string
  email: string
  phone: string
  password: string
  roles: UserRole[]
  orgId?: string
}

export interface UpdateUserDto {
  name?: string
  phone?: string
  avatar?: string
}

export interface UpdateUserStatusDto {
  status: UserStatus
  reason?: string
}

// ─── Organization ─────────────────────────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  slug: string
  type: OrgType
  gstin?: string
  pan?: string
  reraNumber?: string
  phone?: string
  email?: string
  website?: string
  address?: Address
  logo?: string
  verificationStatus: VerificationStatus
  verifiedAt?: string
  members?: OrganizationMember[]
  createdAt: string
  updatedAt: string
}

export interface OrganizationMember {
  id: string
  userId: string
  orgId: string
  role: UserRole
  designation?: string
  joinedAt: string
  user?: User
}

export interface CreateOrganizationDto {
  name: string
  type: OrgType
  gstin?: string
  pan?: string
  reraNumber?: string
  phone?: string
  email?: string
  address?: Address
}

export interface UpdateOrganizationDto {
  name?: string
  gstin?: string
  pan?: string
  reraNumber?: string
  phone?: string
  email?: string
  website?: string
  address?: Address
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile extends User {
  bio?: string
  linkedin?: string
  yearsOfExperience?: number
  specializations?: string[]
  languages?: string[]
}
