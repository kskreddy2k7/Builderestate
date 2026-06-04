'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@buildestate/utils'
import type { NavItem } from './dashboard-shell'

interface SidebarProps {
  navItems: NavItem[]
  title: string
  open: boolean
  collapsed: boolean
  onClose: () => void
  onCollapseToggle: () => void
}

export function Sidebar({ navItems, title, open, collapsed, onClose, onCollapseToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-card transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          // Mobile: slide in/out
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex h-16 shrink-0 items-center border-b border-border px-4',
          collapsed ? 'justify-center' : 'justify-between',
        )}>
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold shrink-0">
                BE
              </div>
              <div>
                <span className="text-sm font-semibold">BuildEstate</span>
                <p className="text-xs text-muted-foreground">{title}</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              BE
            </div>
          )}
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden rounded-md p-1 hover:bg-accent"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <NavItemRow
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
              />
            ))}
          </ul>
        </nav>

        {/* Collapse toggle - desktop only */}
        <div className="hidden lg:flex border-t border-border p-2">
          <button
            onClick={onCollapseToggle}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground text-xs"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}

function NavItemRow({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem
  pathname: string
  collapsed: boolean
}) {
  const isActive =
    pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

  return (
    <li>
      <Link
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={cn(
          'group flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          collapsed && 'justify-center px-2',
        )}
      >
        <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge !== undefined && (
              <span className={cn(
                'ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
              )}>
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    </li>
  )
}
