import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Home, Briefcase, Calendar, Check, X, MapPin, 
  Trash2, DollarSign, ListOrdered, BarChart3, MessageSquare, 
  ShieldCheck, Eye, FileDown, RefreshCw, Send, CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function BuilderDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs State: properties, enquiries, bookings, analytics, projects
  const [activeTab, setActiveTab] = useState('properties');

  // Modals Visibility
  const [showPropModal, setShowPropModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);

  const { register: registerProp, handleSubmit: handlePropSubmit, reset: resetPropForm } = useForm();
  const { register: registerProj, handleSubmit: handleProjSubmit, reset: resetProjForm } = useForm();

  const fetchData = async () => {
    try {
      const [propRes, projRes, bookRes, enqRes] = await Promise.all([
        api.get('/properties'),
        api.get('/projects/builder'),
        api.get('/bookings/builder'),
        api.get('/enquiries')
      ]);
      setProperties(propRes.data.filter((p) => p.builderId === user.id));
      setProjects(projRes.data);
      setBookings(bookRes.data);
      setEnquiries(enqRes.data || []);
    } catch (err) {
      console.error('Error fetching builder dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const onAddProperty = async (data) => {
    try {
      const imageUrls = [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'
      ];
      
      const parsedData = {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        area: parseFloat(data.area),
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseInt(data.bathrooms),
        city: data.city,
        address: data.address,
        type: data.type,
        projectId: data.projectId || null,
        constructionStatus: data.constructionStatus,
        possessionDate: data.possessionDate,
        reraNumber: data.reraNumber,
        nearby: {
          metro: data.metro || 'Metro Link - 1.2km',
          school: data.school || 'DPS School - 2km',
          hospital: data.hospital || 'Multi-Speciality Care - 1.5km',
          airport: data.airport || 'International Terminal - 25km'
        }
      };

      await api.post('/properties', parsedData);
      setShowPropModal(false);
      resetPropForm();
      fetchData();
      alert('Listing created successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding property');
    }
  };

  const onAddProject = async (data) => {
    try {
      await api.post('/projects', data);
      setShowProjModal(false);
      resetProjForm();
      fetchData();
      alert('Project township logged!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding project');
    }
  };

  const handleBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      fetchData();
      alert(`Site visit request status updated to ${status}`);
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleEnquiryStatus = async (id, status) => {
    try {
      await api.put(`/enquiries/${id}/status`, { status });
      fetchData();
      alert(`Callback status updated to ${status}`);
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;
    try {
      await api.delete(`/properties/${id}`);
      fetchData();
      alert('Listing deleted.');
    } catch (err) {
      alert('Error deleting property.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  // Analytics helper metrics
  const totalVisits = properties.reduce((sum, p) => sum + (p.visitsCount || 0), 0);
  const totalEnquiries = enquiries.length;
  const totalBrochures = properties.reduce((sum, p) => sum + (p.downloadsCount || 0), 0);
  const totalValuation = properties.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 space-y-8 text-white font-sans">
      
      {/* Header Profile Info */}
      <div className="glass-premium p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between border border-white/10 gap-4 bg-[#0e1017]/85 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border border-primary/20 shrink-0 font-serif-luxury">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">{user?.name}</h1>
            <p className="text-2xs text-white/50 uppercase font-bold tracking-wider">{user?.email} • Verified Developer Portal</p>
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
          <span className="bg-primary/15 text-primary border border-primary/25 text-3xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full shrink-0">
            Gold Class Builder
          </span>
        </div>
      </div>

      {/* Tabs navigation panel */}
      <div className="flex space-x-4 border-b border-white/15 pb-px text-xs font-bold uppercase tracking-widest overflow-x-auto select-none">
        {[
          { id: 'properties', label: `My Listings (${properties.length})` },
          { id: 'enquiries', label: `Direct Enquiries (${enquiries.length})` },
          { id: 'bookings', label: `Site Visits (${bookings.length})` },
          { id: 'analytics', label: 'Conversion Analytics' },
          { id: 'projects', label: `Townships (${projects.length})` }
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

      {/* Main Tab Render Grid */}
      <div className="min-h-[300px]">
        
        {/* 1. PROPERTIES LISTINGS PANEL */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-serif-luxury font-bold text-white uppercase tracking-wider">Properties Directory</h2>
              <button
                onClick={() => setShowPropModal(true)}
                className="bg-primary text-black px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 hover:bg-primary/95 transition-all shadow-lg shadow-primary/10"
              >
                <Plus className="h-4.5 w-4.5 stroke-[3]" /> Add New Listing
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-semibold text-xs text-white">
              {properties.map((prop) => (
                <div key={prop.id} className="bg-[#12141d]/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
                  <div className="relative h-44 bg-muted">
                    <img
                      src={prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                    <span className="absolute top-3 left-3 bg-primary text-black px-2 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wider">
                      {prop.constructionStatus || 'Under Construction'}
                    </span>
                  </div>

                  <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-primary uppercase font-bold tracking-widest block">{prop.projectName}</span>
                      <h3 className="font-bold text-base line-clamp-1 text-white mt-0.5">{prop.title}</h3>
                      <p className="text-2xs text-white/50 flex items-center gap-1 mt-1 font-semibold">
                        <MapPin className="h-3 w-3 text-primary" /> {prop.address}, {prop.city}
                      </p>
                    </div>

                    {/* Visitor Metrics grid */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 text-center font-normal">
                      <div>
                        <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-0.5">Visits Request</span>
                        <span className="text-white text-xs font-bold font-mono">{prop.visitsCount || 0}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-0.5">Callback Lead</span>
                        <span className="text-white text-xs font-bold font-mono">{prop.enquiriesCount || 0}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-white/40 uppercase font-bold tracking-wider mb-0.5">Brochure Dn</span>
                        <span className="text-white text-xs font-bold font-mono">{prop.downloadsCount || 0}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="font-serif-luxury font-extrabold text-sm text-primary">₹{prop.price.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => handleDeleteProperty(prop.id)}
                        className="text-red-400 hover:text-red-300 flex items-center gap-1 font-bold text-3xs uppercase tracking-wider"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Listing
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {properties.length === 0 && (
                <p className="col-span-3 text-center py-20 text-white/40">No premium properties listed yet.</p>
              )}
            </div>
          </div>
        )}

        {/* 2. ENQUIRIES PANEL */}
        {activeTab === 'enquiries' && (
          <div className="bg-[#12141d]/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto text-xs text-white">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-primary font-bold border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">Listing Unit</th>
                    <th className="px-6 py-4">Buyer profile</th>
                    <th className="px-6 py-4">Enquiry Mode</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold text-white/80">
                  {enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 font-bold max-w-[200px] truncate">{enq.property?.title}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="text-white font-bold">{enq.name}</p>
                          <p className="text-3xs text-white/50">{enq.email} • {enq.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-3xs text-white/70 font-mono">
                          {enq.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-3xs font-extrabold tracking-wider uppercase border ${
                          enq.status === 'RESOLVED' || enq.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {enq.status === 'PENDING' && (
                          <button
                            onClick={() => handleEnquiryStatus(enq.id, 'RESOLVED')}
                            className="p-1.5 bg-primary hover:bg-primary/95 text-black rounded-lg transition-colors font-extrabold text-[10px] uppercase tracking-wider"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {enquiries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-20 text-white/40">No lead inquiries logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. SITE VISITS TABLE PANEL */}
        {activeTab === 'bookings' && (
          <div className="bg-[#12141d]/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto text-xs text-white">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-primary font-bold border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">Target Unit</th>
                    <th className="px-6 py-4">Visitor details</th>
                    <th className="px-6 py-4">Schedule Slot</th>
                    <th className="px-6 py-4">Visitors</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold text-white/80">
                  {bookings.map((book) => (
                    <tr key={book.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 font-bold max-w-[200px] truncate">{book.property?.title}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="text-white font-bold">{book.visitorName}</p>
                          <p className="text-3xs text-white/50">{book.email} • {book.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-white/90">
                        {book.preferredDate}<br />
                        <span className="text-3xs text-white/50 font-normal">{book.preferredTime}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-mono">{book.visitorsCount || 1}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-3xs font-extrabold tracking-wider uppercase border ${
                          book.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          book.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {book.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {book.status === 'PENDING' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleBookingStatus(book.id, 'CONFIRMED')}
                              className="p-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                              title="Confirm visit slot"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleBookingStatus(book.id, 'CANCELLED')}
                              className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                              title="Reject visit slot"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-20 text-white/40">No visits or unit bookings recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. CONVERSION ANALYTICS PANEL */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 font-semibold text-xs text-white">
            
            {/* Metric KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl text-center space-y-1">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Active Listings</span>
                <p className="text-2xl font-serif-luxury font-extrabold text-primary">{properties.length}</p>
              </div>
              <div className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl text-center space-y-1">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Callback Requests</span>
                <p className="text-2xl font-serif-luxury font-extrabold text-primary">{totalEnquiries}</p>
              </div>
              <div className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl text-center space-y-1">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Site Visits Booked</span>
                <p className="text-2xl font-serif-luxury font-extrabold text-primary">{totalVisits}</p>
              </div>
              <div className="bg-[#12141d]/90 border border-white/10 p-5 rounded-3xl text-center space-y-1">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Brochure Downloads</span>
                <p className="text-2xl font-serif-luxury font-extrabold text-primary">{totalBrochures}</p>
              </div>
            </div>

            {/* Custom chart progress bars */}
            <div className="bg-[#12141d]/90 border border-white/10 p-6 rounded-3xl space-y-6">
              <h3 className="font-serif-luxury text-base font-bold text-white tracking-wide uppercase">Listings Conversion & Impressions</h3>
              
              <div className="space-y-4">
                {properties.map((p) => {
                  const maxVal = Math.max(...properties.map(pr => pr.visitsCount || 1), 10);
                  const widthPercent = Math.min(100, Math.max(5, ((p.visitsCount || 0) / maxVal) * 100));
                  return (
                    <div key={p.id} className="space-y-1.5">
                      <div className="flex justify-between text-2xs text-white/70">
                        <span className="font-bold text-white">{p.title}</span>
                        <span>{p.visitsCount || 0} visits</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_#d4af37]"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {properties.length === 0 && (
                  <p className="text-white/40 text-center py-6">No data logs found.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. TOWNSHIPS PANEL */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-serif-luxury font-bold text-white uppercase tracking-wider">Townships Directory</h2>
              <button
                onClick={() => setShowProjModal(true)}
                className="bg-primary text-black px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 hover:bg-primary/95 transition-all"
              >
                <Plus className="h-4.5 w-4.5 stroke-[3]" /> Add New Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-semibold text-xs text-white">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-[#12141d]/90 border border-white/10 p-6 rounded-3xl space-y-4 shadow-2xl flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-serif-luxury text-base font-bold text-white uppercase tracking-wide">{proj.name}</h3>
                    <p className="text-3xs text-white/50 flex items-center gap-1"><MapPin className="h-3 w-3 text-primary shrink-0" /> {proj.location}</p>
                    <p className="text-2xs text-white/50 leading-relaxed font-normal pt-1">{proj.description}</p>
                  </div>

                  <div className="border-t border-white/10 pt-3 flex justify-between text-3xs text-white/60 font-bold uppercase tracking-wider">
                    <span>Active listings: {properties.filter(p => p.projectId === proj.id).length} Units</span>
                    <span className="text-primary font-extrabold">Under Development</span>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="col-span-2 text-center py-20 text-white/40">No projects registered yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      <AnimatePresence>
        {showPropModal && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0e1017] border border-primary/30 p-6 sm:p-8 rounded-3xl w-full max-w-2xl space-y-5 relative shadow-[0_20px_50px_rgba(212,175,55,0.15)] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h2 className="font-serif-luxury text-base font-bold uppercase text-primary tracking-wider">Add New Property Listing</h2>
                <button onClick={() => setShowPropModal(false)} className="p-1 rounded-lg hover:bg-white/5 text-white/50 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handlePropSubmit(onAddProperty)} className="space-y-4 text-xs font-bold grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">Property Title *</label>
                  <input type="text" {...registerProp('title')} required placeholder="e.g. DAMAC Luxury Penthouse Suite" className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner" />
                </div>

                {/* Description */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">Detailed Description *</label>
                  <textarea {...registerProp('description')} required rows={3} placeholder="Describe layout configurations, views, materials, structural highlights..." className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner resize-none" />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">Price (₹) *</label>
                  <input type="number" {...registerProp('price')} required placeholder="e.g. 35000000" className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner" />
                </div>

                {/* Area */}
                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">Super Area (sq.ft) *</label>
                  <input type="number" {...registerProp('area')} required placeholder="e.g. 3200" className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner" />
                </div>

                {/* Bedrooms */}
                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">Bedrooms Count *</label>
                  <input type="number" {...registerProp('bedrooms')} required placeholder="e.g. 3" className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner" />
                </div>

                {/* Bathrooms */}
                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">Bathrooms Count *</label>
                  <input type="number" {...registerProp('bathrooms')} required placeholder="e.g. 4" className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner" />
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">Layout Classification *</label>
                  <select {...registerProp('type')} className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-3 focus:outline-none focus:border-primary text-white text-xs select-custom font-semibold shadow-inner">
                    <option value="APARTMENT">Premium Apartment</option>
                    <option value="VILLA">Sky Villa / Penthouse</option>
                  </select>
                </div>

                {/* Project Township */}
                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">Associated Township *</label>
                  <select {...registerProp('projectId')} className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-3 focus:outline-none focus:border-primary text-white text-xs select-custom font-semibold shadow-inner">
                    <option value="">Independent Layout</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Construction Status */}
                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">Construction Stage *</label>
                  <select {...registerProp('constructionStatus')} className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-3 focus:outline-none focus:border-primary text-white text-xs select-custom font-semibold shadow-inner">
                    <option value="Under Construction">Under Construction</option>
                    <option value="Ready to Move">Ready to Move</option>
                    <option value="New Launch">New Launch</option>
                  </select>
                </div>

                {/* Possession Date */}
                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">Possession Handover Date *</label>
                  <input type="text" {...registerProp('possessionDate')} required placeholder="e.g. Dec 2027 or Ready" className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner" />
                </div>

                {/* RERA */}
                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">RERA Registration Code *</label>
                  <input type="text" {...registerProp('reraNumber')} required placeholder="e.g. RERA-IND-921820" className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner" />
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">Indian Metro City *</label>
                  <input type="text" {...registerProp('city')} required placeholder="e.g. Hyderabad" className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner" />
                </div>

                {/* Address */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">Site Street Address *</label>
                  <input type="text" {...registerProp('address')} required placeholder="e.g. 12, Gold Avenue, Gachibowli" className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner" />
                </div>

                {/* Connectivity inputs */}
                <div className="sm:col-span-2 border-t border-white/10 pt-3 space-y-3">
                  <span className="text-3xs uppercase tracking-widest text-primary font-bold block">Connectivity Landmarks (Distances)</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-white/40 text-3xs font-bold uppercase tracking-wider">Metro Station</label>
                      <input type="text" {...registerProp('metro')} placeholder="e.g. Kokapet Metro - 500m" className="w-full bg-[#161924] border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-primary text-white text-2xs font-semibold shadow-inner" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/40 text-3xs font-bold uppercase tracking-wider">Schools</label>
                      <input type="text" {...registerProp('school')} placeholder="e.g. DPS International - 1.2km" className="w-full bg-[#161924] border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-primary text-white text-2xs font-semibold shadow-inner" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/40 text-3xs font-bold uppercase tracking-wider">Hospital</label>
                      <input type="text" {...registerProp('hospital')} placeholder="e.g. Apollo Hospital - 2.5km" className="w-full bg-[#161924] border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-primary text-white text-2xs font-semibold shadow-inner" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/40 text-3xs font-bold uppercase tracking-wider">Airport</label>
                      <input type="text" {...registerProp('airport')} placeholder="e.g. Shamshabad Airport - 25km" className="w-full bg-[#161924] border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-primary text-white text-2xs font-semibold shadow-inner" />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 pt-4">
                  <button type="submit" className="w-full btn-gold-luxury py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-xl flex items-center justify-center gap-2">List Property</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Project Modal */}
      <AnimatePresence>
        {showProjModal && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0e1017] border border-primary/30 p-6 sm:p-8 rounded-3xl w-full max-w-md space-y-4 relative shadow-[0_20px_50px_rgba(212,175,55,0.15)]"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h2 className="font-serif-luxury text-base font-bold uppercase text-primary tracking-wider">Create Township Project</h2>
                <button onClick={() => setShowProjModal(false)} className="p-1 rounded-lg hover:bg-white/5 text-white/50 hover:text-white"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleProjSubmit(onAddProject)} className="space-y-4 text-xs font-bold">
                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">Project Township Name *</label>
                  <input type="text" {...registerProj('name')} required placeholder="e.g. Prestige Lakefront Enclave" className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">Location / City *</label>
                  <input type="text" {...registerProj('location')} required placeholder="e.g. Kokapet, Hyderabad" className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="text-white/60 uppercase text-3xs tracking-wider">Project Narrative *</label>
                  <textarea {...registerProj('description')} required rows={3} placeholder="Describe the masterplan, total area, green zones, clubhouses..." className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold resize-none" />
                </div>
                
                <div className="pt-4">
                  <button type="submit" className="w-full btn-gold-luxury py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-xl flex items-center justify-center gap-2">Create Township</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
