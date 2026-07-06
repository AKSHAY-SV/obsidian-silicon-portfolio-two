import React, { useState, useEffect } from 'react';
import { NavTab, Project } from './types';
import { PROJECTS } from './data';
import TopNavBar from './components/TopNavBar';
import Footer from './components/Footer';
import InteractiveHeroCanvas from './components/InteractiveHeroCanvas';
import ProjectsLibrary from './components/ProjectsLibrary';
import SecurePortal from './components/SecurePortal';

import About from './components/About';
import Contact from './components/Contact';
import AccessRequest from './components/AccessRequest';
import AdminLogin from './components/AdminLogin';
import AdminLoginModal from './components/AdminLoginModal';
import AdminDashboard from './components/AdminDashboard';
import { auth } from './firebase/firebase';

import DesignFlowVisualizer from './components/DesignFlowVisualizer';
import EngineeringToolchain from './components/EngineeringToolchain';

import { motion, AnimatePresence } from 'motion/react';
import EngineeringBackground from './components/EngineeringBackground';
import ProjectDetailRouter from './components/ProjectDetailRouter';

import {
  Cpu, Terminal, Search, X, Sliders,
  Gauge, Zap, AlertCircle, ChevronRight
} from 'lucide-react';

export default function App() {
  // ---- URL-derived initial states ----
  const getInitialTabAndSlug = (): { tab: NavTab; slug: string | null } => {
    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/login') return { tab: 'admin', slug: null };
    if (path === '/admin/dashboard') return { tab: 'admin-dashboard', slug: null };
    if (path === '/request-access') return { tab: 'access-request', slug: null };
    if (path.startsWith('/projects/')) {
      return { tab: 'projects', slug: path.replace('/projects/', '') };
    }
    const cleanPath = path.replace(/^\//, '');
    const knownTabs: NavTab[] = ['home', 'about', 'projects', 'contact', 'access-request', 'portal', 'admin', 'admin-dashboard'];
    if (knownTabs.includes(cleanPath as any)) {
      return { tab: cleanPath as NavTab, slug: null };
    }
    return { tab: 'home', slug: null };
  };
  const initial = getInitialTabAndSlug();

  const [activeTab, setActiveTab] = useState<NavTab>(initial.tab);
  const [projectSlug, setProjectSlug] = useState<string | null>(initial.slug);

  const [simTab, setSimTab] = useState<'pipeline' | 'cache' | 'memory'>('pipeline');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  
  // Overlays State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Dynamic config parameters state
  const [clockSpeed, setClockSpeed] = useState<number>(3.2); // GHz
  const [nodeSize, setNodeSize] = useState<string>('7nm FinFET');
  const [voltage, setVoltage] = useState<number>(0.675); // V

  // Dynamic projects list state
  const [projects, setProjects] = useState<Project[]>(PROJECTS);

  useEffect(() => {
    fetch('/projects/projects.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch JSON');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data);
        }
      })
      .catch(err => {
        console.warn('[App] Dynamic projects registry load failed, using fallback:', err);
      });
  }, []);

  // CMD+K event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);



  // Synchronize activeTab + projectSlug with URL path
  useEffect(() => {
    const currentPath = window.location.pathname;
    let targetPath = '/';
    if (activeTab === 'admin') {
      targetPath = '/admin/login';
    } else if (activeTab === 'admin-dashboard') {
      targetPath = '/admin/dashboard';
    } else if (activeTab === 'access-request') {
      targetPath = '/request-access';
    } else if (activeTab === 'projects' && projectSlug) {
      targetPath = `/projects/${projectSlug}`;
    } else if (activeTab !== 'home') {
      targetPath = `/${activeTab}`;
    }

    if (currentPath !== targetPath) {
      window.history.pushState({ tab: activeTab, slug: projectSlug }, '', targetPath);
    }
  }, [activeTab, projectSlug]);

  // Handle browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const path = window.location.pathname;
      if (path === '/admin' || path === '/admin/login') {
        setActiveTab('admin');
        setProjectSlug(null);
      } else if (path === '/admin/dashboard') {
        setActiveTab('admin-dashboard');
        setProjectSlug(null);
      } else if (path === '/request-access') {
        setActiveTab('access-request');
        setProjectSlug(null);
      } else if (path.startsWith('/projects/')) {
        setActiveTab('projects');
        setProjectSlug(path.replace('/projects/', ''));
      } else {
        const cleanPath = path.replace(/^\//, '');
        const knownTabs: NavTab[] = ['home', 'about', 'projects', 'contact', 'access-request', 'portal', 'admin', 'admin-dashboard'];
        if (knownTabs.includes(cleanPath as any)) {
          setActiveTab(cleanPath as NavTab);
        } else {
          setActiveTab('home');
        }
        setProjectSlug(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Enforce administrator auth for the admin-dashboard
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const adminEmail = 'crazyplayz61@gmail.com';
      const isAuthorized = !!(user && user.email && user.email.toLowerCase() === adminEmail.toLowerCase());
      setIsAdminAuthenticated(isAuthorized);
      if (activeTab === 'admin-dashboard' && !isAuthorized) {
        setActiveTab('admin');
      }
    });
    return () => unsubscribe();
  }, [activeTab]);



  const filteredSearchResults = searchQuery.trim() === ''
    ? []
    : projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Wrapper so any tab switch (including nav-link clicks while on a project
  // detail route) also clears the projectSlug and returns the user to the
  // projects overview grid.
  const navigateTab = (tab: NavTab | string) => {
    setActiveTab(tab as NavTab);
    setProjectSlug(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] bg-semiconductor-grid bg-wafer-rings text-white flex flex-col justify-between selection:bg-[#a78bfa]/30 selection:text-white" id="root-viewport">

      {/* Global engineering circuit background */}
      <EngineeringBackground />
      
      {/* Sticky TopNavBar */}
      <TopNavBar
        activeTab={activeTab}
        setActiveTab={navigateTab}
        onSearchOpen={() => setSearchOpen(true)}
        onSettingsOpen={() => setSettingsOpen(true)}
        onSystemStatusOpen={() => {}}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.26, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            {/* HOMEPAGE VIEW (Unified Engineering Hub) */}
            {activeTab === 'home' && (
          <div className="relative">
            
            {/* Section 1: Hero Scene */}
            <section className="relative h-[80vh] w-full flex items-center justify-center border-b border-[rgba(255,255,255,0.06)] overflow-hidden" id="hero-section">
              {/* Interactive Vector 3D background */}
              <InteractiveHeroCanvas />

              {/* Silicon Wafer Design Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(167,139,250,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(167,139,250,0.015)_1px,transparent_1px)] bg-[size:5rem_5rem] z-0 pointer-events-none" />

              {/* Ambient Glowing Silicon Nodes */}
              <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-[#a78bfa]/[0.03] rounded-full blur-[100px] pointer-events-none z-0 animate-pulse duration-[8000ms]" />
              <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#e879f9]/[0.02] rounded-full blur-[100px] pointer-events-none z-0 animate-pulse duration-[12000ms]" />

              {/* Radial gradient mask to guarantee flawless typographic contrast */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,10,10,0.2)_0%,rgba(10,10,10,0.85)_100%)] pointer-events-none z-1" />

              {/* Glassmorphic Title overlay card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-slate-950/80 border border-slate-800 font-mono text-[10px] tracking-widest text-[#a78bfa] uppercase mb-5"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  ⚡ INTEGRATED CIRCUITS & SYSTEMS RESEARCH // v1.0.0
                </motion.div>
                <h1 className="font-sans text-5xl font-black tracking-tight leading-[0.95] text-white sm:text-7xl md:text-8xl uppercase">
                  Akshay Srikrishnan:<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] via-[#c084fc] to-[#e879f9]">Architecting Silicon</span>
                </h1>
                <p className="mx-auto mt-8 max-w-2xl font-sans text-base text-slate-300 leading-relaxed">
                  Designing synthesizable micro-architectures, low-latency coherent cache fabrics, high-speed interconnect switches, and automating silicon physical implementation GDS flows.
                </p>
                
                {/* Hero CTAs */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="w-full sm:w-auto rounded-lg bg-[#a78bfa] px-8 py-4 font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#0a0a0a] hover:bg-[#b49dfb] active:scale-95 transition-all shadow-lg shadow-[#a78bfa]/25 duration-200 cursor-pointer"
                  >
                    Explore Architecture
                  </button>
                  <button
                    onClick={() => setActiveTab('about')}
                    className="w-full sm:w-auto rounded-lg border-2 border-[#a78bfa]/80 bg-transparent px-8 py-4 font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#a78bfa] hover:bg-[#a78bfa]/10 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    Meet the Architect
                  </button>
                </div>
              </motion.div>

              {/* Premium micro-designed scroll indicator */}
              <div
                onClick={() => {
                  window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
                }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-300"
              >
                <span className="font-mono text-[9px] text-[#a78bfa] tracking-[0.25em]">// SYS_INITIAL_MONITOR</span>
                <div className="w-[18px] h-[30px] rounded-full border border-slate-600 flex justify-center p-1">
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                    className="w-1 h-1.5 rounded-full bg-[#a78bfa]"
                  />
                </div>
              </div>

              {/* Bottom linear trace decorations */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#a78bfa]/30 to-transparent" />
            </section>

            {/* Automated Design Flow Visualizer */}
            <DesignFlowVisualizer />

            {/* Comprehensive Toolchain Matrix */}
            <EngineeringToolchain />

          </div>
        )}

        {/* ABOUT VIEW */}
        {activeTab === 'about' && <About />}

        {/* PROJECTS LIBRARY VIEW */}
        {activeTab === 'projects' && !projectSlug && (
          <ProjectsLibrary
            projects={projects}
            setActiveTab={navigateTab}
            onOpenProject={(slug) => setProjectSlug(slug)}
          />
        )}

        {/* CONTACT VIEW */}
        {activeTab === 'contact' && <Contact />}

        {/* ACCESS REQUEST VIEW */}
        {activeTab === 'access-request' && (
          <AccessRequest onReturn={() => setActiveTab('home')} />
        )}

        {/* SECURE PORTAL VIEW */}
        {activeTab === 'portal' && (
          <SecurePortal onRequestAccess={() => setActiveTab('access-request')} />
        )}

        {/* ADMIN LOGIN VIEW */}
        {activeTab === 'admin' && (
          <AdminLogin 
            onLoginSuccess={() => setActiveTab('admin-dashboard')} 
            onReturn={() => setActiveTab('home')} 
          />
        )}

        {/* ADMIN DASHBOARD VIEW */}
        {activeTab === 'admin-dashboard' && isAdminAuthenticated && (
          <AdminDashboard onReturn={() => setActiveTab('home')} />
        )}

          </motion.div>
        </AnimatePresence>

        {/* Project Detail Pages — rendered OUTSIDE AnimatePresence to avoid motion/react conflicts */}
        {activeTab === 'projects' && projectSlug && (
          <ProjectDetailRouter slug={projectSlug} projects={projects} setActiveTab={navigateTab} />
        )}
      </main>

      {/* Global Footer component */}
      <Footer
        setActiveTab={navigateTab}
        onSystemStatusOpen={() => {}}
        onSecureDoubleClick={() => setIsAdminModalOpen(true)}
      />

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdminModalOpen(false);
          setActiveTab('admin-dashboard');
        }}
      />

      {/* OVERLAY 1: CMD+K GLOBAL FUZZY SEARCH MODAL */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-lg border border-[rgba(255,255,255,0.15)] bg-[#121212] p-6 shadow-2xl">
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <span className="font-mono text-[9px] uppercase font-bold text-[#a78bfa] tracking-widest block mb-2">
              🔍 Global Schematic Search
            </span>

            <div className="relative flex items-center mb-4">
              <Search className="absolute left-3.5 h-4.5 w-4.5 text-slate-500" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type 'RV32IM', 'RISC-V', or 'ASIC' to filter..."
                className="w-full rounded-md bg-[#0a0a0a] border border-[rgba(255,255,255,0.08)] pl-11 pr-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-[#a78bfa]/50"
              />
            </div>

            {/* List Results */}
            <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
              {searchQuery.trim() === '' ? (
                <div className="text-center p-6 text-slate-500">
                  <Terminal className="h-6 w-6 text-slate-500 mx-auto mb-2 animate-pulse" />
                  <span>Type to search active registers and micro-cores</span>
                </div>
              ) : filteredSearchResults.length > 0 ? (
                filteredSearchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveTab('projects');
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-3 rounded-lg bg-[#181818] border border-[rgba(255,255,255,0.04)] hover:border-[#a78bfa]/30 transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[#a78bfa] font-bold block">{p.name}</span>
                      <span className="text-slate-400 text-[10px] block mt-0.5">{p.tagline}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#a78bfa]" />
                  </button>
                ))
              ) : (
                <div className="text-center p-6 text-[#ef4444] font-bold">
                  <AlertCircle className="h-6 w-6 text-[#ef4444] mx-auto mb-2" />
                  <span>No matching hardware address resolved in ROM</span>
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-[rgba(255,255,255,0.06)] pt-3 flex justify-between items-center text-[9px] font-mono text-slate-500">
              <span>ESC to dismiss</span>
              <span>Search Database version 1.0.0</span>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY 2: HARDWARE SIMULATION SETTINGS MODAL */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-lg border border-[rgba(255,255,255,0.15)] bg-[#121212] p-6 shadow-2xl">
            <button
              onClick={() => setSettingsOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-3 mb-5">
              <Sliders className="h-5 w-5 text-[#a78bfa]" />
              <h2 className="font-sans text-base font-extrabold text-white">
                Physical Hardware Parameters
              </h2>
            </div>

            <div className="space-y-5 font-mono text-xs">
              
              {/* Sliders 1: Frequency */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Gauge className="h-4 w-4 text-[#a78bfa]" /> MAPPED CORE FREQUENCY:
                  </span>
                  <span className="text-[#a78bfa] font-bold">{clockSpeed.toFixed(1)} GHz</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.5"
                  step="0.1"
                  value={clockSpeed}
                  onChange={(e) => setClockSpeed(parseFloat(e.target.value))}
                  className="w-full accent-[#a78bfa]"
                />
              </div>

              {/* Sliders 2: Voltage */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Zap className="h-4 w-4 text-[#a78bfa]" /> CORE VDD VOLTAGE RAIL:
                  </span>
                  <span className="text-[#a78bfa] font-bold">{voltage.toFixed(3)} V</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.2"
                  step="0.025"
                  value={voltage}
                  onChange={(e) => setVoltage(parseFloat(e.target.value))}
                  className="w-full accent-[#a78bfa]"
                />
              </div>

              {/* Dropdown: Process Node */}
              <div>
                <span className="block text-slate-300 mb-1.5 uppercase font-bold text-[9px]">
                  🔬 Micro-technology PDK Node:
                </span>
                <select
                  value={nodeSize}
                  onChange={(e) => setNodeSize(e.target.value)}
                  className="w-full rounded bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] px-3 py-2 text-white focus:outline-none focus:border-[#a78bfa]/50"
                >
                  <option value="7nm FinFET">TSMC 7nm FinFET PDK (High Performance)</option>
                  <option value="Intel 16">Intel 16nm Tri-Gate (Standard-Core)</option>
                  <option value="22nm FD-SOI">GF 22FDX (Ultra-Low Leakage)</option>
                  <option value="Artix-7 FPGA">Xilinx Artix-7 Segment (Look-up Cells)</option>
                </select>
              </div>

            </div>

            <button
              onClick={() => setSettingsOpen(false)}
              className="w-full mt-6 rounded-lg bg-[#a78bfa] py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[#0a0a0a] hover:bg-[#bca5ff]"
            >
              Apply Physical Parameters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
