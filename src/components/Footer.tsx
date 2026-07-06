import React from 'react';
import { Cpu, Github, Linkedin, Rss, Share2, Shield, Heart } from 'lucide-react';
import { NavTab } from '../types';

interface FooterProps {
  setActiveTab: (tab: NavTab) => void;
  onSystemStatusOpen: () => void;
  onSecureDoubleClick?: () => void;
}

export default function Footer({ setActiveTab, onSystemStatusOpen, onSecureDoubleClick }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  // Track clicks for hidden interaction
  const clickData = React.useRef({ count: 0, lastTime: 0 });
  
  const handleSecureClick = () => {
    const now = Date.now();
    if (now - clickData.current.lastTime < 2000) {
      clickData.current.count += 1;
    } else {
      clickData.current.count = 1;
    }
    clickData.current.lastTime = now;
    
    if (clickData.current.count >= 2) {
      onSecureDoubleClick?.();
      clickData.current.count = 0; // reset
    }
  };

  return (
    <footer className="w-full border-t border-[rgba(255,255,255,0.06)] bg-[#0c0c0c] pt-12 pb-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main 3-Column Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 pb-12">
          
          {/* Column 1: Brand & Statement */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#121212]">
                <Cpu className="h-4.5 w-4.5 text-[#a78bfa]" />
              </div>
              <span className="font-sans font-bold tracking-tight text-white">
                OBSIDIAN ARCHITECTURE
              </span>
            </div>
            <p className="font-sans text-sm text-[#94a3b8] leading-relaxed max-w-sm">
              Engineered for high-performance silicon architecture, hardware description languages, synthesizable RTL systems, and automated ASIC digital backend tape-outs.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#a78bfa]">
              Quick Navigation
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <button
                onClick={() => setActiveTab('home')}
                className="text-left font-sans text-sm text-[#94a3b8] hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className="text-left font-sans text-sm text-[#94a3b8] hover:text-white transition-colors"
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-left font-sans text-sm text-[#94a3b8] hover:text-white transition-colors"
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('portal')}
                className="text-left font-sans text-sm text-[#94a3b8] hover:text-white transition-colors"
              >
                Engineering Portal
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className="text-left font-sans text-sm text-[#94a3b8] hover:text-white transition-colors"
              >
                Contact
              </button>
            </div>
          </div>

          {/* Column 3: Connectivity */}
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#a78bfa]">
              System Interfaces
            </span>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/AKSHAY-SV"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#121212] text-[#94a3b8] hover:bg-[#1a1a1a] hover:text-white transition-all"
                title="GitHub Profile"
              >
                <Github className="h-4.5 w-4.5" />
              </a>
              <a
                href="https://www.linkedin.com/in/akshay-srikrishnan150411/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#121212] text-[#94a3b8] hover:bg-[#1a1a1a] hover:text-white transition-all"
                title="LinkedIn Profile"
              >
                <Linkedin className="h-4.5 w-4.5" />
              </a>
            </div>
            <div className="flex items-center gap-1.5 text-[#94a3b8] text-xs font-mono">
              <Shield className="h-3.5 w-3.5 text-[#a78bfa]" />
              <span 
                onClick={handleSecureClick}
                onDoubleClick={onSecureDoubleClick}
                className="cursor-default select-none"
              >
                Secure
              </span>{' '}
              SHA-256 Signoff Enabled
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.06)] pt-6">
          <div className="font-mono text-xs text-[#94a3b8] flex items-center gap-1 flex-wrap justify-center">
            <span>© {currentYear} Akshay Srikrishnan. All core designs reserved.</span>
            <span className="hidden sm:inline">|</span>
            <span className="flex items-center gap-1">
              Synthesized with <Heart className="h-3 w-3 text-[#ef4444]" /> on Obsidian Fabric
            </span>
          </div>

          {/* Dynamic System Status dot */}
          <button
            onClick={onSystemStatusOpen}
            className="flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#121212] px-3 py-1 text-left transition-all hover:border-[#10b981]/40"
            id="system-status-indicator"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10b981]" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#94a3b8]">
              FLOW STATUS: <span className="text-[#10b981] font-semibold">NOMINAL</span>
            </span>
          </button>
        </div>

      </div>
    </footer>
  );
}
