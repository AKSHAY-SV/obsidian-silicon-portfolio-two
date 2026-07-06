import React, { useState, ChangeEvent, FormEvent } from 'react';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { Lock, Mail, Loader2, ShieldAlert, Cpu, X } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
        await signOut(auth);
        setError('Unauthorized administrator.');
        setIsSubmitting(false);
        return;
      }

      onLoginSuccess();
      onClose();
    } catch (err) {
      console.error('[Admin Login Error]', err);
      setError('Invalid administrator credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      id="admin-login-modal-overlay"
    >
      <div className="w-full max-w-md relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#121212] p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md"
          id="admin-login-modal-card"
        >
          {/* Close button top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            id="admin-login-modal-close"
            disabled={isSubmitting}
            type="button"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          {/* Obsidian glowing purple/magenta accent line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#a78bfa] via-[#c084fc] to-[#e879f9]" />

          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] text-[#a78bfa] mb-4 mx-auto sm:mx-0">
              <Cpu className="h-5 w-5" />
            </div>
            <h1 className="font-mono text-2xl font-extrabold tracking-tight text-white uppercase" id="admin-login-modal-title">
              ADMIN PORTAL
            </h1>
            <p className="mt-2 font-sans text-xs text-slate-400" id="admin-login-modal-subtitle">
              Restricted access. Authorized administrators only.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3 font-sans text-xs text-red-400 animate-in fade-in"
              id="admin-login-modal-error"
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
              <label htmlFor="modal-admin-email" className="block font-mono text-[10px] uppercase font-bold tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  id="modal-admin-email"
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
              <label htmlFor="modal-admin-password" className="block font-mono text-[10px] uppercase font-bold tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  id="modal-admin-password"
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row-reverse gap-3 mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 rounded-lg bg-[#a78bfa] disabled:bg-[#a78bfa]/40 disabled:cursor-not-allowed px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#0a0a0a] hover:bg-[#b49dfb] active:scale-98 transition-all shadow-lg shadow-[#a78bfa]/10 duration-200 cursor-pointer"
                id="admin-login-modal-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  'Login'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] hover:bg-[#1a1a1a] text-slate-300 hover:text-white px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-[0.15em] transition-all cursor-pointer"
                id="admin-login-modal-cancel-btn"
              >
                Cancel
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </div>
  );
}
