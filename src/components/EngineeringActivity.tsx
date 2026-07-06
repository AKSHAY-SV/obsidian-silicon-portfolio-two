import React, { useState } from 'react';
import { COMMITS } from '../data';
import { GitCommit, GitBranch, Heart, Database, Terminal, ShieldAlert, Cpu } from 'lucide-react';

export default function EngineeringActivity() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Create 52 columns * 7 rows = 364 cells for contributions heatmap
  // Value represents commit volume (0: None, 1: Low, 2: Mid, 3: High)
  const heatmapData: number[] = [];
  for (let i = 0; i < 364; i++) {
    // Generate a structured pseudo-random noise but with a clear "active" bias
    const noise = Math.sin(i * 0.1) * Math.cos(i * 0.05);
    let val = 0;
    if (noise > 0.4) val = 3; // High
    else if (noise > 0.1) val = 2; // Mid
    else if (noise > -0.3) val = 1; // Low
    heatmapData.push(val);
  }

  const getHeatmapColor = (val: number) => {
    switch (val) {
      case 0: return 'bg-[#181818]';
      case 1: return 'bg-purple-950/40 text-purple-800';
      case 2: return 'bg-purple-800/65 text-purple-400';
      case 3: return 'bg-[#a78bfa] text-[#0a0a0a]';
      default: return 'bg-[#181818]';
    }
  };

  const languages = [
    { name: 'Verilog RTL (Hardware description)', percent: 65, color: 'bg-[#a78bfa]' },
    { name: 'SystemVerilog (Assertions & UVM Verification)', percent: 20, color: 'bg-[#c084fc]' },
    { name: 'C/C++ Co-Simulation Systems (Verilator)', percent: 10, color: 'bg-sky-400' },
    { name: 'Python (Cocotb Verification Testbenches)', percent: 5, color: 'bg-emerald-400' }
  ];

  return (
    <section className="py-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="mb-8 text-center md:text-left">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#a78bfa]">
            Development Telemetry Log
          </span>
          <h1 className="mt-2 font-sans text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            ENGINEERING CONTRIBS & LOGS
          </h1>
          <p className="mt-3 font-sans text-base text-[#94a3b8]">
            Observe real-time digital contributions, multi-branch commit pipelines, and hardware language compilation weights.
          </p>
        </div>

        {/* 1. Contribution Heatmap Board */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#121212] p-6 mb-8">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#a78bfa]">
                📊 52-WEEK CONTRIBUTIONS TELEMETRY
              </span>
              <p className="font-sans text-xs text-[#94a3b8] mt-0.5">
                Each grid cell maps atomic RTL synthesis compilations and physical GDS layout checkins.
              </p>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
              <span>Less</span>
              <span className="h-2.5 w-2.5 rounded bg-[#181818]" />
              <span className="h-2.5 w-2.5 rounded bg-purple-950/40" />
              <span className="h-2.5 w-2.5 rounded bg-purple-800/65" />
              <span className="h-2.5 w-2.5 rounded bg-[#a78bfa]" />
              <span>More</span>
            </div>
          </div>

          {/* Grid canvas wrapping all 364 days */}
          <div className="overflow-x-auto">
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[620px] max-h-[140px]">
              {heatmapData.map((val, idx) => (
                <div
                  key={idx}
                  className={`h-2.5 w-2.5 rounded-sm transition-transform hover:scale-125 ${getHeatmapColor(val)}`}
                  title={`Sect: ${idx} | Weight: ${val}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 2. Language composition progress bar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
          
          {/* Language distribution column (Left 2-colspan) */}
          <div className="lg:col-span-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#121212] p-5 flex flex-col justify-between">
            <div>
              <span className="block font-mono text-[10px] uppercase font-bold tracking-widest text-[#a78bfa] mb-4">
                💻 SYNTAX COMPOSITION FREQUENCY
              </span>
              
              <div className="space-y-4">
                {languages.map((lang) => (
                  <div key={lang.name}>
                    <div className="flex justify-between items-center font-mono text-xs mb-1.5">
                      <span className="text-slate-300">{lang.name}</span>
                      <span className="text-[#a78bfa] font-bold">{lang.percent}%</span>
                    </div>
                    {/* Progress Bar background */}
                    <div className="h-2 w-full rounded bg-[#1a1a1a] overflow-hidden border border-[rgba(255,255,255,0.04)]">
                      <div className={`h-full rounded ${lang.color}`} style={{ width: `${lang.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-[rgba(255,255,255,0.06)] pt-4 font-sans text-[11px] text-[#94a3b8] flex gap-2">
              <Cpu className="h-4.5 w-4.5 text-[#a78bfa]" />
              <span>Synthesis logic compiled and mapped against TSMC 7nm physical library gates.</span>
            </div>
          </div>

          {/* Sidebar Hardware Diagnostic reports */}
          <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#121212] p-5 flex flex-col justify-between">
            <div>
              <span className="block font-mono text-[10px] uppercase font-bold tracking-widest text-[#a78bfa] mb-3">
                📢 REPO TELEMETRY HEALTH
              </span>
              
              <div className="space-y-3 font-mono text-xs text-slate-300">
                <div className="flex justify-between items-center p-2 rounded bg-[#181818]">
                  <span>REPOSITORIES INDEXED:</span>
                  <span className="font-bold text-[#a78bfa]">12</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-[#181818]">
                  <span>VERILOG STREAMS:</span>
                  <span className="font-bold text-[#a78bfa]">48.5K LOC</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-[#181818]">
                  <span>CI/CD RUNNERS:</span>
                  <span className="font-bold text-[#10b981]">ONLINE</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-[#181818]">
                  <span>STA SIGNOFF COVER:</span>
                  <span className="font-bold text-white">99.8%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded border border-[rgba(255,255,255,0.04)] bg-[#181818] p-3 font-sans text-[10px] text-[#94a3b8] flex gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>All repositories are bound by secure GPG signoff validations and locked under main branches.</span>
            </div>
          </div>

        </div>

        {/* 3. Telemetry Commit Logs Table */}
        <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#121212] p-5">
          <span className="block font-mono text-[10px] uppercase font-bold tracking-widest text-[#a78bfa] mb-4">
            📦 ACTIVE DEVELOPMENT COMMIT PIPELINE
          </span>
          
          <div className="border border-[rgba(255,255,255,0.06)] rounded overflow-hidden">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#181818] text-[#94a3b8] border-b border-[rgba(255,255,255,0.06)]">
                <tr>
                  <th className="p-3 w-28">Commit Hash</th>
                  <th className="p-3">Commit Message Specification</th>
                  <th className="p-3 w-48">Branch Track</th>
                  <th className="p-3 text-right w-48">Time Stamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-slate-300">
                {COMMITS.map((commit) => (
                  <tr key={commit.hash} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="p-3 font-bold text-[#a78bfa]">
                      {commit.hash}
                    </td>
                    <td className="p-3 text-white flex items-center gap-2">
                      <GitCommit className="h-4 w-4 text-[#94a3b8] shrink-0" />
                      <span className="truncate max-w-lg" title={commit.message}>{commit.message}</span>
                    </td>
                    <td className="p-3">
                      <span className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                        <GitBranch className="h-3.5 w-3.5" />
                        {commit.branch}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-500">
                      {commit.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
