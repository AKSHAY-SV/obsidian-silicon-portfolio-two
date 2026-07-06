import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Lock,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  ShieldCheck,
  Key,
  ChevronRight,
  Cpu,
  FileText,
  Layers,
  GitBranch,
  LogOut,
  FolderOpen
} from 'lucide-react';
import { getRequestByEmail } from '../services/accessRequestService';
import { DOWNLOAD_ASSETS } from '../data';
import DownloadCard from './DownloadCard';

type AuthState = 'idle' | 'loading' | 'success' | 'error' | 'pending';

interface SecurePortalProps {
  onRequestAccess: () => void;
}

export default function SecurePortal({ onRequestAccess }: SecurePortalProps) {
  const [email, setEmail] = useState('');
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [allowedProjects, setAllowedProjects] = useState<string[] | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const validatePortalToken = async (portalToken: string) => {
    setAuthState('loading');
    setErrorMsg('');
    setDownloadError(null);

    try {
      const response = await fetch(`/api/downloads/init?token=${encodeURIComponent(portalToken)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setAuthState('error');
        setErrorMsg(data.error || 'Invalid or expired portal token.');
        setAllowedProjects(null);
        return;
      }

      setToken(portalToken);
      setEmail(data.email || '');
      setAllowedProjects(Array.isArray(data.allowedProjects) ? data.allowedProjects : []);
      setAuthState('success');
    } catch (err: any) {
      setAuthState('error');
      setErrorMsg(err?.message || 'Unable to validate portal token.');
      setAllowedProjects(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const portalToken = params.get('token');
    if (portalToken) {
      validatePortalToken(portalToken);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setAuthState('error');
      setErrorMsg('Please enter your authorized email address.');
      return;
    }
    setAuthState('loading');
    setErrorMsg('');

    try {
      const request = await getRequestByEmail(trimmedEmail);

      if (!request) {
        setAuthState('error');
        setErrorMsg('No access request found for this email. Submit a request first.');
        return;
      }

      if (request.status === 'approved') {
        setAuthState('success');
        setToken(null);
        setAllowedProjects(null);
      } else if (request.status === 'pending') {
        setAuthState('pending');
      } else {
        setAuthState('error');
        setErrorMsg('Your access request was not approved. Contact the administrator for further information.');
      }
    } catch {
      setAuthState('error');
      setErrorMsg('Authentication service temporarily unavailable. Please try again later.');
    }
  };

  const requestDownload = async (projectId: string): Promise<string | undefined> => {
    setDownloadError(null);
    if (!token) {
      throw new Error('Secure portal token is required to request downloads. Please use the emailed secure portal link.');
    }

    const response = await fetch('/api/downloads/request-download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, projectId })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to authorize download.');
    }
    return data.downloadUrl;
  };

  const isTokenSession = !!token && authState === 'success' && allowedProjects !== null;
  const allowedAssets = allowedProjects
    ? DOWNLOAD_ASSETS.filter(asset => asset.status === 'Restricted' && (allowedProjects.length === 0 || allowedProjects.includes(asset.id)))
    : [];


  const securityBadges = [
    { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: 'End-to-End Secure Access' },
    { icon: <Key className="h-3.5 w-3.5" />, label: 'Administrator Approval Required' },
    { icon: <Lock className="h-3.5 w-3.5" />, label: 'Protected Engineering Assets' },
  ];

  const assetTypes = [
    { icon: <Cpu className="h-3.5 w-3.5 text-[#a78bfa]" />, label: 'RTL Projects & SoC Designs' },
    { icon: <FileText className="h-3.5 w-3.5 text-[#a78bfa]" />, label: 'Research Documents & White Papers' },
    { icon: <Layers className="h-3.5 w-3.5 text-[#a78bfa]" />, label: 'Verification Reports & Waveforms' },
    { icon: <GitBranch className="h-3.5 w-3.5 text-[#a78bfa]" />, label: 'Private GitHub Asset Downloads' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col" id="secure-portal-page">

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#a78bfa]/[0.05] blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-[#c084fc]/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">

        {/* Page Hero */}
        <section className="border-b border-[rgba(255,255,255,0.06)] py-20 px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto"
          >
            {/* Icon cluster */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#161618] flex items-center justify-center shadow-2xl shadow-[#a78bfa]/10">
                  <Shield className="h-10 w-10 text-[#a78bfa]" />
                </div>
                <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-emerald-500 border-2 border-[#0a0a0a] flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Lock className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#a78bfa] font-bold block mb-5"
            >
              ⚡ CLASSIFIED ENGINEERING INFRASTRUCTURE // ACCESS LEVEL: RESTRICTED
            </motion.span>

            <h1 className="font-sans text-5xl sm:text-6xl font-black tracking-tight text-white uppercase leading-tight mb-6">
              Secure Engineering{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] via-[#c084fc] to-[#e879f9]">
                Portal
              </span>
            </h1>

            <p className="font-sans text-base text-slate-400 leading-relaxed">
              Private workspace for approved users. Engineering assets, RTL projects, research documents,
              and verification files are available exclusively to authorized personnel.
            </p>

            {/* Security badges strip */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {securityBadges.map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                  className="flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#121214] px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-wider text-slate-400 font-semibold"
                >
                  <span className="text-[#a78bfa]">{badge.icon}</span>
                  {badge.label}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Authentication Panel — centered, full focus */}
        <section className="flex-1 flex items-start justify-center py-16 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full transition-all duration-500 ${authState === 'success' ? 'max-w-5xl' : 'max-w-2xl'}`}
          >
            <div className="rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[#0f0f11]/90 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden">

              {authState === 'success' ? (
                // --- AUTHENTICATED SECURE DOWNLOAD CENTER WORKSPACE ---
                <div className="animate-in fade-in duration-300">
                  {/* Panel header */}
                  <div className="border-b border-[rgba(255,255,255,0.06)] bg-[#161618] px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="h-9 w-9 rounded-lg border border-emerald-500/25 bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <FolderOpen className="h-4.5 w-4.5 text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="font-mono text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                          Silicon IP Core Workspace
                          <span className="bg-emerald-500/10 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase font-bold tracking-widest">Authorized</span>
                        </h2>
                        <p className="font-sans text-[11px] text-slate-400 mt-0.5">
                          Welcome, <span className="text-white font-bold">{email}</span>. You have access to active synthesizable logic packages.
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setAuthState('idle');
                        setEmail('');
                        setToken(null);
                        setAllowedProjects(null);
                      }}
                      className="self-start sm:self-auto flex items-center gap-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-all cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Lock Session
                    </button>
                  </div>

                  {/* Restricted Downloads Grid */}
                  <div className="p-8 space-y-6">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a78bfa] font-bold block mb-1">
                        // SECURE DATA COMPILER REPOSITORY
                      </span>
                      <p className="font-sans text-xs text-slate-400 leading-normal">
                        Select a restricted IP block to request a secure one-time download token. Only assets authorized by the administrator can be downloaded.
                      </p>
                    </div>

                    {isTokenSession ? (
                      allowedAssets.length === 0 ? (
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-sm text-amber-200">
                          Your portal token is valid, but no restricted assets are currently authorized for this session.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {allowedAssets.map((asset) => (
                            <DownloadCard
                              key={asset.id}
                              asset={asset}
                              isRestricted={true}
                              onDownloadStart={() => setDownloadError(null)}
                              downloadAction={() => requestDownload(asset.id)}
                            />
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="rounded-2xl border border-[#a78bfa]/15 bg-[#0f0f11] p-6">
                        <p className="font-sans text-sm text-slate-300 leading-relaxed">
                          Your request is approved, but secure downloads require the emailed portal token.
                          Please open the secure portal link sent to your approved email address and retry.
                        </p>
                      </div>
                    )}

                    {downloadError && (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                        {downloadError}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // --- UNAUTHORIZED LOGIN SCREEN ---
                <>
                  {/* Panel header */}
                  <div className="border-b border-[rgba(255,255,255,0.06)] bg-[#161618] px-8 py-6">
                    <div className="flex items-center gap-3.5 mb-1.5">
                      <div className="h-9 w-9 rounded-lg border border-[#a78bfa]/25 bg-[#a78bfa]/10 flex items-center justify-center shrink-0">
                        <Key className="h-4.5 w-4.5 text-[#a78bfa]" />
                      </div>
                      <div>
                        <h2 className="font-mono text-sm font-black uppercase tracking-wider text-white">
                          Workspace Authentication
                        </h2>
                        <p className="font-sans text-[11px] text-slate-500 mt-0.5">
                          Authorized personnel only. Access is strictly controlled.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-8 py-8 space-y-7">
                    {/* Protected resources grid */}
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-4">
                        Protected resources inside this workspace
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {assetTypes.map((asset, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2.5 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#0a0a0a] px-3.5 py-2.5"
                          >
                            {asset.icon}
                            <span className="font-sans text-[11px] text-slate-400 leading-tight">{asset.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-[rgba(255,255,255,0.05)]" />

                    {/* Auth Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2.5">
                          Authorized Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (authState === 'error') setAuthState('idle');
                            }}
                            placeholder="you@university.edu"
                            disabled={authState === 'loading'}
                            className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.08)] rounded-xl pl-11 pr-4 py-3.5 font-sans text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#a78bfa]/50 focus:ring-1 focus:ring-[#a78bfa]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* State-based feedback */}
                      {authState === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5"
                        >
                          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                          <p className="font-sans text-xs text-red-400">{errorMsg || 'Authentication failed. Your email is not authorized.'}</p>
                        </motion.div>
                      )}

                      {authState === 'pending' && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3.5"
                        >
                          <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                          <p className="font-sans text-xs text-amber-400">Your access request is pending administrator approval. You will receive an email once approved.</p>
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        disabled={authState === 'loading'}
                        className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#a78bfa] px-6 py-4 font-sans text-xs font-bold uppercase tracking-[0.18em] text-[#0a0a0a] hover:bg-[#b49dfb] active:scale-[0.98] transition-all shadow-xl shadow-[#a78bfa]/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                      >
                        {authState === 'loading' ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying Access...
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4" />
                            Access Workspace
                          </>
                        )}
                      </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
                      <span className="font-mono text-[9px] uppercase tracking-wider text-slate-600 whitespace-nowrap">Not yet approved?</span>
                      <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
                    </div>

                    <button
                      onClick={onRequestAccess}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#121214] px-6 py-3.5 font-sans text-xs font-bold uppercase tracking-[0.15em] text-slate-300 hover:text-white hover:border-[#a78bfa]/40 hover:bg-[#161618] transition-all"
                    >
                      <FileText className="h-4 w-4 text-[#a78bfa]" />
                      Submit an Access Request
                      <ChevronRight className="h-3.5 w-3.5 text-[#a78bfa]" />
                    </button>
                  </div>
                </>
              )}

              {/* Panel footer */}
              <div className="border-t border-[rgba(255,255,255,0.04)] bg-[#0d0d0f] px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full animate-pulse ${authState === 'success' ? 'bg-emerald-500' : 'bg-purple-500'}`} />
                  <span className={`font-mono text-[9px] uppercase tracking-widest ${authState === 'success' ? 'text-emerald-400/70' : 'text-purple-400/70'}`}>
                    {authState === 'success' ? 'Secure Session Active' : 'Security Layer Engaged'}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-slate-600 uppercase tracking-wider">TLS 1.3 Encrypted</span>
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
