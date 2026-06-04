import {
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
  differenceInDays,
  differenceInMonths,
  addDays,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
} from 'date-fns'

// ─── Parsers ──────────────────────────────────────────────────────────────────

export function toDate(value: string | Date): Date {
  if (value instanceof Date) return value
  return parseISO(value)
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatDate(value: string | Date, pattern = 'dd MMM yyyy'): string {
  return format(toDate(value), pattern)
}

export function formatDateTime(value: string | Date): string {
  return format(toDate(value), 'dd MMM yyyy, hh:mm a')
}

export function formatTime(value: string | Date): string {
  return format(toDate(value), 'hh:mm a')
}

export function formatRelative(value: string | Date): string {
  const date = toDate(value)
  if (isToday(date)) return `Today at ${formatTime(date)}`
  if (isYesterday(date)) return `Yesterday at ${formatTime(date)}`
  if (isTomorrow(date)) return `Tomorrow at ${formatTime(date)}`
  return formatDate(date)
}

export function formatTimeAgo(value: string | Date): string {
  return formatDistanceToNow(toDate(value), { addSuffix: true })
}

export function formatMonthYear(value: string | Date): string {
  return format(toDate(value), 'MMMM yyyy')
}

// ─── Comparators ─────────────────────────────────────────────────────────────

export function isOverdue(dueDate: string | Date): boolean {
  return isBefore(toDate(dueDate), new Date())
}

export function isDueSoon(dueDate: string | Date, daysThreshold = 7): boolean {
  const due = toDate(dueDate)
  const threshold = addDays(new Date(), daysThreshold)
  return isAfter(due, new Date()) && isBefore(due, threshold)
}

// ─── Calculations ─────────────────────────────────────────────────────────────

export function daysBetween(from: string | Date, to: string | Date): number {
  return differenceInDays(toDate(to), toDate(from))
}

export function monthsBetween(from: string | Date, to: string | Date): number {
  return differenceInMonths(toDate(to), toDate(from))
}

export function constructionProgress(
  startDate: string | Date,
  endDate: string | Date,
): number {
  const start = toDate(startDate)
  const end = toDate(endDate)
  const now = new Date()

  if (isBefore(now, start)) return 0
  if (isAfter(now, end)) return 100

  const total = differenceInDays(end, start)
  const elapsed = differenceInDays(now, start)
  return Math.round((elapsed / total) * 100)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export { addDays, addMonths, startOfMonth, endOfMonth, startOfDay, endOfDay, isAfter, isBefore }

export function toISOString(value: Date): string {
  return value.toISOString()
}

export function nowISO(): string {
  return new Date().toISOString()
}
