import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, ChevronDown, Cpu, ShieldCheck, Layers, 
  Settings, Terminal, Code, HelpCircle, Hammer, Laptop 
} from 'lucide-react';

interface Tool {
  name: string;
  useCase: string;
  mastery: 'Expert' | 'Intermediate' | 'Learning';
}

interface ToolGroup {
  id: string;
  title: string;
  description: string;
  icon: any;
  tools: Tool[];
}

export default function EngineeringToolchain() {
  const [expandedGroup, setExpandedGroup] = useState<string | null>('rtl');

  const groups: ToolGroup[] = [
    {
      id: 'rtl',
      title: 'RTL Design & Synthesis',
      description: 'Hardware description compile paths and logical netlist synthesis tools.',
      icon: Cpu,
      tools: [
        { name: 'Synopsys Design Compiler', useCase: 'Logical synthesis and cell mapping checks', mastery: 'Intermediate' },
        { name: 'Yosys Open SYnth', useCase: 'RTL synthesis and formal logic mapping', mastery: 'Expert' },
        { name: 'Xilinx Vivado Synthesizer', useCase: 'FPGA design synthesis and resource mapping', mastery: 'Expert' },
        { name: 'Chisel HDL framework', useCase: 'Object-oriented hardware design compilation', mastery: 'Intermediate' }
      ]
    },
    {
      id: 'verify',
      title: 'Verification & Simulation',
      description: 'Register transfer logic validation, testbench simulation, and formal model checks.',
      icon: ShieldCheck,
      tools: [
        { name: 'Verilator C++ Compiler', useCase: 'High-speed cycle-accurate simulation', mastery: 'Expert' },
        { name: 'Cocotb Python Testbench', useCase: 'Python-based asynchronous hardware checks', mastery: 'Expert' },
        { name: 'Icarus Verilog Simulator', useCase: 'General event-driven RTL simulation', mastery: 'Expert' },
        { name: 'SymbiYosys Formal suite', useCase: 'Bounded model checking and induction assertions', mastery: 'Intermediate' }
      ]
    },
    {
      id: 'physical',
      title: 'Physical Design & Layout',
      description: 'Silicon routing, clock network construction, floorplanning, and static timing closures.',
      icon: Layers,
      tools: [
        { name: 'Cadence Innovus System', useCase: 'Placement, physical synthesis, and clock routing', mastery: 'Intermediate' },
        { name: 'OpenROAD / OpenLane', useCase: 'Automated RTL-to-GDSII digital flow execution', mastery: 'Expert' },
        { name: 'KLayout Layout Editor', useCase: 'GDSII layout inspection and cell drawing', mastery: 'Expert' },
        { name: 'Magic VLSI Layout', useCase: 'Interactive floorplanning and manual cell placement', mastery: 'Intermediate' }
      ]
    },
    {
      id: 'embedded',
      title: 'Embedded Systems & Boards',
      description: 'Microcontroller hardware control, registers configurations, and embedded interfaces.',
      icon: Terminal,
      tools: [
        { name: 'STM32CubeIDE', useCase: 'Bare-metal STM32 register map coding', mastery: 'Expert' },
        { name: 'Keil uVision Compiler', useCase: 'Firmware compilation and simulation checks', mastery: 'Intermediate' },
        { name: 'Arduino SDK / ESP32', useCase: 'Rapid embedded hardware prototyping', mastery: 'Expert' },
        { name: 'PlatformIO Ecosystem', useCase: 'Multi-platform firmware builds', mastery: 'Expert' }
      ]
    },
    {
      id: 'programming',
      title: 'Programming Languages',
      description: 'Hardware description structures, software libraries, and scripting automation.',
      icon: Code,
      tools: [
        { name: 'SystemVerilog / Verilog', useCase: 'Synthesizable logic specifications', mastery: 'Expert' },
        { name: 'C / C++ Code', useCase: 'Embedded registers mappings, cycle-accurate models', mastery: 'Expert' },
        { name: 'Python Scripting', useCase: 'Testbench models and synthesis automation', mastery: 'Expert' },
        { name: 'Tcl Synthesis Scripts', useCase: 'Cadence and Synopsys tool config runs', mastery: 'Intermediate' }
      ]
    },
    {
      id: 'eda',
      title: 'EDA Infrastructure & Utilities',
      description: 'Underlying compilation environments and wave monitoring tools.',
      icon: Settings,
      tools: [
        { name: 'GTKWave Trace Monitor', useCase: 'Simulation waveform inspect runs', mastery: 'Expert' },
        { name: 'GCC / GDB Compiler Suite', useCase: 'Compile and debug C++ hardware models', mastery: 'Expert' },
        { name: 'Git Version Control', useCase: 'RTL code change management', mastery: 'Expert' },
        { name: 'Make / CMake Pipelines', useCase: 'Automating multi-tool logical compilation runs', mastery: 'Expert' }
      ]
    }
  ];

  const toggleGroup = (groupId: string) => {
    setExpandedGroup(prev => prev === groupId ? null : groupId);
  };

  return (
    <section className="py-20 border-b border-[rgba(255,255,255,0.06)] bg-[#0c0c0c]" id="engineering-toolchains">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-14 text-center md:text-left">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-[#a78bfa] block">
            Integrated Development Stack
          </span>
          <h2 className="mt-2 font-sans text-3xl font-extrabold tracking-tight text-white uppercase sm:text-4xl">
            Engineering Toolchains
          </h2>
          <p className="mt-4 font-sans text-sm text-[#94a3b8] max-w-2xl leading-relaxed">
            A comprehensive matrix of specialized electronic design automation (EDA) frameworks, compilers, and hardware simulation packages utilized across Akshay's silicon journey.
          </p>
        </div>

        {/* Accordion Layout Block */}
        <div className="space-y-4">
          {groups.map((group) => {
            const Icon = group.icon;
            const isExpanded = expandedGroup === group.id;

            return (
              <div 
                key={group.id}
                className={`rounded-xl border transition-all duration-300 bg-[#121212] overflow-hidden ${
                  isExpanded ? 'border-[#a78bfa]/55 shadow-lg shadow-[#a78bfa]/5' : 'border-[rgba(255,255,255,0.06)]'
                }`}
              >
                
                {/* Trigger Row */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-sans transition-colors hover:bg-[#161616]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center border transition-all ${
                      isExpanded 
                        ? 'bg-purple-900/10 border-[#a78bfa]/50 text-[#a78bfa]' 
                        : 'bg-[#181818] border-[rgba(255,255,255,0.05)] text-slate-400'
                    }`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white uppercase tracking-tight">
                        {group.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-purple-400 shrink-0" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-500 shrink-0" />
                  )}
                </button>

                {/* Expanded Grid Panel */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-[rgba(255,255,255,0.04)] bg-[#090909]"
                    >
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                        {group.tools.map((tool) => (
                          <div 
                            key={tool.name}
                            className="p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.04)] hover:border-[#a78bfa]/20 transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="text-white font-bold block truncate uppercase">
                                  {tool.name}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide shrink-0 ${
                                  tool.mastery === 'Expert' 
                                    ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                                    : tool.mastery === 'Intermediate'
                                    ? 'bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[#a78bfa]'
                                    : 'bg-slate-500/15 border border-slate-500/25 text-slate-400'
                                }`}>
                                  {tool.mastery}
                                </span>
                              </div>
                              <span className="text-slate-500 block text-[10px] leading-relaxed">
                                {tool.useCase}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
