import React from 'react';
import { motion } from 'motion/react';
import {
  Compass, Cpu, Layers, ShieldCheck, Wrench, Microscope,
  Binary, Terminal, Code, Settings, Database, Sliders, Flame, Layers3,
  Waves, Activity, CircuitBoard, LineChart
} from 'lucide-react';

/**
 * Professional Engineering Profile — About page.
 *
 * Sections:
 *  1. Engineering Philosophy
 *  2. Areas of Expertise
 *  3. Design Flow
 *  4. Tools & Technologies
 *  5. Verification Methodology
 *  6. Research Interests
 */
export default function About() {
  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const philosophyPillars = [
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: 'Correctness First',
      body: 'Silicon is unforgiving. Every module is authored under strict synthesizable rules — no inferred latches, no clock glitches, no undefined resets.',
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: 'Physical Awareness',
      body: 'RTL is shaped with awareness of floorplan, clock tree topology, and metal routing. Micro-architectural decisions must map cleanly onto real dies.',
    },
    {
      icon: <Sliders className="h-5 w-5" />,
      title: 'Measure, Then Optimize',
      body: 'Every optimization is justified by a waveform, a timing report, or a synthesis metric. No changes ship without a signed-off measurement.',
    },
  ];

  const expertiseDomains = [
    {
      icon: <Cpu className="h-5 w-5 text-[#a78bfa]" />,
      title: 'Computer Architecture',
      lines: [
        'Pipelined RISC-V microarchitectures (RV32IM)',
        'Hazard detection, data forwarding, branch prediction',
        'MOESI / MESI cache coherence, snoop protocols',
      ],
    },
    {
      icon: <CircuitBoard className="h-5 w-5 text-[#a78bfa]" />,
      title: 'Digital & RTL Design',
      lines: [
        'SystemVerilog, Verilog, Chisel authoring',
        'Finite State Machines and control-path partitioning',
        'Clock-domain crossings and asynchronous FIFOs',
      ],
    },
    {
      icon: <Layers className="h-5 w-5 text-[#a78bfa]" />,
      title: 'Physical Design & Backend',
      lines: [
        'Floorplan, PDN, placement, CTS and routing',
        'Timing closure across PVT corners',
        'DRC / LVS clean sign-off flows',
      ],
    },
    {
      icon: <Microscope className="h-5 w-5 text-[#a78bfa]" />,
      title: 'Verification',
      lines: [
        'UVM-style directed and constrained-random testbenches',
        'SystemVerilog Assertions and functional coverage',
        'Formal property verification with SymbiYosys / Yosys',
      ],
    },
    {
      icon: <Layers3 className="h-5 w-5 text-[#a78bfa]" />,
      title: 'FPGA Prototyping',
      lines: [
        'Xilinx Vivado / Artix-7 (Digilent Basys 3)',
        'Intel Quartus Prime for MAX10 platforms',
        'On-board debug with ILA and logic analyzers',
      ],
    },
    {
      icon: <Flame className="h-5 w-5 text-[#a78bfa]" />,
      title: 'Analog & Mixed-Signal',
      lines: [
        'LTspice, Cadence Virtuoso schematic capture',
        'SAR / R-2R ADC architectures',
        'Bias circuits and comparator offset budgeting',
      ],
    },
  ];

  const designFlow = [
    { code: '01', label: 'Specification', hint: 'Interfaces, protocols, budgets, corner cases.' },
    { code: '02', label: 'Micro-Architecture', hint: 'Block diagram, pipeline, control/datapath partition.' },
    { code: '03', label: 'RTL Coding', hint: 'Synthesizable HDL with lint-clean coding style.' },
    { code: '04', label: 'Simulation', hint: 'Directed + constrained-random verification.' },
    { code: '05', label: 'Formal / Assertions', hint: 'SVA properties, coverage, equivalence checks.' },
    { code: '06', label: 'Synthesis', hint: 'Design Compiler / Yosys, area & timing budget.' },
    { code: '07', label: 'Physical Design', hint: 'Floorplan → PDN → Place → CTS → Route.' },
    { code: '08', label: 'Sign-off', hint: 'STA, DRC, LVS, IR-drop, EM analysis.' },
    { code: '09', label: 'FPGA / Silicon Bring-up', hint: 'Board debug, waveform capture, iteration.' },
  ];

  const toolCategories = [
    {
      icon: <Terminal className="h-4 w-4" />,
      name: 'HDLs',
      tools: ['SystemVerilog', 'Verilog', 'Chisel', 'VHDL'],
    },
    {
      icon: <Settings className="h-4 w-4" />,
      name: 'Synthesis & STA',
      tools: ['Synopsys Design Compiler', 'Yosys', 'OpenSTA', 'PrimeTime'],
    },
    {
      icon: <Layers className="h-4 w-4" />,
      name: 'Physical Design',
      tools: ['Cadence Innovus', 'OpenROAD', 'OpenLane', 'Magic', 'KLayout'],
    },
    {
      icon: <Microscope className="h-4 w-4" />,
      name: 'Simulation & Verification',
      tools: ['Verilator', 'Icarus Verilog', 'ModelSim / Questa', 'Cocotb', 'SymbiYosys'],
    },
    {
      icon: <Layers3 className="h-4 w-4" />,
      name: 'FPGA',
      tools: ['Xilinx Vivado', 'Intel Quartus Prime', 'GTKWave'],
    },
    {
      icon: <Code className="h-4 w-4" />,
      name: 'Programming & Scripting',
      tools: ['C', 'C++', 'Python', 'Tcl', 'RISC-V Assembly', 'Bash'],
    },
    {
      icon: <Database className="h-4 w-4" />,
      name: 'Version Control',
      tools: ['Git', 'GitHub Actions / CI-CD'],
    },
    {
      icon: <Flame className="h-4 w-4" />,
      name: 'Analog / Mixed-Signal',
      tools: ['Cadence Virtuoso', 'LTspice', 'Microwind'],
    },
  ];

  const verificationLayers = [
    {
      title: 'Directed Testing',
      body: 'Hand-authored stimulus for boundary corners, reset sequences, protocol handshakes and known-hard scenarios.',
    },
    {
      title: 'Constrained-Random',
      body: 'Randomized transaction generators with SystemVerilog constraints, driving scoreboards and reference models.',
    },
    {
      title: 'Functional Coverage',
      body: 'Cover-points and cross-coverage bins define what "done" means for each interface and state machine.',
    },
    {
      title: 'SystemVerilog Assertions',
      body: 'Immediate and concurrent SVA properties encode protocol legality — checked in simulation and formal.',
    },
    {
      title: 'Formal Property Verification',
      body: 'SymbiYosys / Yosys bounded model checks on control blocks, arbiters and coherence FSMs.',
    },
    {
      title: 'FPGA Silicon Correlation',
      body: 'Post-simulation results are correlated against on-board captures using logic analyzers and ILA cores.',
    },
  ];

  const researchInterests = [
    {
      icon: <Cpu className="h-4 w-4" />,
      title: 'Out-of-Order & Superscalar Cores',
      body: 'Register renaming, reorder buffers, and issue queues on open-ISA RISC-V pipelines.',
    },
    {
      icon: <Waves className="h-4 w-4" />,
      title: 'Cache Coherence & NoC Fabrics',
      body: 'Directory-based coherence, non-blocking L2/L3, and mesh interconnect topologies.',
    },
    {
      icon: <LineChart className="h-4 w-4" />,
      title: 'Low-Power Physical Design',
      body: 'Power gating, multi-Vt libraries, and IR-drop-aware placement on advanced nodes.',
    },
    {
      icon: <Binary className="h-4 w-4" />,
      title: 'Hardware Security',
      body: 'Side-channel-resistant crypto blocks, secure boot, and trusted execution primitives.',
    },
    {
      icon: <Activity className="h-4 w-4" />,
      title: 'Open-Source Silicon',
      body: 'End-to-end open-source flows: OpenLane, SkyWater PDK, and community IP hardening.',
    },
    {
      icon: <Compass className="h-4 w-4" />,
      title: 'ML-Assisted EDA',
      body: 'Data-driven floorplanning, placement suggestions, and timing prediction for iterative flows.',
    },
  ];

  return (
    <div className="py-16 text-slate-100 overflow-hidden" id="about-page">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-20"
      >
        {/* Header */}
        <motion.div variants={item} className="space-y-4 border-b border-[rgba(255,255,255,0.06)] pb-10">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#a78bfa] flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#a78bfa] animate-pulse" />
            // ENGINEERING PROFILE
          </span>
          <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
            Silicon Engineering
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] via-[#c084fc] to-[#e879f9]">
              Practice &amp; Principles
            </span>
          </h1>
          <p className="max-w-3xl font-sans text-sm sm:text-base text-slate-400 leading-relaxed">
            A concise reference of how I approach digital and physical design — the disciplines I work in,
            the tools I run, the verification layers I insist on, and the research directions that keep pulling
            me forward.
          </p>
        </motion.div>

        {/* 1. Engineering Philosophy */}
        <motion.section variants={item} className="space-y-6" id="engineering-philosophy">
          <SectionHeader index="01" title="Engineering Philosophy" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {philosophyPillars.map((p) => (
              <div
                key={p.title}
                data-testid={`philosophy-${p.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0d0d10] p-6 space-y-3 hover:border-[#a78bfa]/30 transition-colors"
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#a78bfa]/25 bg-[#a78bfa]/10 text-[#a78bfa]">
                  {p.icon}
                </div>
                <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                  {p.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-slate-400 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 2. Areas of Expertise */}
        <motion.section variants={item} className="space-y-6" id="areas-of-expertise">
          <SectionHeader index="02" title="Areas of Expertise" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {expertiseDomains.map((d) => (
              <div
                key={d.title}
                data-testid={`expertise-${d.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0c0c0f] p-5 space-y-3 hover:border-[#a78bfa]/30 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#a78bfa]/20 bg-[#a78bfa]/5">
                    {d.icon}
                  </div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                    {d.title}
                  </h3>
                </div>
                <ul className="space-y-1.5 font-sans text-xs text-slate-400 leading-relaxed">
                  {d.lines.map((l) => (
                    <li key={l} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-[#a78bfa] shrink-0" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 3. Design Flow */}
        <motion.section variants={item} className="space-y-6" id="design-flow">
          <SectionHeader index="03" title="Design Flow" />
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#0b0b0e] p-6 sm:p-8">
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {designFlow.map((s, i) => (
                <li
                  key={s.code}
                  data-testid={`flow-step-${s.code}`}
                  className="relative rounded-lg border border-[rgba(255,255,255,0.05)] bg-[#111116] p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[10px] font-bold text-[#a78bfa] bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded px-1.5 py-0.5">
                      {s.code}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      Stage
                    </span>
                  </div>
                  <h4 className="font-sans text-sm font-bold text-white uppercase tracking-wide">
                    {s.label}
                  </h4>
                  <p className="mt-1.5 font-sans text-xs text-slate-400 leading-relaxed">{s.hint}</p>
                  {i < designFlow.length - 1 && (
                    <span className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 text-[#a78bfa]/40 font-mono text-xs">
                      →
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </motion.section>

        {/* 4. Tools & Technologies */}
        <motion.section variants={item} className="space-y-6" id="tools-and-technologies">
          <SectionHeader index="04" title="Tools & Technologies" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toolCategories.map((c) => (
              <div
                key={c.name}
                data-testid={`tools-${c.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#0c0c0f] p-5"
              >
                <div className="flex items-center gap-2 mb-3 border-b border-[rgba(255,255,255,0.04)] pb-2">
                  <span className="text-[#a78bfa]">{c.icon}</span>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                    {c.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-[#141418] border border-[rgba(255,255,255,0.06)] px-2 py-1 font-mono text-[10px] text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 5. Verification Methodology */}
        <motion.section variants={item} className="space-y-6" id="verification-methodology">
          <SectionHeader index="05" title="Verification Methodology" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verificationLayers.map((layer, idx) => (
              <div
                key={layer.title}
                data-testid={`verif-layer-${idx}`}
                className="relative rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0c0c0f] p-5 space-y-2 hover:border-[#a78bfa]/30 transition-colors"
              >
                <span className="absolute top-3 right-3 font-mono text-[9px] text-slate-600 tracking-widest">
                  L{String(idx + 1).padStart(2, '0')}
                </span>
                <h4 className="font-mono text-sm font-bold uppercase tracking-wide text-white">
                  {layer.title}
                </h4>
                <p className="font-sans text-xs text-slate-400 leading-relaxed">{layer.body}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 6. Research Interests */}
        <motion.section variants={item} className="space-y-6 pb-4" id="research-interests">
          <SectionHeader index="06" title="Research Interests" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {researchInterests.map((r) => (
              <div
                key={r.title}
                data-testid={`research-${r.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex gap-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0c0c0f] p-5 hover:border-[#a78bfa]/30 transition-colors"
              >
                <div className="shrink-0 h-9 w-9 rounded-lg border border-[#a78bfa]/25 bg-[#a78bfa]/10 flex items-center justify-center text-[#a78bfa]">
                  {r.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-mono text-sm font-bold uppercase tracking-wide text-white">
                    {r.title}
                  </h4>
                  <p className="font-sans text-xs text-slate-400 leading-relaxed">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-3">
      <div>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#a78bfa]">
          // {index}
        </span>
        <h2 className="mt-1 font-sans text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
          {title}
        </h2>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 font-mono text-[9px] text-slate-500">
        <Wrench className="h-3 w-3 text-[#a78bfa]" />
        <span>SECTION_ACTIVE</span>
      </div>
    </div>
  );
}
