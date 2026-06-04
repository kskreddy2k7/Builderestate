import { z } from 'zod'

// ─── Primitives ───────────────────────────────────────────────────────────────

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')

export const emailSchema = z.string().email('Enter a valid email address').toLowerCase()

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character')

export const gstinSchema = z
  .string()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    'Enter a valid GSTIN',
  )

export const panSchema = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Enter a valid PAN number')

export const pincodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode')

export const aadhaarSchema = z
  .string()
  .regex(/^[2-9]{1}[0-9]{11}$/, 'Enter a valid 12-digit Aadhaar number')

export const reraSchema = z
  .string()
  .min(5, 'RERA number must be at least 5 characters')
  .max(50, 'RERA number is too long')

// ─── Common ───────────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  line1: z.string().min(5, 'Address is too short'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: pincodeSchema,
  country: z.string().default('India'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
})

export const dateRangeSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
})

// ─── Auth schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ─── Validators ───────────────────────────────────────────────────────────────

export function validateGSTIN(gstin: string): boolean {
  return gstinSchema.safeParse(gstin).success
}

export function validatePAN(pan: string): boolean {
  return panSchema.safeParse(pan).success
}

export function validatePhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success
}

export function validatePincode(pincode: string): boolean {
  return pincodeSchema.safeParse(pincode).success
}
