import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowUpRight, Award, Compass, Key } from 'lucide-react';
import OptimizedImage from '../components/OptimizedImage';

const RESIDENTIAL_CATEGORIES = [
  {
    name: 'Luxury Sky Villas',
    desc: 'High-rise residential enclaves offering full floor plates, private infinity pools, and panoramic views of cityscapes.',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80',
    price: 'Starting ₹4.5 Cr',
    count: '18 Gated Complexes'
  },
  {
    name: 'Independent Estates & Mansions',
    desc: 'Bespoke grand residential plots featuring modern classical architecture and customized private landscaping.',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80',
    price: 'Starting ₹6.8 Cr',
    count: '24 Private Locations'
  },
  {
    name: 'Penthouse Collection',
    desc: 'Exquisite top-tier multi-level homes sitting on the highest floors of iconic architectural glass towers.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
    price: 'Starting ₹8.2 Cr',
    count: '12 Exclusive Units'
  },
  {
    name: 'Gated Townships & Row Houses',
    desc: 'Family-friendly secure gated enclaves with private parks, EV grids, smart security, and dedicated clubhouses.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    price: 'Starting ₹2.8 Cr',
    count: '42 Smart Communities'
  },
  {
    name: 'Duplex & Triplex Suites',
    desc: 'Double-volume high-ceiling urban apartments with private elevators and integrated smart automations.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    price: 'Starting ₹3.5 Cr',
    count: '30 Executive Towers'
  },
  {
    name: 'Luxury Weekend Farm Houses',
    desc: 'Eco-friendly sustainable country estates featuring organic gardens, water ponds, and equestrian trails.',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80',
    price: 'Starting ₹5.2 Cr',
    count: '15 Retreat Zones'
  }
];

export default function Residential() {
  return (
    <div className="bg-[#0b0c10] text-white min-h-screen pt-32 pb-20 space-y-16">
      
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center space-x-2.5 glass-premium px-4 py-2 rounded-full border border-primary/40 text-3xs font-extrabold uppercase tracking-[0.25em] text-primary bg-black/60 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
          <span>LUXURY RESIDENTIAL PORTFOLIO</span>
        </div>
        <h1 className="font-serif-luxury text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
          Where Luxury Finds Its <br />
          <span className="gold-gradient-text">True Architectural Form</span>
        </h1>
        <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto leading-relaxed font-medium">
          Explore our handpicked selection of premium sky villas, waterfront penthouses, row houses, and sustainable country estates across India's most coveted destinations.
        </p>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {RESIDENTIAL_CATEGORIES.map((cat, idx) => (
          <div key={idx} className="glass-card-luxury rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between group">
            <div className="relative h-64 w-full overflow-hidden">
              <OptimizedImage
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-transparent to-black/30" />
              
              <div className="absolute bottom-4 left-4 flex items-center space-x-1.5 text-3xs text-white/95 font-semibold bg-black/65 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
                <Compass className="h-3.5 w-3.5 text-primary" />
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
                  <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Investment Level</p>
                  <p className="font-serif-luxury text-base font-bold text-primary">{cat.price}</p>
                </div>

                <Link
                  to={`/properties?type=${encodeURIComponent(cat.name)}`}
                  className="btn-gold-luxury px-4 py-2.5 rounded-xl text-3xs font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-lg"
                >
                  <span>Explore</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* RERA Verification Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-premium rounded-3xl p-10 border border-primary/30 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <ShieldCheck className="h-10 w-10 text-primary mx-auto" />
          <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white">100% RERA Registered Gated Communities</h3>
          <p className="text-xs text-white/75 max-w-xl mx-auto font-medium">
            Every single property listed on the BuildEstate marketplace undergoes 250+ check engineering audits and RERA legal document verification prior to listing.
          </p>
        </div>
      </section>
    </div>
  );
}
