import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, User, Mail, Phone, Calendar, ArrowLeft, 
  CreditCard, Compass, Info, DollarSign, Calculator, CheckCircle2,
  Video, Star, FileDown, MessageSquare, ChevronDown, Award, Map, 
  ShieldCheck, HelpCircle, Send, Heart, Share2, Image
} from 'lucide-react';
import api from '../services/api';
import AuthGateModal from '../components/AuthGateModal';
import BookVisitModal from '../components/BookVisitModal';

export default function PropertyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Gallery / Media States
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [activeMediaTab, setActiveMediaTab] = useState('PHOTOS'); // PHOTOS, 360, VIDEO, PLAN

  // Property Details Navigation Tabs
  const [activeTab, setActiveTab] = useState('INFO'); // INFO, TIMELINE, EMI, CONNECTIVITY, PAYMENT, FAQS, REVIEWS

  // FAQ Expand state
  const [activeFaq, setActiveFaq] = useState(null);

  // Review Form States
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewsList, setReviewsList] = useState([]);

  // Wishlist Status
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Booking / Payment States
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Visit Scheduler Modal
  const [showBookVisit, setShowBookVisit] = useState(false);

  // Auth Gate Modal States
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authGateTitle, setAuthGateTitle] = useState('Unlock Premium Features');
  const [pendingAction, setPendingAction] = useState(null);

  // EMI Calculator States
  const [tenure, setTenure] = useState(20); // 20 years default
  const [interestRate, setInterestRate] = useState(8.5); // 8.5% default
  const [downPaymentPercent, setDownPaymentPercent] = useState(20); // 20% default

  // Callback form fields (sticky card)
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/${id}`);
        setProperty(response.data);
        setReviewsList(response.data.reviews || []);
        
        // Fetch wishlist to see if this property is saved
        if (user) {
          const wishRes = await api.get('/wishlist');
          setIsWishlisted(wishRes.data.some(p => p.id === response.data.id));
        }
      } catch (err) {
        console.error(err);
        setError('Property details not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, user]);

  const requireAuth = (action, title = "Unlock Premium Features") => {
    if (user) {
      action();
    } else {
      setAuthGateTitle(title);
      setPendingAction(() => action);
      setShowAuthGate(true);
    }
  };

  const handleToggleWishlist = async () => {
    requireAuth(async () => {
      try {
        const response = await api.post('/wishlist', { propertyId: property.id });
        setIsWishlisted(response.data.saved);
        alert(response.data.saved ? 'Saved to wishlist!' : 'Removed from wishlist.');
      } catch (err) {
        console.error(err);
      }
    }, "Add property to wishlist");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Property link copied to clipboard!');
  };

  // Instant booking payment flow
  const handleInitiateBooking = async () => {
    requireAuth(async () => {
      if (user.role !== 'BUYER') {
        alert('Only buyer accounts can reserve property units.');
        return;
      }

      setBookingLoading(true);
      try {
        const bookingAmount = property.price * 0.1;
        const response = await api.post('/bookings', {
          propertyId: property.id,
          amount: bookingAmount,
          notes: 'Initiating unit holding booking reserve.'
        });
        setActiveBooking(response.data);
        setPaymentStep(true);
      } catch (err) {
        alert(err.response?.data?.message || 'Error creating booking hold.');
      } finally {
        setBookingLoading(false);
      }
    }, "Reserve property unit with direct hold amount");
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvv) {
      alert('Card parameters are required.');
      return;
    }

    setBookingLoading(true);
    try {
      await api.post('/bookings/pay', {
        bookingId: activeBooking.id,
        amount: activeBooking.amount,
      });

      setSuccessMsg('Booking Confirmed! Direct hold successful.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment hold failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment) return;

    requireAuth(async () => {
      try {
        const res = await api.post(`/properties/${property.id}/reviews`, {
          name: reviewName || user.name,
          rating: parseInt(reviewRating),
          comment: reviewComment
        });
        setReviewsList(res.data.reviews);
        setReviewComment('');
        setReviewName('');
        alert('Review submitted successfully!');
      } catch (e) {
        alert('Failed to register review.');
      }
    }, "Post a customer review");
  };

  const handleRequestCallback = async (e) => {
    e.preventDefault();
    if (!callbackPhone) return;

    requireAuth(async () => {
      try {
        await api.post('/enquiries', {
          propertyId: property.id,
          type: 'CALLBACK',
          name: callbackName || user.name,
          phone: callbackPhone,
          message: 'Requested direct call callback from Sales Manager.'
        });
        alert('Callback request logged! A sales representative will call you shortly.');
        setCallbackPhone('');
        setCallbackName('');
      } catch (e) {
        alert('Failed to log callback.');
      }
    }, "Request developer callback");
  };

  const handleChat = () => {
    requireAuth(async () => {
      try {
        await api.post('/enquiries', {
          propertyId: property.id,
          type: 'CHAT',
          message: 'Initiated live chat consultation.'
        });
        alert('Live consultation window connected! A Sales representative is joining.');
      } catch (e) {
        console.error(e);
      }
    }, "Initiate live chat consultation");
  };

  const handleWhatsApp = () => {
    requireAuth(async () => {
      try {
        await api.post('/enquiries', {
          propertyId: property.id,
          type: 'WHATSAPP',
          message: 'Opened WhatsApp helpdesk link.'
        });
        const text = encodeURIComponent(`Hi, I am interested in exploring ${property.title} (RERA ID: ${property.reraNumber}). Please share pricing structures.`);
        window.open(`https://wa.me/919999988888?text=${text}`, '_blank');
      } catch (e) {
        console.error(e);
      }
    }, "Contact developer on WhatsApp");
  };

  const handleDownloadBrochure = () => {
    requireAuth(async () => {
      try {
        await api.post('/enquiries', {
          propertyId: property.id,
          type: 'BROCHURE',
          message: 'Downloaded brochure guide.'
        });
        alert('Layout blueprints and pricing brochures downloaded successfully.');
      } catch (e) {
        console.error(e);
      }
    }, "Download property brochure");
  };

  // EMI Calculator Formula
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4 text-white">
        <p className="text-destructive font-bold text-lg">{error || 'Property not found.'}</p>
        <Link to="/properties" className="text-primary hover:underline flex items-center justify-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 
    ? property.images 
    : [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80' }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 space-y-8 text-white font-sans relative">
      
      {/* Top Breadcrumb and Actions */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <Link to="/properties" className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={handleToggleWishlist} 
            className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${
              isWishlisted 
                ? 'bg-red-500/20 border-red-500 text-red-500' 
                : 'bg-white/5 border-white/15 text-white hover:bg-white/10'
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
            <span>{isWishlisted ? 'Saved' : 'Save'}</span>
          </button>
          <button 
            onClick={handleShare}
            className="p-2.5 rounded-xl border border-white/15 text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 bg-white/5"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Column (Gallery & Details Tabs) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Immersive Gallery Media Center */}
          <div className="rounded-3xl overflow-hidden border border-white/15 bg-black/45 relative shadow-2xl">
            {activeMediaTab === 'PHOTOS' && (
              <div className="relative h-[420px] bg-[#0c0d14]">
                <img
                  src={images[activeImgIdx]?.url}
                  alt={property.title}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                
                {/* Carousel indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/60 px-3 py-1.5 rounded-full border border-white/10">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImgIdx(idx)}
                      className={`h-2 w-2 rounded-full transition-all ${
                        activeImgIdx === idx ? 'bg-primary w-4' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeMediaTab === '360' && (
              <div className="h-[420px] bg-black relative flex items-center justify-center">
                <img 
                  src={images[0]?.url} 
                  className="w-full h-full object-cover opacity-35" 
                  alt="" 
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-3 p-6">
                  <Compass className="h-14 w-14 text-primary animate-spin" style={{ animationDuration: '8s' }} />
                  <h4 className="font-serif-luxury text-lg font-bold text-white uppercase tracking-wider">Immersive VR Walkthrough</h4>
                  <p className="text-white/60 text-xs max-w-sm font-normal">Panoramic 3D render loaded. Click and drag pointer on canvas to rotate interior rooms view.</p>
                </div>
              </div>
            )}

            {activeMediaTab === 'VIDEO' && (
              <div className="h-[420px] bg-black relative flex items-center justify-center">
                <img 
                  src={images[1 % images.length]?.url} 
                  className="w-full h-full object-cover opacity-45" 
                  alt="" 
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-3 p-6">
                  <div className="h-16 w-16 rounded-full bg-primary text-black flex items-center justify-center shadow-lg hover:scale-105 transition-all">
                    <Video className="h-6 w-6 ml-0.5 fill-black" />
                  </div>
                  <h4 className="font-serif-luxury text-lg font-bold text-white uppercase tracking-wider">Drone Exterior Flyby Video</h4>
                  <p className="text-white/60 text-xs max-w-sm font-normal">High definition recorded tour of site layout and connectivity elevations.</p>
                </div>
              </div>
            )}

            {activeMediaTab === 'PLAN' && (
              <div className="h-[420px] bg-[#141620] relative flex items-center justify-center p-6">
                <img 
                  src={property.floorPlanUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'} 
                  className="max-h-full max-w-full object-contain filter invert opacity-80" 
                  alt="Floor plan layout" 
                />
                <span className="absolute bottom-4 right-4 bg-black/60 border border-white/10 px-2 py-1 rounded text-3xs font-mono uppercase tracking-widest text-primary font-bold">
                  Tower Block Floor Plan
                </span>
              </div>
            )}

            {/* Media Tab Selectors */}
            <div className="absolute top-4 left-4 flex gap-2 select-none z-10 font-bold uppercase tracking-wider text-3xs">
              {[
                { id: 'PHOTOS', label: 'Photos', icon: Image },
                { id: '360', label: '360 Walkthrough', icon: Compass },
                { id: 'VIDEO', label: 'Video Tour', icon: Video },
                { id: 'PLAN', label: 'Floor Plan', icon: Map }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveMediaTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all flex items-center gap-1.5 ${
                    activeMediaTab === t.id 
                      ? 'bg-primary text-black border-primary' 
                      : 'bg-black/60 border-white/10 text-white/80 hover:text-white'
                  }`}
                >
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Construction status badge overlays */}
            <span className="absolute bottom-4 left-4 bg-green-500/90 text-white border border-green-400/20 px-3 py-1 rounded-full text-3xs font-extrabold uppercase tracking-widest">
              {property.constructionStatus || 'Under Construction'}
            </span>
          </div>

          {/* Details Content Navigation Tabbar */}
          <div className="flex space-x-6 border-b border-white/15 pb-px text-xs font-bold uppercase tracking-widest select-none overflow-x-auto">
            {[
              { id: 'INFO', label: 'Overview' },
              { id: 'TIMELINE', label: 'Milestones' },
              { id: 'EMI', label: 'EMI Plan' },
              { id: 'CONNECTIVITY', label: 'Connectivity' },
              { id: 'PAYMENT', label: 'Payment Schedule' },
              { id: 'FAQS', label: 'FAQs' },
              { id: 'REVIEWS', label: `Reviews (${reviewsList.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 border-b-2 transition-all shrink-0 ${
                  activeTab === tab.id 
                    ? 'border-primary text-primary font-extrabold' 
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Render Switchboard */}
          <div className="min-h-[250px] font-semibold text-xs text-white/80">
            
            {/* 1. OVERVIEW INFO TAB */}
            {activeTab === 'INFO' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-primary text-black text-3xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                      {property.type}
                    </span>
                    {property.featured && (
                      <span className="bg-white/10 text-white border border-white/10 text-3xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                        Premium Landmark
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-serif-luxury font-bold tracking-tight text-white">{property.title}</h1>
                  <p className="text-xs text-white/60 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{property.address}, {property.city}</span>
                  </p>
                </div>

                {/* Spec Icons Grid */}
                <div className="grid grid-cols-4 gap-4 border-y border-white/10 py-5 text-center bg-white/2 rounded-2xl">
                  <div>
                    <span className="block text-3xs text-white/40 uppercase font-bold tracking-widest mb-1.5">Structure</span>
                    <span className="text-white font-bold">{property.bedrooms > 0 ? `${property.bedrooms} BHK Suites` : 'Commercial'}</span>
                  </div>
                  <div>
                    <span className="block text-3xs text-white/40 uppercase font-bold tracking-widest mb-1.5">Bathrooms</span>
                    <span className="text-white font-bold">{property.bathrooms > 0 ? `${property.bathrooms} Baths` : 'Utility'}</span>
                  </div>
                  <div>
                    <span className="block text-3xs text-white/40 uppercase font-bold tracking-widest mb-1.5">Super Area</span>
                    <span className="text-white font-bold">{property.area} sqft</span>
                  </div>
                  <div>
                    <span className="block text-3xs text-white/40 uppercase font-bold tracking-widest mb-1.5">RERA Registered</span>
                    <span className="text-white font-bold font-mono text-2xs flex items-center justify-center gap-0.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Approved
                    </span>
                  </div>
                </div>

                <div className="space-y-3 leading-relaxed">
                  <h3 className="font-serif-luxury text-base font-bold text-white tracking-wide uppercase">Project Narrative</h3>
                  <p className="text-white/60 font-normal leading-relaxed">{property.description}</p>
                </div>

                {/* Amenities List */}
                <div className="space-y-3 border-t border-white/10 pt-5">
                  <h3 className="font-serif-luxury text-base font-bold text-white tracking-wide uppercase">Premium Amenities Included</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-normal">
                    {(property.amenities || ['Infinity Pool', 'Automation']).map((a, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 bg-white/3 border border-white/10 p-3 rounded-xl">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. TIMELINE TAB */}
            {activeTab === 'TIMELINE' && (
              <div className="space-y-6">
                <h3 className="font-serif-luxury text-base font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <Compass className="h-4.5 w-4.5 text-primary" /> Construction Milestones Registry
                </h3>
                
                <div className="relative border-l border-white/10 pl-6 ml-4 space-y-6 text-xs text-left">
                  <div className="relative">
                    <span className="absolute -left-10 top-0.5 h-8 w-8 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center font-bold">
                      ✓
                    </span>
                    <h4 className="font-bold text-sm text-white">Slab & Foundation Pouring Completed</h4>
                    <p className="text-white/50 mt-0.5 font-normal">Excavation complete, base leveling reinforced concrete slab successfully verified.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-10 top-0.5 h-8 w-8 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center font-bold">
                      ✓
                    </span>
                    <h4 className="font-bold text-sm text-white">Framing & External Brickwork Completed</h4>
                    <p className="text-white/50 mt-0.5 font-normal">Internal layout brick divisions completed up to the 12th floor level.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-10 top-0.5 h-8 w-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold animate-pulse">
                      •
                    </span>
                    <h4 className="font-bold text-sm text-white">HVAC Ventilation & Wiring Active</h4>
                    <p className="text-white/50 mt-0.5 font-normal">Active wiring grids, plumbing pipelines layout tracking in progress.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-10 top-0.5 h-8 w-8 rounded-full bg-white/5 text-white/40 border border-white/10 flex items-center justify-center font-bold">
                      -
                    </span>
                    <h4 className="font-bold text-sm text-white/50">Drywall Finishes & Handover Scheduled</h4>
                    <p className="text-white/40 mt-0.5 font-normal">Interior plastering, marble tiling, and final unit handover key transfer.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. EMI CALCULATOR TAB */}
            {activeTab === 'EMI' && (
              <div className="space-y-6 bg-white/2 p-6 rounded-3xl border border-white/10 shadow-inner">
                <h3 className="font-serif-luxury text-base font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <Calculator className="h-4.5 w-4.5 text-primary" /> Estimated Monthly EMI Calculator
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs font-semibold">
                  <div className="space-y-4">
                    {/* Down Payment slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-white/60">Down Payment ({downPaymentPercent}%):</span>
                        <span className="text-primary font-bold">₹{(property.price * downPaymentPercent / 100).toLocaleString('en-IN')}</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        step="5"
                        value={downPaymentPercent}
                        onChange={(e) => setDownPaymentPercent(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-white/60">Interest Rate (p.a.):</span>
                        <span className="text-primary font-bold">{interestRate}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="15"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Tenure */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-white/60">Loan Tenure (Years):</span>
                        <span className="text-primary font-bold">{tenure} Years</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="1"
                        value={tenure}
                        onChange={(e) => setTenure(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  <div className="bg-[#161924] p-5 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center space-y-2">
                    <span className="text-white/40 uppercase tracking-widest text-3xs font-extrabold">Estimated EMI / Month</span>
                    <span className="text-3xl font-serif-luxury font-extrabold text-primary">
                      ₹{parseInt(calculateEMI()).toLocaleString('en-IN')}
                    </span>
                    <p className="text-white/40 text-[10px] font-normal leading-relaxed">
                      Based on a loan principal of ₹{(property.price * (1 - downPaymentPercent / 100)).toLocaleString('en-IN')} at {interestRate}% rate over {tenure} years.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. CONNECTIVITY TAB */}
            {activeTab === 'CONNECTIVITY' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <h3 className="font-serif-luxury text-base font-bold text-white tracking-wide uppercase">Nearby Infrastructure Connectivity</h3>
                  
                  <div className="space-y-3 font-normal">
                    <div className="flex items-center gap-3 bg-white/3 border border-white/10 p-3 rounded-xl">
                      <Compass className="h-4.5 w-4.5 text-primary shrink-0" />
                      <div>
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest block">Metro Station</span>
                        <span className="text-white text-xs font-semibold">{property.nearby?.metro || 'Central Metro - 500m'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/3 border border-white/10 p-3 rounded-xl">
                      <Award className="h-4.5 w-4.5 text-primary shrink-0" />
                      <div>
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest block">Schools & Academies</span>
                        <span className="text-white text-xs font-semibold">{property.nearby?.school || 'DPS International - 1.2km'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/3 border border-white/10 p-3 rounded-xl">
                      <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0" />
                      <div>
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest block">Hospitals</span>
                        <span className="text-white text-xs font-semibold">{property.nearby?.hospital || 'Apollo Medical Care - 1.5km'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/3 border border-white/10 p-3 rounded-xl">
                      <MapPin className="h-4.5 w-4.5 text-primary shrink-0" />
                      <div>
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest block">Airport</span>
                        <span className="text-white text-xs font-semibold">{property.nearby?.airport || 'International Terminal - 28km'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dark Theme Google Maps Mock */}
                <div className="relative h-60 w-full bg-[#0c0d14] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80" 
                    className="w-full h-full object-cover opacity-20 filter invert" 
                    alt="Map Grid"
                  />
                  {/* Glowing core location pinpoint */}
                  <div className="absolute flex flex-col items-center gap-1.5 z-10 text-center">
                    <div className="h-10 w-10 bg-primary/20 border border-primary text-primary rounded-full flex items-center justify-center animate-pulse">
                      <MapPin className="h-5 w-5 fill-primary" />
                    </div>
                    <span className="bg-black/80 px-2 py-0.5 rounded text-[10px] text-primary border border-primary/20 tracking-wider font-extrabold uppercase shadow-xl">
                      {property.projectName} Location
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. PAYMENT PLANS TAB */}
            {activeTab === 'PAYMENT' && (
              <div className="space-y-4">
                <h3 className="font-serif-luxury text-base font-bold text-white tracking-wide uppercase">Construction-Linked Payment Schedule</h3>
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/2">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 font-bold uppercase tracking-wider text-[10px] text-primary">
                        <th className="p-4">Milestone Progress Step</th>
                        <th className="p-4 border-l border-white/10 text-right">Payment percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(property.paymentPlan || []).map((step, idx) => (
                        <tr key={idx} className="hover:bg-white/2">
                          <td className="p-4">{step.step}</td>
                          <td className="p-4 border-l border-white/10 text-right text-primary font-bold">{step.percent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. FAQS ACCORDION TAB */}
            {activeTab === 'FAQS' && (
              <div className="space-y-4">
                <h3 className="font-serif-luxury text-base font-bold text-white tracking-wide uppercase">Frequently Asked Questions</h3>
                <div className="space-y-3">
                  {(property.faqs || []).map((faq, idx) => (
                    <div key={idx} className="border border-white/10 rounded-2xl bg-white/2 overflow-hidden">
                      <button
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        className="w-full p-4 flex justify-between items-center text-left font-bold text-white hover:bg-white/3 transition-all"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`h-4 w-4 text-primary transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {activeFaq === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 pb-4 border-t border-white/5 pt-2 text-white/60 font-normal leading-relaxed"
                          >
                            {faq.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. CUSTOMER REVIEWS TAB */}
            {activeTab === 'REVIEWS' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-serif-luxury text-base font-bold text-white tracking-wide uppercase">Customer Feedbacks</h3>
                  <div className="space-y-4">
                    {reviewsList.map((r, idx) => (
                      <div key={idx} className="bg-white/3 border border-white/10 p-4 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-xs">{r.name}</span>
                          <div className="flex gap-0.5 text-yellow-400">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-white/60 text-2xs leading-relaxed font-normal">{r.comment}</p>
                      </div>
                    ))}
                    {reviewsList.length === 0 && (
                      <p className="text-white/40 text-center py-6">No customer reviews yet. Be the first to leave a feedback!</p>
                    )}
                  </div>
                </div>

                {/* Add Review Form */}
                <form onSubmit={handleReviewSubmit} className="border-t border-white/10 pt-5 space-y-4">
                  <h3 className="font-serif-luxury text-sm font-bold text-white tracking-wide uppercase">Add Your Feedback</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-primary font-bold">Reviewer Name</label>
                      <input
                        type="text"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="e.g. Vikram Reddy"
                        className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-primary font-bold">Rating Star Selection</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(parseInt(e.target.value))}
                        className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs select-custom font-semibold"
                      >
                        <option value="5">★★★★★ Outstanding (5/5)</option>
                        <option value="4">★★★★ Very Good (4/5)</option>
                        <option value="3">★★★ Average (3/5)</option>
                        <option value="2">★★ Poor (2/5)</option>
                        <option value="1">★ Critical (1/5)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-primary font-bold">Your Comment</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts on build quality, spaces, amenities, or surrounding connectivity..."
                      rows="3"
                      required
                      className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-gold-luxury px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Submit Review</span>
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Builder Profile card */}
          <div className="bg-[#12141d]/90 border border-white/10 p-6 rounded-3xl space-y-4">
            <h3 className="font-serif-luxury text-base font-bold text-white tracking-wide uppercase">Builder Credentials</h3>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary text-xl font-extrabold font-serif-luxury shrink-0">
                {property.builderName[0]}
              </div>
              <div className="space-y-1 font-semibold text-xs text-white/70">
                <h4 className="font-bold text-white text-sm">{property.builderName}</h4>
                <p>25+ Years Experience • 45 Completed Landmarks</p>
                <p>Corporate Office: HITEC City Cyber Towers, Hyderabad</p>
              </div>
            </div>
            <p className="text-2xs text-white/50 leading-relaxed font-normal">
              {property.builderName} is a premiere real estate conglomerate recognized for creating state-of-the-art residential enclaves, grade-A corporate offices, and ultra-luxury sky villas across metropolitan hubs.
            </p>
          </div>
        </div>

        {/* Sidebar Sticky Contact / Booking Console */}
        <div className="space-y-6 lg:sticky lg:top-32 z-20">
          
          {/* Unit Reservation / Direct Hold */}
          <div className="bg-[#0e1017] border border-primary/30 rounded-3xl p-6 shadow-[0_20px_50px_rgba(212,175,55,0.12)] space-y-4 relative overflow-hidden font-semibold text-xs">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="border-b border-white/10 pb-3 flex justify-between items-center">
              <div>
                <span className="block text-4xs uppercase tracking-widest text-white/50">Unit Starting From</span>
                <span className="text-xl font-serif-luxury font-extrabold text-primary">
                  ₹{property.price.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wider">
                Instant Hold
              </span>
            </div>

            {paymentStep ? (
              <form onSubmit={handleProcessPayment} className="space-y-3.5">
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl text-primary text-2xs leading-relaxed font-normal">
                  Paying token hold reservation fee: <strong>₹{(property.price * 0.1).toLocaleString('en-IN')}</strong> (10% reservation amount)
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Credit/Debit Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4000 1234 5678 9010"
                    className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs font-mono font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Expiry Date</label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs font-mono font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold">CVV Code</label>
                    <input
                      type="password"
                      required
                      maxLength="3"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs font-mono font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full btn-gold-luxury py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>{bookingLoading ? 'Processing transaction...' : 'Complete hold hold hold'}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <p className="text-white/50 text-2xs leading-relaxed font-normal">
                  Reserve a priority unit booking instantly via a construct-linked token deposit. Holding deposits are fully refundable within 72 hours.
                </p>
                <button
                  onClick={handleInitiateBooking}
                  className="w-full btn-gold-luxury py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Secure Direct hold unit</span>
                </button>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-2xs text-center font-bold">
                {successMsg}
              </div>
            )}
          </div>

          {/* Sticky Sales Representative Card */}
          <div className="bg-[#12141d]/90 border border-white/10 p-6 rounded-3xl space-y-4 font-semibold text-xs text-white">
            <div className="border-b border-white/10 pb-3 flex items-center gap-3">
              {/* Photo */}
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-extrabold shrink-0">
                SR
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">Sanjay Rawat</h4>
                <p className="text-3xs text-white/50">Senior Sales Consultant - BuildEstate</p>
              </div>
            </div>

            {/* Direct Callback Form */}
            <form onSubmit={handleRequestCallback} className="space-y-2">
              <span className="text-3xs uppercase tracking-widest text-primary font-bold">Request a Callback</span>
              <input
                type="text"
                value={callbackName}
                onChange={(e) => setCallbackName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-[#161924] border border-white/15 rounded-xl py-2 px-3 focus:outline-none focus:border-primary text-white text-2xs font-semibold"
              />
              <div className="flex gap-2">
                <input
                  type="tel"
                  required
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  placeholder="Mobile number"
                  className="w-full bg-[#161924] border border-white/15 rounded-xl py-2 px-3 focus:outline-none focus:border-primary text-white text-2xs font-semibold"
                />
                <button
                  type="submit"
                  className="bg-primary text-black px-3.5 rounded-xl font-bold uppercase text-[10px]"
                >
                  Request
                </button>
              </div>
            </form>

            <div className="border-t border-white/10 pt-3 space-y-2 text-2xs font-bold tracking-wider uppercase">
              <button 
                onClick={() => requireAuth(() => setShowBookVisit(true), "Schedule private site visit")}
                className="w-full py-2.5 rounded-xl bg-primary text-black flex items-center justify-center gap-2 hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
              >
                <Calendar className="h-4 w-4" />
                <span>Schedule Site Visit</span>
              </button>
              
              <button 
                onClick={handleChat}
                className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 flex items-center justify-center gap-2 transition-all text-white/80 hover:text-white"
              >
                <MessageSquare className="h-4 w-4 text-primary" />
                <span>Live Chat Consultation</span>
              </button>

              <button 
                onClick={handleWhatsApp}
                className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 flex items-center justify-center gap-2 transition-all text-white/80 hover:text-white"
              >
                <span className="text-green-400 font-normal">🟢 Message on WhatsApp</span>
              </button>

              <button 
                onClick={handleDownloadBrochure}
                className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 flex items-center justify-center gap-2 transition-all text-white/80 hover:text-white"
              >
                <FileDown className="h-4 w-4 text-primary" />
                <span>Download Brochure</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Book Visit Modal Popup */}
      <BookVisitModal
        isOpen={showBookVisit}
        onClose={() => setShowBookVisit(false)}
        property={property}
        onSuccess={() => {
          alert('Private guided site visit booked successfully!');
        }}
      />

      {/* Auth Gate Modal Popup */}
      <AuthGateModal
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        title={authGateTitle}
        onSuccess={() => {
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
        }}
      />
    </div>
  );
}
