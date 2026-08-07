import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, CreditCard, Building, MapPin, DollarSign, ArrowUpRight, 
  Compass, ShieldCheck, Heart, Search, Eye, Bell, FileDown, 
  MessageSquare, Phone, CheckCircle, RefreshCw 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searches, setSearches] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('UNITS'); // UNITS, VISITS, WISHLIST, SEARCHES, ENQUIRIES

  const fetchData = async () => {
    try {
      const [bookRes, wishRes, searchRes, alertRes, viewedRes, enqRes] = await Promise.all([
        api.get('/bookings/buyer'),
        api.get('/wishlist'),
        api.get('/saved-searches'),
        api.get('/alerts'),
        api.get('/recently-viewed'),
        api.get('/enquiries')
      ]);
      setBookings(bookRes.data || []);
      setWishlist(wishRes.data || []);
      setSearches(searchRes.data || []);
      setAlerts(alertRes.data || []);
      setRecentlyViewed(viewedRes.data || []);
      setEnquiries(enqRes.data || []);
    } catch (err) {
      console.error('Error fetching buyer portal stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleAlert = async (propertyId) => {
    try {
      const res = await api.post('/alerts', { propertyId });
      if (res.data.active) {
        setAlerts(prev => [...prev, propertyId]);
        alert('Price drop and construction milestone alerts activated!');
      } else {
        setAlerts(prev => prev.filter(id => id !== propertyId));
        alert('Alerts disabled.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveWishlist = async (propertyId) => {
    try {
      await api.post('/wishlist', { propertyId });
      setWishlist(prev => prev.filter(p => p.id !== propertyId));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const totalInvested = confirmedBookings.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 space-y-8 text-white font-sans">
      
      {/* Profile Header Card */}
      <div className="glass-premium p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between border border-white/10 gap-4 bg-[#0e1017]/85 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border border-primary/20 shrink-0 font-serif-luxury">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">{user?.name}</h1>
            <p className="text-2xs text-white/50 uppercase font-bold tracking-wider">{user?.email} • Verified Buyer Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => { setLoading(true); fetchData(); }}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-3xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full shrink-0">
            Premium Portfolio
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Sidebar Tabs Selectors */}
        <div className="glass-premium p-4 rounded-3xl border border-white/10 bg-[#0e1017]/80 space-y-2 select-none font-bold uppercase tracking-wider text-3xs">
          {[
            { id: 'UNITS', label: `Booked Units (${bookings.length})`, icon: Building },
            { id: 'VISITS', label: `Scheduled Visits (${bookings.filter(b => b.visitorName).length})`, icon: Calendar },
            { id: 'WISHLIST', label: `Wishlist & Views (${wishlist.length})`, icon: Heart },
            { id: 'SEARCHES', label: `Searches & Alerts (${searches.length})`, icon: Search },
            { id: 'ENQUIRIES', label: `Enquiries (${enquiries.length})`, icon: MessageSquare }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                activeTab === t.id 
                  ? 'bg-primary text-black border-primary font-extrabold' 
                  : 'bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <t.icon className="h-4 w-4 shrink-0" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Main Display Column */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 1. BOOKED UNITS TAB */}
          {activeTab === 'UNITS' && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif-luxury font-bold flex items-center gap-2 text-white uppercase tracking-wider">
                <Building className="h-5 w-5 text-primary" />
                <span>My Booked Units</span>
              </h2>

              <div className="space-y-6">
                {bookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#12141d]/90 border border-white/10 p-6 rounded-3xl space-y-6"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">{booking.property?.projectName}</span>
                        <h3 className="font-bold text-base leading-snug text-white mt-0.5">{booking.property?.title}</h3>
                        <p className="text-2xs text-white/50 flex items-center gap-1 mt-1 font-semibold">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{booking.property?.address}, {booking.property?.city}</span>
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-3xs font-extrabold tracking-wider uppercase border ${
                        booking.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        booking.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    {/* Construction stage updates visual timeline */}
                    {booking.status === 'CONFIRMED' && (
                      <div className="space-y-3 pt-4 border-t border-white/10 font-bold uppercase tracking-wider">
                        <p className="text-3xs text-primary flex items-center gap-1.5 font-extrabold uppercase">
                          <Compass className="h-4 w-4 text-primary shrink-0" /> Construction Stage Monitor
                        </p>
                        <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-extrabold leading-normal select-none">
                          <div className="bg-green-500/20 text-green-400 border border-green-500/30 p-2.5 rounded-xl">FOUNDATION</div>
                          <div className="bg-green-500/20 text-green-400 border border-green-500/30 p-2.5 rounded-xl">BRICKWORK</div>
                          <div className="bg-primary/20 text-primary border border-primary/30 p-2.5 rounded-xl animate-pulse">WIRING</div>
                          <div className="bg-white/5 text-white/40 border border-white/10 p-2.5 rounded-xl">FINISHES</div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs font-semibold">
                      <div>
                        <span className="block text-3xs text-white/40 uppercase">Total Unit Value</span>
                        <span className="font-bold text-primary text-sm">₹{booking.property?.price.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="block text-3xs text-white/40 uppercase">Token Reservation Paid</span>
                        <span className="font-bold text-sm text-white">₹{booking.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="block text-3xs text-white/40 uppercase">Developer Consultant</span>
                        <span className="font-medium text-white">{booking.property?.builderName || 'Signature Builders'}</span>
                      </div>
                    </div>

                    {booking.payments && booking.payments.length > 0 && (
                      <div className="bg-white/2 border border-white/10 p-3 rounded-2xl flex items-center justify-between text-2xs font-semibold">
                        <span className="flex items-center gap-1.5 text-white/50">
                          <CreditCard className="h-4 w-4 text-primary" /> Receipt Reference ID:
                        </span>
                        <span className="font-mono text-primary font-bold">{booking.payments[0].reference}</span>
                      </div>
                    )}
                  </motion.div>
                ))}

                {bookings.length === 0 && (
                  <div className="bg-[#12141d]/90 border border-white/10 p-12 text-center rounded-3xl text-white/50 space-y-2 text-xs font-semibold">
                    <p className="font-bold text-sm">No active unit bookings registered.</p>
                    <p className="text-white/40">Check out the listings page to hold property units.</p>
                    <Link to="/properties" className="inline-flex items-center gap-1.5 text-primary hover:underline pt-3 font-bold uppercase tracking-wider text-3xs">
                      Explore Listings <ArrowUpRight className="h-4.5 w-4.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. VISITS SCHEDULE TAB */}
          {activeTab === 'VISITS' && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif-luxury font-bold flex items-center gap-2 text-white uppercase tracking-wider">
                <Calendar className="h-5 w-5 text-primary" />
                <span>My Scheduled Visits</span>
              </h2>

              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl flex justify-between items-center text-xs font-semibold">
                    <div className="space-y-1">
                      <span className="text-[10px] text-primary uppercase font-bold tracking-widest">{booking.property?.projectName}</span>
                      <h4 className="font-bold text-sm text-white">{booking.property?.title}</h4>
                      <div className="flex gap-4 text-3xs text-white/50 pt-1 font-normal">
                        <span>Date: <strong className="text-white font-bold">{booking.preferredDate}</strong></span>
                        <span>Time: <strong className="text-white font-bold">{booking.preferredTime}</strong></span>
                        <span>Visitors: <strong className="text-white font-bold">{booking.visitorsCount}</strong></span>
                      </div>
                    </div>
                    
                    <span className="bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-xl text-3xs font-extrabold uppercase tracking-wider shadow-md">
                      Confirmed Representative Assigned
                    </span>
                  </div>
                ))}
                
                {bookings.length === 0 && (
                  <p className="text-white/40 text-center py-12">No scheduled visits logged. Book a visit directly from the property details page.</p>
                )}
              </div>
            </div>
          )}

          {/* 3. WISHLIST & VIEWS TAB */}
          {activeTab === 'WISHLIST' && (
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl font-serif-luxury font-bold flex items-center gap-2 text-white uppercase tracking-wider">
                  <Heart className="h-5 w-5 text-primary" />
                  <span>My Wishlist ({wishlist.length})</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((p) => (
                    <div key={p.id} className="bg-[#12141d]/90 border border-white/10 p-4 rounded-3xl flex justify-between items-center text-xs font-semibold">
                      <div>
                        <h4 className="font-bold text-white line-clamp-1">{p.title}</h4>
                        <p className="text-3xs text-primary font-bold mt-0.5">₹{p.price.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/properties/${p.id}`} className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-colors" title="Full Page">
                          <Eye className="h-4.5 w-4.5" />
                        </Link>
                        <button onClick={() => handleRemoveWishlist(p.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                          <Heart className="h-4.5 w-4.5 fill-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {wishlist.length === 0 && (
                    <p className="text-white/40 col-span-2">Your wishlist is currently empty.</p>
                  )}
                </div>
              </div>

              {/* Recently Viewed */}
              <div className="space-y-4 border-t border-white/10 pt-6">
                <h2 className="text-base font-serif-luxury font-bold flex items-center gap-2 text-white uppercase tracking-wider">
                  <Eye className="h-4.5 w-4.5 text-primary" />
                  <span>Recently Viewed ({recentlyViewed.length})</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentlyViewed.map((p) => (
                    <Link to={`/properties/${p.id}`} key={p.id} className="bg-[#12141d]/90 border border-white/10 p-4 rounded-3xl flex items-center gap-3 hover:border-primary/30 transition-all">
                      <img src={p.images?.[0]?.url} className="h-12 w-16 object-cover rounded-xl" alt="" />
                      <div>
                        <h4 className="font-bold text-white line-clamp-1">{p.title}</h4>
                        <p className="text-3xs text-white/50">{p.bedrooms} BHK Suites • {p.city}</p>
                      </div>
                    </Link>
                  ))}
                  {recentlyViewed.length === 0 && (
                    <p className="text-white/40">No views logs found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. SEARCHES & ALERTS TAB */}
          {activeTab === 'SEARCHES' && (
            <div className="space-y-8">
              {/* Saved Searches */}
              <div className="space-y-4">
                <h2 className="text-xl font-serif-luxury font-bold flex items-center gap-2 text-white uppercase tracking-wider">
                  <Search className="h-5 w-5 text-primary" />
                  <span>Saved Searches</span>
                </h2>

                <div className="space-y-3 font-semibold text-xs text-white/70">
                  {searches.map((s) => (
                    <div key={s.id} className="bg-[#12141d]/90 border border-white/10 p-4 rounded-3xl flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white text-xs">{s.name}</h4>
                        <span className="text-3xs text-white/40 font-mono mt-0.5 block">{s.query}</span>
                      </div>
                      <Link to={`/properties${s.query}`} className="flex items-center gap-1 bg-primary text-black px-3.5 py-1.5 rounded-xl font-extrabold uppercase text-3xs tracking-wider">
                        <span>Load Search</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ))}
                  {searches.length === 0 && (
                    <p className="text-white/40">No saved filters searches recorded.</p>
                  )}
                </div>
              </div>

              {/* Price Alerts */}
              <div className="space-y-4 border-t border-white/10 pt-6">
                <h2 className="text-base font-serif-luxury font-bold flex items-center gap-2 text-white uppercase tracking-wider">
                  <Bell className="h-4.5 w-4.5 text-primary" />
                  <span>Active Price Alerts</span>
                </h2>

                <div className="space-y-3 text-xs font-semibold text-white/70">
                  {wishlist.slice(0, 3).map((p) => {
                    const hasAlert = alerts.includes(p.id);
                    return (
                      <div key={p.id} className="bg-[#12141d]/90 border border-white/10 p-4 rounded-3xl flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-white">{p.title}</h4>
                          <p className="text-3xs text-white/50">Current starting price: ₹{p.price.toLocaleString('en-IN')}</p>
                        </div>
                        <button
                          onClick={() => handleToggleAlert(p.id)}
                          className={`px-3 py-1.5 rounded-xl text-3xs font-extrabold uppercase tracking-wider border transition-all ${
                            hasAlert ? 'bg-primary text-black border-primary' : 'bg-white/5 text-white/70 border-white/10'
                          }`}
                        >
                          {hasAlert ? 'Alert Active' : 'Enable Alert'}
                        </button>
                      </div>
                    );
                  })}
                  {wishlist.length === 0 && (
                    <p className="text-white/40">Add properties to wishlist first to configure price drop alerts.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. ENQUIRIES TAB */}
          {activeTab === 'ENQUIRIES' && (
            <div className="space-y-6">
              <h2 className="text-xl font-serif-luxury font-bold flex items-center gap-2 text-white uppercase tracking-wider">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span>My Logged Enquiries</span>
              </h2>

              <div className="space-y-4">
                {enquiries.map((enq) => (
                  <div key={enq.id} className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl space-y-3 text-xs font-semibold">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded text-3xs font-extrabold uppercase tracking-widest">
                          {enq.type}
                        </span>
                        <h4 className="font-bold text-sm text-white mt-1.5">{enq.property?.title}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-3xs font-bold uppercase tracking-wider ${
                        enq.status === 'APPROVED' || enq.status === 'RESOLVED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {enq.status}
                      </span>
                    </div>

                    <div className="border-t border-white/5 pt-2 text-2xs text-white/50 leading-relaxed font-normal">
                      <span className="block text-3xs text-white/30 uppercase font-bold tracking-widest mb-0.5">Enquiry Detail Log</span>
                      {enq.message || 'Connecting to assigned broker helpline...'}
                    </div>

                    <div className="flex justify-between items-center text-3xs text-white/40 pt-1 font-normal border-t border-white/5">
                      <span>Ref ID: {enq.id}</span>
                      <span>Logged on: {new Date(enq.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}

                {enquiries.length === 0 && (
                  <p className="text-white/40 text-center py-12">No active inquiries recorded.</p>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
