import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, User, Mail, Phone, Calendar, ArrowLeft, 
  CreditCard, Compass, Info, DollarSign, Calculator, CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import OptimizedImage from '../components/OptimizedImage';
import { fetchPublicJson, normalizeProperty } from '../services/publicData';

export default function PropertyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tabs State: INFO, TIMELINE, EMI, MAP
  const [activeTab, setActiveTab] = useState('INFO');

  // Booking / Payment States
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // EMI Calculator States
  const [tenure, setTenure] = useState(20); // 20 years default
  const [interestRate, setInterestRate] = useState(8.5); // 8.5% default
  const [downPaymentPercent, setDownPaymentPercent] = useState(20); // 20% default

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const jsonData = await fetchPublicJson('data/properties.json');
        const item = (jsonData || []).map(normalizeProperty).find((entry) => String(entry.id) === String(id));
        if (!item) {
          setError('Property details not found.');
        } else {
          setProperty(item);
        }
      } catch (err) {
        setError('Property details not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleInitiateBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'BUYER') {
      alert('Only buyers can book properties.');
      return;
    }

    setBookingLoading(true);
    try {
      const bookingAmount = property.price * 0.1;
      const response = await api.post('/bookings', {
        propertyId: property.id,
        amount: bookingAmount,
      });
      setActiveBooking(response.data);
      setPaymentStep(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvv) {
      alert('Card fields are required.');
      return;
    }

    setBookingLoading(true);
    try {
      await api.post('/bookings/pay', {
        bookingId: activeBooking.id,
        amount: activeBooking.amount,
        reference: `TXN-INDIA-${Math.floor(1000000 + Math.random() * 9000000)}`,
      });

      setSuccessMsg('Booking confirmed! Payment successful.');
      setTimeout(() => {
        navigate('/buyer');
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  // EMI Calculation Formula
  const calculateEMI = () => {
    if (!property) return 0;
    const principal = property.price * (1 - downPaymentPercent / 100);
    const monthlyRate = (interestRate / 12) / 100;
    const totalMonths = tenure * 12;
    if (monthlyRate === 0) return (principal / totalMonths).toFixed(0);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return emi.toFixed(0);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-destructive font-bold text-lg">{error || 'Property not found.'}</p>
        <Link to="/properties" className="text-primary hover:underline flex items-center justify-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>
      </div>
    );
  }

  // Determine local infrastructure names based on the property city
  const getNearbyLandmarks = () => {
    const isHyd = property.city.toLowerCase() === 'hyderabad';
    const isBlr = property.city.toLowerCase() === 'bengaluru';
    
    return {
      metro: isHyd ? 'HITEC City Metro Station - 800m' : isBlr ? 'Whitefield Namma Metro - 650m' : 'Local Metro Station - 1.2 km',
      school: isHyd ? 'Oakridge & Chirec International School - 2.5 km' : isBlr ? 'DPS Whitefield - 1.8 km' : 'Aditya Birla World Academy - 3 km',
      hospital: isHyd ? 'Apollo Health City Gachibowli - 3.2 km' : isBlr ? 'Manipal Hospital Whitefield - 2 km' : 'Fortis Hospital - 2.5 km',
    };
  };

  const landmarks = getNearbyLandmarks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 space-y-8">
      {/* Back link */}
      <Link to="/properties" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-semibold">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gallery & Interactive Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl overflow-hidden border border-border bg-muted relative">
            <OptimizedImage
              src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
              alt={property.title}
              className="w-full h-[400px] object-cover"
              eager
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
            <span className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold uppercase">
              {property.type}
            </span>
          </div>

          {/* Details Page Tabs Navigation */}
          <div className="flex space-x-4 border-b border-border pb-px text-xs font-bold uppercase tracking-wider">
            {['INFO', 'TIMELINE', 'EMI', 'MAP'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 border-b-2 transition-all ${
                  activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="min-h-[200px]">
            {/* Info Tab */}
            {activeTab === 'INFO' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-extrabold">{property.title}</h1>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{property.address}, {property.city}</span>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 border-y border-border py-4 text-center bg-secondary rounded-xl text-sm font-semibold">
                  <div>
                    <span className="block text-2xs text-muted-foreground uppercase mb-1">Layout</span>
                    <span>{property.bedrooms > 0 ? `${property.bedrooms} BHK` : 'Commercial'}</span>
                  </div>
                  <div>
                    <span className="block text-2xs text-muted-foreground uppercase mb-1">Bathrooms</span>
                    <span>{property.bathrooms > 0 ? `${property.bathrooms} Baths` : 'Utility'}</span>
                  </div>
                  <div>
                    <span className="block text-2xs text-muted-foreground uppercase mb-1">Super Area</span>
                    <span>{property.area} sqft</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm leading-relaxed">
                  <h3 className="font-extrabold text-base">Property Description</h3>
                  <p className="text-muted-foreground">{property.description}</p>
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'TIMELINE' && (
              <div className="space-y-6">
                <h3 className="font-extrabold text-base flex items-center gap-1.5">
                  <Compass className="h-4.5 w-4.5 text-primary" /> Construction Milestones Status
                </h3>
                
                <div className="relative border-l border-border pl-6 ml-4 space-y-6 text-xs text-left">
                  <div className="relative">
                    <span className="absolute -left-10 top-0.5 h-8 w-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold">
                      ✓
                    </span>
                    <h4 className="font-bold text-sm text-foreground">Slab & Foundation Pour</h4>
                    <p className="text-muted-foreground">Excavation complete, base leveling reinforced concrete slab successfully poured and verified.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-10 top-0.5 h-8 w-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold">
                      ✓
                    </span>
                    <h4 className="font-bold text-sm text-foreground">Framing & External Brickwork</h4>
                    <p className="text-muted-foreground">Internal layout brick divisions completed up to the 12th floor level.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-10 top-0.5 h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold animate-pulse">
                      •
                    </span>
                    <h4 className="font-bold text-sm text-foreground">HVAC Ventilation & Electrical Placements</h4>
                    <p className="text-muted-foreground">Active wiring, ventilation pipe layout tracking in progress.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-10 top-0.5 h-8 w-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center font-bold">
                      -
                    </span>
                    <h4 className="font-bold text-sm text-foreground">Drywall, Finishes, & Possession Handover</h4>
                    <p className="text-muted-foreground">Interior modeling, kitchen tile alignments, and final handover scheduled.</p>
                  </div>
                </div>
              </div>
            )}

            {/* EMI Tab */}
            {activeTab === 'EMI' && (
              <div className="space-y-6 glass-premium p-6 rounded-2xl border border-border">
                <h3 className="font-bold text-base flex items-center gap-1.5">
                  <Calculator className="h-4.5 w-4.5 text-primary" /> Estimated Monthly EMI Calculator
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs font-semibold">
                  <div className="space-y-4">
                    {/* Down Payment slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Down Payment ({downPaymentPercent}%):</span>
                        <span className="text-primary font-bold">₹{(property.price * downPaymentPercent / 100).toLocaleString('en-IN')}</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        step="5"
                        value={downPaymentPercent}
                        onChange={(e) => setDownPaymentPercent(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Interest Rate (p.a.):</span>
                        <span className="text-primary font-bold">{interestRate}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="15"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Tenure */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tenure (Years):</span>
                        <span className="text-primary font-bold">{tenure} Years</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={tenure}
                        onChange={(e) => setTenure(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-center p-6 bg-secondary/40 rounded-xl border border-border text-center space-y-2">
                    <span className="text-muted-foreground uppercase text-2xs tracking-widest font-extrabold">Calculated Monthly EMI</span>
                    <span className="text-3xl font-extrabold text-primary text-glow">₹{parseInt(calculateEMI()).toLocaleString('en-IN')}</span>
                    <span className="text-2xs text-muted-foreground">Principal Loan: ₹{(property.price * (1 - downPaymentPercent / 100)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Map Tab */}
            {activeTab === 'MAP' && (
              <div className="space-y-6">
                <h3 className="font-extrabold text-base">Nearby Infrastructure Map</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                  <div className="bg-secondary p-4 rounded-xl border border-border space-y-2">
                    <p className="text-primary uppercase tracking-wider text-2xs font-extrabold">Transit Rail</p>
                    <p className="font-bold text-sm">{landmarks.metro}</p>
                    <p className="text-muted-foreground">Direct metro line access</p>
                  </div>
                  <div className="bg-secondary p-4 rounded-xl border border-border space-y-2">
                    <p className="text-primary uppercase tracking-wider text-2xs font-extrabold">Health Care</p>
                    <p className="font-bold text-sm">{landmarks.hospital}</p>
                    <p className="text-muted-foreground">Super-specialty medical center</p>
                  </div>
                  <div className="bg-secondary p-4 rounded-xl border border-border space-y-2">
                    <p className="text-primary uppercase tracking-wider text-2xs font-extrabold">Education</p>
                    <p className="font-bold text-sm">{landmarks.school}</p>
                    <p className="text-muted-foreground">Top international institutions</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel / Checkout */}
        <div className="space-y-6">
          <div className="glass-premium p-6 rounded-2xl shadow-sm border border-border space-y-6 text-xs font-semibold">
            <div className="space-y-1">
              <span className="text-muted-foreground uppercase text-2xs tracking-widest font-extrabold">Premium Selling Price</span>
              <p className="text-3xl font-extrabold text-primary text-glow">₹{property.price.toLocaleString('en-IN')}</p>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking Deposit (10%):</span>
                <span>₹{(property.price * 0.1).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Unit Status:</span>
                <span className={`px-2 py-0.5 rounded text-3xs uppercase tracking-wider ${property.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {property.status}
                </span>
              </div>
            </div>

            {property.status === 'AVAILABLE' && (
              <>
                {!paymentStep ? (
                  <button
                    onClick={handleInitiateBooking}
                    disabled={bookingLoading}
                    className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-55 glow-btn text-sm"
                  >
                    <Calendar className="h-4.5 w-4.5" />
                    <span>{user ? 'Initiate Booking Checkout' : 'Login to Proceed'}</span>
                  </button>
                ) : (
                  <div className="border-t border-border pt-4 space-y-4 text-left">
                    <h3 className="font-extrabold text-primary flex items-center gap-1.5">
                      <CreditCard className="h-4.5 w-4.5 text-primary" /> MOCK PAYMENT DETAILS
                    </h3>
                    
                    {successMsg ? (
                      <p className="text-green-500 font-bold text-center text-xs">{successMsg}</p>
                    ) : (
                      <form onSubmit={handleProcessPayment} className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-muted-foreground uppercase text-2xs font-extrabold">Card Number</label>
                          <input
                            type="text"
                            placeholder="1234 5678 9876 5432"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-muted-foreground uppercase text-2xs font-extrabold">Expiry</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              value={expiry}
                              onChange={(e) => setExpiry(e.target.value)}
                              className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-muted-foreground uppercase text-2xs font-extrabold">CVV</label>
                            <input
                              type="password"
                              placeholder="123"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value)}
                              className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:outline-none"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={bookingLoading}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all shadow-md mt-2"
                        >
                          Confirm & Pay ₹{(property.price * 0.1).toLocaleString('en-IN')}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Builder profile details */}
          <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border space-y-4">
            <h3 className="font-extrabold border-b border-border pb-2 text-2xs uppercase text-muted-foreground tracking-widest">Builder Registry</h3>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {property.builder.name[0]}
              </div>
              <div>
                <p className="font-bold text-sm">{property.builder.name}</p>
                <p className="text-3xs text-muted-foreground uppercase tracking-widest">{property.builder.role}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="line-clamp-1">{property.builder.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{property.builder.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
