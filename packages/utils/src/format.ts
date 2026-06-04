// ─── Currency ─────────────────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupees (INR)
 * e.g. 1500000 → "₹15,00,000"
 */
export function formatCurrency(
  amount: number,
  options: { compact?: boolean; decimals?: number } = {},
): string {
  const { compact = false, decimals = 0 } = options

  if (compact) {
    if (amount >= 10_000_000) {
      return `₹${(amount / 10_000_000).toFixed(2)} Cr`
    }
    if (amount >= 100_000) {
      return `₹${(amount / 100_000).toFixed(2)} L`
    }
    if (amount >= 1_000) {
      return `₹${(amount / 1_000).toFixed(1)}K`
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

/**
 * Parse INR string back to number
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[₹,]/g, '').trim())
}

/**
 * Format price per sqft
 */
export function formatPricePerSqft(price: number): string {
  return `${formatCurrency(price)}/sqft`
}

// ─── Area ─────────────────────────────────────────────────────────────────────

export function sqftToSqmtr(sqft: number): number {
  return Math.round(sqft * 0.0929 * 100) / 100
}

export function sqmtrToSqft(sqmtr: number): number {
  return Math.round(sqmtr * 10.764 * 100) / 100
}

export function formatArea(sqft: number, showBoth = false): string {
  if (showBoth) {
    return `${sqft.toLocaleString('en-IN')} sqft (${sqftToSqmtr(sqft)} sqm)`
  }
  return `${sqft.toLocaleString('en-IN')} sqft`
}

// ─── Numbers ──────────────────────────────────────────────────────────────────

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value)
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function roundToNearest(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest
}

// ─── Phone ────────────────────────────────────────────────────────────────────

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  return phone
}

export function maskPhone(phone: string): string {
  const formatted = phone.replace(/\D/g, '')
  return `${formatted.slice(0, 2)}XXXXXX${formatted.slice(-2)}`
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  const visible = local.slice(0, 2)
  return `${visible}${'*'.repeat(local.length - 2)}@${domain}`
}
