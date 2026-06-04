import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, MapPin, TrendingUp, Shield, Building2, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'BuildEstate — Find Your Dream Property',
  description: 'Search thousands of verified properties across India. New launches, resale, and rental listings with RERA-verified builders.',
}

const popularCities = [
  { name: 'Bengaluru', count: '2,847 properties', img: '🏙️' },
  { name: 'Hyderabad', count: '1,923 properties', img: '🌆' },
  { name: 'Mumbai', count: '3,412 properties', img: '🌃' },
  { name: 'Pune', count: '1,654 properties', img: '🏘️' },
  { name: 'Chennai', count: '1,287 properties', img: '🏗️' },
  { name: 'Delhi NCR', count: '2,104 properties', img: '🏢' },
]

const features = [
  { icon: <Shield className="h-6 w-6" />, title: 'RERA Verified', desc: 'Every project cross-checked against state RERA portals' },
  { icon: <TrendingUp className="h-6 w-6" />, title: 'AI Valuation', desc: 'Market-accurate property valuations using comparable data' },
  { icon: <Building2 className="h-6 w-6" />, title: 'Live Progress', desc: 'Track construction milestone-by-milestone in real time' },
  { icon: <Star className="h-6 w-6" />, title: 'Verified Builders', desc: 'Only background-checked, document-verified developers' },
]

export default function MarketplacePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">BE</div>
            <span className="font-semibold">BuildEstate</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="/marketplace" className="text-foreground font-medium">Buy</Link>
            <Link href="/marketplace?type=rental" className="text-muted-foreground hover:text-foreground">Rent</Link>
            <Link href="/marketplace?type=land" className="text-muted-foreground hover:text-foreground">Land</Link>
            <Link href="/marketplace?new=true" className="text-muted-foreground hover:text-foreground">New launches</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 py-32 text-white">
        {/* Decorative background gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-100 to-brand-300">
            Find your perfect property
          </h1>
          <p className="mb-10 text-brand-200 text-lg md:text-xl max-w-2xl mx-auto font-light">
            From budget apartments to luxury villas — verified listings from trusted builders across India.
          </p>

          {/* Search bar */}
          <div className="mx-auto max-w-3xl mt-8">
            <div className="flex flex-col gap-3 rounded-2xl glass p-3 shadow-[0_8px_30px_rgb(0,0,0,0.3)] sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-md border border-white/10 transition-colors focus-within:border-primary/50 focus-within:bg-white/20">
                <MapPin className="h-5 w-5 shrink-0 text-brand-200" />
                <input
                  type="text"
                  placeholder="City, locality, or project name"
                  className="flex-1 bg-transparent text-sm md:text-base text-white placeholder:text-brand-200/70 focus:outline-none"
                />
              </div>
              <div className="relative flex-shrink-0">
                <select className="h-full w-full appearance-none rounded-xl border border-white/10 bg-white/10 px-4 py-3 pr-10 text-sm md:text-base text-white backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-primary/50 [&>option]:bg-brand-950">
                  <option value="">All types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House / Villa</option>
                  <option value="land">Land / Plot</option>
                </select>
              </div>
              <button className="inline-flex h-12 md:h-auto items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-primary/40 hover:bg-primary/90">
                <Search className="h-5 w-5" />
                Search
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-brand-300">
            <span>Popular:</span>
            {['2BHK Bengaluru', '3BHK Hyderabad', 'Villa Pune', 'Plot Chennai'].map((term) => (
              <button key={term} className="rounded-full border border-brand-600/50 px-2.5 py-1 hover:bg-white/10 transition-colors">
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular cities */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-xl font-semibold">Browse by city</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularCities.map((city) => (
              <Link
                key={city.name}
                href={`/marketplace?city=${city.name}`}
                className="group relative flex items-center gap-5 rounded-2xl border border-border/50 glass-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-3xl shadow-sm ring-1 ring-border/50 transition-transform duration-300 group-hover:scale-110 group-hover:ring-primary/30">
                  {city.img}
                </div>
                <div className="relative z-10">
                  <p className="text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">{city.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{city.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 text-xl font-semibold text-center">Why BuildEstate?</h2>
          <p className="mb-10 text-center text-sm text-muted-foreground">Built for the Indian real estate ecosystem</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <h3 className="mb-1.5 font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-950 py-16 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="mb-3 text-2xl font-semibold">Are you a builder or broker?</h2>
          <p className="mb-6 text-brand-200">List your projects, manage CRM, and track construction — all in one platform.</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register?role=BUILDER"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-brand-950 hover:bg-brand-50 transition-colors"
            >
              <Building2 className="h-4 w-4" />
              List as Builder
            </Link>
            <Link
              href="/register?role=BROKER"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/30 px-6 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Join as Broker
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} BuildEstate. All rights reserved.</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
