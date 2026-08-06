import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowUpRight, Building, Compass, Sparkles } from 'lucide-react';

const COMMERCIAL_CATEGORIES = [
  {
    name: 'Grade-A Office Towers',
    desc: 'Premium double-glazed glass front office floors in financial districts with triple height lobbies and high-speed elevator shafts.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    price: 'Starting ₹12 Cr',
    count: '15 Active Listings'
  },
  {
    name: 'Executive Coworking Suites',
    desc: 'Fully managed shared workspaces featuring luxury video conferencing pods, executive lounges, and high-speed fiber grids.',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
    price: 'Starting ₹4.8 Cr',
    count: '8 Business Parks'
  },
  {
    name: 'IT Parks & Tech Campus Enclaves',
    desc: 'Multi-acre sprawling campuses built for global corporations, featuring smart central utilities and green courtyards.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    price: 'Starting ₹45 Cr',
    count: '5 SEZ Campuses'
  },
  {
    name: 'Retail Showrooms & Malls',
    desc: 'High-footfall flagship retail showrooms positioned in premier high-street commercial fashion hubs.',
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80',
    price: 'Starting ₹8.5 Cr',
    count: '18 Retail Enclaves'
  },
  {
    name: 'IT Logistic Warehouses',
    desc: 'Grade-A industrial logistic spaces equipped with heavy automated loading bays, solar grids, and fire safety systems.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    price: 'Starting ₹15 Cr',
    count: '11 Logistic Hubs'
  },
  {
    name: 'Luxury Hotels & Restaurants',
    desc: 'Bespoke hospitality layouts featuring custom kitchens, luxury conference halls, and central location tags.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    price: 'Starting ₹32 Cr',
    count: '6 Premium Hotels'
  }
];

export default function Commercial() {
  return (
    <div className="bg-[#0b0c10] text-white min-h-screen pt-32 pb-20 space-y-16">
      
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center space-x-2.5 glass-premium px-4 py-2 rounded-full border border-primary/40 text-3xs font-extrabold uppercase tracking-[0.25em] text-primary bg-black/60 backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span>FLAGSHIP COMMERCIAL REGISTRY</span>
        </div>
        <h1 className="font-serif-luxury text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
          Iconic Corporate Spaces for <br />
          <span className="gold-gradient-text">Global Business Leaders</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto leading-relaxed font-medium">
          Shape your enterprise's future in India's premier Grade-A corporate towers, tech business campuses, and high-footfall flagship showrooms.
        </p>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {COMMERCIAL_CATEGORIES.map((cat, idx) => (
          <div key={idx} className="glass-card-luxury rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between group">
            <div className="relative h-64 w-full overflow-hidden">
              <img
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-transparent to-black/30" />
              
              <div className="absolute bottom-4 left-4 flex items-center space-x-1.5 text-3xs text-white/95 font-semibold bg-black/65 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
                <Building className="h-3.5 w-3.5 text-primary" />
                <span>{cat.count}</span>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-serif-luxury text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-white/75 leading-relaxed font-medium">
                  {cat.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Starting Investment</p>
                  <p className="font-serif-luxury text-base font-bold text-primary">{cat.price}</p>
                </div>

                <Link
                  to={`/properties?type=Commercial`}
                  className="btn-gold-luxury px-4 py-2.5 rounded-xl text-3xs font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-lg"
                >
                  <span>View Spaces</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Yield Info Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-premium rounded-3xl p-10 border border-primary/30 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <ShieldCheck className="h-10 w-10 text-primary mx-auto" />
          <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white">Institutional Grade Lease Yields</h3>
          <p className="text-xs text-white/75 max-w-xl mx-auto font-medium">
            Access secure pre-leased office enclaves offering consistent 8.5% – 10.2% Net Rental Yields with major Fortune 500 tenants locked on long-term corporate leases.
          </p>
        </div>
      </section>
    </div>
  );
}
