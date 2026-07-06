import React, { useState, ChangeEvent, FormEvent } from 'react';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { Lock, Mail, Loader2, ArrowLeft, ShieldAlert, Cpu } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onReturn: () => void;
}

export default function AdminLogin({ onLoginSuccess, onReturn }: AdminLoginProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const user = userCredential.user;
      
      // Configure administrator email check
      const adminEmail = 'crazyplayz61@gmail.com';
      
      if (!user.email || user.email.toLowerCase() !== adminEmail.toLowerCase()) {
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
        setError('Unauthorized administrator.');
        setIsSubmitting(false);
        return;
      }

      onLoginSuccess();
    } catch (err) {
      console.error('[Admin Login Error]', err);
      setError('Invalid administrator credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 flex justify-center items-center px-4 sm:px-6 lg:px-8" id="admin-login-container">
      <div className="w-full max-w-md">
        
        {/* Back Link */}
        <button
          onClick={onReturn}
          className="mb-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-400 hover:text-white transition-all cursor-pointer"
          id="admin-login-back-btn"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Return to Portfolio
        </button>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#121212] p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md"
          id="admin-login-card"
        >
          {/* Obsidian glowing purple/magenta accent line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#a78bfa] via-[#c084fc] to-[#e879f9]" />

          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] text-[#a78bfa] mb-4 mx-auto sm:mx-0">
              <Cpu className="h-5 w-5" />
            </div>
            <h1 className="font-mono text-2xl font-extrabold tracking-tight text-white uppercase" id="admin-login-title">
              ADMIN PORTAL
            </h1>
            <p className="mt-2 font-sans text-xs text-slate-400" id="admin-login-subtitle">
              Restricted access. Authorized administrators only.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3 font-sans text-xs text-red-400 animate-in fade-in"
              id="admin-login-error"
            >
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-500" />
              <div>
                <span className="font-bold block uppercase font-mono tracking-wider text-[10px] mb-0.5">Access Denied</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            
            {/* Email Field */}
            <div>
              <label htmlFor="admin-email" className="block font-mono text-[10px] uppercase font-bold tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  id="admin-email"
                  name="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="admin@domain.com"
                  className="w-full bg-[#0a0a0c] border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-2.5 font-sans text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:border-[#a78bfa]/50 focus:ring-[#a78bfa]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="admin-password" className="block font-mono text-[10px] uppercase font-bold tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  id="admin-password"
                  name="password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0a0c] border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-2.5 font-sans text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:border-[#a78bfa]/50 focus:ring-[#a78bfa]/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 flex items-center justify-center gap-2 rounded-lg bg-[#a78bfa] disabled:bg-[#a78bfa]/40 disabled:cursor-not-allowed px-4 py-3 font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#0a0a0a] hover:bg-[#b49dfb] active:scale-98 transition-all shadow-lg shadow-[#a78bfa]/10 duration-200 cursor-pointer"
              id="admin-login-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  LOGIN
                </>
              )}
            </button>

          </form>
        </motion.div>
      </div>
    </div>
  );
}
