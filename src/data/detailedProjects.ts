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
    diagram: '/projects/5-stage-soc/block-diagram.png',
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
    diagram: '/projects/5-stage-pipeline-riscv/block-diagram.png',
    futureImprovements: 'Transitioning to a superscalar dual-issue instruction pipeline to scale execution performance beyond 1.0 IPC.'
  },
  {
    id: 'uart',
    slug: 'uart',
    name: 'UART Controller',
    tagline: 'Fully-Parametric UART IP Core with Configurable FIFO & Flow Control',
    category: 'Digital IP',
    image: 'https://images.unsplash.com/photo-1601524909162-be87252be298?q=80&w=600&auto=format&fit=crop',
    techStack: ['SystemVerilog', 'Verilator', 'C++ Testbench', 'FPGA (Artix-7)', 'OpenSTA'],
    description: 'A highly robust, parameterized UART controller with configurable baud rate, data bits, parity modes, stop bits, and independent transmitter/receiver FIFO queues supporting automatic RTS/CTS flow control.',
    metrics: [
      { label: 'Baud Rate Support', value: 'Configurable up to 12.5 Mbps' },
      { label: 'FIFO Size', value: 'Configurable (16 to 256-byte queues)' },
      { label: 'Gate Count', value: '~2,500 Gates' },
      { label: 'Power Draw', value: '< 5 mW @ 100MHz' },
      { label: 'Interface Type', value: 'APB Slave' }
    ],
    designObjectives: [
      'Implement a fully synthesizable UART IP core supporting customizable word lengths, parity modes, and stop bits.',
      'Integrate hardware-based flow control (RTS/CTS) with programmable watermarks to prevent buffer overruns.',
      'Maintain robust clock-domain crossing synchronization between bus clock and peripheral clock.',
      'Optimize design for minimum silicon area and zero CDC violations.'
    ],
    features: [
      'Configurable 5, 6, 7, or 8-bit word length with optional Odd/Even/No parity check.',
      'Dual independent FIFO buffers for transmit and receive paths with programmable interrupts.',
      'RTS/CTS automatic hardware flow control preventing receiver buffer overrun.',
      'Digital filtering on receiver line to suppress noise glitches.',
      'Standard APB register interface for seamless SoC integration.'
    ],
    overview: 'This project provides a standard-compliant, parameterized UART peripheral core designed in SystemVerilog. Configured with separate transmit/receive pipelines and parameterized depth FIFOs, the controller meets high-performance CDC constraints and includes digital glitch filtering for high-noise industrial environments.',
    architecture: 'Features a standard APB slave interface for control register and FIFO buffer accesses. State machines drive independent transmitter and receiver modules, synced to a baud rate generator divider register. Interrupts trigger on FIFO status thresholds.',
    challenges: 'Baud rate oversampling mismatch and high-frequency line noise during high-speed UART transactions caused receiver frame errors and character loss.',
    solutions: 'Implemented a 16x oversampling receiver state machine with a majority-voting filter to sample incoming bits, and added configurable watermarks on the RX FIFO to trigger early interrupt alerts.',
    verification: 'Validated using a comprehensive SystemVerilog testbench simulating various line delay, noise injection, clock jitter, and random baud-rate mismatches.',
    simulation: 'Simulated in Verilator with a C++ runtime test harness plotting byte-by-byte status waveforms and checking framing parity assertions.',
    documentation: 'Includes register mapping configurations, timing diagrams for start/stop framing, and Synthesis/OpenSTA summaries.',
    waveforms: 'Tx/Rx framing waveforms showing start bit, 8 data bits, parity, stop bit, and RTS/CTS toggle.',
    diagram: '/projects/uart/block-diagram.png',
    futureImprovements: 'Adding automatic baud rate detection and DMA interface support for high-throughput block data transfers.'
  },
  {
    id: 'cache-memory',
    slug: 'cache-memory',
    name: 'Cache Memory Controller',
    tagline: 'Non-Blocking L1/L2 Cache Controller with MESI Coherency Protocol',
    category: 'Digital IP',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=600&auto=format&fit=crop',
    techStack: ['SystemVerilog', 'Verilator', 'OpenROAD', 'Synopsys Design Compiler', 'Cadence Innovus'],
    description: 'A high-performance, non-blocking 4-way set-associative cache memory controller featuring a MESI cache coherency engine, lookahead prefetching, and configurable write-back/write-allocate architectures.',
    metrics: [
      { label: 'Associativity', value: '4-Way Set Associative' },
      { label: 'Coherency Protocol', value: 'MESI Snooping Controller' },
      { label: 'Line Size', value: '64 Bytes Cache Lines' },
      { label: 'Hit Latency', value: '1 Cycle Tag Match' },
      { label: 'System Interface', value: '128-bit AXI4 Master' }
    ],
    designObjectives: [
      'Implement a 4-way set associative L1 cache controller with non-blocking miss handling.',
      'Enforce multi-core coherency via a hardware MESI snooping engine.',
      'Optimize critical path in Tag Match to achieve target frequency closure above 800MHz.',
      'Integrate lookahead stride prefetcher to reduce average memory access time (AMAT).'
    ],
    features: [
      'Fully-associative LRU (Least Recently Used) replacement policy implemented in logic.',
      'Non-blocking cache architecture with dual Miss Status Holding Registers (MSHR).',
      'MESI Coherency snooping interface for quad-core system fabrics.',
      'Write-back and write-allocate policy supporting burst AXI4 transfers.',
      'Parameterizable cache line and tag sizes to scale across application requirements.'
    ],
    overview: 'This Cache Controller represents a high-speed memory sub-system IP designed to minimize core stall cycles. Implemented with set-associative SRAM tag lookup arrays, the controller implements MESI snooping rules to support multi-processor cluster integration. Non-blocking accesses allow hits to bypass outstanding miss requests.',
    architecture: 'Features parallel Tag and Data SRAM macros arrays lookup. The MESI control logic registers incoming snoop requests and transitions line states concurrently. Memory request buffers interface directly to an AXI4 system master.',
    challenges: 'High-frequency tag match comparisons on 4-way parallel sets created critical path timing violations, limiting system clock frequency.',
    solutions: 'Pipelined the tag comparison step and split set selection into a dedicated pre-decode cycle, meeting the 800MHz timing budget without increasing access latency.',
    verification: 'Rigorous verification using dynamic trace generators feeding randomized address streams, stress-testing eviction loops and MESI state Transitions.',
    simulation: 'Verilator and VCS co-simulations verifying snooping transitions and cache fill burst transactions against custom memory models.',
    documentation: 'Registers config, state-transition diagram, timing sign-off reports, and power reports.',
    waveforms: 'Read-miss/write-miss line fill cycles showing MESI transition from Invalid to Shared/Modified and AXI4 burst handshakes.',
    diagram: '/projects/cache-memory/block-diagram.png',
    futureImprovements: 'Adding pseudo-LRU policies and integrating dynamic write-through bypassing for streaming workloads.'
  },
  {
    id: '8-bit-cpu',
    slug: '8-bit-cpu',
    name: '8-Bit CPU & Custom Computer',
    tagline: 'A complete discrete-logic TTL-equivalent 8-Bit Computer',
    category: 'Computer Arch',
    image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=600&auto=format&fit=crop',
    techStack: ['SystemVerilog', 'Logisim', 'KiCAD', 'Verilator', 'FPGA (Artix-7)'],
    description: 'A custom 8-bit discrete-logic computer architecture featuring an 8-bit ALU, register file, microprogrammed control unit, memory controller, and a custom instruction set (assembly-programmable).',
    metrics: [
      { label: 'Bus Width', value: '8-bit Data / 16-bit Addr' },
      { label: 'Instruction Set', value: 'Custom 32 assembly opcodes' },
      { label: 'Register Count', value: '4 General Purpose' },
      { label: 'Control Method', value: 'Microcoded Control ROM' },
      { label: 'Memory Limit', value: '64 KB Addressable space' }
    ],
    designObjectives: [
      'Design a microprogrammed 8-bit computer from fundamental digital logic components.',
      'Build a modular architecture comprising Register File, ALU, Control Unit, and I/O registers.',
      'Develop a custom instruction set architecture (ISA) with fully functioning assembler.',
      'Synthesize onto FPGA and implement a physical PCB prototype for hardware validation.'
    ],
    features: [
      'Microcoded control ROM allowing easy updates to execution micro-steps.',
      'Four 8-bit general-purpose registers and a 16-bit Program Counter (PC).',
      '8-bit ALU with Carry, Zero, Negative, and Overflow flags.',
      'Direct, Indirect, and Immediate addressing modes.',
      'Integrated 7-segment display interface for program monitoring and debug outputs.'
    ],
    overview: 'This project implements a classic 8-bit computer architecture, capturing the essence of early computing systems. Designed with modular blocks modeled after classic TTL components, the CPU operates under custom microprogrammed instructions and executes user assemblies loaded from flash or ROM.',
    architecture: 'Features a single unified internal 8-bit data bus connecting the Accumulator, general-purpose registers, ALU, and Instruction Register. A separate 16-bit address bus drives memory decoding. Microinstructions are fetched from a microcode control ROM.',
    challenges: 'Bus contention and signal glitches during clock edge transitions caused unstable instruction execution under physical breadboard/FPGA setups.',
    solutions: 'Strictly synchronized all bus-enable control signals to a non-overlapping clock phase model and added active high-impedance state protections during transitions.',
    verification: 'Verified in Logisim-evolution block-level simulation, followed by comprehensive Verilator compilation and assembly test scripts.',
    simulation: 'Waveform analysis of bus transactions showing PC increment, address latching, instruction fetch, and ALU writebacks.',
    documentation: 'Microcode ROM maps, assembly opcode references, instruction execution step tables, and PCB schematics.',
    waveforms: 'Instruction fetch cycle showing Program Counter latching, memory read data on bus, and instruction load registers.',
    diagram: '/projects/8-bit-cpu/block-diagram.png',
    futureImprovements: 'Adding hardware-level interrupts and a dedicated UART serial interface.'
  }
];
