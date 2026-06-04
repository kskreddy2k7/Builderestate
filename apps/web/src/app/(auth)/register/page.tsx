'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Building2, Briefcase, Home, HardHat, Wrench, Package } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@buildestate/utils'
import { useAuth } from '@/hooks/use-auth'
import type { UserRole } from '@buildestate/types'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'One uppercase letter')
      .regex(/[0-9]/, 'One number'),
    confirmPassword: z.string(),
    role: z.enum(['BUILDER', 'BROKER', 'BUYER', 'CONTRACTOR', 'SITE_ENGINEER', 'SUPPLIER']),
    orgName: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

const ROLES: { value: UserRole; label: string; description: string; icon: React.ReactNode; needsOrg: boolean }[] = [
  { value: 'BUILDER', label: 'Builder', description: 'Develop & sell properties', icon: <Building2 className="h-5 w-5" />, needsOrg: true },
  { value: 'BROKER', label: 'Broker', description: 'Sell & earn commissions', icon: <Briefcase className="h-5 w-5" />, needsOrg: true },
  { value: 'BUYER', label: 'Buyer', description: 'Find & buy properties', icon: <Home className="h-5 w-5" />, needsOrg: false },
  { value: 'CONTRACTOR', label: 'Contractor', description: 'Construction & labour', icon: <HardHat className="h-5 w-5" />, needsOrg: true },
  { value: 'SITE_ENGINEER', label: 'Site Engineer', description: 'Inspections & approvals', icon: <Wrench className="h-5 w-5" />, needsOrg: false },
  { value: 'SUPPLIER', label: 'Supplier', description: 'Sell construction materials', icon: <Package className="h-5 w-5" />, needsOrg: true },
]

export default function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'BUYER' },
  })

  const selectedRole = form.watch('role')
  const needsOrg = ROLES.find((r) => r.value === selectedRole)?.needsOrg ?? false

  const onSubmit = (values: RegisterFormValues) => {
    registerUser({
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password,
      role: values.role as UserRole,
      orgName: values.orgName,
    })
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Join BuildEstate — choose your role to get started
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selection */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">I am a</label>
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => field.onChange(role.value)}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all',
                      field.value === role.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-primary/50 hover:bg-accent',
                    )}
                  >
                    <div className={cn(
                      'rounded-md p-1.5',
                      field.value === role.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}>
                      {role.icon}
                    </div>
                    <span className="text-xs font-medium">{role.label}</span>
                    <span className="text-xs text-muted-foreground leading-tight">{role.description}</span>
                  </button>
                ))}
              </div>
            )}
          />
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Ravi Kumar"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...form.register('name')}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        {/* Org name (conditional) */}
        {needsOrg && (
          <div className="space-y-1.5">
            <label htmlFor="orgName" className="text-sm font-medium">
              Company / Organisation name
            </label>
            <input
              id="orgName"
              type="text"
              placeholder="Prestige Constructions Pvt Ltd"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...form.register('orgName')}
            />
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium">Mobile number</label>
          <div className="flex gap-2">
            <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
              +91
            </div>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="9876543210"
              maxLength={10}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...form.register('phone')}
            />
          </div>
          {form.formState.errors.phone && (
            <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...form.register('confirmPassword')}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isRegistering}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          {isRegistering ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
          ) : (
            'Create account'
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </>
  )
}
