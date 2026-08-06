import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Mail, Phone, MapPin, Send, ArrowUpRight, ShieldCheck, Award } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="border-t border-white/10 bg-[#090a0d] text-white relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 relative z-10 space-y-16">
        
        {/* Top Brand Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-white/10 pb-12 gap-8">
          <div className="space-y-3 max-w-2xl">
            <Link to="/" className="flex items-center space-x-3 text-primary font-extrabold text-3xl tracking-tight">
              <Building className="h-8 w-8 text-primary" />
              <span className="font-serif-luxury text-white tracking-widest">BUILD<span className="text-primary font-bold">ESTATE</span></span>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed font-medium">
              India's premier luxury real estate brand, engineering landmark residential sky villas, gated townships, and ultra-modern commercial destinations across prime metropolises.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-3 glass-card-luxury px-5 py-3 rounded-2xl border border-primary/20">
              <Award className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Awwwards 2026</p>
                <p className="text-3xs text-white/60">Best Architectural PropTech</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 glass-card-luxury px-5 py-3 rounded-2xl border border-primary/20">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">100% RERA Verified</p>
                <p className="text-3xs text-white/60">Compliant Infrastructure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Column Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          
          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary font-serif-luxury">Company</h3>
            <ul className="space-y-2.5 text-xs text-white/70 font-medium">
              <li><Link to="/about" className="hover:text-primary transition-colors">Our Legacy</Link></li>
              <li><a href="#about" className="hover:text-primary transition-colors">Leadership & Vision</a></li>
              <li><a href="#projects" className="hover:text-primary transition-colors">Architectural Design</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers & Talent</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Press & Media</a></li>
            </ul>
          </div>

          {/* Projects */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary font-serif-luxury">Projects</h3>
            <ul className="space-y-2.5 text-xs text-white/70 font-medium">
              <li><Link to="/properties?type=Residential" className="hover:text-primary transition-colors">Luxury Sky Villas</Link></li>
              <li><Link to="/properties?type=Commercial" className="hover:text-primary transition-colors">Corporate Glass Towers</Link></li>
              <li><Link to="/properties?city=Hyderabad" className="hover:text-primary transition-colors">Hyderabad Enclaves</Link></li>
              <li><Link to="/properties?city=Bengaluru" className="hover:text-primary transition-colors">Bengaluru Smart Townships</Link></li>
              <li><Link to="/properties?city=Mumbai" className="hover:text-primary transition-colors">Mumbai Waterfront Penthouses</Link></li>
            </ul>
          </div>

          {/* Investors & RERA */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary font-serif-luxury">Investors</h3>
            <ul className="space-y-2.5 text-xs text-white/70 font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Financial Reports</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">RERA Disclosures</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">ESG & Sustainability</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">NRI Investment Desk</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Partner Portal</a></li>
            </ul>
          </div>

          {/* Head Office */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary font-serif-luxury">Headquarters</h3>
            <div className="space-y-3 text-xs text-white/70 font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Financial District, Nanakramguda, Hyderabad, Telangana 500032</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+91 (040) 8888 7777</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>concierge@buildestate.in</span>
              </div>
            </div>
          </div>

          {/* Private Newsletter */}
          <div className="space-y-4 col-span-2 md:col-span-4 lg:col-span-1">
            <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary font-serif-luxury">Private Desk</h3>
            <p className="text-xs text-white/60 leading-relaxed font-medium">Subscribe for exclusive early-bird previews of off-market luxury launches.</p>
            {subscribed ? (
              <p className="text-xs font-bold text-primary">Invitation Confirmed.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="relative flex">
                <input
                  type="email"
                  placeholder="Enter work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 pr-10 text-xs focus:ring-1 focus:ring-primary focus:outline-none text-white placeholder:text-white/40"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-primary text-black rounded-lg font-bold hover:bg-primary/90 transition-all text-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/50 font-medium gap-4">
          <p>© {new Date().getFullYear()} BuildEstate Luxury Real Estate Limited. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
