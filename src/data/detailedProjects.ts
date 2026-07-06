import { ProjectDetail } from '../types';

export const DETAILED_PROJECTS: ProjectDetail[] = [
  {
    id: '5-stage-soc',
    slug: '5-stage-soc',
    name: '5-Stage SoC with Custom RISC-V Processor',
    tagline: '5-Stage Pipelined RISC-V System-on-Chip (7nm FinFET Node)',
    category: 'ASIC',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
    techStack: ['Chisel', 'Verilog', 'TSMC 7nm PDK', 'Synopsys Design Compiler', 'Cadence Innovus', 'OpenROAD'],
    description: 'A fully integrated mixed-signal 5-stage pipelined RISC-V processor co-designed with high-efficiency accelerators, sharing an L1/L2 coherence fabric and interfacing via high-speed APB/AXI4 interconnects.',
    metrics: [
      { label: 'Process Node', value: 'TSMC 7nm FinFET N7' },
      { label: 'Core Frequency', value: '1.2 GHz @ 0.85V' },
      { label: 'Cell Area', value: '12.54 mm²' },
      { label: 'Peak Power', value: '452 mW' },
      { label: 'NPU Output', value: '4.2 TOPS INT8' }
    ],
    designObjectives: [
      'Design a fully compliant RV32IM base integer processor core with dynamic hazard-forwarding logic.',
      'Achieve timing closure at 1.2 GHz clock frequency under nominal corner checks on TSMC N7 FinFET process node.',
      'Construct a robust power mesh on Metal 7 & Metal 8 layers ensuring static/dynamic IR drop remains strictly below 2% of VDD.',
      'Optimize layout congestion near highly parallel FPU and Systolic Matrix NPU accelerators.'
    ],
    features: [
      'Quad-core asymmetric cluster with L1/L2 Cache Coherency (MESI protocol).',
      'Pipelined Radix-4 Booth Integer Multiplier and 8-cycle non-restoring divider unit.',
      'Systolic INT8 Matrix Multiplication Accelerator delivering 4.2 TOPS.',
      '128-bit Non-blocking AXI4 crossbar with concurrent read/write transactions.',
      'Complete APB peripheral subsystem including UART, SPI, GPIO, timers and PLIC controller.'
    ],
    overview: 'This project showcases a mixed-signal 5-stage pipelined RISC-V System-on-Chip fabricated using TSMC 7nm FinFET PDK tools. Co-designed alongside systolic matrix NPU co-processors, the chip interfaces over high-bandwidth 128-bit non-blocking AXI4 bus rings to minimize latency. The core utilizes multi-source clock tree synthesis to maintain global clock skew below 35ps.',
    architecture: 'Features a heterogeneous multi-master arrangement. CPU cores and NPU blocks act as master entities communicating with direct set-associative tag arrays and coherent L2 cache line managers. Low-speed peripherals register accesses are translated through a standard APB bridge to preserve main memory bandwidth.',
    challenges: 'Dynamic voltage fluctuations (dynamic IR drop) in the core processor boundary exceeded 85mV during heavy Systolic NPU arithmetic stress, leading to register setup violations.',
    solutions: 'Re-synthesized the power grid mesh using an enhanced dual-grid matrix on Metal 7/Metal 8, placed decaps directly flanking structural modules, and staggered NPU state pipeline stages to limit current surges.',
    verification: 'Rigorous validation using a SystemVerilog UVM environment, constraint-random instruction streams, SystemVerilog Assertions (SVA) checking pipeline hazards, and full coverage validation against RISCOF suite.',
    simulation: 'Co-simulation run inside VCS and Verilator. Compilation traces verified against instruction-level logs to prove cycle-accurate execution matching.',
    documentation: 'Includes register maps, pad-ring layouts, pinouts descriptions, SDC constraint rules, synthesis gate summaries, and timing sign-off reports.',
    waveforms: 'AXI4 bus write transaction waves illustrating address, data, and handshakes synchronization during multi-beat burst writes.',
    diagram: '/assets/projects/5-stage-soc/block-diagram/block-diagram.png',
    futureImprovements: 'Implementing directory-based L2 coherency models to support scaling beyond 8 core clusters.'
  },
  {
    id: '5-stage-pipeline-riscv',
    slug: '5-stage-pipeline-riscv',
    name: '5-Stage Pipeline RISC-V Processor',
    tagline: 'High-Performance 5-Stage Pipelined RISC-V CPU Core',
    category: 'Computer Arch',
    image: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=600&auto=format&fit=crop',
    techStack: ['SystemVerilog', 'Verilator', 'C++ Testbench', 'FPGA (Artix-7)', 'OpenSTA'],
    description: 'A fully-synthesizable, cycle-accurate implementation of the RISC-V RV32IM instruction set architecture. Features a 5-stage classic pipeline (Fetch, Decode, Execute, Memory, Write-back) with full data-forwarding, hazard detection, and a parameterizable hardware integer multiplier/divider unit.',
    metrics: [
      { label: 'ISA Extension', value: 'RV32IM (Integer + Multiply)' },
      { label: 'Pipeline Depth', value: '5 Stages with Bypass paths' },
      { label: 'Frequency', value: '180 MHz (TSMC 65nm)' },
      { label: 'Cell Area', value: '0.18 mm²' },
      { label: 'Lut Count', value: '4,280 LUTs (FPGA)' }
    ],
    designObjectives: [
      'Implement synthesizable SystemVerilog pipelines with full hazard detection and forward-bypass paths.',
      'Ensure zero latch warnings during synthesis to maintain predictable synchronous behavior.',
      'Verify timing closure at 150MHz target frequency on standard Artix-7 FPGA boards.',
      'Achieve maximum instruction throughput exceeding 0.95 IPC on classic branch workloads.'
    ],
    features: [
      'Classical 5-Stage Pipeline: Fetch (IF), Decode (ID), Execute (EX), Memory (MEM), Write-back (WB).',
      'High-performance ALU coupled with dynamic hazard detection and register forwarding paths.',
      'Iterative Radix-4 Booth Multiplier and State-Machine driven Division units.',
      'Branch Target Buffer (BTB) featuring dynamic 2-bit branch prediction buffers.',
      'Integrated interfaces to private 4KB instruction cache and 4KB data cache.'
    ],
    overview: 'A synthesizable, cycle-accurate classical 5-stage pipeline RISC-V core. Incorporates dynamic hazard-bypassing structures to forward operands directly from Memory or Writeback pipeline registers, reducing stalls to 0 for consecutive ALU operations.',
    architecture: 'Classic Harvard processor layout separating instruction fetch buses from data memory ports. Dedicated dual-port Register File allows parallel instruction register decode while execution blocks process ALU operands forwarded from downstream stages.',
    challenges: 'Read-After-Write (RAW) data hazards in tight instructions loops introduced up to 2-cycle stalls, degrading overall IPC from 1.0 to 0.74.',
    solutions: 'Constructed an Operand Forwarding Unit that inspects register destinations in EX, MEM and WB stages and routes raw register buffers directly back to ALU input muxes.',
    verification: 'Extensive verification using a C++ Verilator simulator checking execution states against a golden architectural instruction model on 10,000 randomized loops.',
    simulation: 'Verilator compilation logs, functional waveform plots, and cycle-by-cycle register trace logs viewing register status.',
    documentation: 'Instruction timing matrices, forwarding state logic schematics, and pin description tables.',
    waveforms: 'Pipeline forwarding transactions illustrating EX-to-ID and MEM-to-ID data bypassing under back-to-back mathematical operations.',
    diagram: '/assets/projects/5-stage-pipeline-riscv/block-diagram/block-diagram.png',
    futureImprovements: 'Transitioning to a superscalar dual-issue instruction pipeline to scale execution performance beyond 1.0 IPC.'
  }
];
