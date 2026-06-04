import { cn } from '@buildestate/utils'
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// ─── StatsCard ────────────────────────────────────────────────────────────────

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: { value: number; label: string }
  className?: string
  loading?: boolean
}

export function StatsCard({ title, value, description, icon: Icon, trend, className, loading }: StatsCardProps) {
  if (loading) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-5', className)}>
        <div className="h-4 w-24 rounded shimmer mb-3" />
        <div className="h-8 w-32 rounded shimmer mb-2" />
        <div className="h-3 w-20 rounded shimmer" />
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-border/50 glass-card p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group', className)}>
      {/* Subtle background gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-xl bg-primary/10 p-3 ring-1 ring-primary/20 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)]">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          {trend.value > 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-success-600" />
          ) : trend.value < 0 ? (
            <TrendingDown className="h-3.5 w-3.5 text-danger-500" />
          ) : (
            <Minus className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className={cn(
            'text-xs font-medium',
            trend.value > 0 ? 'text-success-600' : trend.value < 0 ? 'text-danger-500' : 'text-muted-foreground',
          )}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  )
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumb?: { label: string; href?: string }[]
}

export function PageHeader({ title, description, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                {item.href ? (
                  <a href={item.href} className="hover:text-foreground transition-colors">{item.label}</a>
                ) : (
                  <span>{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2 mt-2 sm:mt-0">{actions}</div>}
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      {icon && <div className="mb-4 text-muted-foreground/50 [&>svg]:h-12 [&>svg]:w-12">{icon}</div>}
      <h3 className="text-base font-medium">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-success-50 text-success-700 dark:bg-success-700/20 dark:text-success-400',
  warning: 'bg-warning-50 text-warning-700 dark:bg-warning-700/20 dark:text-warning-400',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-700/20 dark:text-danger-400',
  info: 'bg-brand-50 text-brand-700 dark:bg-brand-700/20 dark:text-brand-400',
  outline: 'border border-border bg-transparent text-foreground',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      badgeVariants[variant],
      className,
    )}>
      {children}
    </span>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function ProgressBar({ value, max = 100, label, showValue = false, size = 'md', variant = 'default' }: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)

  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' }
  const colors = {
    default: 'bg-primary',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
  }

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && <span className="font-medium">{percentage}%</span>}
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-secondary/80 ring-1 ring-inset ring-border/50', heights[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out relative',
            colors[variant]
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-[shimmer_2s_infinite]" />
        </div>
      </div>
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('rounded shimmer', className)} />
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface SectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function Section({ title, description, children, actions, className }: SectionProps) {
  return (
    <section className={cn('rounded-xl border border-border/50 glass-card overflow-hidden', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-5 py-4 backdrop-blur-sm">
          <div>
            {title && <h2 className="text-base font-semibold tracking-tight">{title}</h2>}
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  )
}
