import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, AlertCircle, Building, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 pt-32 pb-16 relative overflow-hidden bg-background">
      {/* Background Aurora Elements */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 text-primary font-extrabold text-2xl tracking-tight justify-center">
            <Building className="h-7 w-7 text-glow" />
            <span className="text-white">BuildEstate</span>
          </Link>
          <p className="text-xs text-muted-foreground">Log in to manage bookings and track milestones</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-premium p-8 rounded-3xl shadow-xl space-y-6 text-xs font-semibold"
        >
          {error && (
            <div className="bg-destructive/15 text-destructive p-3.5 rounded-xl font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase flex items-center gap-1 text-2xs font-extrabold">
                <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. buyer@buildestate.in"
                {...register('email', { required: 'Email is required' })}
                className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 px-3.5 focus:ring-1 focus:ring-primary focus:outline-none transition-all text-white placeholder:text-muted-foreground/60 text-xs"
              />
              {errors.email && <p className="text-destructive text-2xs font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-muted-foreground uppercase flex items-center gap-1 text-2xs font-extrabold">
                <Key className="h-3.5 w-3.5 text-primary" /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                  className="w-full bg-[#161924] border border-white/15 rounded-xl py-3 pl-3.5 pr-10 focus:ring-1 focus:ring-primary focus:outline-none transition-all text-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-2xs font-medium">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold shadow-md hover:bg-primary/90 transition-all disabled:opacity-55 mt-2 glow-btn text-xs uppercase"
            >
              <LogIn className="h-4 w-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="border-t border-border pt-4 text-center">
            <p className="text-2xs text-muted-foreground">
              New to BuildEstate?{' '}
              <Link to="/register" className="font-bold text-primary hover:underline">
                Create buyer/builder account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
