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
      <section className="bg-gradient-to-b from-brand-950 to-brand-900 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Find your perfect property
          </h1>
          <p className="mb-8 text-brand-200 text-lg max-w-xl mx-auto">
            From budget apartments to luxury villas — verified listings from trusted builders across India.
          </p>

          {/* Search bar */}
          <div className="mx-auto max-w-2xl">
            <div className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-elevated sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="City, locality, or project name"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">All types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House / Villa</option>
                <option value="land">Land / Plot</option>
              </select>
              <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                <Search className="h-4 w-4" />
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
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-card-hover"
              >
                <div className="text-4xl">{city.img}</div>
                <div>
                  <p className="font-medium group-hover:text-primary transition-colors">{city.name}</p>
                  <p className="text-sm text-muted-foreground">{city.count}</p>
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
