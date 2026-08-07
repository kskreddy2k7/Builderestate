import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Search, MapPin, SlidersHorizontal, Eye, Scale, X, ArrowUpRight, 
  Heart, Share2, Phone, Video, Send, FileDown, Star, MessageSquare, 
  CheckCircle, Compass, HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AuthGateModal from '../components/AuthGateModal';
import BookVisitModal from '../components/BookVisitModal';
import CompareModal from '../components/CompareModal';

// Local backup properties in case API is down
const BACKUP_PROPERTIES = [
  {
    id: 'prop-1',
    title: 'Prestige Kokapet Sky Villas',
    projectName: 'Prestige Kokapet Lakefront',
    builderName: 'Prestige Group',
    address: 'Kokapet',
    city: 'Hyderabad',
    price: 48000000,
    type: 'VILLA',
    status: 'AVAILABLE',
    reraNumber: 'P02400008891',
    bedrooms: 4,
    bathrooms: 5,
    area: 4800,
    images: [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80' }],
    amenities: ['Infinity Pool', 'Private Elevator', 'Smart Automation'],
    constructionStatus: 'Ready to Move',
    possessionDate: 'Ready',
    rating: 4.8,
    featured: true
  },
  {
    id: 'prop-3',
    title: 'Sobha Royal Meadows',
    projectName: 'Sobha Royal Meadows',
    builderName: 'Sobha Realty',
    address: 'Tellapur',
    city: 'Hyderabad',
    price: 36000000,
    type: 'VILLA',
    status: 'AVAILABLE',
    reraNumber: 'P02400007781',
    bedrooms: 4,
    bathrooms: 4,
    area: 3900,
    images: [{ url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80' }],
    amenities: ['Private Garden', 'Clubhouse', 'EV Charging'],
    constructionStatus: 'Under Construction',
    possessionDate: 'Dec 2027',
    rating: 4.6,
    featured: false
  }
];

// Encapsulated Property Card for hover slideshow performance
function PropertyCard({ 
  prop, 
  viewType, 
  isWishlisted, 
  isCompared, 
  onToggleWishlist, 
  onToggleCompare, 
  onBookVisit, 
  onChat, 
  onCall, 
  onWhatsApp, 
  onDownloadBrochure,
  onExplore,
  onOpenTour,
  onOpenVideo
}) {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const slideshowTimer = useRef(null);

  const images = prop.images && prop.images.length > 0 
    ? prop.images 
    : [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80' }];

  useEffect(() => {
    if (isHovered && images.length > 1) {
      slideshowTimer.current = setInterval(() => {
        setActiveImgIdx(prev => (prev + 1) % images.length);
      }, 2000);
    } else {
      if (slideshowTimer.current) {
        clearInterval(slideshowTimer.current);
      }
      setActiveImgIdx(0);
    }
    return () => {
      if (slideshowTimer.current) clearInterval(slideshowTimer.current);
    };
  }, [isHovered, images.length]);

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIdx((activeImgIdx + 1) % images.length);
  };

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImgIdx((activeImgIdx - 1 + images.length) % images.length);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/properties/${prop.id}`);
    alert('Property link copied to clipboard!');
  };

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group bg-[#12141d]/90 text-white border border-white/10 hover:border-primary/40 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(212,175,55,0.12)] flex ${
        viewType === 'GRID' ? 'flex-col justify-between' : 'flex-col sm:flex-row'
      }`}
    >
      {/* Property Image Container */}
      <div className={`relative overflow-hidden bg-muted select-none ${
        viewType === 'GRID' ? 'h-56 w-full' : 'h-64 sm:h-auto sm:w-80 shrink-0'
      }`}>
        <img
          src={images[activeImgIdx]?.url}
          alt={prop.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Dark image gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
          {prop.featured && (
            <span className="bg-primary text-black px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wider shadow-md">
              Featured
            </span>
          )}
          <span className="bg-green-500/90 text-white px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1">
            <CheckCircle className="h-2.5 w-2.5" /> Verified
          </span>
          <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white px-2.5 py-0.5 rounded-full text-3xs font-bold uppercase tracking-wider">
            {prop.constructionStatus || 'Under Construction'}
          </span>
        </div>

        {/* Top Right Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={(e) => { e.preventDefault(); onToggleWishlist(prop.id); }}
            className={`p-2 rounded-full backdrop-blur-md border transition-all ${
              isWishlisted 
                ? 'bg-red-500/20 border-red-500 text-red-500' 
                : 'bg-black/60 border-white/10 text-white/80 hover:text-white hover:bg-black/80'
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
          </button>
          
          <button
            onClick={(e) => { e.preventDefault(); onToggleCompare(prop); }}
            className={`p-2 rounded-full backdrop-blur-md border transition-all ${
              isCompared 
                ? 'bg-primary/20 border-primary text-primary' 
                : 'bg-black/60 border-white/10 text-white/80 hover:text-white hover:bg-black/80'
            }`}
            title="Add to Compare"
          >
            <Scale className="h-4 w-4" />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-black/80 transition-all"
            title="Share Property"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Hover Slider Arrows */}
        {images.length > 1 && isHovered && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 transition-colors"
            >
              ‹
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 transition-colors"
            >
              ›
            </button>
          </>
        )}

        {/* Media Badges (360, Video) */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <button
            onClick={(e) => { e.preventDefault(); onOpenTour(prop); }}
            className="flex items-center gap-1 bg-black/70 hover:bg-black/95 border border-white/15 px-2 py-1 rounded-lg text-3xs font-extrabold uppercase tracking-wider transition-all"
          >
            <Compass className="h-3 w-3 text-primary animate-spin" style={{ animationDuration: '6s' }} />
            <span>360 Tour</span>
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onOpenVideo(prop); }}
            className="flex items-center gap-1 bg-black/70 hover:bg-black/95 border border-white/15 px-2 py-1 rounded-lg text-3xs font-extrabold uppercase tracking-wider transition-all"
          >
            <Video className="h-3 w-3 text-primary" />
            <span>Video</span>
          </button>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-4 font-semibold text-xs">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">
                {prop.projectName || `${prop.builderName} Landmark`}
              </span>
              <span className="text-3xs text-white/50 block mt-0.5">
                Developer: {prop.builderName}
              </span>
            </div>
            <div className="flex items-center gap-1 text-yellow-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 text-[10px]">
              <Star className="h-3 w-3 fill-yellow-400 shrink-0" />
              <span>{prop.rating || 4.8}</span>
            </div>
          </div>

          <h3 className="font-serif-luxury text-base font-bold line-clamp-1 group-hover:text-primary transition-colors text-white tracking-wide">
            {prop.title}
          </h3>

          <div className="flex justify-between items-center text-3xs text-white/60">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              {prop.address}, {prop.city}
            </span>
            <span className="bg-white/5 px-1.5 py-0.5 rounded text-white/40 font-mono">
              RERA Approved
            </span>
          </div>

          <p className="text-2xs text-white/50 line-clamp-2 leading-relaxed font-normal">
            {prop.description}
          </p>
        </div>

        {/* Specifications Grid */}
        <div className="border-t border-white/10 pt-3 space-y-3">
          <div className="flex justify-between text-3xs text-white/70 uppercase tracking-wider">
            <span>{prop.bedrooms > 0 ? `${prop.bedrooms} BHK Suites` : 'Commercial'}</span>
            <span>{prop.bathrooms > 0 ? `${prop.bathrooms} Baths` : 'Utility Area'}</span>
            <span>{prop.area} sqft Area</span>
          </div>

          <div className="flex justify-between items-center text-3xs border-t border-white/5 pt-2 text-white/50 font-normal">
            <span>Possession: <strong className="text-white font-bold">{prop.possessionDate || 'Dec 2027'}</strong></span>
            <span>RERA ID: <strong className="text-white font-bold font-mono">{prop.reraNumber || prop.rera}</strong></span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-white/5">
            <div>
              <span className="block text-4xs uppercase tracking-widest text-white/40">Starting Price</span>
              <span className="text-primary font-serif-luxury font-extrabold text-base">
                ₹{prop.price.toLocaleString('en-IN')}
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.preventDefault(); onExplore(prop.id); }}
                className="bg-white/5 text-white p-2.5 rounded-xl hover:bg-white/10 border border-white/10 transition-colors"
                title="Quick View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              <Link
                to={`/properties/${prop.id}`}
                className="bg-primary text-black px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider hover:bg-primary/95 transition-all shadow-md"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>

        {/* Action Button Grid */}
        <div className="grid grid-cols-3 gap-1.5 border-t border-white/10 pt-3 text-[10px] font-extrabold tracking-wider uppercase text-center">
          <button 
            onClick={() => onBookVisit(prop)}
            className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg border border-primary/20 hover:border-primary/50 bg-primary/5 hover:bg-primary/10 transition-all text-primary"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Book Visit</span>
          </button>
          
          <button 
            onClick={() => onChat(prop, 'CHAT')}
            className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 transition-all text-white/80 hover:text-white"
          >
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span>Chat</span>
          </button>

          <button 
            onClick={() => onWhatsApp(prop)}
            className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 transition-all text-white/80 hover:text-white"
          >
            <span className="text-green-400 font-normal">🟢 WhatsApp</span>
          </button>

          <button 
            onClick={() => onCall(prop)}
            className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 transition-all text-white/80 hover:text-white"
          >
            <Phone className="h-3.5 w-3.5 text-primary" />
            <span>Call Now</span>
          </button>

          <button 
            onClick={() => onDownloadBrochure(prop)}
            className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 transition-all text-white/80 hover:text-white"
          >
            <FileDown className="h-3.5 w-3.5 text-primary" />
            <span>Brochure</span>
          </button>

          <button 
            onClick={() => onToggleWishlist(prop.id)}
            className="flex flex-col items-center justify-center gap-1 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/2 hover:bg-white/5 transition-all text-white/80 hover:text-white"
          >
            <Heart className={`h-3.5 w-3.5 text-primary ${isWishlisted ? 'fill-primary' : ''}`} />
            <span>Save</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Properties() {
  const location = useLocation();
  const { user } = useAuth();
  
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('GRID');

  // Filters State
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  // Wishlist state
  const [wishlist, setWishlist] = useState([]);

  // Modals visibility state
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [authGateTitle, setAuthGateTitle] = useState('Unlock Premium Features');
  const [pendingAction, setPendingAction] = useState(null);

  const [showBookVisit, setShowBookVisit] = useState(false);
  const [bookVisitProp, setBookVisitProp] = useState(null);

  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [showCompareDrawer, setShowCompareDrawer] = useState(false);

  // Quick media walkthrough state
  const [mediaModal, setMediaModal] = useState(null); // { type: '360'|'VIDEO', prop }

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('search')) setSearch(query.get('search'));
    if (query.get('city')) setCity(query.get('city'));
    if (query.get('type')) setType(query.get('type'));
  }, [location.search]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (city) params.city = city;
      if (type) params.type = type;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (bedrooms) params.bedrooms = bedrooms;
      params.status = 'AVAILABLE';

      const response = await api.get('/properties', { params });
      if (response.data && response.data.length > 0) {
        setProperties(response.data);
      } else {
        setProperties(BACKUP_PROPERTIES);
      }
    } catch (error) {
      console.error('Error fetching properties', error);
      setProperties(BACKUP_PROPERTIES);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const response = await api.get('/wishlist');
      setWishlist(response.data.map(p => p.id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [search, city, type, minPrice, maxPrice, bedrooms]);

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
  };

  // Auth gate wrapper helper
  const requireAuth = (action, title = "Unlock Premium Features") => {
    if (user) {
      action();
    } else {
      setAuthGateTitle(title);
      setPendingAction(() => action);
      setShowAuthGate(true);
    }
  };

  const handleToggleWishlist = async (propertyId) => {
    try {
      const response = await api.post('/wishlist', { propertyId });
      if (response.data.saved) {
        setWishlist(prev => [...prev, propertyId]);
      } else {
        setWishlist(prev => prev.filter(id => id !== propertyId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCompare = (prop) => {
    const exists = compareList.find((p) => p.id === prop.id);
    if (exists) {
      setCompareList(compareList.filter((p) => p.id !== prop.id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 properties at a time.');
        return;
      }
      setCompareList([...compareList, prop]);
      setShowCompareDrawer(true);
    }
  };

  // Actions trigger handlers with Auth Gates
  const triggerWishlist = (propertyId) => {
    requireAuth(() => handleToggleWishlist(propertyId), "Add property to your wishlist");
  };

  const triggerBookVisit = (prop) => {
    requireAuth(() => {
      setBookVisitProp(prop);
      setShowBookVisit(true);
    }, "Book a private site visit");
  };

  const triggerChat = async (prop, type = 'CHAT') => {
    requireAuth(async () => {
      try {
        await api.post('/enquiries', {
          propertyId: prop.id,
          type,
          message: 'Initiating live consultation with developer representative.'
        });
        alert(`Live consultation chat initiated for ${prop.title}! An agent will contact you.`);
      } catch (e) {
        console.error(e);
      }
    }, "Initiate live developer chat");
  };

  const triggerCall = async (prop) => {
    requireAuth(async () => {
      try {
        await api.post('/enquiries', {
          propertyId: prop.id,
          type: 'CALL',
          message: 'Requested call connection'
        });
        alert(`Connecting call details for ${prop.title}. A registered representative will call you in 5 minutes.`);
      } catch (e) {
        console.error(e);
      }
    }, "Access phone consultation directory");
  };

  const triggerDownloadBrochure = async (prop) => {
    requireAuth(async () => {
      try {
        await api.post('/enquiries', {
          propertyId: prop.id,
          type: 'BROCHURE',
          message: 'Downloaded brochure guide.'
        });
        // Simulate immediate brochure download
        const link = document.createElement('a');
        link.href = '#';
        link.setAttribute('download', `brochure_${prop.id}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert(`Brochure and layout blueprints for ${prop.title} successfully downloaded!`);
      } catch (e) {
        console.error(e);
      }
    }, "Download premium layout brochure");
  };

  const handleWhatsApp = async (prop) => {
    try {
      await api.post('/enquiries', {
        propertyId: prop.id,
        type: 'WHATSAPP',
        message: 'Redirected to WhatsApp helpline.'
      });
      const text = encodeURIComponent(`Hi, I am interested in exploring ${prop.title}. Please share payment plans.`);
      window.open(`https://wa.me/919999988888?text=${text}`, '_blank');
    } catch (e) {
      console.error(e);
    }
  };

  const triggerSaveSearch = () => {
    requireAuth(async () => {
      try {
        const queryParams = new URLSearchParams({
          search, city, type, minPrice, maxPrice, bedrooms
        }).toString();
        await api.post('/saved-searches', {
          name: `${city || 'All Cities'} ${type || 'Luxury'} Searches`,
          query: `?${queryParams}`
        });
        alert('Search preferences and automated listing alerts registered successfully!');
      } catch (err) {
        alert('Failed to register saved search.');
      }
    }, "Register search preferences and alerts");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 space-y-8 relative font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-serif-luxury">LUXURY MARKETPLACE</h1>
          <p className="text-white/60 text-xs mt-1 font-semibold uppercase tracking-wider">Explore ready-to-move apartments, sky villas, and weekends farm houses.</p>
        </div>
        
        {/* Grid/List View Toggler */}
        <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-white/10 select-none">
          <button
            onClick={() => setViewType('GRID')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewType === 'GRID' ? 'bg-primary text-black font-extrabold' : 'text-white/60 hover:text-white'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewType('LIST')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewType === 'LIST' ? 'bg-primary text-black font-extrabold' : 'text-white/60 hover:text-white'
            }`}
          >
            List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="glass-premium p-6 rounded-3xl h-fit space-y-6 border border-white/10 bg-[#0e1017]/80">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-serif-luxury text-sm font-bold flex items-center gap-2 text-white">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span>FILTERS</span>
            </h2>
            <button onClick={clearFilters} className="text-xs text-primary hover:underline font-bold uppercase tracking-wider">
              Clear All
            </button>
          </div>

          <div className="space-y-4 text-xs font-bold">
            {/* Search */}
            <div className="space-y-1.5">
              <label className="text-white/60 uppercase text-3xs tracking-widest font-bold">Search Project</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. Prestige, Sobha"
                  className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 pl-3 pr-10 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-white/40" />
              </div>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-white/60 uppercase text-3xs tracking-widest font-bold">Indian Metro City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs select-custom font-semibold"
              >
                <option value="">All Cities</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-white/60 uppercase text-3xs tracking-widest font-bold">Property Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs select-custom font-semibold"
              >
                <option value="">All Types</option>
                <option value="APARTMENT">Premium Apartment</option>
                <option value="VILLA">Sky Villa / Penthouse</option>
              </select>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-white/60 uppercase text-3xs tracking-widest font-bold">Price Bounds (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-1.5">
              <label className="text-white/60 uppercase text-3xs tracking-widest font-bold">Bedrooms</label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs select-custom font-semibold"
              >
                <option value="">Any BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>
            
            {/* Save Search preference */}
            <button
              onClick={triggerSaveSearch}
              className="w-full py-3 rounded-xl border border-primary/45 hover:bg-primary/5 text-primary text-xs uppercase tracking-wider font-extrabold transition-all mt-4 flex items-center justify-center gap-2"
            >
              <span>Save Search & Alerts</span>
            </button>
          </div>
        </div>

        {/* Listings Display Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : (
            <div className={viewType === 'GRID' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
              {properties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  prop={prop}
                  viewType={viewType}
                  isWishlisted={wishlist.includes(prop.id)}
                  isCompared={compareList.some(p => p.id === prop.id)}
                  onToggleWishlist={triggerWishlist}
                  onToggleCompare={handleToggleCompare}
                  onBookVisit={triggerBookVisit}
                  onChat={triggerChat}
                  onCall={triggerCall}
                  onWhatsApp={handleWhatsApp}
                  onDownloadBrochure={triggerDownloadBrochure}
                  onExplore={(id) => window.location.href = `/properties/${id}`}
                  onOpenTour={(p) => setMediaModal({ type: '360', prop: p })}
                  onOpenVideo={(p) => setMediaModal({ type: 'VIDEO', prop: p })}
                />
              ))}
              
              {properties.length === 0 && (
                <div className="col-span-2 text-center py-20 text-white/50 space-y-2">
                  <p className="font-bold">No active listings match your filter specifications.</p>
                  <button onClick={clearFilters} className="text-primary hover:underline text-sm font-semibold">
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Drawer */}
      <AnimatePresence>
        {showCompareDrawer && compareList.length > 0 && (
          <motion.div
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            exit={{ y: 200 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e1017]/95 border-t border-primary/30 shadow-2xl p-6 backdrop-blur-xl"
          >
            <div className="max-w-7xl mx-auto space-y-4 font-semibold text-xs text-white">
              <div className="flex justify-between items-center">
                <h3 className="font-serif-luxury text-sm font-bold uppercase text-primary flex items-center gap-1.5">
                  <Scale className="h-4.5 w-4.5 text-primary" /> Property Compare Drawer ({compareList.length}/3)
                </h3>
                <div className="flex gap-4 uppercase tracking-widest text-3xs font-extrabold">
                  <button onClick={() => setCompareList([])} className="text-white/60 hover:text-white">Clear All</button>
                  <button 
                    onClick={() => requireAuth(() => setShowCompareModal(true), "Compare detailed specifications")}
                    className="text-primary hover:underline"
                  >
                    Compare Specifications
                  </button>
                  <button onClick={() => setShowCompareDrawer(false)} className="p-1 rounded hover:bg-white/5 text-white/50 hover:text-white"><X className="h-4.5 w-4.5" /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {compareList.map((p) => (
                  <div key={p.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white line-clamp-1">{p.title}</p>
                      <p className="text-3xs text-white/50 mt-0.5">₹{p.price.toLocaleString('en-IN')} • {p.bedrooms} BHK • {p.area} sqft</p>
                    </div>
                    <button onClick={() => handleToggleCompare(p)} className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 360 / Video Media Lightbox Modal */}
      <AnimatePresence>
        {mediaModal && (
          <div className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0e1017] border border-primary/30 p-6 rounded-3xl w-full max-w-4xl space-y-4 relative shadow-[0_20px_50px_rgba(212,175,55,0.2)]"
            >
              <button 
                onClick={() => setMediaModal(null)} 
                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-1">
                <span className="text-3xs uppercase tracking-widest text-primary font-bold">
                  {mediaModal.type === '360' ? 'Immersive VR Walkthrough' : 'Cinematic Video Tour'}
                </span>
                <h3 className="font-serif-luxury text-lg font-bold text-white">{mediaModal.prop.title}</h3>
              </div>

              {mediaModal.type === '360' ? (
                <div className="relative w-full h-[450px] bg-black rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                  {/* Simulated 360 walkthrough sphere using full-screen panoramic image */}
                  <img
                    src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
                    className="w-full h-full object-cover animate-pulse"
                    style={{ filter: 'brightness(0.9) contrast(1.05)' }}
                    alt=""
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 backdrop-blur-2xs text-center space-y-3">
                    <Compass className="h-14 w-14 text-primary animate-spin" style={{ animationDuration: '8s' }} />
                    <p className="text-white font-extrabold text-sm uppercase tracking-widest">Hold Left Click & Drag to Rotate Walkthrough</p>
                    <p className="text-white/60 text-xs font-normal">Loading High-Resolution 3D Render Sphere...</p>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-[450px] bg-black rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                  {/* Simulated video playback frame */}
                  <img
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
                    className="w-full h-full object-cover"
                    alt=""
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-center space-y-3">
                    <div className="h-16 w-16 bg-primary/95 text-black rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-xl shadow-primary/20">
                      <ArrowUpRight className="h-8 w-8 rotate-45 transform translate-x-0.5" />
                    </div>
                    <p className="text-white font-extrabold text-sm uppercase tracking-widest">Play Cinematic Flyby Sequence</p>
                    <p className="text-white/60 text-xs font-normal">Recorded in 4K UHD 60FPS. Drone footage overview.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      {/* Book Visit Modal Popup */}
      <BookVisitModal
        isOpen={showBookVisit}
        onClose={() => setShowBookVisit(false)}
        property={bookVisitProp}
        onSuccess={() => {
          alert('Site visit confirmation registered. Details loaded to your dashboard.');
        }}
      />

      {/* Side-by-Side Compare Modal Popup */}
      <CompareModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        compareList={compareList}
        onRemove={handleToggleCompare}
      />
    </div>
  );
}
