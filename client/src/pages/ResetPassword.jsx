import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Sparkles, Building, Key, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || 'buyer@buildestate.in';
  const navigate = useNavigate();

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { email: emailParam }
  });

  const newPassword = watch('password');

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { 
        email: data.email, 
        password: data.password 
      });
      setSuccess(res.data.message || 'Password updated successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password.');
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
            Reset Password <Sparkles className="h-4.5 w-4.5 text-primary shrink-0" />
          </h2>
          <p className="text-xs text-white/50 leading-relaxed font-semibold">
            Define your new account credentials. Ensure it is distinct and secure.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold">
            <span>⚠️ {error}</span>
          </div>
        )}

        {success ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-xs font-semibold text-center">
            ✓ {success} Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-white/60 uppercase flex items-center gap-1 text-2xs font-extrabold tracking-wider">
                <Key className="h-3.5 w-3.5 text-primary" /> Target Email
              </label>
              <input
                type="email"
                required
                readOnly
                {...register('email')}
                className="w-full bg-[#161924]/60 border border-white/10 rounded-xl py-3.5 px-4 focus:outline-none text-white/60 text-xs font-semibold shadow-inner cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-white/60 uppercase flex items-center gap-1 text-2xs font-extrabold tracking-wider">
                <Lock className="h-3.5 w-3.5 text-primary" /> New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className="w-full bg-[#161924] border border-white/15 rounded-xl py-3.5 pl-4 pr-10 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-2xs font-semibold">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-white/60 uppercase flex items-center gap-1 text-2xs font-extrabold tracking-wider">
                <Lock className="h-3.5 w-3.5 text-primary" /> Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword', { 
                    required: 'Please confirm password',
                    validate: v => v === newPassword || 'Passwords do not match'
                  })}
                  className="w-full bg-[#161924] border border-white/15 rounded-xl py-3.5 pl-4 pr-10 focus:outline-none focus:border-primary text-white text-xs font-semibold shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-2xs font-semibold">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold shadow-md hover:bg-primary/95 transition-all disabled:opacity-55 text-xs uppercase tracking-wider"
            >
              {loading ? 'Resetting password...' : 'Save New Credentials'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
