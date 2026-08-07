import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Phone, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthGateModal({ isOpen, onClose, onSuccess, title = "Unlock Premium Features" }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('OPTIONS'); // OPTIONS, LOGIN, REGISTER
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('BUYER'); // BUYER, BUILDER
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        resetForm();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Use buyer@buildestate.in / Password@123');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !phone || !password) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, phone, password, role);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        resetForm();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMode('OPTIONS');
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setRole('BUYER');
    setError('');
    setSuccess(false);
  };

  const handleGoogleContinue = () => {
    setLoading(true);
    setError('');
    // Simulate Google Login
    setTimeout(async () => {
      try {
        // Auto sign in as buyer for mock convenience
        await login('buyer@buildestate.in', 'Password@123');
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
          resetForm();
        }, 1000);
      } catch (err) {
        setError('Google authentication failed.');
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-[#0e1017] border border-primary/30 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-[0_20px_50px_rgba(212,175,55,0.15)] overflow-hidden"
      >
        {/* Glow Effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Close Button */}
        <button 
          onClick={() => { onClose(); resetForm(); }}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
            <div className="h-16 w-16 bg-primary/20 text-primary border border-primary/50 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 animate-bounce" />
            </div>
            <h3 className="font-serif-luxury text-xl font-bold text-white tracking-wide">WELCOME TO BUILDESTATE</h3>
            <p className="text-xs text-primary font-bold tracking-widest uppercase">UNLOCKING PLATFORM...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">{title}</h2>
              <p className="text-xs text-white/60">Create your free BuildEstate account to unlock premium actions and listings.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            {mode === 'OPTIONS' && (
              <div className="space-y-4">
                <button
                  onClick={handleGoogleContinue}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-wider"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.822-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.636 0 3.106.626 4.237 1.65l3.052-3.052C19.387 2.72 16.037 1.5 12.24 1.5 6.42 1.5 1.7 6.22 1.7 12s4.72 10.5 10.54 10.5c6.077 0 10.54-4.277 10.54-10.5 0-.71-.082-1.378-.24-2.015H12.24z"/>
                  </svg>
                  <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
                </button>

                <button
                  onClick={() => setMode('LOGIN')}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-primary text-black font-extrabold hover:bg-primary/90 transition-all text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
                >
                  <Mail className="h-4 w-4" />
                  <span>Continue with Email</span>
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/10" />
                  <span className="flex-shrink mx-4 text-white/40 text-3xs font-bold uppercase tracking-widest">Or</span>
                  <div className="flex-grow border-t border-white/10" />
                </div>

                <div className="text-center text-xs">
                  <span className="text-white/60">New to BuildEstate? </span>
                  <button 
                    onClick={() => setMode('REGISTER')}
                    className="text-primary font-bold hover:underline tracking-wide uppercase text-3xs"
                  >
                    Register Account
                  </button>
                </div>
              </div>
            )}

            {mode === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-primary font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. buyer@buildestate.in"
                    className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-primary font-bold">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gold-luxury py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-xl flex items-center justify-center gap-2"
                >
                  {loading ? 'Logging in...' : 'Sign In'}
                </button>

                <div className="flex justify-between items-center text-3xs uppercase tracking-wider font-extrabold pt-2">
                  <button type="button" onClick={() => setMode('OPTIONS')} className="text-white/60 hover:text-white">← Back</button>
                  <button type="button" onClick={() => setMode('REGISTER')} className="text-primary hover:underline">Create Account →</button>
                </div>
              </form>
            )}

            {mode === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-primary font-bold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-primary font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rohan@gmail.com"
                    className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-primary font-bold">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +919876543210"
                    className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-primary font-bold">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#161924] border border-white/15 rounded-xl py-2.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-primary font-bold">I want to</label>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setRole('BUYER')}
                      className={`py-2 px-3 rounded-xl border text-3xs font-extrabold uppercase tracking-wider transition-all ${
                        role === 'BUYER' ? 'bg-primary text-black border-primary' : 'bg-[#161924] text-white/70 border-white/10'
                      }`}
                    >
                      Buy / Rent
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('BUILDER')}
                      className={`py-2 px-3 rounded-xl border text-3xs font-extrabold uppercase tracking-wider transition-all ${
                        role === 'BUILDER' ? 'bg-primary text-black border-primary' : 'bg-[#161924] text-white/70 border-white/10'
                      }`}
                    >
                      List Property
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-gold-luxury py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? 'Creating...' : 'Register'}
                </button>

                <div className="flex justify-between items-center text-3xs uppercase tracking-wider font-extrabold pt-2">
                  <button type="button" onClick={() => setMode('OPTIONS')} className="text-white/60 hover:text-white">← Back</button>
                  <button type="button" onClick={() => setMode('LOGIN')} className="text-primary hover:underline">Log In →</button>
                </div>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
