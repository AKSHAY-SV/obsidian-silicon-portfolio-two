import { PortfolioKnowledgeBase } from "../types/knowledge";

export const PORTFOLIO_KNOWLEDGE: PortfolioKnowledgeBase = {
  about: {
    name: "Akshay Srikrishnan",
    role: "Silicon Architect & RTL Engineer",
    location: "Bengaluru, Karnataka, India",
    email: "crazyplayz61@gmail.com",
    bio: "Designing synthesizable micro-architectures, low-latency coherent cache fabrics, high-speed interconnect switches, and automating silicon physical implementation GDS flows.",
    specialties: [
      "ASIC Design",
      "RTL Design",
      "Computer Architecture",
      "FPGA Development",
      "Physical Design"
    ],
    summaryText: "Manipal Institute of Technology, Bengaluru B.Tech student focusing on fundamental semiconductor physics, digital integrated circuit layouts, computer architectures, and hardware description languages."
  },
  projects: [
    {
      id: "rv32im-core",
      name: "RV32IM_PROCESSOR",
      category: "Computer Architecture",
      tagline: "High-Performance 5-Stage Pipelined RISC-V CPU Core",
      description: "A fully-synthesizable, cycle-accurate implementation of the RISC-V RV32IM instruction set architecture. Features a 5-stage classic pipeline (Fetch, Decode, Execute, Memory, Write-back) with full data-forwarding, hazard detection, and a parameterizable hardware integer multiplier/divider unit.",
      techStack: ["SystemVerilog", "Verilator", "C++ Testbench", "FPGA (Artix-7)", "OpenSTA"],
      metrics: {
        lutCount: "4,280 LUTs",
        timingSlack: "+1.42 ns @ 150MHz",
        area: "0.18 mm²",
        power: "32.4 mW",
        frequency: "180 MHz (TSMC 65nm)"
      },
      specs: [
        { label: "ISA Extension", value: "RV32IM (Base Integer + M Extension)" },
        { label: "Pipeline Depth", value: "5 Stages with Bypass paths" },
        { label: "Branch Predictor", value: "Dynamic 2-bit BHT (94% Accuracy)" },
        { label: "Multiplier Unit", value: "Pipelined Radix-4 Booth Multiplier" },
        { label: "L1 Cache", value: "Direct Mapped, 4KB I-Cache / 4KB D-Cache" },
        { label: "Verification Suite", value: "RISCOF (99.8% Suite Coverage)" }
      ],
      challenges: [
        {
          problem: "RAW (Read-After-Write) Hazards on consecutive arithmetic operations caused 2-cycle stalls in early synthesis rounds, degrading IPC to 0.74.",
          solution: "Implemented a multi-level Operand Forwarding network mapping ALU outputs and MEM stage registers back to the ID/EX boundary, reducing hazard-related stalls to 0 cycles for general instructions and improving performance to 0.96 IPC."
        },
        {
          problem: "Hardware Divider propagation delay dominated the critical path, restricting maximum clock frequency to 80 MHz in physical layout checks.",
          solution: "Redesigned the division architecture from a single-cycle restoring layout into an 8-cycle state-machine iterative division block, decoupling timing and boosting max frequency to 180 MHz."
        }
      ]
    },
    {
      id: "rv32im-soc-processor",
      name: "RV32IM SoC – 5-Stage Pipelined RISC-V Processor",
      category: "ASIC",
      tagline: "5-Stage Pipelined RISC-V Processor System on Chip (7nm FinFET)",
      description: "A fully integrated mixed-signal 5-stage pipelined RISC-V processor co-designed with high-efficiency accelerators, sharing an L1/L2 coherence fabric and interfacing via high-speed APB/AXI4 interconnects.",
      techStack: ["Chisel", "Verilog", "TSMC 7nm PDK", "Synopsys Design Compiler", "Cadence Innovus"],
      metrics: {
        lutCount: "28.4M Transistors",
        timingSlack: "+0.11 ns @ 1.2GHz",
        area: "12.54 mm²",
        power: "452 mW (Peak)",
        frequency: "1.2 GHz (7nm FinFET)"
      },
      specs: [
        { label: "Process Node", value: "TSMC 7nm FinFET N7" },
        { label: "CPU Cluster", value: "4x RV64GCX Dual-Issue Out-of-Order Cores" },
        { label: "NPU Performance", value: "4.2 TOPS @ 800MHz INT8 Matrix Engine" },
        { label: "Memory Host", value: "Integrated LPDDR4/5 Physical Layer (PHY)" },
        { label: "Interconnect", value: "128-bit AXI4 Non-blocking Ring Network" },
        { label: "Cache Hierarchy", value: "32KB L1 + Shared 1MB L2 Cache Coherent SRAM" }
      ],
      challenges: [
        {
          problem: "High IR drop in the core NPU region during peak 4.2 TOPS matrix workloads led to severe dynamic voltage fluctuations and setup-time errors.",
          solution: "Re-architected the power mesh using a dual-grid layout in Metal 7 & Metal 8, doubling standard cell tap densities and placing decaps adjacent to structural multiplier groups."
        },
        {
          problem: "Clock skew across the 12.54 mm² die boundary exceeded 180ps, causing hold timing violations on deep FIFO registers.",
          solution: "Deployed Multi-Source Clock Tree Synthesis (MSCTS) via Cadence Innovus, routing a global H-Tree grid using ultra-thick top metal layers to bound skew within 35ps."
        }
      ]
    },
    {
      id: "axi4-interconnect",
      name: "AXI4_CROSSBAR",
      category: "Computer Architecture",
      tagline: "High-Throughput Non-Blocking AXI4 Crossbar Interconnect",
      description: "A parameterized 4-Master to 4-Slave AXI4 Switch Core enabling fully concurrent read/write transactions, utilizing custom split-address pathways, credit-based buffer flow control, and dynamic round-robin arbitration modules.",
      techStack: ["SystemVerilog", "ModelSim", "SVA (Assertions)", "UVM", "FPGA (UltraScale+)"],
      metrics: {
        lutCount: "8,450 LUTs",
        timingSlack: "+2.10 ns @ 250MHz",
        area: "0.09 mm²",
        power: "18.2 mW",
        frequency: "350 MHz (TSMC 65nm)"
      },
      specs: [
        { label: "Protocols Supported", value: "AXI4, AXI4-Lite" },
        { label: "Arbitration Scheme", value: "Weighted Round-Robin (Dynamic)" },
        { label: "Data Bus Width", value: "64/128/256-bit configurable" },
        { label: "Address Channels", value: "Split Address, Read-Write De-coupled" },
        { label: "Verification Method", value: "UVM Agent with Scoreboards & Coverage" }
      ],
      challenges: [
        {
          problem: "HoL (Head-of-Line) Blocking occurred on Slow Peripheral channels, stalling fast memory transactions during overlapping burst operations.",
          solution: "Designed and implemented Out-of-Order Transaction ID routing, isolating traffic lanes and allowing non-blocking command pipelines."
        }
      ]
    },
    {
      id: "l2-cache-controller",
      name: "L2_CACHE_SYSTEM",
      category: "Verification",
      tagline: "MESI-Coherent Multi-Core Cache Controller System",
      description: "A 4-way set associative L2 write-back cache, implementing a pseudo-LRU replacement policy, MESI cache coherence protocol, and complete formal coverage verification mapping complex CPU core coherence matrices.",
      techStack: ["SystemVerilog", "SymbiYosys", "SystemVerilog Assertions", "ModelSim"],
      metrics: {
        lutCount: "12,240 LUTs",
        timingSlack: "+0.85 ns @ 200MHz",
        area: "0.22 mm²",
        power: "42.5 mW",
        frequency: "200 MHz"
      },
      specs: [
        { label: "Associativity", value: "4-Way Set Associative" },
        { label: "Coherency Protocol", value: "MESI (Modified, Exclusive, Shared, Invalid)" },
        { label: "Line Replacement", value: "Pseudo-LRU (Tree-based)" },
        { label: "Write Policy", value: "Write-Back with Write-Allocate" }
      ],
      challenges: [
        {
          problem: "Transient coherency race conditions between CPU0 writing and CPU1 reading simultaneously triggered deadlocks in formal assertions tests.",
          solution: "Developed an explicit 'Snoop Buffer Pending Queue' holding read requests until local cache-lines successfully complete write-back sequences."
        }
      ]
    },
    {
      id: "apb-uart-periph",
      name: "APB UART Peripheral",
      category: "RTL Design",
      tagline: "Configurable UART Controller with AMBA APB Bus Interface",
      description: "Synthesizable UART serial transceiver peripheral mapped to the standard AMBA APB bus protocol. Equipped with dual 16-deep FIFO arrays, receiver/transmitter shift registers, and a baud rate division register.",
      techStack: ["Verilog", "AMBA APB", "FIFO Registers", "Xilinx Vivado"],
      metrics: {
        fifoDepth: "16 Words",
        baudRates: "Configurable",
        busWidth: "32-bit APB"
      },
      specs: [
        { label: "Protocol", value: "AMBA APB Protocol Compliant" },
        { label: "Buffer", value: "Dual 16-deep Tx/Rx FIFOs" },
        { label: "Baud Generator", value: "Highly configurable baud ticks divider" }
      ],
      challenges: [
        {
          problem: "FIFO overflows and asynchronous clock domain glitches on high transmission speeds.",
          solution: "Wrote dual gray-coded address pointer synchronization circuits and robust empty/full check logic with meta-stability filtering."
        }
      ]
    },
    {
      id: "mixed-sig-adc",
      name: "Mixed Signal ADC",
      category: "Analog Design",
      tagline: "8-Bit Successive Approximation Register (SAR) ADC",
      description: "Custom transistor-level analog/digital mixed SAR ADC. Features an R-2R digital-to-analog ladder, low-power comparator, and digital control register, developed in a 180nm process node.",
      techStack: ["LTspice", "Cadence Virtuoso", "Microwind", "TSMC 180nm PDK"],
      metrics: {
        resolution: "8-bit binary",
        samplingRate: "1 MS/s",
        staticPower: "45 uW @ 1.8V"
      },
      specs: [
        { label: "Process Node", value: "TSMC 180nm PDK" },
        { label: "Resolution", value: "8-Bit Successive Approximation" },
        { label: "Sampling Speed", value: "1 Mega Sample per second" }
      ],
      challenges: [
        {
          problem: "DAC mismatches and comparator voltage offsets caused non-monotonic output codes and severe differential non-linearity.",
          solution: "Designed the DAC ladder using strict common-centroid physical layouts and optimized comparator input transistor sizing to bound offsets under 2mV."
        }
      ]
    },
    {
      id: "eight-bit-computer",
      name: "8-BIT_COMPUTER",
      category: "Computer Architecture",
      tagline: "Classic Accumulator-Based von Neumann 8-Bit Computer",
      description: "A complete custom accumulator-based 8-bit computer implemented in synthesizable Verilog. Follows a classical von Neumann architecture, coordinated over an 8-bit shared tri-state bus. Features a custom 16-instruction ISA microsequenced by a control unit state machine and verified cycle-by-cycle inside Xilinx Vivado XSim.",
      techStack: ["Verilog HDL", "Vivado", "Xilinx XSim", "Computer Architecture", "Digital Design"],
      metrics: {
        lutCount: "342 LUTs",
        timingSlack: "+4.12 ns @ 50MHz",
        area: "FPGA Artix-7 Mapping",
        power: "4.2 mW (Est.)",
        frequency: "50 MHz"
      },
      specs: [
        { label: "Architecture Type", value: "Accumulator-based von Neumann" },
        { label: "Data Width", value: "8-bit Word" },
        { label: "Address Space", value: "4-bit (16 addressed Bytes)" },
        { label: "Instruction Set", value: "16 core operations (Custom ISA)" },
        { label: "Bus Structure", value: "8-bit shared tri-state parallel" },
        { label: "Verification Tools", value: "Xilinx Vivado XSim RTL Simulator" }
      ],
      challenges: [
        {
          problem: "Logical bus contention and dynamic meta-stability risks when multiple registers drive high/low values onto the shared 8-bit bus concurrently.",
          solution: "Implemented high-impedance tri-state buffers (assign bus = output_enable ? register_data : 8'bZ) on all modules connected to the shared interconnect. Integrated mutually-exclusive output control signals in the microsequence decoder to ensure at most one transmitter active per T-state."
        },
        {
          problem: "Flickering ALU comparison outputs and asynchronous timing loops causing unstable conditional branching flags on LDA, ADD and SUB commands.",
          solution: "Isolated ALU carry and zero calculation paths by synchronizing physical flag outputs into a dedicated Flags Register. The register is latched on the positive clock edge only when the alu_flags_load control line is active, stabilizing jump calculations."
        }
      ]
    }
  ],
  education: [
    {
      institution: "Manipal Institute of Technology, Bengaluru",
      degree: "B.Tech in Electronics Engineering",
      specialization: "VLSI Design & Technology",
      period: "2024 — Present",
      location: "Bengaluru, Karnataka, India",
      details: "Focusing on fundamental semiconductor physics, digital integrated circuit layouts, computer architectures, and hardware description languages. Maintaining prime research focus on pipelined processor design and micro-architectural optimizations.",
      highlights: [
        "First Class academic standing across VLSI design core curriculum",
        "Active Member of IEEE Circuits and Systems Society branch",
        "Developing advanced EDA lab benchmarks for synthesizable micro-cores"
      ]
    }
  ],
  certifications: [
    {
      title: "Computer Architecture Essentials on Arm",
      issuer: "Arm Education (Coursera)",
      date: "June 2026",
      category: "Computer Architecture",
      skills: ["ARM Architecture", "Processor Design", "Computer Organization", "Instruction Set Architecture"],
      verificationUrl: "https://coursera.org/verify/3NJZHUFQWWDF",
      authority: "Dr Khaled Benkrid, Senior Director, Education and Research (Arm Ltd)"
    },
    {
      title: "Embedded Software and Hardware Architecture",
      issuer: "University of Colorado Boulder (Coursera)",
      date: "July 2025",
      category: "Embedded Systems",
      skills: ["Embedded Systems", "Hardware Architecture", "Firmware Concepts", "Hardware-Software Co-design"],
      verificationUrl: "https://coursera.org/verify/8KD3Z90X2O44",
      authority: "Alex Fosdick, Instructor (Electrical, Computer, and Energy Engineering)"
    },
    {
      title: "Introduction to Python",
      issuer: "Coursera Project Network",
      date: "June 2025",
      category: "Programming",
      skills: ["Python", "Scripting", "Automation"],
      verificationUrl: "https://coursera.org/verify/OK0SWDD53DAP",
      authority: "David Dalsveen, Subject Matter Expert (Freedom Learning Group)"
    },
    {
      title: "GenAI Basics – How LLMs Work",
      issuer: "Duke University (Coursera)",
      date: "June 2025",
      category: "Artificial Intelligence",
      skills: ["Large Language Models", "Prompt Engineering", "AI Fundamentals"],
      verificationUrl: "https://coursera.org/verify/T6ZM8VUTF7B7",
      authority: "Derek Wales, Adjunct Professor (Data Science/Business)"
    },
    {
      title: "ChatGPT Playground for Beginners: Intro to NLP AI",
      issuer: "Coursera Project Network",
      date: "June 2025",
      category: "Artificial Intelligence",
      skills: ["ChatGPT", "NLP", "AI Tools"],
      verificationUrl: "https://coursera.org/verify/ZQK4UR1MH7ZI",
      authority: "Rudi Hinds, Software Engineer (Coursera Project Network)"
    },
    {
      title: "AI Tools & ChatGPT Workshop",
      issuer: "be10X",
      date: "June 2026",
      category: "Artificial Intelligence",
      skills: ["AI Productivity", "ChatGPT", "AI-assisted Coding", "AI Workflows"],
      authority: "Aditya Goenka & Aditya Kachave, Co-founders (be10X)"
    }
  ],
  skills: [
    {
      id: "hdls",
      name: "HDLs & Languages",
      skills: [
        { name: "SystemVerilog", proficiency: 98 },
        { name: "Verilog", proficiency: 98 },
        { name: "Chisel", proficiency: 75 },
        { name: "VHDL", proficiency: 65 }
      ]
    },
    {
      id: "programming",
      name: "Programming",
      skills: [
        { name: "C", proficiency: 95 },
        { name: "C++", proficiency: 85 },
        { name: "Python", proficiency: 90 },
        { name: "Tcl Scripts", proficiency: 80 },
        { name: "RISC-V Assembly", proficiency: 85 }
      ]
    },
    {
      id: "eda",
      name: "EDA Synthesis Tools",
      skills: [
        { name: "Synopsys Design Compiler", proficiency: 90 },
        { name: "Cadence Innovus", proficiency: 90 },
        { name: "Synopsys PrimeTime", proficiency: 85 },
        { name: "OpenSTA", proficiency: 88 },
        { name: "Yosys Open SY", proficiency: 92 }
      ]
    },
    {
      id: "fpga",
      name: "FPGA Development Tools",
      skills: [
        { name: "Xilinx Vivado", proficiency: 95 },
        { name: "Intel Quartus Prime", proficiency: 80 },
        { name: "ModelSim / Questa", proficiency: 90 }
      ]
    }
  ],
  journey: [
    { phase: "Phase 1", title: "Logic Design", note: "Basic combinational logic gates, boolean algebra, multiplexers, and decoders." },
    { phase: "Phase 2", title: "Finite State Machines", note: "Moore & Mealy sequential logic, sequential registers, setup/hold constraints." },
    { phase: "Phase 3", title: "UART", note: "Asynchronous transceiver hardware block with parameterized baud counters." },
    { phase: "Phase 4", title: "8-bit CPU", note: "Designed complete TTL breadboard architecture with hardware microcode EEPROMs." },
    { phase: "Phase 5", title: "RV32IM Processor", note: "First synthesizable RISC-V digital core implementing base integer & multiply sets." },
    { phase: "Phase 6", title: "Five Stage Pipeline RV32IM", note: "Introduced classic hazard detection, bypass routing matrices, and execution stages." },
    { phase: "Phase 7", title: "Cache Memory", note: "Coherent L1/L2 multi-core set-associative cache controlled via snoop queues." },
    { phase: "Phase 8", title: "System on Chip", note: "Interconnected multi-core RISC-V nodes with a custom systolic array matrix engine." },
    { phase: "Phase 9", title: "RTL to GDSII", note: "Physical ASIC backend compilation under TSMC PDK libraries." },
    { phase: "Phase 10", title: "Future Tapeout", note: "Final digital silicon fabrication signoff with zero negative timing slack." }
  ],
  downloadableAssets: [
    { id: "proj-rpt", name: "RV32IM_Core_Design_Report.pdf", type: "Technical Report", size: "1.8 MB", description: "Detailed 24-page report outlining pipeline, hazard matrix, and Verilator verification tests." },
    { id: "res-paper", name: "Power_Mesh_IR_Drop_7nm.pdf", type: "Research Paper", size: "1.2 MB", description: "Technical white paper investigating dual-grid power distributions in sub-10nm processes." },
    { id: "arch-doc", name: "MESI_Coherent_Cache_Spec.pdf", type: "Architecture Spec", size: "980 KB", description: "Architecture specification including MESI state transition matrices and formal SV assertions." },
    { id: "pres-slides", name: "RV32IM_SoC_Tapeout_Slides.pdf", type: "Slides Deck", size: "3.4 MB", description: "Presentation deck from the physical design review highlighting floorplan DEF and clock tree results." }
  ],
  achievements: [
    { category: "Processor Architecture", title: "RV32IM Design", desc: "Micro-architected and validated a fully compliant RISC-V processor core from scratch." },
    { category: "SoC Integration", title: "RV32IM SoC Synthesis", desc: "Successfully mapped 5-stage pipelined processor core nets and multipliers onto TSMC 7nm technology libraries." },
    { category: "RTL Development", title: "Verilog / SV Mastery", desc: "Wrote 45+ clean, synthesizable hardware modules with flawless latch-free logs." },
    { category: "Hardware Verification", title: "99.8% Test Coverage", desc: "Verified system core memory maps using Cocotb Python randomized assertions." },
    { category: "FPGA Implementation", title: "Timing Closure", desc: "Achieved clean constraints clocking at 150MHz on Artix-7 and UltraScale+ FPGA targets." },
    { category: "Digital System Design", title: "FSM Optimization", desc: "Designed high-speed state controllers reducing instruction overhead clock cycles." },
    { category: "Cache Architecture", title: "MESI Resolution", desc: "Resolved multi-core coherence transient race deadlocks using explicit Snoop pending queues." },
    { category: "Pipeline Design", title: "Bypass Integration", desc: "Designed complex operand-forwarding matrices that reduced pipeline stalls by 100%." },
    { category: "ASIC Flow Exploration", title: "Power Mesh Grid", desc: "Optimized Innovus power routes, reducing peak dynamic IR drop voltage droop by 42%." }
  ],
  techStackSummary: [
    { name: "Verilog", rating: "Core HDL" },
    { name: "SystemVerilog", rating: "Verification" },
    { name: "C", rating: "Firmware" },
    { name: "Vivado", rating: "FPGA Design" },
    { name: "Cadence Virtuoso", rating: "Analog PDK" },
    { name: "LTspice", rating: "Simulations" },
    { name: "Microwind", rating: "CMOS Layout" },
    { name: "OpenLane", rating: "ASIC RTL-GDS" },
    { name: "GTKWave", rating: "Wave Viewer" },
    { name: "Linux", rating: "CLI Host" },
    { name: "Git", rating: "Versioning" },
    { name: "Arduino", rating: "Prototyping" },
    { name: "Computer Architecture", rating: "Micro-Arch" },
    { name: "RTL Design", rating: "Synthesis" },
    { name: "ASIC Design", rating: "Signoff" },
    { name: "FPGA Development", rating: "Bitstream" }
  ]
};
