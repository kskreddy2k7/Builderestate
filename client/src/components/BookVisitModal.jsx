import React, { useState } from 'react';
import api from '../services/api';
import { X, Calendar, Clock, User, Phone, Mail, Users, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookVisitModal({ isOpen, onClose, property, onSuccess }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [visitors, setVisitors] = useState(1);
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !property) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!date || !name || !phone || !email) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/bookings', {
        propertyId: property.id,
        amount: property.price * 0.1, // 10% mock reservation hold, though visits are free, we store it
        preferredDate: date,
        preferredTime: time,
        visitorName: name,
        phone,
        email,
        visitorsCount: parseInt(visitors),
        notes
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        resetForm();
      }, 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error booking site visit.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDate('');
    setTime('10:00 AM');
    setName('');
    setPhone('');
    setEmail('');
    setVisitors(1);
    setNotes('');
    setSuccess(false);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-[#0e1017] border border-primary/30 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-[0_20px_50px_rgba(212,175,55,0.15)] max-h-[90vh] overflow-y-auto"
      >
        {/* Glow Effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={() => { onClose(); resetForm(); }}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
            <div className="h-16 w-16 bg-primary/20 text-primary border border-primary/50 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif-luxury text-xl font-bold text-white tracking-wide">SITE VISIT SCHEDULED</h3>
              <p className="text-xs text-primary font-bold tracking-widest uppercase">CONFIRMATION REGISTERED</p>
            </div>
            
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl w-full text-xs text-white/80 space-y-2.5 text-left font-semibold">
              <p className="text-[10px] text-primary uppercase font-bold tracking-wider">Simulated Email Notification</p>
              <div className="border-t border-white/10 pt-2 space-y-1 text-2xs">
                <p><span className="text-white/40">To:</span> {email}</p>
                <p><span className="text-white/40">Subject:</span> BuildEstate Site Visit Confirmation - {property.projectName}</p>
                <p className="pt-2 text-white font-normal leading-relaxed">
                  Dear {name}, your private guided tour for <strong>{property.title}</strong> has been confirmed for <strong>{date}</strong> at <strong>{time}</strong>. An executive sales representative will connect with you at <strong>{phone}</strong> shortly.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 font-semibold text-xs">
            <div className="space-y-1.5 border-b border-white/10 pb-3">
              <span className="text-3xs uppercase tracking-widest text-primary font-bold">PRIVATE RESERVATION</span>
              <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">Book a Site Visit</h2>
              <p className="text-white/60 text-2xs font-normal">Schedule an immersive, guided walkthrough of {property.projectName} in {property.city}.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-semibold">
                {error}
              </div>
            )}

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Preferred Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                />
              </div>

              {/* Time Slots */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Preferred Time Slot *
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs select-custom font-semibold shadow-inner"
                >
                  <option value="10:00 AM">Morning (10:00 AM – 12:00 PM)</option>
                  <option value="01:30 PM">Afternoon (01:30 PM – 03:30 PM)</option>
                  <option value="04:30 PM">Evening (04:30 PM – 06:30 PM)</option>
                </select>
              </div>

              {/* Visitor Name */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rohan Sharma"
                  className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                />
              </div>

              {/* Visitors Count */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" /> Number of Visitors
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={visitors}
                  onChange={(e) => setVisitors(e.target.value)}
                  className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary" /> Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +919876543210"
                  className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" /> Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rohan@gmail.com"
                  className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-primary font-bold flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" /> Special Notes / Requests
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Request wheelchair access / interested in floor plans."
                rows="2"
                className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold-luxury py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Registering visit...' : 'Confirm Schedule'}</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
