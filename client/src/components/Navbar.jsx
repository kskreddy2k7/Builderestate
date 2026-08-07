import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Menu, X, Calendar, Search, Sparkles, ChevronDown, Heart, User, PlusCircle, Compass, LogOut, MessageSquare, Scale, FileDown, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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

  const getProfilePath = () => {
    if (!user) return '/login';
    return '/dashboard';
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

              {/* Profile / Dropdown */}
              {!user ? (
                <Link
                  to="/login"
                  className="p-2.5 rounded-full text-white/80 hover:text-primary hover:bg-white/5 transition-all"
                  title="Profile / Login"
                >
                  <User className="h-4 w-4" />
                </Link>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="p-2.5 rounded-full text-white/80 hover:text-primary hover:bg-white/5 transition-all flex items-center gap-1 focus:outline-none"
                    title={`Dashboard (${user.name})`}
                  >
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 glass-premium border border-white/10 bg-[#0e1017]/95 rounded-2xl p-2 shadow-2xl z-50 text-xs font-bold uppercase tracking-wider text-white/70"
                      >
                        <div className="px-3.5 py-2.5 border-b border-white/10 mb-1 select-none">
                          <p className="text-white text-[10px] truncate">{user.name}</p>
                          <span className="text-[8px] text-primary block mt-0.5 tracking-widest">{user.role}</span>
                        </div>
                        {user.role === 'BUYER' ? (
                          <>
                            <Link
                              to="/dashboard"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <User className="h-4 w-4 text-primary shrink-0" />
                              <span>My Dashboard</span>
                            </Link>
                            <Link
                              to="/dashboard?tab=WISHLIST"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <Heart className="h-4 w-4 text-primary shrink-0" />
                              <span>Wishlist</span>
                            </Link>
                            <Link
                              to="/dashboard?tab=COMPARE"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <Scale className="h-4 w-4 text-primary shrink-0" />
                              <span>Compare Properties</span>
                            </Link>
                            <Link
                              to="/dashboard?tab=VISITS"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <Calendar className="h-4 w-4 text-primary shrink-0" />
                              <span>Site Visits</span>
                            </Link>
                            <Link
                              to="/dashboard?tab=BROCHURES"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <FileDown className="h-4 w-4 text-primary shrink-0" />
                              <span>Brochures</span>
                            </Link>
                            <Link
                              to="/dashboard?tab=ENQUIRIES"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                              <span>My Enquiries</span>
                            </Link>
                            <Link
                              to="/dashboard?tab=SETTINGS"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <Settings className="h-4 w-4 text-primary shrink-0" />
                              <span>Settings</span>
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              to="/dashboard"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <User className="h-4 w-4 text-primary shrink-0" />
                              <span>My Dashboard</span>
                            </Link>
                            <Link
                              to="/dashboard?tab=LISTINGS"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <Building className="h-4 w-4 text-primary shrink-0" />
                              <span>My Listings</span>
                            </Link>
                            <Link
                              to="/sell"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <PlusCircle className="h-4 w-4 text-primary shrink-0" />
                              <span>Add Property</span>
                            </Link>
                            <Link
                              to="/dashboard?tab=ENQUIRIES"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                              <span>Enquiries</span>
                            </Link>
                            <Link
                              to="/dashboard?tab=VISITS"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <Calendar className="h-4 w-4 text-primary shrink-0" />
                              <span>Site Visits</span>
                            </Link>
                            <Link
                              to="/dashboard?tab=ANALYTICS"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                            >
                              <Sparkles className="h-4 w-4 text-primary shrink-0" />
                              <span>Analytics</span>
                            </Link>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors mt-1 border-t border-white/5 pt-2"
                        >
                          <LogOut className="h-4 w-4 shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

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
          { name: 'Profile', icon: User, path: getProfilePath() }
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
