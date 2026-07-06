import React from 'react';
import { Search, Settings, FileDown, Cpu, Menu, X, Terminal, Shield } from 'lucide-react';
import { NavTab } from '../types';
import { motion } from 'motion/react';

interface TopNavBarProps {
  activeTab: NavTab | string;
  setActiveTab: (tab: NavTab | string) => void;
  onSearchOpen: () => void;
  onSettingsOpen: () => void;
  onSystemStatusOpen: () => void;
}

export default function TopNavBar({
  activeTab,
  setActiveTab,
  onSearchOpen,
  onSettingsOpen,
  onSystemStatusOpen
}: TopNavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems: { id: NavTab; label: string; highlight?: boolean }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' },
    { id: 'access-request', label: 'Request Access' },
    { id: 'portal', label: 'Portal', highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 h-16 lg:h-20 w-full border-b border-[rgba(255,255,255,0.08)] bg-[#0a0a0ae0] backdrop-blur-md shadow-lg shadow-black/20 transition-all duration-300">
      <div className="mx-auto flex h-full max-w-7xl xl:max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo Left */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 lg:gap-3.5 text-left group focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:outline-none rounded-lg p-1"
          id="nav-brand-logo"
          aria-label="Obsidian Architecture - Silicon Design Hub Home"
        >
          <div className="relative flex h-9.5 w-9.5 lg:h-12 lg:w-12 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.15)] bg-[#121212] transition-all group-hover:border-[#a78bfa]/50">
            <Cpu className="h-5 w-5 lg:h-6 lg:w-6 text-[#a78bfa] transition-transform duration-700 group-hover:rotate-180" />
            <div className="absolute inset-0 rounded-lg bg-[#a78bfa]/10 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
          </div>
          <div>
            <span className="block font-sans font-black text-sm lg:text-base tracking-tight uppercase text-white leading-tight">
              Obsidian Architecture
            </span>
            <span className="block font-mono text-[8px] lg:text-[9.5px] uppercase tracking-[0.25em] text-[#a78bfa] font-semibold">
              Silicon Design Hub
            </span>
          </div>
        </button>

        {/* Nav Links Center (Desktop) */}
        <nav className="hidden lg:flex h-full items-center gap-1.5 xl:gap-3" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeTab === item.id || (item.id === 'projects' && typeof activeTab === 'string' && activeTab.startsWith('/projects/'));
            if (item.highlight) {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`relative flex h-full items-center px-2.5 xl:px-4 focus-visible:ring-2 focus-visible:ring-[#a78bfa]/70 focus-visible:outline-none`}
                  id={`nav-link-${item.id}`}
                  data-testid={`nav-link-${item.id}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 lg:px-4 lg:py-2.5 font-sans text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200 ${
                    isActive
                      ? 'bg-[#a78bfa] text-[#0a0a0a] shadow-md shadow-[#a78bfa]/30'
                      : 'bg-[#a78bfa]/10 border border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/20'
                  }`}>
                    <Shield className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-gradient-to-r from-[#a78bfa] to-[#c084fc] rounded-full shadow-[0_-1px_6px_rgba(167,139,250,0.5)]"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                </button>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`relative flex h-full items-center px-2.5 xl:px-4 font-sans text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#a78bfa]/70 focus-visible:outline-none ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
                id={`nav-link-${item.id}`}
                data-testid={`nav-link-${item.id}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-gradient-to-r from-[#a78bfa] to-[#c084fc] rounded-full shadow-[0_-1px_6px_rgba(167,139,250,0.5)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions Right */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <button
            onClick={onSearchOpen}
            className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-lg border border-transparent text-[#94a3b8] hover:border-[rgba(255,255,255,0.08)] hover:bg-[#161616] hover:text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:outline-none"
            title="Search Projects (Cmd+K)"
            id="nav-action-search"
            aria-label="Search Projects"
          >
            <Search className="h-4.5 w-4.5 lg:h-5.5 lg:w-5.5" />
          </button>

          <button
            onClick={onSettingsOpen}
            className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-lg border border-transparent text-[#94a3b8] hover:border-[rgba(255,255,255,0.08)] hover:bg-[#161616] hover:text-white transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:outline-none"
            title="System Settings"
            id="nav-action-settings"
            aria-label="System Settings"
          >
            <Settings className="h-4.5 w-4.5 lg:h-5.5 lg:w-5.5" />
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className="flex items-center gap-1.5 rounded-lg bg-[#a78bfa] px-4.5 py-2 lg:px-6 lg:py-3.5 font-sans text-[10px] lg:text-xs font-bold uppercase tracking-[0.15em] text-[#0a0a0a] hover:brightness-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none transition-all shadow-md shadow-[#a78bfa]/15 duration-200"
            id="nav-action-contact"
          >
            Get in Touch
          </button>
        </div>

        {/* Mobile Burger Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onSearchOpen}
            className="flex h-9.5 w-9.5 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#161616] hover:text-white"
          >
            <Search className="h-4.5 w-4.5" />
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9.5 w-9.5 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.1)] text-[#94a3b8] bg-[#121212] hover:text-white transition-colors"
            id="nav-burger-btn"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 border-b border-[rgba(255,255,255,0.1)] bg-[#0a0a0afc] p-4 backdrop-blur-xl lg:hidden animate-in slide-in-from-top-4 duration-250">
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id || (item.id === 'projects' && typeof activeTab === 'string' && activeTab.startsWith('/projects/'));
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-[0.15em] transition-all ${
                    item.highlight
                      ? isActive
                        ? 'bg-[#a78bfa] text-[#0a0a0a]'
                        : 'bg-[#a78bfa]/10 border border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/20'
                      : isActive
                        ? 'bg-[#181818] text-[#a78bfa] border-l-2 border-[#a78bfa]'
                        : 'text-[#94a3b8] hover:bg-[#121212] hover:text-white'
                  }`}
                >
                  {item.highlight && <Shield className="h-3.5 w-3.5" />}
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          <div className="mt-4 flex gap-2 border-t border-[rgba(255,255,255,0.08)] pt-4">
            <button
              onClick={() => {
                onSettingsOpen();
                setMobileMenuOpen(false);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#121212] border border-[rgba(255,255,255,0.1)] py-2 text-xs font-bold uppercase tracking-wider text-[#94a3b8]"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button
              onClick={() => {
                setActiveTab('contact');
                setMobileMenuOpen(false);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[#a78bfa] py-2 text-xs font-bold uppercase tracking-wider text-[#0a0a0a]"
            >
              Get in Touch
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
