import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  LayoutDashboard, Layers, GitBranch, FileText, Wallet, BarChart3,
} from 'lucide-react'

interface ProjectLayoutProps {
  children: React.ReactNode
  params: { id: string }
}

const projectNavTabs = [
  { label: 'Overview', href: 'overview', icon: LayoutDashboard },
  { label: 'Units', href: 'units', icon: Layers },
  { label: 'Milestones', href: 'milestones', icon: GitBranch },
  { label: 'Reports', href: 'reports', icon: FileText },
  { label: 'Finance', href: 'finance', icon: Wallet },
]

export default function ProjectDetailLayout({ children, params }: ProjectLayoutProps) {
  return (
    <div>
      {/* Back link */}
      <div className="mb-4">
        <Link href="/builder/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← All projects
        </Link>
      </div>

      {/* Tab navigation */}
      <div className="mb-6 border-b border-border">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {projectNavTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={`/builder/projects/${params.id}/${tab.href}`}
                className="flex shrink-0 items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground aria-[current=page]:border-primary aria-[current=page]:text-primary"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {children}
    </div>
  )
}
