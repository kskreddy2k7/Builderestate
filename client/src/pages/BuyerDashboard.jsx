import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, CreditCard, Building, MapPin, DollarSign, ArrowUpRight, Compass, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings/buyer');
        setBookings(response.data);
      } catch (err) {
        console.error('Error fetching bookings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  const confirmedBookingsCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const totalInvested = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 space-y-8">
      {/* Profile Header */}
      <div className="glass-premium p-6 rounded-2xl flex items-center justify-between border border-border">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold">{user?.name}</h1>
            <p className="text-2xs text-muted-foreground uppercase font-bold tracking-wider">{user?.email} • Buyer Portal</p>
          </div>
        </div>
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-3xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
          Active Investor
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            <span>My Booked Units</span>
          </h2>

          <div className="space-y-6">
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card text-card-foreground border border-border p-6 rounded-2xl shadow-sm space-y-6"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-base leading-snug">{booking.property.title}</h3>
                    <p className="text-2xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{booking.property.address}, {booking.property.city}</span>
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-3xs font-extrabold tracking-wider uppercase ${
                    booking.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    booking.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {booking.status}
                  </span>
                </div>

                {/* Construction stages tracking */}
                {booking.status === 'CONFIRMED' && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <p className="text-2xs font-extrabold text-primary uppercase tracking-widest flex items-center gap-1">
                      <Compass className="h-3.5 w-3.5" /> Construction Stage Monitor
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center text-3xs font-extrabold">
                      <div className="bg-green-500/10 text-green-400 border border-green-500/20 p-2 rounded">FOUNDATION</div>
                      <div className="bg-green-500/10 text-green-400 border border-green-500/20 p-2 rounded">BRICKWORK</div>
                      <div className="bg-primary/20 text-primary border border-primary/30 p-2 rounded animate-pulse">WIRING</div>
                      <div className="bg-secondary text-muted-foreground border border-border p-2 rounded">FINISHES</div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border text-xs font-semibold">
                  <div>
                    <span className="block text-3xs text-muted-foreground uppercase">Property Value</span>
                    <span className="font-bold text-primary text-sm">₹{booking.property.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="block text-3xs text-muted-foreground uppercase">Token Paid</span>
                    <span className="font-bold text-sm">₹{booking.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-3xs text-muted-foreground uppercase">Developer Name</span>
                    <span className="font-medium text-foreground">{booking.property.builder?.name || 'Signature Builders'}</span>
                  </div>
                </div>

                {booking.payments && booking.payments.length > 0 && (
                  <div className="bg-secondary/40 border border-border p-3.5 rounded-xl flex items-center justify-between text-2xs font-semibold">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <CreditCard className="h-4 w-4 text-primary" /> Receipt Reference ID:
                    </span>
                    <span className="font-mono text-white text-glow">{booking.payments[0].reference}</span>
                  </div>
                )}
              </motion.div>
            ))}

            {bookings.length === 0 && (
              <div className="bg-card border border-border p-12 text-center rounded-2xl text-muted-foreground space-y-2 text-xs font-semibold">
                <p className="font-bold text-sm">No active property bookings found.</p>
                <p className="text-muted-foreground">Browse properties in the marketplace to secure a residential unit.</p>
                <Link to="/properties" className="inline-flex items-center gap-1 text-primary hover:underline pt-2">
                  Browse Properties <ArrowUpRight className="h-4.5 w-4.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Financial widgets */}
        <div className="space-y-6">
          <div className="glass-premium p-6 rounded-2xl border border-border space-y-4 text-xs font-semibold">
            <h3 className="font-bold text-base flex items-center gap-1.5 border-b border-border pb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span>Investment Summary</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Bookings:</span>
                <span>{bookings.length} Units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmed Units:</span>
                <span>{confirmedBookingsCount} Units</span>
              </div>
              <div className="flex justify-between items-center border-t border-border pt-3">
                <span className="text-muted-foreground">Total Funds Transferred:</span>
                <span className="text-primary font-bold text-sm">₹{totalInvested.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border space-y-3 text-xs">
            <h3 className="font-bold text-sm flex items-center gap-1.5 border-b border-border pb-2 text-muted-foreground uppercase tracking-wider">
              <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Verification Audit
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              All transactions listed are verified and protected via blockchain mock signatures and cryptographically salted authorization tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
