import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Building, Calendar, Heart, Scale, FileDown, MessageSquare, 
  Bell, Eye, Search, User, Settings, LogOut, MapPin, Star, 
  CheckCircle, X, ChevronRight, Send, Paperclip, ShieldAlert,
  ArrowUpRight, Edit2, ShieldCheck, Moon, Globe, Lock, Trash2, Clock,
  PlusCircle, BarChart2, Check, RefreshCw, FileText, Phone, MessageCircle, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import BookVisitModal from '../components/BookVisitModal';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isSeller = user?.role === 'BUILDER' || user?.role === 'SELLER';

  // Active View Tab State
  const [activeView, setActiveView] = useState('DASHBOARD');

  // Read URL query parameter for tabs on navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveView(tabParam.toUpperCase());
    }
  }, [location]);

  // Data States
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searches, setSearches] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Property state (for Seller)
  const [editingProperty, setEditingProperty] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Seller Enquiry Reply state
  const [replyEnquiryId, setReplyEnquiryId] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Sub-view specific states (Buyer)
  const [wishlistSearch, setWishlistSearch] = useState('');
  const [wishlistFilterType, setWishlistFilterType] = useState('');
  const [compareSelection, setCompareSelection] = useState([]);
  const [visitFilter, setVisitFilter] = useState('UPCOMING'); // UPCOMING, COMPLETED, CANCELLED
  const [rescheduleVisit, setRescheduleVisit] = useState(null); // bookingId
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [activeChatChannel, setActiveChatChannel] = useState('SALES'); // BUILDER, SALES, SUPPORT
  const [chatInput, setChatInput] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  
  // Site Visit Calendar month selector
  const [calendarDate] = useState(new Date());

  // Profile forms
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddress, setProfileAddress] = useState('Flat 402, Signature Residency, Kokapet, Hyderabad');
  const [profilePassword, setProfilePassword] = useState('Password@123');

  // Book Visit Modal Trigger
  const [showBookVisit, setShowBookVisit] = useState(false);
  const [bookVisitProp, setBookVisitProp] = useState(null);

  // Settings Toggles
  const [settingsNotify, setSettingsNotify] = useState(true);
  const [settingsPrivacy, setSettingsPrivacy] = useState(false);
  const [settingsLanguage, setSettingsLanguage] = useState('en');
  const [settingsDarkMode, setSettingsDarkMode] = useState(true);

  // Seller Form State
  const [sellerPropType, setSellerPropType] = useState('VILLA');
  const [sellerCity, setSellerCity] = useState('Hyderabad');
  const [sellerLocality, setSellerLocality] = useState('Kokapet');
  const [sellerAddress, setSellerAddress] = useState('');
  const [sellerTitle, setSellerTitle] = useState('');
  const [sellerPrice, setSellerPrice] = useState('');
  const [sellerArea, setSellerArea] = useState('');
  const [sellerDesc, setSellerDesc] = useState('');

  const chatEndRef = useRef(null);

  const fetchData = async () => {
    try {
      const urlVisits = isSeller ? '/bookings/builder' : '/bookings/buyer';
      const [bookRes, wishRes, searchRes, alertRes, viewedRes, enqRes, msgRes, notRes, propRes] = await Promise.all([
        api.get(urlVisits),
        api.get('/wishlist'),
        api.get('/saved-searches'),
        api.get('/alerts'),
        api.get('/recently-viewed'),
        api.get('/enquiries'),
        api.get('/messages'),
        api.get('/notifications'),
        api.get('/properties')
      ]);

      setBookings(bookRes.data || []);
      setWishlist(wishRes.data || []);
      setSearches(searchRes.data || []);
      setAlerts(alertRes.data || []);
      setRecentlyViewed(viewedRes.data || []);
      setEnquiries(enqRes.data || []);
      setMessages(msgRes.data || []);
      setNotifications(notRes.data || []);
      setAllProperties(propRes.data || []);

      if (user) {
        setProfileName(user.name);
        setProfileEmail(user.email);
        setProfilePhone(user.phone || '+918888877777');
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeView]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Seller Property Handlers
  const handleSellerAddProperty = async (e) => {
    e.preventDefault();
    if (!sellerTitle || !sellerPrice || !sellerArea) {
      alert('Please fill out Title, Price, and Super Area metrics.');
      return;
    }
    try {
      await api.post('/properties/add', {
        title: sellerTitle,
        price: Number(sellerPrice),
        area: Number(sellerArea),
        description: sellerDesc,
        type: sellerPropType,
        city: sellerCity,
        locality: sellerLocality,
        address: sellerAddress,
        projectName: 'BuildEstate Elite Signature'
      });
      alert('Listing created successfully!');
      setSellerTitle('');
      setSellerPrice('');
      setSellerArea('');
      setSellerDesc('');
      setSellerAddress('');
      fetchData();
      setActiveView('LISTINGS');
    } catch (e) {
      console.error(e);
      alert('Failed to add property.');
    }
  };

  const handleSellerEditProperty = async (e) => {
    e.preventDefault();
    try {
      // In-memory edit mapping
      const props = JSON.parse(localStorage.getItem('mock_properties') || '[]');
      const idx = props.findIndex(p => p.id === editingProperty.id);
      if (idx !== -1) {
        props[idx].title = editTitle;
        props[idx].price = Number(editPrice);
        localStorage.setItem('mock_properties', JSON.stringify(props));
      }
      setEditingProperty(null);
      alert('Listing specifications updated successfully!');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSellerPause = (propertyId) => {
    const props = JSON.parse(localStorage.getItem('mock_properties') || '[]');
    const idx = props.findIndex(p => p.id === propertyId);
    if (idx !== -1) {
      props[idx].constructionStatus = props[idx].constructionStatus === 'Paused' ? 'Under Construction' : 'Paused';
      localStorage.setItem('mock_properties', JSON.stringify(props));
      alert(`Property listing is now ${props[idx].constructionStatus === 'Paused' ? 'paused' : 'active'}.`);
      fetchData();
    }
  };

  const handleSellerDelete = (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) return;
    const props = JSON.parse(localStorage.getItem('mock_properties') || '[]');
    const filtered = props.filter(p => p.id !== propertyId);
    localStorage.setItem('mock_properties', JSON.stringify(filtered));
    alert('Listing deleted successfully.');
    fetchData();
  };

  const handleSellerDuplicate = (property) => {
    const props = JSON.parse(localStorage.getItem('mock_properties') || '[]');
    const duplicate = {
      ...property,
      id: `prop-${Date.now()}`,
      title: `${property.title} (Copy)`,
      viewsCount: 0,
      enquiriesCount: 0
    };
    props.push(duplicate);
    localStorage.setItem('mock_properties', JSON.stringify(props));
    alert('Listing duplicated successfully!');
    fetchData();
  };

  const handleShare = (propertyId) => {
    const url = `${window.location.origin}/#/properties/${propertyId}`;
    navigator.clipboard.writeText(url);
    alert('Listing link copied to clipboard!');
  };

  const handleSellerEnquiryReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const enqs = JSON.parse(localStorage.getItem('mock_enquiries') || '[]');
      const idx = enqs.findIndex(e => e.id === replyEnquiryId);
      if (idx !== -1) {
        enqs[idx].status = 'RESOLVED';
        enqs[idx].message = `${enqs[idx].message || ''}\n\n[Developer Response]: ${replyText}`;
        localStorage.setItem('mock_enquiries', JSON.stringify(enqs));
      }
      setReplyEnquiryId(null);
      setReplyText('');
      alert('Reply transmitted successfully!');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      alert(`Booking has been successfully ${status.toLowerCase()}!`);
      fetchData();
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() && !selectedAttachment) return;

    try {
      const receiver = activeChatChannel === 'BUILDER' 
        ? 'Prestige Group Developers' 
        : activeChatChannel === 'SUPPORT' 
          ? 'BuildEstate Support Desk' 
          : 'Sanjay Rawat (Sales Manager)';

      const res = await api.post('/messages', {
        receiver,
        content: chatInput,
        attachment: selectedAttachment ? selectedAttachment.name : null
      });

      setMessages(prev => [...prev, res.data]);
      setChatInput('');
      setSelectedAttachment(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAttachmentChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedAttachment(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', {
        name: profileName,
        email: profileEmail,
        phone: profilePhone
      });
      alert('Profile credentials saved successfully in database!');
    } catch (e) {
      alert('Failed to update credentials.');
    }
  };

  const handleReschedule = async (bookingId) => {
    if (!rescheduleDate) return;
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'PENDING', preferredDate: rescheduleDate });
      alert('Reschedule request sent!');
      setRescheduleVisit(null);
      setRescheduleDate('');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelVisit = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this site visit?')) return;
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: 'CANCELLED' });
      alert('Visit cancelled successfully.');
      fetchData();
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

  // Sidebar list depending on role
  const buyerSidebarItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: User },
    { id: 'WISHLIST', label: 'Wishlist', icon: Heart },
    { id: 'COMPARE', label: 'Compare Properties', icon: Scale },
    { id: 'VISITS', label: 'Site Visit Bookings', icon: Calendar },
    { id: 'BROCHURES', label: 'Downloaded Brochures', icon: FileDown },
    { id: 'ENQUIRIES', label: 'My Enquiries', icon: MessageSquare },
    { id: 'MESSAGES', label: 'Messages', icon: MessageSquare },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
    { id: 'HISTORY', label: 'Recently Viewed', icon: Clock },
    { id: 'SEARCHES', label: 'Saved Searches', icon: Search },
    { id: 'PROFILE', label: 'Profile', icon: User },
    { id: 'SETTINGS', label: 'Settings', icon: Settings }
  ];

  const sellerSidebarItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: User },
    { id: 'LISTINGS', label: 'My Listings', icon: Building },
    { id: 'ADD_PROPERTY', label: 'Add Property', icon: PlusCircle },
    { id: 'ENQUIRIES', label: 'Enquiries', icon: MessageSquare },
    { id: 'VISITS', label: 'Site Visits', icon: Calendar },
    { id: 'ANALYTICS', label: 'Analytics', icon: BarChart2 },
    { id: 'DOCUMENTS', label: 'Documents', icon: FileText },
    { id: 'PROFILE', label: 'Profile', icon: User },
    { id: 'SETTINGS', label: 'Settings', icon: Settings }
  ];

  const sidebarItems = isSeller ? sellerSidebarItems : buyerSidebarItems;
  const sellerListings = allProperties.filter(p => p.builderId === user?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 text-white font-sans flex flex-col md:flex-row gap-8 items-start relative min-h-screen">
      
      {/* 1. Left Sticky Sidebar */}
      <div className="w-full md:w-64 shrink-0 glass-premium p-5 rounded-3xl border border-white/10 bg-[#0e1017]/85 space-y-4 md:sticky md:top-32 select-none z-10 font-bold uppercase tracking-wider text-3xs">
        <div className="border-b border-white/10 pb-4 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-serif-luxury text-lg mb-2 shadow-lg">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <h4 className="font-bold text-white text-xs tracking-wider line-clamp-1">{user?.name}</h4>
          <span className="text-3xs text-primary font-extrabold tracking-widest mt-0.5 block uppercase">
            {isSeller ? 'Verified Seller' : 'Verified Investor'}
          </span>
        </div>

        <div className="space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4.5 py-3 rounded-xl border text-left transition-all ${
                activeView === item.id 
                  ? 'bg-primary text-black border-primary font-extrabold shadow-md shadow-primary/15' 
                  : 'bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4.5 py-3 rounded-xl border border-transparent text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all font-bold uppercase tracking-wider"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 2. Main content rendering window */}
      <div className="flex-grow w-full min-w-0">
        
        {/* ==========================================================
            SELLER / BUILDER PORTAL RENDERER
            ========================================================== */}
        {isSeller ? (
          <div className="space-y-8">
            
            {/* TAB: SELLER DASHBOARD HOME */}
            {activeView === 'DASHBOARD' && (
              <div className="space-y-8">
                <div className="glass-premium p-6 rounded-3xl border border-white/10 bg-[#0e1017]/85 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="space-y-2">
                    <span className="text-3xs uppercase tracking-widest text-primary font-bold">Seller Dashboard Console</span>
                    <h1 className="text-3xl font-serif-luxury font-bold tracking-tight text-white uppercase">Seller Portal Home</h1>
                    <p className="text-xs text-white/60 font-semibold max-w-xl leading-relaxed">
                      Track active listings, pending approvals, total organic views, buyer enquiries, and approve site visit walkthrough requests.
                    </p>
                  </div>
                </div>

                {/* Seller KPI Metric Row */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  {[
                    { label: 'Active Listings', count: sellerListings.length, icon: Building },
                    { label: 'Pending Approval', count: 1, icon: Clock },
                    { label: 'Total Views', count: '2.4K', icon: Eye },
                    { label: 'Enquiries Received', count: enquiries.length, icon: MessageSquare },
                    { label: 'Site Visits Scheduled', count: bookings.length, icon: Calendar },
                    { label: 'Wishlist Saves', count: 12, icon: Heart }
                  ].map((kpi, idx) => (
                    <div
                      key={idx}
                      className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl text-center space-y-1.5 flex flex-col items-center select-none"
                    >
                      <kpi.icon className="h-4.5 w-4.5 text-primary shrink-0" />
                      <span className="text-[9px] text-white/50 uppercase font-bold tracking-wider leading-tight">{kpi.label}</span>
                      <p className="text-xl font-serif-luxury font-extrabold text-white">{kpi.count}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                  {/* Recent Activity Log */}
                  <div className="md:col-span-2 bg-[#12141d]/90 border border-white/10 p-6 rounded-3xl space-y-4">
                    <h3 className="font-serif-luxury text-sm font-bold text-white tracking-wide uppercase">Activity Logs</h3>
                    <div className="space-y-4 font-normal text-xs text-white/70">
                      {bookings.slice(0, 3).map((b, idx) => (
                        <div key={idx} className="flex gap-3 items-start border-l-2 border-primary/45 pl-4 py-0.5">
                          <div>
                            <p className="text-white font-semibold">Walkthrough Requested</p>
                            <p className="text-2xs text-white/50">Buyer {b.buyerName} requested a site visit for {b.property?.title} on {b.preferredDate}. Status: {b.status}</p>
                          </div>
                        </div>
                      ))}
                      {enquiries.slice(0, 3).map((e, idx) => (
                        <div key={idx} className="flex gap-3 items-start border-l-2 border-white/20 pl-4 py-0.5">
                          <div>
                            <p className="text-white font-semibold">New Consultation Enquiry</p>
                            <p className="text-2xs text-white/50">Callback requested by {e.name} ({e.email}). Enquiry Status: {e.status}</p>
                          </div>
                        </div>
                      ))}
                      {bookings.length === 0 && enquiries.length === 0 && (
                        <p className="text-white/40">No activity logs recorded yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Profile Summary */}
                  <div className="bg-[#12141d]/90 border border-white/10 p-6 rounded-3xl space-y-4 text-xs font-semibold">
                    <h3 className="font-serif-luxury text-sm font-bold text-white tracking-wide uppercase border-b border-white/10 pb-2">Corporate Profile</h3>
                    <div className="space-y-3 font-normal text-white/70">
                      <p><span className="text-white/40 font-bold block text-3xs uppercase">Seller Name</span>{profileName}</p>
                      <p><span className="text-white/40 font-bold block text-3xs uppercase">Registered Email</span>{profileEmail}</p>
                      <p><span className="text-white/40 font-bold block text-3xs uppercase">Support Mobile</span>{profilePhone}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SELLER LISTINGS */}
            {activeView === 'LISTINGS' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-serif-luxury font-bold text-white uppercase tracking-wider">My Listings ({sellerListings.length})</h2>
                    <p className="text-white/60 text-2xs font-normal">Manage your listed property portfolios.</p>
                  </div>
                  <button
                    onClick={() => setActiveView('ADD_PROPERTY')}
                    className="btn-gold-luxury px-4 py-2 rounded-xl text-3xs font-extrabold uppercase tracking-wider flex items-center gap-1"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Add Listing</span>
                  </button>
                </div>

                {editingProperty && (
                  <form onSubmit={handleSellerEditProperty} className="bg-[#161924] border border-primary/20 p-5 rounded-3xl space-y-4 text-xs font-semibold text-white">
                    <h3 className="text-sm font-serif-luxury text-primary uppercase font-bold">Edit Listing Specifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-white/60 uppercase text-3xs font-extrabold">Property Title</label>
                        <input
                          type="text"
                          required
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-[#0c0d12] border border-white/15 rounded-xl py-2 px-3 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-white/60 uppercase text-3xs font-extrabold">Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full bg-[#0c0d12] border border-white/15 rounded-xl py-2 px-3 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingProperty(null)}
                        className="text-white/60 hover:text-white text-3xs uppercase tracking-wider font-extrabold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-primary text-black px-4 py-2 rounded-xl text-3xs font-extrabold uppercase tracking-wider"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sellerListings.map(p => (
                    <div key={p.id} className="bg-[#12141d]/90 border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between text-xs font-semibold text-white">
                      <div className="h-44 relative bg-muted select-none">
                        <img src={p.images?.[0]?.url} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                        <span className={`absolute top-3 left-3 px-2 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wider ${
                          p.constructionStatus === 'Paused' ? 'bg-red-500 text-white' : 'bg-primary text-black'
                        }`}>
                          {p.constructionStatus || 'Active'}
                        </span>
                        
                        <div className="absolute top-3 right-3 flex gap-1.5">
                          <button
                            onClick={() => { setEditingProperty(p); setEditTitle(p.title); setEditPrice(p.price); }}
                            className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-white hover:text-primary"
                            title="Edit Listing"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleSellerDelete(p.id)}
                            className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-red-400 hover:text-red-300"
                            title="Delete Permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">{p.city}</span>
                          <h3 className="font-bold text-sm text-white line-clamp-1">{p.title}</h3>
                          <p className="text-3xs text-white/50 flex items-center gap-1 font-semibold">
                            <MapPin className="h-3 w-3 text-primary" /> {p.address || p.locality}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/10 text-center font-normal text-3xs text-white/60">
                          <div>
                            <span className="block text-[8px] text-white/40 uppercase font-bold mb-0.5">Views</span>
                            <span>{p.viewsCount || 120} organic</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-white/40 uppercase font-bold mb-0.5">Enquiries</span>
                            <span>{p.enquiriesCount || 0} leads</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-white/40 uppercase font-bold mb-0.5">Price</span>
                            <span className="text-primary font-bold">₹{p.price.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 text-3xs font-extrabold uppercase tracking-wider">
                          <button
                            onClick={() => handleSellerPause(p.id)}
                            className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2 rounded-xl text-center"
                          >
                            {p.constructionStatus === 'Paused' ? 'Resume' : 'Pause'}
                          </button>
                          <button
                            onClick={() => handleSellerDuplicate(p)}
                            className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-2 rounded-xl text-center"
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleShare(p.id)}
                            className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl"
                            title="Share Link"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {sellerListings.length === 0 && (
                    <p className="col-span-2 text-center py-12 text-white/40 font-bold">No active listings registered yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB: SELLER ADD PROPERTY */}
            {activeView === 'ADD_PROPERTY' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif-luxury font-bold text-white uppercase tracking-wider">Add New Property Listing</h2>
                  <p className="text-white/60 text-2xs font-normal">Add property specifications directly to the database.</p>
                </div>

                <form onSubmit={handleSellerAddProperty} className="bg-[#12141d]/90 border border-white/10 p-6 rounded-3xl space-y-4 text-xs font-semibold text-white">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-white/60 uppercase text-[10px] font-bold">Property Listing Title *</label>
                      <input
                        type="text"
                        required
                        value={sellerTitle}
                        onChange={(e) => setSellerTitle(e.target.value)}
                        className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/60 uppercase text-[10px] font-bold">Type</label>
                      <select
                        value={sellerPropType}
                        onChange={(e) => setSellerPropType(e.target.value)}
                        className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs select-custom"
                      >
                        <option value="VILLA">Villa</option>
                        <option value="APARTMENT">Apartment</option>
                        <option value="HOUSE">Independent House</option>
                        <option value="COMMERCIAL">Commercial</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/60 uppercase text-[10px] font-bold">Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={sellerPrice}
                        onChange={(e) => setSellerPrice(e.target.value)}
                        className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/60 uppercase text-[10px] font-bold">Super Area (sqft) *</label>
                      <input
                        type="number"
                        required
                        value={sellerArea}
                        onChange={(e) => setSellerArea(e.target.value)}
                        className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/60 uppercase text-[10px] font-bold">City</label>
                      <input
                        type="text"
                        value={sellerCity}
                        onChange={(e) => setSellerCity(e.target.value)}
                        className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/60 uppercase text-[10px] font-bold">Locality</label>
                      <input
                        type="text"
                        value={sellerLocality}
                        onChange={(e) => setSellerLocality(e.target.value)}
                        className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-white/60 uppercase text-[10px] font-bold">Office/Building Address</label>
                      <input
                        type="text"
                        value={sellerAddress}
                        onChange={(e) => setSellerAddress(e.target.value)}
                        className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-white/60 uppercase text-[10px] font-bold">Description</label>
                      <textarea
                        value={sellerDesc}
                        onChange={(e) => setSellerDesc(e.target.value)}
                        rows={3}
                        className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-white/5">
                    <button
                      type="submit"
                      className="btn-gold-luxury px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider"
                    >
                      Save Property Listing
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: SELLER ENQUIRIES */}
            {activeView === 'ENQUIRIES' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif-luxury font-bold text-white uppercase tracking-wider">Buyer Enquiries ({enquiries.length})</h2>
                  <p className="text-white/60 text-2xs font-normal">Connect directly with prospective wealth investors.</p>
                </div>

                {replyEnquiryId && (
                  <form onSubmit={handleSellerEnquiryReply} className="bg-[#161924] border border-primary/20 p-5 rounded-3xl space-y-4 text-xs font-semibold text-white">
                    <h3 className="text-sm font-serif-luxury text-primary uppercase font-bold">Reply Consultation</h3>
                    <textarea
                      required
                      placeholder="Write your email/whatsapp response details..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      className="w-full bg-[#0c0d12] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setReplyEnquiryId(null)}
                        className="text-white/60 hover:text-white text-3xs uppercase tracking-wider font-extrabold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-primary text-black px-4 py-2 rounded-xl text-3xs font-extrabold uppercase tracking-wider"
                      >
                        Send Reply
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {enquiries.map(e => (
                    <div key={e.id} className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl space-y-4 text-xs font-semibold text-white">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[9px] text-primary uppercase font-bold tracking-widest block">{e.property?.projectName}</span>
                          <h4 className="font-bold text-sm text-white mt-1">{e.property?.title}</h4>
                          <p className="text-3xs text-white/50 font-normal mt-0.5">Enquiry on: {new Date(e.createdAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wider border ${
                          e.status === 'RESOLVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {e.status}
                        </span>
                      </div>

                      <div className="bg-[#0c0d12]/40 p-3 rounded-2xl border border-white/5 text-2xs text-white/70 font-normal leading-relaxed">
                        <span className="block text-3xs text-white/30 uppercase font-extrabold mb-1">{e.name} ({e.email}) says:</span>
                        {e.message || 'Requested immediate call back details.'}
                      </div>

                      <div className="flex gap-3 pt-2 font-extrabold uppercase text-[10px] tracking-wider">
                        <button
                          onClick={() => setReplyEnquiryId(e.id)}
                          className="text-primary hover:underline"
                        >
                          Send Message Reply
                        </button>
                        <a href={`tel:${e.phone}`} className="text-white/60 hover:text-white flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Call Buyer
                        </a>
                        <a 
                          href={`https://wa.me/${e.phone.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-green-400 hover:text-green-300 flex items-center gap-1"
                        >
                          <MessageCircle className="h-3 w-3" /> WhatsApp
                        </a>
                      </div>
                    </div>
                  ))}

                  {enquiries.length === 0 && (
                    <p className="text-white/40 text-center py-12">No enquiries registered yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB: SELLER SITE VISITS */}
            {activeView === 'VISITS' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif-luxury font-bold text-white uppercase tracking-wider">Site Visits Management ({bookings.length})</h2>
                  <p className="text-white/60 text-2xs font-normal">Approve, reject, or request rescheduling for guided tours.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                  
                  {/* Appointments grid */}
                  <div className="md:col-span-2 space-y-4">
                    {bookings.map(b => (
                      <div key={b.id} className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl space-y-4 text-xs font-semibold text-white">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] text-primary uppercase font-bold tracking-widest block">{b.property?.projectName}</span>
                            <h4 className="font-bold text-sm text-white mt-0.5">{b.property?.title}</h4>
                            <p className="text-3xs text-white/50 mt-0.5">Visitor: {b.buyerName} ({b.buyerEmail})</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wider border ${
                            b.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            b.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {b.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 py-2.5 border-y border-white/10 text-center font-normal text-3xs text-white/60">
                          <div>
                            <span className="block text-[8px] text-white/40 uppercase font-bold mb-0.5">Date Requested</span>
                            <span>{b.preferredDate}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-white/40 uppercase font-bold mb-0.5">Preferred Slot</span>
                            <span>{b.preferredTime}</span>
                          </div>
                        </div>

                        {b.status === 'PENDING' && (
                          <div className="flex gap-4 pt-2 font-extrabold uppercase text-[10px] tracking-wider">
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')}
                              className="text-green-400 hover:text-green-300"
                            >
                              Approve Appointment
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                              className="text-red-400 hover:text-red-300"
                            >
                              Reject Walkthrough
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {bookings.length === 0 && (
                      <p className="text-white/40 text-center py-12">No site visits scheduled.</p>
                    )}
                  </div>

                  {/* Calendar view */}
                  <div className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl space-y-4">
                    <h3 className="font-serif-luxury text-xs font-bold text-white tracking-wide uppercase border-b border-white/10 pb-2">Calendar Scheduler</h3>
                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-3xs select-none">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <span key={idx} className="text-white/40 p-1">{day}</span>
                      ))}
                      {Array.from({ length: 30 }).map((_, idx) => {
                        const dayNum = idx + 1;
                        const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                        const hasVisit = bookings.some(b => b.preferredDate === dateStr && b.status === 'CONFIRMED');
                        return (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg flex items-center justify-center relative cursor-pointer hover:bg-white/5 transition-colors ${
                              hasVisit ? 'bg-primary/20 border border-primary/40 text-primary' : 'text-white/70'
                            }`}
                          >
                            <span>{dayNum}</span>
                            {hasVisit && (
                              <span className="absolute bottom-0.5 h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SELLER ANALYTICS */}
            {activeView === 'ANALYTICS' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif-luxury font-bold text-white uppercase tracking-wider">Listings Analytics Reports</h2>
                  <p className="text-white/60 text-2xs font-normal">Check visitor impressions, views, clicks, and queries over time.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Views/Clicks Chart */}
                  <div className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl space-y-4">
                    <h3 className="font-serif-luxury text-xs font-bold uppercase tracking-wider text-primary">Monthly Traffic Analytics</h3>
                    {/* SVG Chart placeholder */}
                    <div className="h-48 w-full border border-white/5 rounded-2xl bg-black/40 flex items-end p-4 gap-3 relative">
                      {[40, 60, 80, 50, 90, 70, 95].map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                          <div className="bg-primary/80 hover:bg-primary w-full rounded-t" style={{ height: `${val * 1.2}px` }} />
                          <span className="text-[8px] text-white/50 font-mono">M{idx+1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enquiries / Bookings line chart */}
                  <div className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl space-y-4">
                    <h3 className="font-serif-luxury text-xs font-bold uppercase tracking-wider text-primary">Enquiries conversion</h3>
                    <div className="h-48 w-full border border-white/5 rounded-2xl bg-black/40 flex items-end p-4 gap-3 relative justify-around">
                      {[20, 35, 45, 30, 55, 48, 62].map((val, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-emerald-400" />
                          <div className="bg-emerald-500/20 w-1 rounded-t" style={{ height: `${val * 1.5}px` }} />
                          <span className="text-[8px] text-white/50 font-mono">W{idx+1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlight card */}
                  <div className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl md:col-span-2 flex items-center justify-between text-xs font-semibold">
                    <div className="space-y-1">
                      <span className="text-3xs uppercase tracking-widest text-primary font-bold">Top performer</span>
                      <h4 className="font-bold text-sm text-white">{sellerListings?.[0]?.title || 'Prestige Kokapet Lakefront'}</h4>
                      <p className="text-3xs text-white/50">Holds 65% of your organic leads conversion share.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-serif-luxury font-extrabold text-primary">2,410</p>
                      <span className="text-3xs text-white/40 block">Monthly Impressions</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SELLER DOCUMENTS */}
            {activeView === 'DOCUMENTS' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif-luxury font-bold text-white uppercase tracking-wider">Verified Documents Vault</h2>
                  <p className="text-white/60 text-2xs font-normal">Manage ownership registry title deeds, RERA filings, and government ID certificates.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { name: 'Gov_Identification_Card.pdf', size: '1.2 MB', date: '08/07/2026', type: 'PAN/Aadhaar Proof' },
                    { name: 'Sale_Deed_Registry_Copy.pdf', size: '15.4 MB', date: '08/07/2026', type: 'Property Ownership Deed' }
                  ].map((doc, idx) => (
                    <div key={idx} className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl flex justify-between items-center text-xs font-semibold text-white">
                      <div className="space-y-1">
                        <span className="text-[9px] text-primary uppercase font-bold tracking-widest block">{doc.type}</span>
                        <h4 className="font-bold text-sm text-white">{doc.name}</h4>
                        <p className="text-3xs text-white/40 font-normal">Uploaded on: {doc.date} • Size: {doc.size}</p>
                      </div>
                      <button 
                        onClick={() => alert(`Downloading registry copy: ${doc.name}...`)}
                        className="flex items-center gap-1.5 bg-primary text-black px-4 py-2 rounded-xl text-3xs font-extrabold uppercase tracking-wider"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROFILE & SETTINGS (Common UI) */}
            {activeView === 'PROFILE' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif-luxury font-bold text-white uppercase tracking-wider">Corporate Profile Management</h2>
                  <p className="text-white/60 text-2xs font-normal">Edit your corporate registration credentials.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="bg-[#12141d]/90 border border-white/10 p-6 rounded-3xl space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-white/60 uppercase text-[10px] font-bold">Corporate Name *</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/60 uppercase text-[10px] font-bold">Office Phone *</label>
                      <input
                        type="text"
                        required
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-white/60 uppercase text-[10px] font-bold">Corporate Email *</label>
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-white/60 uppercase text-[10px] font-bold">Office Address</label>
                      <input
                        type="text"
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-white/5">
                    <button
                      type="submit"
                      className="btn-gold-luxury px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeView === 'SETTINGS' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif-luxury font-bold text-white uppercase tracking-wider">Account Settings</h2>
                  <p className="text-white/60 text-2xs font-normal">Configure dashboard visual and notification toggles.</p>
                </div>

                <div className="bg-[#12141d]/90 border border-white/10 p-6 rounded-3xl space-y-6 text-xs font-semibold text-white/80">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">Lead Notification Email Alerts</h4>
                      <p className="text-2xs text-white/50 leading-relaxed font-normal">Receive immediate email alerts when buyer logs callback interest.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsNotify}
                      onChange={(e) => setSettingsNotify(e.target.checked)}
                      className="h-4 w-4 rounded accent-primary cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">Hide Sold Out Listings</h4>
                      <p className="text-2xs text-white/50 leading-relaxed font-normal">Automatically archive listings marked sold out.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsPrivacy}
                      onChange={(e) => setSettingsPrivacy(e.target.checked)}
                      className="h-4 w-4 rounded accent-primary cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => alert('Settings preferences saved!')}
                      className="btn-gold-luxury px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* ==========================================================
              BUYER PORTAL RENDERER
              ========================================================== */
          <div className="space-y-8">
            {activeView === 'DASHBOARD' && (
              <div className="space-y-8">
                <div className="glass-premium p-6 rounded-3xl border border-white/10 bg-[#0e1017]/85 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="space-y-2">
                    <span className="text-3xs uppercase tracking-widest text-primary font-bold">LUXURY RESIDENCE CLUB</span>
                    <h1 className="text-3xl font-serif-luxury font-bold tracking-tight text-white uppercase">Welcome back, {user?.name}</h1>
                    <p className="text-xs text-white/60 font-semibold max-w-xl leading-relaxed">
                      Manage your private architectural portfolio, schedule visit bookings, track enquiries progress, and communicate directly with sales teams.
                    </p>
                  </div>
                </div>

                {/* Metric KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Saved Homes', count: wishlist.length, icon: Heart, view: 'WISHLIST' },
                    { label: 'Compared', count: compareSelection.length, icon: Scale, view: 'COMPARE' },
                    { label: 'Visits Schedule', count: bookings.filter(b => b.status === 'CONFIRMED').length, icon: Calendar, view: 'VISITS' },
                    { label: 'Brochure Logs', count: enquiries.filter(e => e.type === 'BROCHURE').length, icon: FileDown, view: 'BROCHURES' },
                    { label: 'Chats Inboxes', count: messages.length > 0 ? 1 : 0, icon: MessageSquare, view: 'MESSAGES' }
                  ].map((kpi, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveView(kpi.view)}
                      className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl text-center space-y-1.5 hover:border-primary/40 hover:shadow-xl transition-all flex flex-col items-center"
                    >
                      <kpi.icon className="h-4.5 w-4.5 text-primary shrink-0" />
                      <span className="text-[9px] text-white/50 uppercase font-bold tracking-wider">{kpi.label}</span>
                      <p className="text-xl font-serif-luxury font-extrabold text-white">{kpi.count}</p>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                  {/* Recent Activities */}
                  <div className="md:col-span-2 bg-[#12141d]/90 border border-white/10 p-6 rounded-3xl space-y-4">
                    <h3 className="font-serif-luxury text-sm font-bold text-white tracking-wide uppercase">Recent Activity Logs</h3>
                    <div className="space-y-4 font-normal text-xs text-white/70">
                      {bookings.slice(0, 2).map((b, idx) => (
                        <div key={idx} className="flex gap-3 items-start border-l-2 border-primary/40 pl-4 py-0.5">
                          <div className="space-y-0.5">
                            <p className="text-white font-semibold">Scheduled Site Walkthrough Tour</p>
                            <p className="text-2xs text-white/50">Requested reservation date {b.preferredDate} for {b.property?.title}.</p>
                          </div>
                        </div>
                      ))}
                      {enquiries.slice(0, 2).map((e, idx) => (
                        <div key={idx} className="flex gap-3 items-start border-l-2 border-white/20 pl-4 py-0.5">
                          <div className="space-y-0.5">
                            <p className="text-white font-semibold">Enquiry Consultation Registered</p>
                            <p className="text-2xs text-white/50">Callback requested for property {e.property?.title}. Status: {e.status}.</p>
                          </div>
                        </div>
                      ))}
                      {bookings.length === 0 && enquiries.length === 0 && (
                        <p className="text-white/40">No activity logs recorded yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Profile Summary */}
                  <div className="bg-[#12141d]/90 border border-white/10 p-6 rounded-3xl space-y-4 text-xs font-semibold">
                    <h3 className="font-serif-luxury text-sm font-bold text-white tracking-wide uppercase border-b border-white/10 pb-2">Profile Card</h3>
                    <div className="space-y-3 font-normal text-white/70">
                      <p><span className="text-white/40 font-bold block text-3xs uppercase">Registered Name</span>{profileName}</p>
                      <p><span className="text-white/40 font-bold block text-3xs uppercase">Email Address</span>{profileEmail}</p>
                      <p><span className="text-white/40 font-bold block text-3xs uppercase">Primary Mobile</span>{profilePhone}</p>
                    </div>
                  </div>
                </div>

                {/* Recommended Properties */}
                <div className="space-y-4 border-t border-white/10 pt-8">
                  <h3 className="font-serif-luxury text-base font-bold text-white tracking-wide uppercase">Recommended Listings For You</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {allProperties.slice(0, 3).map((p) => (
                      <Link 
                        to={`/properties/${p.id}`} 
                        key={p.id}
                        className="group bg-[#12141d]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:border-primary/45 transition-all flex flex-col justify-between"
                      >
                        <div className="h-36 overflow-hidden relative">
                          <img src={p.images?.[0]?.url} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" alt="" />
                          <span className="absolute top-2 left-2 bg-primary text-black text-[9px] font-extrabold uppercase px-2 py-0.5 rounded">
                            {p.constructionStatus || 'Ready'}
                          </span>
                        </div>
                        <div className="p-4 space-y-2 text-xs font-semibold">
                          <h4 className="font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">{p.title}</h4>
                          <p className="text-3xs text-white/50 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> {p.address}, {p.city}</p>
                          <div className="flex justify-between items-center border-t border-white/10 pt-2 font-bold">
                            <span className="text-primary">₹{p.price.toLocaleString('en-IN')}</span>
                            <span className="text-3xs text-white/50">{p.area} sqft</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: WISHLIST */}
            {activeView === 'WISHLIST' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/10 pb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-serif-luxury font-bold text-white uppercase tracking-wider">Saved Wishlist ({wishlist.length})</h2>
                    <p className="text-white/60 text-2xs font-normal">Review and manage your curated luxury properties selections.</p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search wishlist..."
                      value={wishlistSearch}
                      onChange={(e) => setWishlistSearch(e.target.value)}
                      className="bg-[#161924] border border-white/15 rounded-xl py-2 px-3 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                    />
                    <select
                      value={wishlistFilterType}
                      onChange={(e) => setWishlistFilterType(e.target.value)}
                      className="bg-[#161924] border border-white/15 rounded-xl py-2 px-3 focus:outline-none focus:border-primary text-white text-xs select-custom font-semibold"
                    >
                      <option value="">All Types</option>
                      <option value="APARTMENT">Apartments</option>
                      <option value="VILLA">Villas</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {wishlist
                    .filter(p => p.title.toLowerCase().includes(wishlistSearch.toLowerCase()))
                    .filter(p => !wishlistFilterType || p.type === wishlistFilterType)
                    .map((p) => {
                      const isCompared = compareSelection.some(c => c.id === p.id);
                      return (
                        <div key={p.id} className="bg-[#12141d]/90 border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between text-xs font-semibold text-white">
                          <div className="h-44 relative bg-muted select-none">
                            <img src={p.images?.[0]?.url} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                            <span className="absolute top-3 left-3 bg-primary text-black px-2 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wider">
                              {p.constructionStatus || 'Ready to Move'}
                            </span>
                            
                            <button
                              onClick={() => handleRemoveWishlist(p.id)}
                              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 border border-white/10 text-red-400 hover:text-red-300"
                              title="Remove Wishlist"
                            >
                              <Heart className="h-4 w-4 fill-red-400" />
                            </button>
                          </div>

                          <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                            <div className="space-y-1">
                              <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">{p.projectName}</span>
                              <h3 className="font-bold text-sm text-white line-clamp-1">{p.title}</h3>
                              <p className="text-3xs text-white/50 flex items-center gap-1 font-semibold">
                                <MapPin className="h-3 w-3 text-primary" /> {p.address}, {p.city}
                              </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-white/10 text-center font-normal text-3xs text-white/60">
                              <div>
                                <span className="block text-[9px] text-white/40 uppercase font-bold mb-0.5">Layout</span>
                                <span>{p.bedrooms > 0 ? `${p.bedrooms} BHK` : 'Commercial'}</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-white/40 uppercase font-bold mb-0.5">Super Area</span>
                                <span>{p.area} sqft</span>
                              </div>
                              <div>
                                <span className="block text-[9px] text-white/40 uppercase font-bold mb-0.5">Rating</span>
                                <span className="text-yellow-400 font-bold">★ {p.rating}</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                              <span className="font-serif-luxury font-extrabold text-sm text-primary">₹{p.price.toLocaleString('en-IN')}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (isCompared) {
                                      setCompareSelection(prev => prev.filter(c => c.id !== p.id));
                                    } else {
                                      if (compareSelection.length >= 4) {
                                        alert('Maximum 4 properties compared side-by-side.');
                                        return;
                                      }
                                      setCompareSelection(prev => [...prev, p]);
                                    }
                                  }}
                                  className={`px-3 py-1.5 rounded-xl border text-3xs font-extrabold uppercase tracking-wider transition-colors ${
                                    isCompared ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                  }`}
                                >
                                  {isCompared ? 'Comparing' : 'Compare'}
                                </button>
                                <Link
                                  to={`/properties/${p.id}`}
                                  className="bg-primary text-black px-3.5 py-1.5 rounded-xl text-3xs font-extrabold uppercase tracking-wider hover:bg-primary/95 transition-all shadow-md"
                                >
                                  Explore
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {wishlist.length === 0 && (
                    <p className="col-span-2 text-center py-10 text-white/40">No properties in wishlist.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB: COMPARE */}
            {activeView === 'COMPARE' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-serif-luxury font-bold text-white uppercase tracking-wider">Comparison Grid ({compareSelection.length}/4)</h2>
                    <p className="text-white/60 text-2xs font-normal">Review specification attributes side-by-side.</p>
                  </div>
                  {compareSelection.length > 0 && (
                    <button onClick={() => setCompareSelection([])} className="text-xs text-primary hover:underline font-bold uppercase tracking-wider">
                      Clear All
                    </button>
                  )}
                </div>

                {compareSelection.length === 0 ? (
                  <div className="bg-[#12141d]/90 border border-white/10 p-12 text-center rounded-3xl text-white/50 space-y-2 text-xs font-semibold">
                    <p className="font-bold text-sm">No properties loaded for comparison.</p>
                    <p className="text-white/40">Save properties to your wishlist first and click "Compare" to check specs.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-white/10 rounded-3xl bg-[#12141d]/90">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          <th className="p-4 text-primary font-bold uppercase tracking-wider text-[10px] w-1/5">Attribute Checklist</th>
                          {compareSelection.map(p => (
                            <th key={p.id} className="p-4 font-bold text-white w-1/5 relative border-l border-white/10 min-w-[200px]">
                              <div className="flex justify-between items-start gap-4">
                                <span className="line-clamp-2">{p.title}</span>
                                <button 
                                  onClick={() => setCompareSelection(prev => prev.filter(c => c.id !== p.id))}
                                  className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-semibold text-white/90">
                        <tr>
                          <td className="p-4 text-[10px] text-white/40 uppercase font-bold">Image Preview</td>
                          {compareSelection.map(p => (
                            <td key={p.id} className="p-4 border-l border-white/10">
                              <img src={p.images?.[0]?.url} className="w-full h-24 object-cover rounded-2xl border border-white/10 shadow-inner" alt="" />
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-primary/2">
                          <td className="p-4 text-[10px] text-primary uppercase font-bold">Starting Price</td>
                          {compareSelection.map(p => (
                            <td key={p.id} className="p-4 border-l border-white/10 text-primary font-extrabold text-sm">
                              ₹{p.price.toLocaleString('en-IN')}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-4 text-[10px] text-white/40 uppercase font-bold">Builder</td>
                          {compareSelection.map(p => (
                            <td key={p.id} className="p-4 border-l border-white/10">{p.builderName}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-4 text-[10px] text-white/40 uppercase font-bold">Location</td>
                          {compareSelection.map(p => (
                            <td key={p.id} className="p-4 border-l border-white/10 text-2xs text-white/70">
                              {p.address}, {p.city}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-4 text-[10px] text-white/40 uppercase font-bold">Super Area</td>
                          {compareSelection.map(p => (
                            <td key={p.id} className="p-4 border-l border-white/10">{p.area} sqft</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-4 text-[10px] text-white/40 uppercase font-bold">RERA Number</td>
                          {compareSelection.map(p => (
                            <td key={p.id} className="p-4 border-l border-white/10 font-mono text-2xs text-primary">{p.reraNumber || p.rera}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: VISITS */}
            {activeView === 'VISITS' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-white/10 pb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-serif-luxury font-bold text-white uppercase tracking-wider">Site Visits</h2>
                    <p className="text-white/60 text-2xs font-normal">Track scheduled private appointments.</p>
                  </div>
                  <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-white/10 text-[10px] font-extrabold uppercase tracking-wider">
                    {['UPCOMING', 'COMPLETED', 'CANCELLED'].map(t => (
                      <button
                        key={t}
                        onClick={() => setVisitFilter(t)}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          visitFilter === t ? 'bg-primary text-black' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                  <div className="md:col-span-2 space-y-4">
                    {bookings
                      .filter(b => {
                        if (visitFilter === 'UPCOMING') return b.status === 'CONFIRMED' || b.status === 'PENDING';
                        if (visitFilter === 'COMPLETED') return b.status === 'COMPLETED';
                        return b.status === 'CANCELLED';
                      })
                      .map((b) => (
                        <div key={b.id} className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl space-y-4 text-xs font-semibold text-white">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-[9px] text-primary uppercase font-bold tracking-widest block">{b.property?.projectName}</span>
                              <h4 className="font-bold text-sm text-white mt-0.5">{b.property?.title}</h4>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wider border ${
                              b.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              b.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                              'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 text-3xs font-bold uppercase text-white/60">
                            <div>
                              <span className="block text-4xs text-white/30 uppercase mb-0.5">Visit Date</span>
                              <span className="text-white font-bold">{b.preferredDate}</span>
                            </div>
                            <div>
                              <span className="block text-4xs text-white/30 uppercase mb-0.5">Time Slot</span>
                              <span className="text-white font-bold">{b.preferredTime}</span>
                            </div>
                          </div>

                          {rescheduleVisit === b.id ? (
                            <div className="flex gap-2 items-center pt-2">
                              <input
                                type="date"
                                value={rescheduleDate}
                                onChange={(e) => setRescheduleDate(e.target.value)}
                                className="bg-[#161924] border border-white/15 rounded-xl py-2 px-3 text-white text-xs font-semibold"
                              />
                              <button onClick={() => handleReschedule(b.id)} className="bg-primary text-black px-4 py-2 rounded-xl text-3xs font-extrabold uppercase">Save</button>
                              <button onClick={() => setRescheduleVisit(null)} className="text-white/60 text-3xs uppercase">Cancel</button>
                            </div>
                          ) : (
                            visitFilter === 'UPCOMING' && (
                              <div className="flex gap-4 pt-2 font-extrabold uppercase text-[10px] tracking-wider">
                                <button onClick={() => { setRescheduleVisit(b.id); setRescheduleDate(b.preferredDate); }} className="text-primary hover:underline">Reschedule</button>
                                <button onClick={() => handleCancelVisit(b.id)} className="text-red-400 hover:text-red-300">Cancel Visit</button>
                              </div>
                            )
                          )}
                        </div>
                      ))}

                    {bookings.length === 0 && (
                      <p className="text-white/40">No appointments registered.</p>
                    )}
                  </div>

                  <div className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl">
                    <h3 className="font-serif-luxury text-xs font-bold text-white tracking-wide uppercase border-b border-white/10 pb-2 mb-2">Calendar</h3>
                    {/* Simplified Calendar rendering */}
                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-3xs text-white/70">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-white/30">{d}</span>)}
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} className="p-2 rounded-lg hover:bg-white/5">{i+1}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BROCHURES */}
            {activeView === 'BROCHURES' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif-luxury font-bold text-white uppercase tracking-wider">Downloaded Brochures</h2>
                  <p className="text-white/60 text-2xs font-normal">Re-download layouts and brochures PDF.</p>
                </div>

                <div className="space-y-4">
                  {enquiries.filter(e => e.type === 'BROCHURE').map(enq => (
                    <div key={enq.id} className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl flex justify-between items-center text-xs font-semibold text-white">
                      <div className="space-y-1">
                        <span className="text-[9px] text-primary uppercase font-bold tracking-widest block">{enq.property?.projectName}</span>
                        <h4 className="font-bold text-sm text-white">{enq.property?.title}</h4>
                      </div>
                      <button onClick={() => alert(`Downloading brochure...`)} className="flex items-center gap-1.5 bg-primary text-black px-4 py-2 rounded-xl text-3xs font-extrabold uppercase">
                        <FileDown className="h-3.5 w-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: MY ENQUIRIES */}
            {activeView === 'ENQUIRIES' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif-luxury font-bold text-white uppercase tracking-wider">Consultation Enquiries</h2>
                  <p className="text-white/60 text-2xs font-normal">Track progress of your queries.</p>
                </div>

                <div className="space-y-4">
                  {enquiries.filter(e => e.type !== 'BROCHURE').map(enq => (
                    <div key={enq.id} className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl space-y-3 text-xs font-semibold text-white">
                      <h4 className="font-bold text-sm text-white">{enq.property?.title}</h4>
                      <p className="text-2xs text-white/50 leading-relaxed font-normal">{enq.message || 'Requested callback details.'}</p>
                      <div className="flex gap-2">
                        <span className="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase">
                          Status: {enq.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: MESSAGES */}
            {activeView === 'MESSAGES' && (
              <div className="glass-premium border border-white/10 rounded-3xl overflow-hidden h-[500px] flex bg-[#12141d]/90 font-semibold text-xs text-white">
                <div className="w-1/3 border-r border-white/10 bg-black/30 flex flex-col font-bold uppercase tracking-wider text-3xs select-none">
                  <div className="p-4 border-b border-white/10"><span className="text-white text-2xs block">Channels</span></div>
                  <div className="flex-1 divide-y divide-white/5">
                    {['SALES', 'BUILDER', 'SUPPORT'].map(ch => (
                      <button key={ch} onClick={() => setActiveChatChannel(ch)} className={`w-full text-left p-4 space-y-1 block transition-colors ${activeChatChannel === ch ? 'bg-white/5 text-white' : 'text-white/50 hover:bg-white/3'}`}>
                        <span className="text-white block font-bold text-[10px]">{ch} Representative</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-grow flex flex-col justify-between min-w-0 bg-[#0e1017]/40">
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((m) => {
                      const isOwn = m.sender === user.id || m.sender === 'usr-buyer';
                      return (
                        <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] p-3.5 rounded-2xl border text-2xs leading-relaxed font-normal ${
                            isOwn ? 'bg-primary text-black border-primary font-semibold' : 'bg-white/5 text-white border-white/10'
                          }`}>
                            <p>{m.content}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Write a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-grow bg-[#161924] border border-white/15 rounded-xl py-2 px-4 text-white text-xs font-semibold"
                    />
                    <button type="submit" className="bg-primary text-black p-2.5 rounded-xl"><Send className="h-4 w-4" /></button>
                  </form>
                </div>
              </div>
            )}

            {/* PROFILE & SETTINGS (Common UI) */}
            {activeView === 'PROFILE' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif-luxury font-bold text-white uppercase tracking-wider">Profile Management</h2>
                </div>
                <form onSubmit={handleUpdateProfile} className="bg-[#12141d]/90 border border-white/10 p-6 rounded-3xl space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-white/60 uppercase text-[10px] font-bold">Registered Name *</label>
                      <input type="text" required value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 text-white text-xs font-semibold" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-white/60 uppercase text-[10px] font-bold">Mobile Phone *</label>
                      <input type="text" required value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 text-white text-xs font-semibold" />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-white/60 uppercase text-[10px] font-bold">Email Address *</label>
                      <input type="email" required value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 text-white text-xs font-semibold" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-white/5">
                    <button type="submit" className="btn-gold-luxury px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase">Save Profile</button>
                  </div>
                </form>
              </div>
            )}

            {activeView === 'SETTINGS' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif-luxury font-bold text-white uppercase tracking-wider">Account Settings</h2>
                </div>
                <div className="bg-[#12141d]/90 border border-white/10 p-6 rounded-3xl space-y-6 text-xs font-semibold text-white/80">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">SMS Notifications</h4>
                      <p className="text-2xs text-white/50 font-normal">Receive updates on construction milestones.</p>
                    </div>
                    <input type="checkbox" checked={settingsNotify} onChange={(e) => setSettingsNotify(e.target.checked)} className="h-4 w-4 accent-primary cursor-pointer" />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button onClick={() => alert('Preferences saved!')} className="btn-gold-luxury px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase">Save Settings</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      <BookVisitModal
        isOpen={showBookVisit}
        onClose={() => setShowBookVisit(false)}
        property={bookVisitProp}
        onSuccess={() => {
          alert('Private site visit scheduled successfully!');
          fetchData();
        }}
      />
    </div>
  );
}
