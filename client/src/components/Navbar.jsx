import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Menu, X, Calendar, Search, Sparkles, ChevronDown, Heart, User, PlusCircle, Compass } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Projects', path: '/properties' },
    { name: 'Residential', path: '/residential' },
    { name: 'Commercial', path: '/commercial' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const handleBookVisit = () => {
    const event = new CustomEvent('openBookVisitModal');
    window.dispatchEvent(event);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-3 ${
          scrolled
            ? 'glass-nav shadow-2xl'
            : 'bg-gradient-to-b from-black/85 via-black/45 to-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center space-x-2.5 text-primary font-extrabold text-2xl tracking-tight group shrink-0">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/30 group-hover:border-primary/60 transition-colors">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif-luxury text-white text-lg tracking-widest leading-none">BUILD<span className="text-primary font-bold">ESTATE</span></span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-semibold">Luxury Real Estate</span>
              </div>
            </Link>

            {/* Desktop Links (Optimized core 6 routes) */}
            <div className="hidden lg:flex items-center space-x-5">
              <div className="flex space-x-6">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`relative py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                        isActive ? 'text-primary' : 'text-white/80 hover:text-primary'
                      }`}
                    >
                      <span>{link.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-underline"
                          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_#d4af37]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="h-4 w-px bg-white/15" />

              {/* Profile Link */}
              <Link
                to="/login"
                className="p-2.5 rounded-full text-white/80 hover:text-primary hover:bg-white/5 transition-all"
                title="Profile / Login"
              >
                <User className="h-4 w-4" />
              </Link>

              {/* Book Site Visit CTA */}
              <button
                onClick={handleBookVisit}
                className="btn-gold-luxury px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg"
              >
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Book Site Visit</span>
              </button>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="lg:hidden flex items-center space-x-2">
              <button
                onClick={handleBookVisit}
                className="btn-gold-luxury px-3.5 py-2 rounded-lg text-3xs uppercase font-extrabold"
              >
                Visit
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl bg-white/5 text-white/90 border border-white/10 hover:bg-white/10 transition-all"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden glass-nav border-t border-white/10 overflow-hidden px-4 pt-3 pb-6 space-y-2.5"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleBookVisit();
                  }}
                  className="w-full btn-gold-luxury py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book Site Visit</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-[#0c0d12]/95 border-t border-white/10 z-50 flex justify-around py-3 backdrop-blur-xl">
        {[
          { name: 'Home', icon: Building, path: '/' },
          { name: 'Search', icon: Search, path: '/properties' },
          { name: 'About', icon: Compass, path: '/about' },
          { name: 'Contact', icon: Calendar, path: '/contact' },
          { name: 'Profile', icon: User, path: '/login' }
        ].map((tab, idx) => (
          <Link
            key={idx}
            to={tab.path}
            className="flex flex-col items-center text-white/70 hover:text-primary transition-all space-y-0.5"
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[9px] uppercase font-bold tracking-wider">{tab.name}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
