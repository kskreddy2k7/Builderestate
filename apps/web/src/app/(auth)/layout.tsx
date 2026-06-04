import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { default: 'Sign In', template: '%s | BuildEstate' },
}

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
              BE
            </div>
            <span className="text-xl font-semibold tracking-tight">BuildEstate</span>
          </Link>
          {children}
        </div>
      </div>

      {/* Right: brand panel */}
      <div className="hidden bg-brand-950 lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-800/30 to-transparent" />
        <div className="relative z-10 max-w-md text-center text-white">
          <div className="mb-8 text-6xl">🏗️</div>
          <h1 className="mb-4 text-3xl font-semibold tracking-tight">
            One platform for the entire real estate lifecycle
          </h1>
          <p className="text-brand-200 leading-relaxed">
            Builders, brokers, buyers, contractors, and engineers — all connected
            on a single platform. From listing to handover, managed in one place.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-left">
            {[
              { icon: '🏢', label: 'Builder ERP', desc: 'Projects & finance' },
              { icon: '🤝', label: 'Broker CRM', desc: 'Leads & commissions' },
              { icon: '👷', label: 'Construction', desc: 'Progress & quality' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-brand-300">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
