import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cpu, Layers, Network, X, BookOpen, Activity, Terminal } from "lucide-react";

interface DiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: React.ReactNode;
}

function DiagramModal({ isOpen, onClose, title, description, children }: DiagramModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl bg-zinc-950 border border-zinc-800 p-6 md:p-8 overflow-y-auto flex flex-col space-y-6"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div>
            <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <Cpu className="h-5.5 w-5.5 text-purple-400 animate-pulse" />
              {title}
            </h3>
            <p className="text-sm text-zinc-400 font-mono mt-1">{description}</p>
          </div>

          <div className="flex-1 min-h-[300px] flex items-center justify-center bg-zinc-900/40 rounded-2xl border border-zinc-800/50 p-4">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function PipelineDiagram() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeStage, setActiveStage] = useState<number | null>(null);

  const stages = [
    { name: "IF", label: "Instruction Fetch", desc: "Fetches instructions from the local instruction cache or SRAM. Program Counter (PC) incremented.", activeColor: "stroke-blue-500 fill-blue-500/10 text-blue-400" },
    { name: "ID", label: "Instruction Decode", desc: "Decodes the fetched 32-bit instruction, reads registers from the dual-port register file, and generates immediately extended fields.", activeColor: "stroke-purple-500 fill-purple-500/10 text-purple-400" },
    { name: "EX", label: "Execute", desc: "Performs Arithmetic Logic Unit (ALU) operations, resolves branch targets, or initiates the hardware integer multiplier (M-extension).", activeColor: "stroke-rose-500 fill-rose-500/10 text-rose-400" },
    { name: "MEM", label: "Memory Access", desc: "Coordinates memory-mapped loads and stores with the unified non-blocking cache hierarchy. Handles alignment constraints.", activeColor: "stroke-emerald-500 fill-emerald-500/10 text-emerald-400" },
    { name: "WB", label: "Writeback", desc: "Registers ALU or load memory results back to the architectural register file, completing instruction commit cycle.", activeColor: "stroke-amber-500 fill-amber-500/10 text-amber-400" }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-purple-400" />
          RISC-V 5-Stage Pipeline
        </span>
        <button
          onClick={() => setModalOpen(true)}
          className="text-[10px] font-mono text-purple-400 hover:text-purple-300 transition-colors"
        >
          Expand Schematic
        </button>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col space-y-4">
        {/* Simple Horizontal Layout */}
        <div className="flex items-center justify-between gap-1">
          {stages.map((stage, idx) => (
            <React.Fragment key={stage.name}>
              <motion.div
                className={`flex-1 aspect-square rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                  activeStage === idx
                    ? "bg-purple-950/40 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
                onMouseEnter={() => setActiveStage(idx)}
                onMouseLeave={() => setActiveStage(null)}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-xs font-bold font-mono">{stage.name}</span>
                <span className="text-[7px] text-zinc-500 text-center uppercase tracking-widest mt-1 hidden sm:block">stage {idx+1}</span>
              </motion.div>
              {idx < stages.length - 1 && (
                <div className="h-0.5 w-3 bg-zinc-800 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Dynamic Detail Card */}
        <div className="min-h-[64px] p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-900 text-[11px] font-mono text-zinc-400">
          {activeStage !== null ? (
            <div>
              <span className="font-bold text-white uppercase">{stages[activeStage].label}:</span>{" "}
              <span>{stages[activeStage].desc}</span>
            </div>
          ) : (
            <div className="text-zinc-500 italic text-center py-2">
              Hover over a pipeline stage to inspect registers and RTL functions.
            </div>
          )}
        </div>
      </div>

      <DiagramModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="RV32IM Base Integer CPU core Micro-Architecture Pipeline"
        description="Detailed logical mapping of the synthesizable 5-stage classic RISC pipeline showcasing control hazard forwarding & stalls."
      >
        <div className="flex flex-col md:flex-row gap-6 items-center w-full">
          <div className="flex-1 w-full max-w-[500px]">
            <svg viewBox="0 0 500 200" className="w-full h-auto">
              {/* Stages boxes */}
              {stages.map((stage, idx) => {
                const x = 20 + idx * 95;
                const isActive = activeStage === idx;
                return (
                  <g key={stage.name} className="cursor-pointer" onMouseEnter={() => setActiveStage(idx)} onMouseLeave={() => setActiveStage(null)}>
                    {/* Shadow if active */}
                    <rect
                      x={x}
                      y={60}
                      width={70}
                      height={80}
                      rx={8}
                      className={`stroke-2 transition-all duration-300 ${isActive ? stage.activeColor : "stroke-zinc-700 fill-zinc-900/60"}`}
                    />
                    <text x={x + 35} y={100} textAnchor="middle" className="fill-white font-mono font-bold text-base">{stage.name}</text>
                    <text x={x + 35} y={120} textAnchor="middle" className="fill-zinc-500 font-mono text-[8px] uppercase tracking-wider">stage {idx + 1}</text>
                    
                    {/* Interconnection Lines */}
                    {idx < stages.length - 1 && (
                      <g>
                        <path d={`M ${x + 70} 100 L ${x + 95} 100`} className={`stroke-zinc-800 stroke-2 fill-none`} />
                        <polygon points={`${x + 95},100 ${x + 89},97 ${x + 89},103`} className="fill-zinc-700" />
                      </g>
                    )}
                  </g>
                );
              })}
              
              {/* Hazard Forwarding loop */}
              <path d="M 400 140 L 400 170 L 140 170 L 140 140" className="stroke-purple-500/40 stroke-2 stroke-dasharray fill-none" strokeDasharray="4,4" />
              <text x="260" y="165" textAnchor="middle" className="fill-purple-400 font-mono text-[9px]">Operand Forwarding Multiplexers Bypass Loop</text>
            </svg>
          </div>
          <div className="w-full md:w-80 space-y-4 text-xs font-mono text-zinc-400">
            <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/20 space-y-3">
              <span className="font-bold text-white flex items-center gap-1">
                <Activity className="h-4 w-4 text-purple-400" /> RTL Structural Specs:
              </span>
              <ul className="list-disc pl-4 space-y-2 text-[11px]">
                <li><strong className="text-zinc-200">Bypass Net</strong>: Forwarding from EX/MEM and MEM/WB paths avoids stalls on RAW dependencies.</li>
                <li><strong className="text-zinc-200">Load Stalls</strong>: Hazard detection unit inserts a single cycle stall for Load-to-Use cases.</li>
                <li><strong className="text-zinc-200">Branch Predictor</strong>: Dynamic branch solver at ID/EX stages flushes 1 instruction on mispredict.</li>
              </ul>
            </div>
          </div>
        </div>
      </DiagramModal>
    </div>
  );
}

export function SoCDiagram() {
  const [modalOpen, setModalOpen] = useState(false);
  const [hoverNode, setHoverNode] = useState<string | null>(null);

  const nodes = [
    { id: "core", label: "RV32IM CPU Core", role: "Primary computational orchestrator executing baseline instruction blocks.", coord: { x: 100, y: 50 }, color: "fill-blue-500/20 stroke-blue-500" },
    { id: "npu", label: "NPU Systolic Matrix", role: "Custom Systolic neural arithmetic hardware mapping quantized tensor operations.", coord: { x: 400, y: 50 }, color: "fill-rose-500/20 stroke-rose-500" },
    { id: "axi", label: "AXI4 Interconnect Matrix", role: "Central multi-port master/slave switch routing parallel memory transfers.", coord: { x: 250, y: 120 }, color: "fill-purple-500/20 stroke-purple-500" },
    { id: "cache", label: "Non-blocking L2 Cache", role: "Intermediary high-speed coherent memory system utilizing MESI model.", coord: { x: 100, y: 250 }, color: "fill-emerald-500/20 stroke-emerald-500" },
    { id: "sram", label: "On-Chip SRAM", role: "Physical scratchpad arrays storing operational frames and register stacks.", coord: { x: 400, y: 250 }, color: "fill-amber-500/20 stroke-amber-500" }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Network className="h-3.5 w-3.5 text-purple-400" />
          RV32IM SoC Network
        </span>
        <button
          onClick={() => setModalOpen(true)}
          className="text-[10px] font-mono text-purple-400 hover:text-purple-300 transition-colors"
        >
          Expand Schematic
        </button>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col space-y-4">
        {/* Simplified Hub Block Grid */}
        <div className="relative h-24 bg-zinc-950/40 border border-zinc-900 rounded-lg flex items-center justify-center p-2">
          <div className="absolute top-2 left-2 text-[8px] font-mono text-zinc-600">STAR_INTERCONNECT_TOPOLOGY</div>
          <div className="flex gap-2 items-center justify-around w-full">
            <div className="px-2 py-1 bg-blue-950/20 border border-blue-900 rounded text-[10px] font-mono text-blue-400">RV32IM CPU</div>
            <div className="h-1.5 w-4 bg-zinc-800 flex-shrink-0" />
            <div className="p-2 bg-purple-950/40 border border-purple-500 rounded font-bold text-[10px] font-mono text-purple-300">AXI4 SW</div>
            <div className="h-1.5 w-4 bg-zinc-800 flex-shrink-0" />
            <div className="px-2 py-1 bg-rose-950/20 border border-rose-900 rounded text-[10px] font-mono text-rose-400">Systolic NPU</div>
          </div>
        </div>

        <div className="text-[11px] font-mono text-zinc-400 text-center italic">
          Click "Expand Schematic" to view master-slave matrices and memory topologies.
        </div>
      </div>

      <DiagramModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="RV32IM SoC – 5-Stage Pipelined RISC-V Processor Architectural Block Layout"
        description="Physical multi-master interconnection network powered by custom high-performance AXI4 and APB busses."
      >
        <div className="flex flex-col md:flex-row gap-6 items-center w-full">
          <div className="flex-1 w-full max-w-[500px]">
            <svg viewBox="0 0 500 320" className="w-full h-auto">
              {/* Lines from central AXI matrix to other nodes */}
              {nodes.map(n => {
                if (n.id === "axi") return null;
                return (
                  <line
                    key={`line-${n.id}`}
                    x1={250}
                    y1={140}
                    x2={n.coord.x}
                    y2={n.coord.y}
                    className="stroke-purple-900 stroke-2"
                    strokeDasharray="5,5"
                  />
                );
              })}

              {/* Render Nodes */}
              {nodes.map((n) => {
                const isHover = hoverNode === n.id;
                return (
                  <g
                    key={n.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverNode(n.id)}
                    onMouseLeave={() => setHoverNode(null)}
                  >
                    <rect
                      x={n.coord.x - 65}
                      y={n.coord.y - 25}
                      width={130}
                      height={50}
                      rx={8}
                      className={`stroke-2 transition-all duration-300 ${isHover ? "fill-purple-900/50 stroke-purple-400" : n.color}`}
                    />
                    <text x={n.coord.x} y={n.coord.y + 4} textAnchor="middle" className="fill-white font-mono text-[9px] font-semibold">{n.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="w-full md:w-80 space-y-4 text-xs font-mono text-zinc-400">
            <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/20 space-y-3">
              <span className="font-bold text-white flex items-center gap-1">
                <Terminal className="h-4 w-4 text-purple-400" /> Selected Node Info:
              </span>
              <div className="min-h-[80px] text-[11px] leading-relaxed">
                {hoverNode ? (
                  <div>
                    <span className="font-bold text-purple-300 block mb-1">
                      {nodes.find((n) => n.id === hoverNode)?.label}:
                    </span>
                    {nodes.find((n) => n.id === hoverNode)?.role}
                  </div>
                ) : (
                  <span className="text-zinc-500 italic">
                    Hover over a silicon subsystem block on the left to review master/slave matrix roles and registers.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </DiagramModal>
    </div>
  );
}

export function CoherenceDiagram() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeState, setActiveState] = useState<string | null>(null);

  const states = [
    { id: "M", name: "Modified", desc: "Cacheline is dirty, owned solely by local cache. Memory holds stale data. Local writes are free.", color: "fill-rose-500/20 stroke-rose-500 text-rose-400" },
    { id: "E", name: "Exclusive", desc: "Cacheline is clean, synchronized with memory. Owned solely by local cache. Local writes promote state to Modified.", color: "fill-blue-500/20 stroke-blue-500 text-blue-400" },
    { id: "S", name: "Shared", desc: "Cacheline is clean, shared with neighboring cache controllers. Local writes require bus invalidate broadcasts.", color: "fill-emerald-500/20 stroke-emerald-500 text-emerald-400" },
    { id: "I", name: "Invalid", desc: "Cacheline contains stale or unmapped data. Reading triggers a cache miss, prompting bus memory fetches.", color: "fill-zinc-800 stroke-zinc-700 text-zinc-500" }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-purple-400" />
          MESI Cache Coherence FSM
        </span>
        <button
          onClick={() => setModalOpen(true)}
          className="text-[10px] font-mono text-purple-400 hover:text-purple-300 transition-colors"
        >
          Expand Schematic
        </button>
      </div>

      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col space-y-4">
        {/* Simple vertical state lists */}
        <div className="grid grid-cols-4 gap-2">
          {states.map((st) => (
            <motion.div
              key={st.id}
              className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                activeState === st.id
                  ? "bg-purple-950/40 border-purple-500 text-purple-300"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
              onMouseEnter={() => setActiveState(st.id)}
              onMouseLeave={() => setActiveState(null)}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-sm font-bold font-mono">{st.id}</div>
              <div className="text-[7px] text-zinc-500 uppercase font-mono mt-0.5">{st.name.substring(0, 5)}</div>
            </motion.div>
          ))}
        </div>

        {/* Detail descriptor block */}
        <div className="min-h-[64px] p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-900 text-[11px] font-mono text-zinc-400">
          {activeState ? (
            <div>
              <span className="font-bold text-white uppercase">{states.find(s=>s.id === activeState)?.name}:</span>{" "}
              <span>{states.find(s=>s.id === activeState)?.desc}</span>
            </div>
          ) : (
            <div className="text-zinc-500 italic text-center py-2">
              Hover over a state node to inspect transitions and bus coherence signals.
            </div>
          )}
        </div>
      </div>

      <DiagramModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="MESI (Illinois Protocol) Cache Coherence Finite State Machine"
        description="Logical state diagram for non-blocking secondary caches managing consistency in multi-core shared memory."
      >
        <div className="flex flex-col md:flex-row gap-6 items-center w-full">
          <div className="flex-1 w-full max-w-[500px]">
            <svg viewBox="0 0 400 300" className="w-full h-auto">
              {/* Transition arcs */}
              <circle cx={100} cy={100} r={35} className="fill-none stroke-zinc-800 stroke-2" />
              <circle cx={300} cy={100} r={35} className="fill-none stroke-zinc-800 stroke-2" />
              <circle cx={300} cy={220} r={35} className="fill-none stroke-zinc-800 stroke-2" />
              <circle cx={100} cy={220} r={35} className="fill-none stroke-zinc-800 stroke-2" />

              {/* Arcs text descriptions */}
              <path d="M 135 100 L 265 100" className="stroke-zinc-700 stroke-2" />
              <polygon points="265,100 259,97 259,103" className="fill-zinc-600" />
              
              {/* Render Nodes */}
              {states.map((st, idx) => {
                const x = idx === 0 || idx === 3 ? 100 : 300;
                const y = idx === 0 || idx === 1 ? 100 : 220;
                const isHover = activeState === st.id;
                return (
                  <g key={st.id} className="cursor-pointer" onMouseEnter={() => setActiveState(st.id)} onMouseLeave={() => setActiveState(null)}>
                    <circle
                      cx={x}
                      cy={y}
                      r={30}
                      className={`stroke-2 transition-all duration-300 ${isHover ? "fill-purple-900/40 stroke-purple-500" : st.color}`}
                    />
                    <text x={x} y={y + 5} textAnchor="middle" className="fill-white font-mono font-bold text-base">{st.id}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="w-full md:w-80 space-y-4 text-xs font-mono text-zinc-400">
            <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/20 space-y-3">
              <span className="font-bold text-white flex items-center gap-1">
                <Activity className="h-4 w-4 text-purple-400" /> Coherence Protocols:
              </span>
              <ul className="list-disc pl-4 space-y-2 text-[11px]">
                <li><strong className="text-zinc-200">PrRd (Processor Read)</strong>: Triggers read hits on M, E, S. Triggers bus transactions on I (miss).</li>
                <li><strong className="text-zinc-200">PrWr (Processor Write)</strong>: Promotes state to M. Broadcasts invalidations to S states.</li>
                <li><strong className="text-zinc-200">BusRdX (Bus Read Ex)</strong>: Demotes M/E/S states of other controllers directly to I.</li>
              </ul>
            </div>
          </div>
        </div>
      </DiagramModal>
    </div>
  );
}
