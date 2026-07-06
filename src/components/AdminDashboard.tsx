import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  doc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { AccessRequest } from '../types/accessRequest';
import { DOWNLOAD_ASSETS } from '../data';
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  Cpu, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  ArrowUpDown, 
  Inbox, 
  Loader2, 
  ChevronDown,
  Lock,
  Building,
  Mail,
  FileText,
  HelpCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

// Required error handling formats for Firestore Operations per integration rules
enum OperationType {
  LIST_REALTIME = 'list_realtime',
  APPROVE = 'approve',
  REJECT = 'reject'
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error in Admin Dashboard: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AdminDashboardProps {
  onReturn: () => void;
}

export default function AdminDashboard({ onReturn }: AdminDashboardProps) {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Admin View Tab
  const [activeTab, setActiveTab] = useState<'requests' | 'downloads'>('requests');

  // Secure Download Analytics & Logging States
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState<boolean>(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Unauthenticated admin session.');
      const res = await fetch('/api/downloads/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch download analytics');
      }
      setAnalyticsData(data);
    } catch (err: any) {
      console.error(err);
      setAnalyticsError(err.message || 'Failed to load secure database stats');
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'downloads') {
      fetchAnalytics();
    }
  }, [activeTab]);

  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Tooltip tracking for Purpose Hover
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  // Update Tracking State for Buttons (Disable & Loader)
  const [updatingRequests, setUpdatingRequests] = useState<Record<string, 'approving' | 'rejecting'>>({});
  
  // Track checked projects per request ID (defaults to all)
  const [selectedProjectsForRequest, setSelectedProjectsForRequest] = useState<Record<string, string[]>>({});

  // Track notification email states
  const [emailStatuses, setEmailStatuses] = useState<Record<string, {
    status: 'idle' | 'sending' | 'success' | 'failed';
    error?: string;
  }>>({});

  const handleRequestAction = async (id: string, action: 'approve' | 'reject', allowedProjects?: string[]) => {
    setUpdatingRequests(prev => ({ ...prev, [id]: action === 'approve' ? 'approving' : 'rejecting' }));
    setEmailStatuses(prev => ({ ...prev, [id]: { status: 'sending' } }));

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('User is not authenticated.');
      }

      const response = await fetch('/api/admin/request-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: id,
          action,
          allowedProjects
        })
      });

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before retrying.');
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete action on request');
      }

      if (data.emailSent === false) {
        setEmailStatuses(prev => ({
          ...prev,
          [id]: { status: 'failed', error: 'Email delivery failed' }
        }));
        addToast('Request updated. Email delivery failed.', 'error');
      } else {
        setEmailStatuses(prev => ({
          ...prev,
          [id]: { status: 'success' }
        }));
        addToast(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      }
    } catch (err: any) {
      console.error('Request action error:', err);
      setEmailStatuses(prev => ({
        ...prev,
        [id]: { status: 'failed', error: err.message || 'Action failed' }
      }));
      addToast(err.message || 'Action failed: Server error or unauthorized.', 'error');
    } finally {
      setUpdatingRequests(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleApprove = async (id: string) => {
    const allowed = selectedProjectsForRequest[id] ?? DOWNLOAD_ASSETS.map(a => a.id);
    await handleRequestAction(id, 'approve', allowed);
  };

  const handleReject = async (id: string) => {
    await handleRequestAction(id, 'reject');
  };
  
  // Custom Premium Toast System
  interface ToastNotification {
    id: string;
    message: string;
    type: 'success' | 'error';
  }
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Real-time listener for access requests
  useEffect(() => {
    const colPath = 'portfolio_access_requests';
    const colRef = collection(db, colPath);

    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const fetchedRequests: AccessRequest[] = [];
        snapshot.forEach((docSnap) => {
          fetchedRequests.push({
            ...docSnap.data(),
            id: docSnap.id,
          } as AccessRequest);
        });
        setRequests(fetchedRequests);
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        try {
          handleFirestoreError(err, OperationType.LIST_REALTIME, colPath);
        } catch (wrappedErr: any) {
          setError('Failed to sync database. Unauthorized or insufficient permissions.');
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Date Formatting Helper
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '—';
    const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const formattedHours = String(hours).padStart(2, '0');
    return `${day} ${month} ${year} ${formattedHours}:${minutes} ${ampm}`;
  };

  // Statistic Computations
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  // Search & Filters Application
  const filteredAndSortedRequests = requests
    .filter((req) => {
      // Status Match
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;

      // Text Search Match (Name, Email, University, Request ID)
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const nameMatch = req.name?.toLowerCase().includes(term) || false;
      const emailMatch = req.email?.toLowerCase().includes(term) || false;
      const univMatch = req.university?.toLowerCase().includes(term) || false;
      const idMatch = req.id?.toLowerCase().includes(term) || false;

      return nameMatch || emailMatch || univMatch || idMatch;
    })
    .sort((a, b) => {
      const getMs = (ts: any): number => {
        if (!ts) return 0;
        if (typeof ts.toDate === 'function') return ts.toDate().getTime();
        if (typeof ts.seconds === 'number') return ts.seconds * 1000;
        return new Date(ts).getTime();
      };
      const timeA = getMs(a.createdAt);
      const timeB = getMs(b.createdAt);
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });

  // Skeleton Loaders
  const SkeletonRows = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b border-[rgba(255,255,255,0.04)] animate-pulse">
          <td className="p-4"><div className="h-3 bg-slate-800/80 rounded-md w-16" /></td>
          <td className="p-4"><div className="h-3 bg-slate-800/80 rounded-md w-24" /></td>
          <td className="p-4"><div className="h-3 bg-slate-800/80 rounded-md w-28" /></td>
          <td className="p-4"><div className="h-3 bg-slate-800/80 rounded-md w-36" /></td>
          <td className="p-4"><div className="h-3 bg-slate-800/80 rounded-md w-32" /></td>
          <td className="p-4"><div className="h-3 bg-slate-800/80 rounded-md w-40" /></td>
          <td className="p-4"><div className="h-6 bg-slate-800/80 rounded-full w-16" /></td>
          <td className="p-4 flex gap-2"><div className="h-7 bg-slate-800/80 rounded-md w-16" /><div className="h-7 bg-slate-800/80 rounded-md w-16" /></td>
        </tr>
      ))}
    </>
  );

  const SkeletonCards = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border border-[rgba(255,255,255,0.06)] bg-[#121212] p-5 rounded-xl space-y-3 animate-pulse">
          <div className="flex justify-between items-center"><div className="h-4 bg-slate-800 rounded w-20" /><div className="h-6 bg-slate-800 rounded-full w-16" /></div>
          <div className="h-4 bg-slate-800 rounded w-1/2" />
          <div className="h-3 bg-slate-800 rounded w-2/3" />
          <div className="h-12 bg-slate-800 rounded-lg w-full" />
          <div className="flex gap-2 pt-2"><div className="h-8 bg-slate-800 rounded w-1/2" /><div className="h-8 bg-slate-800 rounded w-1/2" /></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8" id="admin-dashboard-container">
      
      {/* TOP HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[rgba(255,255,255,0.06)] pb-8" id="admin-dashboard-header">
        <div className="flex items-start gap-4">
          <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#161618] text-[#a78bfa] shadow-lg shadow-[#a78bfa]/5">
            <Cpu className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2">
              ADMINISTRATIVE DASHBOARD
            </h1>
            <p className="font-sans text-sm text-slate-400 mt-1.5 leading-relaxed">
              Manage portfolio access requests and system authorizations.
            </p>
          </div>
        </div>

        {/* Access Granted Badge */}
        <div 
          className="flex items-center gap-3.5 bg-emerald-500/5 border border-emerald-500/20 px-5 py-3 rounded-xl shadow-md shadow-emerald-500/5 self-start md:self-auto"
          id="admin-status-badge"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg shadow-emerald-500/20">
            <Check className="h-4 w-4 stroke-[3]" />
          </div>
          <div>
            <div className="font-mono text-xs font-black tracking-wider text-emerald-400 uppercase flex items-center gap-1">
              ACCESS GRANTED <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="font-sans text-[10px] text-emerald-400/70 font-semibold uppercase tracking-wider mt-0.5">
              Secure Session Active
            </div>
          </div>
        </div>
      </div>

      {/* VIEW SELECTOR TABS */}
      <div className="flex border-b border-white/[0.04] gap-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-3 font-mono text-[10px] uppercase font-black tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'border-[#a78bfa] text-[#a78bfa] bg-[#a78bfa]/5'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          Access Requests
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          className={`px-5 py-3 font-mono text-[10px] uppercase font-black tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'downloads'
              ? 'border-[#a78bfa] text-[#a78bfa] bg-[#a78bfa]/5'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          Secure Downloads Audit Log
        </button>
      </div>

      {error && (
        <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-400 rounded-xl text-xs font-sans flex items-center gap-3">
          <XCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'requests' ? (
        <>
          {/* STATISTIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="admin-statistics-grid">
        
        {/* Card 1: Pending (Orange) */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#121214] p-5 flex items-center justify-between relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <div className="space-y-1">
            <p className="font-sans text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Pending Requests
            </p>
            <h3 className="font-mono text-3xl font-black text-amber-500 tracking-tight">
              {isLoading ? '...' : pendingCount}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-lg border border-amber-500/10 bg-amber-500/5 flex items-center justify-center text-amber-500">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Approved (Green) */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#121214] p-5 flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="space-y-1">
            <p className="font-sans text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Approved
            </p>
            <h3 className="font-mono text-3xl font-black text-emerald-400 tracking-tight">
              {isLoading ? '...' : approvedCount}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-lg border border-emerald-500/10 bg-emerald-500/5 flex items-center justify-center text-emerald-500">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Rejected (Red) */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#121214] p-5 flex items-center justify-between relative overflow-hidden group hover:border-red-500/30 transition-all duration-300">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
          <div className="space-y-1">
            <p className="font-sans text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Rejected
            </p>
            <h3 className="font-mono text-3xl font-black text-red-500 tracking-tight">
              {isLoading ? '...' : rejectedCount}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-lg border border-red-500/10 bg-red-500/5 flex items-center justify-center text-red-500">
            <XCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4: Total (Purple) */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#121214] p-5 flex items-center justify-between relative overflow-hidden group hover:border-[#a78bfa]/30 transition-all duration-300">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#a78bfa]" />
          <div className="space-y-1">
            <p className="font-sans text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Total Requests
            </p>
            <h3 className="font-mono text-3xl font-black text-[#a78bfa] tracking-tight">
              {isLoading ? '...' : totalCount}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-lg border border-[#a78bfa]/10 bg-[#a78bfa]/5 flex items-center justify-center text-[#a78bfa]">
            <Users className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* FILTER & SEARCH CONTROL BLOCK */}
      <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0d0d0f] p-4 flex flex-col md:flex-row gap-4 items-center justify-between" id="admin-controls-panel">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by ID, Name, Email, University..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121214] border border-[rgba(255,255,255,0.06)] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:border-[#a78bfa]/50 focus:ring-[#a78bfa]/20 transition-all"
            id="admin-search-input"
          />
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          
          {/* Status Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-mono text-[10px] uppercase font-bold text-slate-500 hidden sm:inline">Status</span>
            <div className="relative w-full sm:w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-[#121214] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:ring-1 focus:border-[#a78bfa]/50 transition-all cursor-pointer font-sans"
                id="admin-status-filter"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-mono text-[10px] uppercase font-bold text-slate-500 hidden sm:inline">Sort</span>
            <div className="relative w-full sm:w-44">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-[#121214] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:ring-1 focus:border-[#a78bfa]/50 transition-all cursor-pointer font-sans"
                id="admin-sort-filter"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      {/* LARGE DASHBOARD CONTAINER WITH PORTFOLIO REQUESTS */}
      <div 
        className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#121214] overflow-hidden shadow-xl"
        id="admin-table-card"
      >
        {/* Card Header */}
        <div className="border-b border-[rgba(255,255,255,0.06)] bg-[#161618] px-6 py-5">
          <div className="flex items-center gap-2 text-[#a78bfa] mb-1">
            <FileText className="h-4 w-4" />
            <h2 className="font-mono text-sm font-black tracking-wider uppercase">
              Portfolio Access Requests
            </h2>
          </div>
          <p className="font-sans text-xs text-slate-400">
            Pending access approval requests.
          </p>
        </div>

        {/* LOADING STATE SKELETON */}
        {isLoading ? (
          <div className="p-6">
            <div className="hidden md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)] text-left font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="p-4">Request ID</th>
                    <th className="p-4">Created</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">University / Company</th>
                    <th className="p-4">Purpose</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <SkeletonRows />
                </tbody>
              </table>
            </div>
            <div className="md:hidden">
              <SkeletonCards />
            </div>
          </div>
        ) : filteredAndSortedRequests.length === 0 ? (
          
          /* EMPTY STATE */
          <div className="p-16 text-center" id="admin-empty-state">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#161618] text-slate-600 mb-6">
              <Inbox className="h-8 w-8" />
            </div>
            <p className="font-mono text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-1.5">
              No portfolio access requests.
            </p>
            <p className="font-sans text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              No portfolio access requests currently match the search query, status filters, or are registered in the system.
            </p>
          </div>
        ) : (
          
          /* CONTENT VIEWS */
          <>
            {/* DESKTOP & TABLET VIEW TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left" id="admin-requests-table">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[#161618]/50 text-left font-mono text-[10px] uppercase tracking-wider text-[#a78bfa] select-none">
                    <th className="p-4 pl-6">Request ID</th>
                    <th className="p-4">Created</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">University / Company</th>
                    <th className="p-4">Purpose</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                  {filteredAndSortedRequests.map((req, index) => {
                    const isPending = req.status === 'pending';
                    const idShort = req.id ? (req.id.length > 8 ? `${req.id.substring(0, 8).toUpperCase()}` : req.id.toUpperCase()) : 'N/A';
                    
                    return (
                      <tr 
                        key={req.id || index} 
                        className={`group border-b border-[rgba(255,255,255,0.03)] hover:bg-[#a78bfa]/[0.02] transition-colors duration-200 ${
                          index % 2 === 0 ? 'bg-transparent' : 'bg-[#18181b]/20'
                        }`}
                      >
                        {/* Request ID */}
                        <td className="p-4 pl-6 font-mono text-xs font-black text-slate-400 group-hover:text-white transition-colors">
                          {idShort}
                        </td>

                        {/* Created Date */}
                        <td className="p-4 font-sans text-xs text-slate-400 font-medium">
                          {formatDate(req.createdAt)}
                        </td>

                        {/* Name */}
                        <td className="p-4 font-sans text-xs font-semibold text-white">
                          {req.name}
                        </td>

                        {/* Email */}
                        <td className="p-4 font-sans text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                          {req.email}
                        </td>

                        {/* University / Company */}
                        <td className="p-4 font-sans text-xs text-slate-400">
                          {req.university}
                        </td>

                        {/* Purpose (with custom absolute tooltip on hover) */}
                        <td className="p-4 max-w-xs relative">
                          <div 
                            className="text-xs text-slate-400 line-clamp-2 select-text cursor-help group/purpose"
                            onMouseEnter={() => req.id && setActiveTooltipId(req.id)}
                            onMouseLeave={() => setActiveTooltipId(null)}
                          >
                            {req.purpose}

                            {/* Custom hovering Tooltip */}
                            <AnimatePresence>
                              {activeTooltipId === req.id && req.purpose.length > 40 && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className="absolute z-50 left-0 bottom-full mb-3 w-72 p-4 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[#161618] shadow-2xl pointer-events-none text-slate-200 font-sans text-xs font-normal leading-relaxed text-left normal-case"
                                  style={{ transform: 'translateX(-10%)' }}
                                >
                                  <div className="font-mono text-[9px] uppercase tracking-wider text-[#a78bfa] mb-1 font-black">Full Request Purpose</div>
                                  {req.purpose}
                                  <div className="absolute top-full left-1/4 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#161618]" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>

                        {/* Status Pills */}
                        <td className="p-4">
                          {req.status === 'pending' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase font-black tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm shadow-amber-500/5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Pending
                            </span>
                          )}
                          {req.status === 'approved' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase font-black tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              Approved
                            </span>
                          )}
                          {req.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase font-black tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm shadow-red-500/5">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              Rejected
                            </span>
                          )}
                        </td>

                        {/* Actions buttons */}
                        <td className="p-4 pr-6 text-right">
                          {isPending ? (
                            <div className="flex flex-col items-end gap-2 text-right">
                              {/* Checkbox Group for Permissions */}
                              <div className="flex flex-col gap-1.5 text-left bg-black/40 border border-white/5 p-2 rounded-lg w-56 mb-1">
                                <span className="font-mono text-[9px] uppercase tracking-wider text-[#a78bfa] font-black">
                                  ☑ Project Permissions
                                </span>
                                <div className="space-y-1">
                                  {DOWNLOAD_ASSETS.map((asset) => {
                                    const isChecked = selectedProjectsForRequest[req.id || '']?.includes(asset.id) ?? true;
                                    return (
                                      <label key={asset.id} className="flex items-center gap-1.5 text-[9px] font-sans text-slate-300 hover:text-white cursor-pointer select-none">
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={(e) => {
                                            const current = selectedProjectsForRequest[req.id || ''] ?? DOWNLOAD_ASSETS.map(a => a.id);
                                            const next = e.target.checked
                                              ? [...current, asset.id]
                                              : current.filter(id => id !== asset.id);
                                            setSelectedProjectsForRequest(prev => ({ ...prev, [req.id || '']: next }));
                                          }}
                                          className="rounded border-slate-700 bg-slate-900 text-[#a78bfa] focus:ring-[#a78bfa]/50 h-3 w-3"
                                        />
                                        <span className="truncate">{asset.name}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  disabled={updatingRequests[req.id || ''] !== undefined}
                                  onClick={() => req.id && handleApprove(req.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-black tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                  title="Approve Request"
                                >
                                  {updatingRequests[req.id || ''] === 'approving' ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Check className="h-3 w-3 stroke-[2.5]" />
                                  )} Approve
                                </button>
                                <button
                                  disabled={updatingRequests[req.id || ''] !== undefined}
                                  onClick={() => req.id && handleReject(req.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-black tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-black hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                                  title="Reject Request"
                                >
                                  {updatingRequests[req.id || ''] === 'rejecting' ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <X className="h-3 w-3 stroke-[2.5]" />
                                  )} Reject
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2.5">
                              {req.status === 'approved' ? (
                                <div className="text-right">
                                  <div className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-emerald-400 font-black tracking-wider bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full select-none mb-1">
                                    ✓ Approved
                                  </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[180px] font-medium" title={req.approvedBy || 'Unknown'}>
                                  by {req.approvedBy || 'Admin'}
                                </div>
                                <div className="text-[9px] text-slate-500 mt-0.5 font-mono">
                                  {formatDate(req.approvedAt)}
                                </div>
                                {emailStatuses[req.id || '']?.status === 'sending' && (
                                  <div className="mt-1 flex items-center justify-end gap-1 text-[9px] font-mono text-purple-400 select-none">
                                    <Loader2 className="h-2.5 w-2.5 animate-spin" /> Sending email...
                                  </div>
                                )}
                                {emailStatuses[req.id || '']?.status === 'success' && (
                                  <div className="mt-1 text-[9px] font-mono text-emerald-500 select-none">
                                    ✓ Email sent
                                  </div>
                                )}
                                {emailStatuses[req.id || '']?.status === 'failed' && (
                                  <div className="mt-1 flex flex-col items-end gap-1">
                                    <span className="text-[9px] text-red-400 font-mono text-right leading-tight">
                                      Request updated.<br />Email delivery failed.
                                    </span>
                                    <button
                                      onClick={() => req.id && handleApprove(req.id)}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono text-[9px] uppercase font-bold tracking-wider transition-all cursor-pointer"
                                    >
                                      Retry?
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-right">
                                <div className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-red-400 font-black tracking-wider bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-full select-none mb-1">
                                  ✕ Rejected
                                </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[180px] font-medium" title={req.rejectedBy || 'Unknown'}>
                                  by {req.rejectedBy || 'Admin'}
                                </div>
                                <div className="text-[9px] text-slate-500 mt-0.5 font-mono">
                                  {formatDate(req.rejectedAt)}
                                </div>
                                {emailStatuses[req.id || '']?.status === 'sending' && (
                                  <div className="mt-1 flex items-center justify-end gap-1 text-[9px] font-mono text-purple-400 select-none">
                                    <Loader2 className="h-2.5 w-2.5 animate-spin" /> Sending email...
                                  </div>
                                )}
                                {emailStatuses[req.id || '']?.status === 'success' && (
                                  <div className="mt-1 text-[9px] font-mono text-emerald-500 select-none">
                                    ✓ Email sent
                                  </div>
                                )}
                                {emailStatuses[req.id || '']?.status === 'failed' && (
                                  <div className="mt-1 flex flex-col items-end gap-1">
                                    <span className="text-[9px] text-red-400 font-mono text-right leading-tight">
                                      Request updated.<br />Email delivery failed.
                                    </span>
                                    <button
                                      onClick={() => req.id && handleReject(req.id)}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono text-[9px] uppercase font-bold tracking-wider transition-all cursor-pointer"
                                    >
                                      Retry?
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW CARDS */}
            <div className="md:hidden p-4 space-y-4">
              {filteredAndSortedRequests.map((req, index) => {
                const isPending = req.status === 'pending';
                const idShort = req.id ? (req.id.length > 8 ? `${req.id.substring(0, 8).toUpperCase()}` : req.id.toUpperCase()) : 'N/A';
                
                return (
                  <div 
                    key={req.id || index}
                    className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#161618]/50 p-5 space-y-4 relative overflow-hidden"
                  >
                    {/* Status accent indicator */}
                    <div className={`absolute top-0 left-0 w-full h-[2px] ${
                      req.status === 'pending' ? 'bg-amber-500' :
                      req.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />

                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-mono text-xs font-black text-slate-500">ID: {idShort}</div>
                        <div className="font-sans text-[10px] text-slate-500 mt-0.5">{formatDate(req.createdAt)}</div>
                      </div>
                      
                      {/* Status pill */}
                      <div>
                        {req.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase font-black tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Pending
                          </span>
                        )}
                        {req.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase font-black tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Approved
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase font-black tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-sans text-sm font-extrabold text-white">{req.name}</h4>
                      
                      <div className="space-y-1 text-xs text-slate-400 font-sans">
                        <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" /> {req.email}</div>
                        <div className="flex items-center gap-2"><Building className="h-3.5 w-3.5 text-slate-500 shrink-0" /> {req.university}</div>
                      </div>

                      <div className="border-t border-[rgba(255,255,255,0.04)] pt-3 mt-3">
                        <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 block mb-1">Purpose</span>
                        <p className="font-sans text-xs text-slate-300 leading-relaxed bg-[#101012] border border-[rgba(255,255,255,0.03)] p-3 rounded-lg">
                          {req.purpose}
                        </p>
                      </div>
                    </div>

                    {/* Actions panel */}
                    {isPending ? (
                      <div className="pt-3 mt-3 border-t border-[rgba(255,255,255,0.04)] space-y-3">
                        {/* Checkbox Group for Permissions */}
                        <div className="flex flex-col gap-1.5 text-left bg-black/40 border border-white/5 p-3 rounded-lg w-full">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-[#a78bfa] font-black">
                            ☑ Project Permissions
                          </span>
                          <div className="space-y-1.5">
                            {DOWNLOAD_ASSETS.map((asset) => {
                              const isChecked = selectedProjectsForRequest[req.id || '']?.includes(asset.id) ?? true;
                              return (
                                <label key={asset.id} className="flex items-center gap-1.5 text-xs font-sans text-slate-300 hover:text-white cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const current = selectedProjectsForRequest[req.id || ''] ?? DOWNLOAD_ASSETS.map(a => a.id);
                                      const next = e.target.checked
                                        ? [...current, asset.id]
                                        : current.filter(id => id !== asset.id);
                                      setSelectedProjectsForRequest(prev => ({ ...prev, [req.id || '']: next }));
                                    }}
                                    className="rounded border-slate-700 bg-slate-900 text-[#a78bfa] focus:ring-[#a78bfa]/50 h-3.5 w-3.5"
                                  />
                                  <span className="truncate">{asset.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            disabled={updatingRequests[req.id || ''] !== undefined}
                            onClick={() => req.id && handleApprove(req.id)}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-mono uppercase font-black tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black hover:border-emerald-400 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                          >
                            {updatingRequests[req.id || ''] === 'approving' ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            )} Approve
                          </button>
                          <button
                            disabled={updatingRequests[req.id || ''] !== undefined}
                            onClick={() => req.id && handleReject(req.id)}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-mono uppercase font-black tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-black hover:border-red-400 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                          >
                          {updatingRequests[req.id || ''] === 'rejecting' ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="h-3.5 w-3.5 stroke-[2.5]" />
                          )} Reject
                        </button>
                      </div>
                    </div>
                    ) : req.status === 'approved' ? (
                      <>
                        <div className="border-t border-[rgba(255,255,255,0.04)] pt-3 mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-xs text-slate-400 font-sans">
                          <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-black">
                            ✓ Approved
                          </span>
                          <div className="flex flex-col text-left sm:text-right">
                            <span className="text-slate-300">by {req.approvedBy || 'Admin'}</span>
                            <span className="text-[10px] text-slate-500 mt-0.5 font-mono">{formatDate(req.approvedAt)}</span>
                          </div>
                        </div>
                        {req.id && emailStatuses[req.id] && (
                          <div className="border-t border-[rgba(255,255,255,0.04)] pt-2.5 mt-2.5 flex justify-between items-center text-[10px] font-sans">
                            <span className="text-slate-500 font-mono uppercase text-[9px]">Notification Email</span>
                            <div>
                              {emailStatuses[req.id].status === 'sending' && (
                                <span className="flex items-center gap-1 font-mono text-purple-400 animate-pulse">
                                  <Loader2 className="h-2.5 w-2.5 animate-spin" /> Sending...
                                </span>
                              )}
                              {emailStatuses[req.id].status === 'success' && (
                                <span className="font-mono text-emerald-500">
                                  ✓ Sent successfully
                                </span>
                              )}
                              {emailStatuses[req.id].status === 'failed' && (
                                <div className="flex flex-col items-end gap-1">
                                  <span className="font-mono text-red-400 text-[10px] text-right leading-tight">
                                    Request updated.<br />Email delivery failed.
                                  </span>
                                  <button
                                    onClick={() => req.id && handleApprove(req.id)}
                                    className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] uppercase font-bold tracking-wider cursor-pointer"
                                  >
                                    Retry?
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="border-t border-[rgba(255,255,255,0.04)] pt-3 mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-xs text-slate-400 font-sans">
                          <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-red-400 font-black">
                            ✕ Rejected
                          </span>
                          <div className="flex flex-col text-left sm:text-right">
                            <span className="text-slate-300">by {req.rejectedBy || 'Admin'}</span>
                            <span className="text-[10px] text-slate-500 mt-0.5 font-mono">{formatDate(req.rejectedAt)}</span>
                          </div>
                        </div>
                        {req.id && emailStatuses[req.id] && (
                          <div className="border-t border-[rgba(255,255,255,0.04)] pt-2.5 mt-2.5 flex justify-between items-center text-[10px] font-sans">
                            <span className="text-slate-500 font-mono uppercase text-[9px]">Notification Email</span>
                            <div>
                              {emailStatuses[req.id].status === 'sending' && (
                                <span className="flex items-center gap-1 font-mono text-purple-400 animate-pulse">
                                  <Loader2 className="h-2.5 w-2.5 animate-spin" /> Sending...
                                </span>
                              )}
                              {emailStatuses[req.id].status === 'success' && (
                                <span className="font-mono text-emerald-500">
                                  ✓ Sent successfully
                                </span>
                              )}
                              {emailStatuses[req.id].status === 'failed' && (
                                <div className="flex flex-col items-end gap-1">
                                  <span className="font-mono text-red-400 text-[10px] text-right leading-tight">
                                    Request updated.<br />Email delivery failed.
                                  </span>
                                  <button
                                    onClick={() => req.id && handleReject(req.id)}
                                    className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] uppercase font-bold tracking-wider cursor-pointer"
                                  >
                                    Retry?
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
        </>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* DOWNLOADS STATISTIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#121214] p-5 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
              <div className="space-y-1">
                <p className="font-sans text-[11px] uppercase font-bold tracking-wider text-slate-400">Total Downloads</p>
                <h3 className="font-mono text-3xl font-black text-purple-400 tracking-tight">
                  {isAnalyticsLoading ? '...' : analyticsData?.metrics?.totalDownloads ?? 0}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-lg border border-purple-500/10 bg-purple-500/5 flex items-center justify-center text-purple-400">
                <Cpu className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#121214] p-5 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
              <div className="space-y-1">
                <p className="font-sans text-[11px] uppercase font-bold tracking-wider text-slate-400">Downloads Today</p>
                <h3 className="font-mono text-3xl font-black text-emerald-400 tracking-tight">
                  {isAnalyticsLoading ? '...' : analyticsData?.metrics?.downloadsToday ?? 0}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-lg border border-emerald-500/10 bg-emerald-500/5 flex items-center justify-center text-emerald-400">
                <Check className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#121214] p-5 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
              <div className="space-y-1 max-w-[70%]">
                <p className="font-sans text-[11px] uppercase font-bold tracking-wider text-slate-400">Most Active University</p>
                <h3 className="font-mono text-xs font-bold text-blue-400 truncate mt-1" title={analyticsData?.metrics?.mostActiveUniversity}>
                  {isAnalyticsLoading ? '...' : analyticsData?.metrics?.mostActiveUniversity ?? '—'}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-lg border border-blue-500/10 bg-blue-500/5 flex items-center justify-center text-blue-400 shrink-0">
                <Building className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#121214] p-5 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
              <div className="space-y-1 max-w-[70%]">
                <p className="font-sans text-[11px] uppercase font-bold tracking-wider text-slate-400">Top Project</p>
                <h3 className="font-mono text-xs font-bold text-amber-500 truncate mt-1" title={analyticsData?.metrics?.mostDownloadedProject}>
                  {isAnalyticsLoading ? '...' : analyticsData?.metrics?.mostDownloadedProject ?? '—'}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-lg border border-amber-500/10 bg-amber-500/5 flex items-center justify-center text-amber-500 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* DOWNLOAD AUDIT LOGS LIST */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0d0d0f] overflow-hidden">
            <div className="p-5 border-b border-white/[0.04] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-mono text-xs font-black uppercase tracking-wider text-slate-300">Download Audit Logs</h3>
                <p className="font-sans text-[11px] text-slate-500 mt-0.5">Real-time immutable database security transfer logs</p>
              </div>
              <button
                onClick={fetchAnalytics}
                disabled={isAnalyticsLoading}
                className="px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase font-black bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`h-3 w-3 ${isAnalyticsLoading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {analyticsError && (
              <div className="p-5 text-center text-xs text-red-400 font-sans border-b border-white/[0.04]">
                ⚠️ {analyticsError}
              </div>
            )}

            {/* logs table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-[#09090b] font-mono text-[9px] uppercase font-black tracking-wider text-slate-500">
                    <th className="p-4 pl-6">Recipient / Email</th>
                    <th className="p-4">University</th>
                    <th className="p-4">Requested File</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4 pr-6 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {isAnalyticsLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4 pl-6"><div className="h-3 bg-white/5 rounded-md w-32" /></td>
                        <td className="p-4"><div className="h-3 bg-white/5 rounded-md w-28" /></td>
                        <td className="p-4"><div className="h-3 bg-white/5 rounded-md w-36" /></td>
                        <td className="p-4"><div className="h-3 bg-white/5 rounded-md w-24" /></td>
                        <td className="p-4"><div className="h-3 bg-white/5 rounded-md w-20" /></td>
                        <td className="p-4 pr-6 text-right"><div className="h-5 bg-white/5 rounded-full w-14 ml-auto" /></td>
                      </tr>
                    ))
                  ) : !analyticsData?.logs || analyticsData.logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-xs font-sans text-slate-500">
                        No download transaction logs found in secure database storage.
                      </td>
                    </tr>
                  ) : (
                    analyticsData.logs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-white/[0.01] transition-colors font-sans text-xs text-slate-300">
                        <td className="p-4 pl-6 font-medium text-white">{log.email}</td>
                        <td className="p-4 text-slate-400">{log.university}</td>
                        <td className="p-4 font-mono text-[10px] text-purple-300 font-semibold">{log.project}</td>
                        <td className="p-4 text-slate-400 font-mono text-[10px]">{log.downloadTime}</td>
                        <td className="p-4 text-slate-500 font-mono text-[10px]">{log.downloadIP}</td>
                        <td className="p-4 pr-6 text-right">
                          {log.result === 'success' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              SUCCESS
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-black bg-red-500/10 text-red-400 border border-red-500/20">
                              FAILED
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER ACTION TO RETURN TO PORTFOLIO */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onReturn}
          className="rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#121214] px-8 py-3.5 font-mono text-[11px] uppercase font-bold tracking-wider text-slate-400 hover:text-white hover:border-[#a78bfa]/50 hover:shadow-lg hover:shadow-[#a78bfa]/5 transition-all cursor-pointer flex items-center gap-2"
        >
          Return to Portfolio Home
        </button>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none" id="admin-toasts-container">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl border shadow-2xl flex items-start gap-3 pointer-events-auto ${
                toast.type === 'success'
                  ? 'bg-[#0f1715]/95 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5'
                  : 'bg-[#1c1212]/95 border-red-500/20 text-red-400 shadow-red-500/5'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              )}
              <div className="flex-1 font-sans text-xs font-medium leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
