import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Class Names ──────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ─── Slug ─────────────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateUniqueSlug(base: string, existing: string[]): string {
  const slug = slugify(base)
  if (!existing.includes(slug)) return slug

  let counter = 1
  while (existing.includes(`${slug}-${counter}`)) {
    counter++
  }
  return `${slug}-${counter}`
}

// ─── ID Generation ────────────────────────────────────────────────────────────

export function generateBookingNumber(): string {
  const year = new Date().getFullYear().toString().slice(2)
  const random = Math.floor(Math.random() * 900000 + 100000)
  return `BK${year}${random}`
}

export function generatePaymentNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  return `PAY${timestamp}`
}

export function generateDemandLetterNumber(projectCode: string, seq: number): string {
  return `DL-${projectCode}-${seq.toString().padStart(4, '0')}`
}

export function generateNCRNumber(projectCode: string, seq: number): string {
  return `NCR-${projectCode}-${seq.toString().padStart(4, '0')}`
}

export function generatePONumber(projectCode: string, seq: number): string {
  return `PO-${projectCode}-${seq.toString().padStart(4, '0')}`
}

export function generateWONumber(projectCode: string, seq: number): string {
  return `WO-${projectCode}-${seq.toString().padStart(4, '0')}`
}

// ─── String ───────────────────────────────────────────────────────────────────

export function truncate(text: string, maxLength: number, ellipsis = '...'): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - ellipsis.length)}${ellipsis}`
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function titleCase(text: string): string {
  return text.replace(/\w\S*/g, capitalize)
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

// ─── Arrays ───────────────────────────────────────────────────────────────────

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (acc, item) => {
      const groupKey = String(item[key])
      return {
        ...acc,
        [groupKey]: [...(acc[groupKey] ?? []), item],
      }
    },
    {} as Record<string, T[]>,
  )
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return order === 'asc' ? comparison : -comparison
  })
}

// ─── Objects ─────────────────────────────────────────────────────────────────

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => delete result[key])
  return result
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    result[key] = obj[key]
  })
  return result
}

export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target }
  for (const key in source) {
    const targetVal = target[key]
    const sourceVal = source[key]
    if (
      targetVal &&
      sourceVal &&
      typeof targetVal === 'object' &&
      typeof sourceVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      output[key] = deepMerge(targetVal as object, sourceVal as object) as T[typeof key]
    } else if (sourceVal !== undefined) {
      output[key] = sourceVal as T[typeof key]
    }
  }
  return output
}

// ─── Async ────────────────────────────────────────────────────────────────────

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000,
): Promise<T> {
  let lastError: Error | undefined
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (attempt < maxAttempts) {
        await sleep(delay * attempt)
      }
    }
  }
  throw lastError ?? new Error('Max retry attempts exceeded')
}

// ─── URL ──────────────────────────────────────────────────────────────────────

export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)))
      } else {
        searchParams.set(key, String(value))
      }
    }
  }
  return searchParams.toString()
}

export function parseQueryString(query: string): Record<string, string | string[]> {
  const params = new URLSearchParams(query)
  const result: Record<string, string | string[]> = {}
  params.forEach((value, key) => {
    if (key in result) {
      const existing = result[key]
      result[key] = Array.isArray(existing) ? [...existing, value] : [existing!, value]
    } else {
      result[key] = value
    }
  })
  return result
}
