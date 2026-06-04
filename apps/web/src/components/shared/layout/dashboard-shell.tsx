'use client'

import { useState } from 'react'
import { cn } from '@buildestate/utils'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

interface DashboardShellProps {
  children: React.ReactNode
  navItems: NavItem[]
  title: string
}

export interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number | string
  children?: NavItem[]
}

export function DashboardShell({ children, navItems, title }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        title={title}
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onCollapseToggle={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64',
        )}
      >
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 lg:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
