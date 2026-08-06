import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Plus, Home, Briefcase, Calendar, Check, X, MapPin, Trash2, DollarSign, ListOrdered } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function BuilderDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs State: properties, projects, bookings
  const [activeTab, setActiveTab] = useState('properties');

  // Modals Visibility
  const [showPropModal, setShowPropModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);

  const { register: registerProp, handleSubmit: handlePropSubmit, reset: resetPropForm } = useForm();
  const { register: registerProj, handleSubmit: handleProjSubmit, reset: resetProjForm } = useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [propRes, projRes, bookRes] = await Promise.all([
        api.get('/properties'),
        api.get('/projects/builder'),
        api.get('/bookings/builder')
      ]);
      setProperties(propRes.data.filter((p) => p.builderId === user.id));
      setProjects(projRes.data);
      setBookings(bookRes.data);
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
      await api.post('/properties', {
        ...data,
        imageUrls
      });
      setShowPropModal(false);
      resetPropForm();
      fetchData();
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
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding project');
    }
  };

  const handleBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      fetchData();
    } catch (err) {
      alert('Error updating booking status.');
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;
    try {
      await api.delete(`/properties/${id}`);
      fetchData();
    } catch (err) {
      alert('Error deleting property.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  // Calculate metrics
  const totalAssetsValue = properties.reduce((acc, curr) => acc + curr.price, 0);
  const totalSalesRevenue = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 space-y-8">
      {/* Header Banner */}
      <div className="glass-premium p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between border border-border gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold">{user?.name}</h1>
            <p className="text-2xs text-muted-foreground uppercase font-bold tracking-wider">{user?.email} • Builder ERP Portal</p>
          </div>
        </div>

        <div className="flex space-x-2 w-fit">
          <button
            onClick={() => setShowProjModal(true)}
            className="bg-secondary text-secondary-foreground flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all border border-border"
          >
            <Plus className="h-4 w-4" /> Add Project
          </button>
          <button
            onClick={() => setShowPropModal(true)}
            className="bg-primary text-primary-foreground flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover:bg-primary/95 transition-all shadow-md glow-btn"
          >
            <Plus className="h-4 w-4" /> Add Property
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
        <div className="bg-card border border-border p-5 rounded-2xl space-y-1">
          <span className="text-muted-foreground uppercase text-3xs font-extrabold tracking-wider block">Total Listed Portfolio</span>
          <span className="text-xl font-bold text-white">₹{totalAssetsValue.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl space-y-1">
          <span className="text-muted-foreground uppercase text-3xs font-extrabold tracking-wider block">Realized Booking Capital</span>
          <span className="text-xl font-bold text-primary text-glow">₹{totalSalesRevenue.toLocaleString('en-IN')}</span>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl space-y-1">
          <span className="text-muted-foreground uppercase text-3xs font-extrabold tracking-wider block">Active Listed Units</span>
          <span className="text-xl font-bold text-white">{properties.length} Units</span>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl space-y-1">
          <span className="text-muted-foreground uppercase text-3xs font-extrabold tracking-wider block">Construction Projects</span>
          <span className="text-xl font-bold text-white">{projects.length} Projects</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-border pb-px text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('properties')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'properties' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Home className="h-4 w-4" /> Properties ({properties.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'projects' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Briefcase className="h-4 w-4" /> Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'bookings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="h-4 w-4" /> Bookings ({bookings.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* Properties Panel */}
        {activeTab === 'properties' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <div key={prop.id} className="bg-card text-card-foreground border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group">
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <img
                    src={prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'}
                    alt=""
                    className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-0.5 rounded text-3xs font-bold uppercase">{prop.status}</span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">{prop.title}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {prop.address}, {prop.city}</p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-border text-xs font-semibold">
                    <span className="font-bold text-primary">₹{prop.price.toLocaleString('en-IN')}</span>
                    <button
                      onClick={() => handleDeleteProperty(prop.id)}
                      className="text-destructive hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" /> Delete Listing
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {properties.length === 0 && (
              <p className="col-span-3 text-center py-10 text-muted-foreground text-sm font-semibold">No properties listed yet.</p>
            )}
          </div>
        )}

        {/* Projects Panel */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div key={proj.id} className="bg-card text-card-foreground border border-border p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base">{proj.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {proj.location}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{proj.description}</p>
                <div className="border-t border-border pt-3 flex justify-between text-2xs text-muted-foreground font-semibold">
                  <span>Listed Properties: {proj.properties?.length || 0} Units</span>
                  <span className="text-primary uppercase tracking-wider">Under Development</span>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="col-span-2 text-center py-10 text-muted-foreground text-sm font-semibold">No projects created yet.</p>
            )}
          </div>
        )}

        {/* Bookings Panel */}
        {activeTab === 'bookings' && (
          <div className="bg-card text-card-foreground rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-2xs uppercase tracking-wider text-muted-foreground font-extrabold">
                  <tr>
                    <th className="px-6 py-4">Listed Property</th>
                    <th className="px-6 py-4">Buyer Profile</th>
                    <th className="px-6 py-4">Token Transferred</th>
                    <th className="px-6 py-4">Booking Status</th>
                    <th className="px-6 py-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {bookings.map((book) => (
                    <tr key={book.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-6 py-4 font-bold">{book.property.title}</td>
                      <td className="px-6 py-4 font-semibold">{book.buyer.name}<br /><span className="text-3xs text-muted-foreground font-semibold">{book.buyer.email}</span></td>
                      <td className="px-6 py-4 font-bold text-primary">₹{book.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded text-3xs font-extrabold tracking-wider uppercase ${
                          book.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          book.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
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
                              title="Approve booking"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleBookingStatus(book.id, 'CANCELLED')}
                              className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                              title="Reject booking"
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
                      <td colSpan={5} className="text-center py-10 text-muted-foreground font-semibold">No bookings recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showPropModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border p-6 rounded-2xl shadow-xl w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="font-bold text-base uppercase text-primary tracking-wider">Add New Property Listing</h2>
              <button onClick={() => setShowPropModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handlePropSubmit(onAddProperty)} className="space-y-3 text-2xs font-bold grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-muted-foreground uppercase">Property Title</label>
                <input type="text" {...registerProp('title')} required className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:outline-none text-xs text-white" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-muted-foreground uppercase">Description</label>
                <textarea {...registerProp('description')} required rows={2} className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:outline-none text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase">Price (₹)</label>
                <input type="number" {...registerProp('price')} required className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:outline-none text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase">Area (sqft)</label>
                <input type="number" {...registerProp('area')} required className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:outline-none text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase">Type</label>
                <select {...registerProp('type')} className="w-full bg-background border border-border rounded-xl py-3 px-3 focus:outline-none text-xs text-white select-custom">
                  <option value="APARTMENT">Apartment</option>
                  <option value="VILLA">Villa</option>
                  <option value="HOUSE">House</option>
                  <option value="LAND">Land</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase">Project</label>
                <select {...registerProp('projectId')} className="w-full bg-background border border-border rounded-xl py-3 px-3 focus:outline-none text-xs text-white select-custom">
                  <option value="">None (Independent)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase">Bedrooms</label>
                <input type="number" {...registerProp('bedrooms')} required className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:outline-none text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase">Bathrooms</label>
                <input type="number" {...registerProp('bathrooms')} required className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:outline-none text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase">City</label>
                <input type="text" {...registerProp('city')} required className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:outline-none text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase">Address</label>
                <input type="text" {...registerProp('address')} required className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:outline-none text-xs text-white" />
              </div>
              <div className="col-span-2 pt-2">
                <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold uppercase">List Property</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showProjModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="font-bold text-base uppercase text-primary tracking-wider">Add New Construction Project</h2>
              <button onClick={() => setShowProjModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleProjSubmit(onAddProject)} className="space-y-3 text-2xs font-bold">
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase">Project Name</label>
                <input type="text" {...registerProj('name')} required className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:outline-none text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase">Location</label>
                <input type="text" {...registerProj('location')} required className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:outline-none text-xs text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground uppercase">Description</label>
                <textarea {...registerProj('description')} required rows={3} className="w-full bg-background border border-border rounded-xl py-2.5 px-3 focus:outline-none text-xs text-white" />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold uppercase">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
