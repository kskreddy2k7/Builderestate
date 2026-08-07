import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Building, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function ForgotPassword() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: data.email });
      setSuccess(res.data.message || 'Password reset link sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-radial-luxury pt-32 pb-16 flex items-center justify-center px-4 font-sans text-white relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-premium p-8 rounded-3xl border border-white/10 bg-[#0e1017]/85 space-y-6 shadow-2xl relative"
      >
        <div className="text-center space-y-2 select-none">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3 shadow-lg">
            <Building className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-serif-luxury font-bold tracking-wide uppercase text-white flex items-center justify-center gap-1.5">
            Forgot Password <Sparkles className="h-4.5 w-4.5 text-primary shrink-0" />
          </h2>
          <p className="text-xs text-white/50 leading-relaxed font-semibold">
            Enter your email below. We will send you a luxury invitation link to update your security credentials.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
            <span>⚠️ {error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-xs font-semibold">
              ✓ {success}
            </div>
            <Link 
              to="/login"
              className="w-full bg-primary text-black flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold shadow-md hover:bg-primary/95 transition-all text-xs uppercase tracking-wider"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-white/60 uppercase flex items-center gap-1 text-2xs font-extrabold tracking-wider">
                <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your registered email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
                className="w-full bg-[#161924] border border-white/15 rounded-xl py-3.5 px-4 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
              />
              {errors.email && <p className="text-red-400 text-2xs font-semibold">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold shadow-md hover:bg-primary/95 transition-all disabled:opacity-55 text-xs uppercase tracking-wider"
            >
              {loading ? 'Sending link...' : 'Send Reset Invitation'}
            </button>

            <div className="text-center pt-2">
              <Link 
                to="/login"
                className="inline-flex items-center gap-1 text-white/50 hover:text-white text-3xs font-extrabold uppercase tracking-widest transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Log In
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
