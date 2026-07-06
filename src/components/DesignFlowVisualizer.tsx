import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, Code, Play, ShieldCheck, Hammer, Sliders, Layout, 
  Cpu, GitMerge, Clock, FileCheck, CheckCircle2, ChevronRight,
  ChevronDown
} from 'lucide-react';

interface FlowStage {
  id: string;
  name: string;
  tool: string;
  desc: string;
  icon: any;
  status: 'completed' | 'learning' | 'upcoming';
}

export default function DesignFlowVisualizer() {
  const stages: FlowStage[] = [
    { id: 'spec', name: 'Specification', tool: 'Architecture Doc', desc: 'Defining pipeline architecture, registers, instruction mappings, and cache limits.', icon: FileText, status: 'completed' },
    { id: 'rtl', name: 'RTL Design', tool: 'SystemVerilog / Chisel', desc: 'Coding synthesizable behavioral and structural designs.', icon: Code, status: 'completed' },
    { id: 'sim', name: 'Simulation', tool: 'Verilator / Icarus', desc: 'Compiling register transfer modules and running basic testbenches.', icon: Play, status: 'completed' },
    { id: 'verify', name: 'Verification', tool: 'Cocotb / SVA / SymbiYosys', desc: 'Writing formal assertions, checking snoop queues and state machines.', icon: ShieldCheck, status: 'completed' },
    { id: 'synth', name: 'Synthesis', tool: 'Yosys / Synopsys DC', desc: 'Mapping behavioral HDL logic onto logical gates.', icon: Hammer, status: 'completed' },
    { id: 'floorplan', name: 'Floorplanning', tool: 'OpenROAD / Innovus', desc: 'Setting silicon die dimensions, core boundaries, and power grids.', icon: Layout, status: 'completed' },
    { id: 'placement', name: 'Placement', tool: 'OpenROAD Place', desc: 'Placing logical gates onto silicon tracks.', icon: Sliders, status: 'completed' },
    { id: 'cts', name: 'Clock Tree Synthesis', tool: 'Innovus MSCTS', desc: 'Constructing H-Tree clock nets to distribute timing signals.', icon: Clock, status: 'learning' },
    { id: 'route', name: 'Routing', tool: 'TritonRoute / Innovus', desc: 'Connecting wire signals across metal routing layers.', icon: GitMerge, status: 'learning' },
    { id: 'timing', name: 'Timing Analysis', tool: 'OpenSTA / PrimeTime', desc: 'Static Timing Analysis (STA) to calculate worst slacks and timing closures.', icon: FileCheck, status: 'learning' },
    { id: 'drc', name: 'DRC Check', tool: 'Magic / Calibre', desc: 'Design Rule Checks to verify manufacturing layout constraints.', icon: FileCheck, status: 'learning' },
    { id: 'lvs', name: 'LVS Check', tool: 'Netgen / Calibre', desc: 'Layout vs. Schematic check to match source netlists and physical gates.', icon: FileCheck, status: 'learning' },
    { id: 'gdsii', name: 'GDSII Streamout', tool: 'KLayout / Innovus', desc: 'Generating final streamout photomask files for factory tapeouts.', icon: Cpu, status: 'learning' },
  ];

  return (
    <section className="py-20 border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0a]" id="semiconductor-design-flow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-14">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#a78bfa] block">
            RTL-TO-GDSII PROCESS
          </span>
          <h2 className="mt-2 font-sans text-3xl font-extrabold tracking-tight text-white uppercase sm:text-4xl">
            Semiconductor Design Flow
          </h2>
          <p className="mt-4 font-sans text-sm text-[#94a3b8] max-w-3xl leading-relaxed">
            Every step of the digital physical implementation cycle. Tracing logic constraints from initial hardware specification blocks to streamout GDSII silicon.
          </p>
        </div>

        {/* Interactive Flowchart with Arrows */}
        <div className="relative" id="flowchart-container">
          
          {/* Desktop view controller & navigation instructions */}
          <div className="hidden md:flex justify-between items-center mb-6">
            <span className="font-mono text-[10px] uppercase text-slate-500 font-extrabold tracking-wider flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa] animate-ping" />
              ✦ Scroll horizontally to trace the logic pipeline
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const el = document.getElementById('flowchart-scroll-track');
                  if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
                }}
                className="h-8 w-8 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#111] text-slate-400 hover:text-white hover:border-[#a78bfa]/50 transition-colors flex items-center justify-center cursor-pointer"
                title="Scroll Left"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('flowchart-scroll-track');
                  if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
                }}
                className="h-8 w-8 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#111] text-slate-400 hover:text-white hover:border-[#a78bfa]/50 transition-colors flex items-center justify-center cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Desktop Flowchart layout (horizontal slider with connected arrows) */}
          <div 
            id="flowchart-scroll-track"
            className="hidden md:flex items-stretch overflow-x-auto pb-6 gap-4 scroll-smooth snap-x select-none"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(167, 139, 250, 0.2) transparent'
            }}
          >
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isLast = index === stages.length - 1;
              const isCompleted = stage.status === 'completed';
              const isLearning = stage.status === 'learning';
              
              return (
                <React.Fragment key={stage.id}>
                  {/* Pipeline Stage Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.35, delay: index * 0.03 }}
                    whileHover={{ y: -4, borderColor: 'rgba(167, 139, 250, 0.4)' }}
                    className={`snap-center shrink-0 w-72 p-5 rounded-xl border bg-[#111111]/90 flex flex-col justify-between transition-all ${
                      isCompleted 
                        ? 'border-purple-500/25 shadow-[0_4px_20px_rgba(167,139,250,0.02)]' 
                        : isLearning 
                        ? 'border-dashed border-[#a78bfa] shadow-[0_0_15px_rgba(167,139,250,0.08)]' 
                        : 'border-[rgba(255,255,255,0.05)]'
                    }`}
                  >
                    <div>
                      {/* Connection Flow Pulse Ticker (top index count tag) */}
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-mono text-[9px] uppercase font-extrabold tracking-widest text-[#a78bfa]/60">
                          STAGE {(index + 1).toString().padStart(2, '0')}
                        </span>
                        {isCompleted && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        )}
                        {isLearning && (
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                        )}
                      </div>

                      {/* Icon Panel */}
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center border mb-4 ${
                        isCompleted 
                          ? 'bg-purple-900/10 border-purple-500/35 text-purple-400' 
                          : 'bg-indigo-900/15 border-[#a78bfa]/50 text-[#a78bfa]'
                      }`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>

                      {/* Title & Tool */}
                      <h3 className="font-sans text-sm font-black text-white tracking-tight uppercase">
                        {stage.name}
                      </h3>
                      <div className="mt-1 font-mono text-[9px] text-[#a78bfa] uppercase font-black tracking-wider flex items-center gap-1">
                        <span className="text-[10px]">⚙</span> {stage.tool}
                      </div>

                      {/* Description */}
                      <p className="mt-3 font-sans text-xs text-slate-400 leading-relaxed min-h-[50px]">
                        {stage.desc}
                      </p>
                    </div>

                    {/* Status indicator line */}
                    <div className="mt-5 pt-3.5 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between text-[9px] font-mono">
                      <span className="text-slate-500 uppercase font-semibold">Verification:</span>
                      <span className={`uppercase font-bold tracking-wider flex items-center gap-1 ${
                        isCompleted ? 'text-emerald-400' : 'text-purple-400 animate-pulse'
                      }`}>
                        <span className={`h-1 w-1 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-purple-400'}`} />
                        {isCompleted ? 'Verified' : 'In Progress'}
                      </span>
                    </div>
                  </motion.div>

                  {/* Flowchart Arrow Connector */}
                  {!isLast && (
                    <div className="hidden md:flex items-center justify-center shrink-0">
                      <div className={`h-[1px] w-6 ${isCompleted ? 'bg-purple-500/30' : 'bg-white/10'}`} />
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(255,255,255,0.06)] bg-[#141416] text-[#a78bfa]/70 hover:text-white hover:border-[#a78bfa]/30 transition-colors">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                      <div className={`h-[1px] w-6 ${isCompleted ? 'bg-purple-500/30' : 'bg-white/10'}`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile view: Connected Vertical List */}
          <div className="flex md:hidden flex-col gap-2">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isLast = index === stages.length - 1;
              const isCompleted = stage.status === 'completed';
              const isLearning = stage.status === 'learning';
              
              return (
                <React.Fragment key={stage.id}>
                  {/* Pipeline Stage Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    className={`relative p-5 rounded-xl border bg-[#111111]/90 flex flex-col justify-between ${
                      isCompleted 
                        ? 'border-purple-500/20' 
                        : isLearning 
                        ? 'border-dashed border-[#a78bfa]' 
                        : 'border-[rgba(255,255,255,0.05)]'
                    }`}
                  >
                    <div className="absolute top-4 right-4 font-mono text-[9px] uppercase font-extrabold tracking-widest text-[#a78bfa]/60">
                      STAGE {(index + 1).toString().padStart(2, '0')}
                    </div>

                    <div className="flex items-start gap-4">
                      {/* Icon Panel */}
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center border shrink-0 ${
                        isCompleted 
                          ? 'bg-purple-900/10 border-purple-500/30 text-purple-400' 
                          : 'bg-indigo-900/15 border-[#a78bfa]/50 text-[#a78bfa]'
                      }`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-sans text-sm font-black text-white tracking-tight uppercase">
                          {stage.name}
                        </h3>
                        <div className="font-mono text-[9px] text-[#a78bfa] uppercase font-black tracking-wider">
                          ⚙ {stage.tool}
                        </div>
                        <p className="font-sans text-xs text-slate-400 leading-relaxed pt-1">
                          {stage.desc}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between text-[9px] font-mono">
                      <span className="text-slate-500 uppercase font-semibold">Verification:</span>
                      <span className={`uppercase font-bold tracking-wider flex items-center gap-1 ${
                        isCompleted ? 'text-emerald-400' : 'text-purple-400 animate-pulse'
                      }`}>
                        <span className={`h-1 w-1 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-purple-400'}`} />
                        {isCompleted ? 'Verified' : 'In Progress'}
                      </span>
                    </div>
                  </motion.div>

                  {/* Flowchart Arrow Connector (Vertical) */}
                  {!isLast && (
                    <div className="flex items-center justify-center py-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-[1px] h-4 ${isCompleted ? 'bg-purple-500/30' : 'bg-white/10'}`} />
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(255,255,255,0.06)] bg-[#141416] text-[#a78bfa]/70">
                          <ChevronDown className="h-3 w-3" />
                        </div>
                        <div className={`w-[1px] h-4 ${isCompleted ? 'bg-purple-500/30' : 'bg-white/10'}`} />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
