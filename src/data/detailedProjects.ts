import { ProjectDetail } from '../types';

export const DETAILED_PROJECTS: ProjectDetail[] = [
  {
    id: 'rv32im-proc',
    slug: 'rv32im-processor',
    name: 'RV32IM Processor Core',
    tagline: 'High-Performance Synthesizable RISC-V CPU Core',
    category: 'Computer Arch',
    image: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=600&auto=format&fit=crop',
    techStack: ['SystemVerilog', 'Verilator', 'C++ Testbench', 'FPGA (Artix-7)', 'OpenSTA'],
    description: 'A fully-synthesizable, cycle-accurate implementation of the RISC-V RV32IM ISA. Features a high-efficiency ALU paired with parameterizable multi-cycle integer divider and multipliers.',
    metrics: [
      { label: 'Frequency', value: '180 MHz (TSMC 65nm)' },
      { label: 'Cell Area', value: '0.18 mm²' },
      { label: 'Logic Gates', value: '38.4k NAND2' }
    ],
    overview: 'This project centers on the implementation of a fully compliant RISC-V RV32IM processor. Special focus was placed on creating synthesizable hardware blocks that do not generate unintended latches and maintain strict synchronous reset parameters.',
    architecture: 'Single-cycle core mapping instruction-level registers to internal hardware pipelines. Employs a parameterizable barrel shifter and pipelined execution logic that integrates closely with memory arrays.',
    challenges: 'Multi-bit hardware multiplication propagation delay heavily restricted maximum clock speed in early synthesis runs.',
    solutions: 'Designed an iterative Radix-4 Booth Multiplier with internal pipelining, splitting critical multiplier path delays over 3 independent clocks.',
    verification: 'Verified through a multi-layered Verilator testbench writing C++ stimulus drivers, achieving full compliance with official RISC-V instruction-level validation suites.',
    simulation: 'Cycle-accurate simulation trace logs compiled to VCD files and viewed in GTKWave to confirm register file and execution timing.',
    documentation: 'Complete architecture reference manual detailing instruction execution clocks, register allocations, and physical block sizes.',
    waveforms: 'Displays the partial product summation waves executing a 32x32-bit hardware multiply.',
    diagram: 'Displays the standard Harvard register architecture feeding custom execute modules.',
    futureImprovements: 'Integrating branch target buffers to reduce multi-cycle delay branches.'
  },
  {
    id: 'five-stage-pipe',
    slug: 'five-stage-pipeline',
    name: 'Five Stage Pipeline RV32IM',
    tagline: 'Classic Pipelined CPU with Forwarding & Hazard Bypass',
    category: 'RTL Design',
    image: 'https://images.unsplash.com/photo-1601987177651-8edfe6c20009?q=80&w=600&auto=format&fit=crop',
    techStack: ['SystemVerilog', 'Operand Forwarding', 'Hazard Detection', 'ModelSim'],
    description: 'Classic Fetch, Decode, Execute, Memory, and Write-Back hardware pipeline core. Fully equipped with operand-forwarding registers and data hazard detectors to optimize IPC.',
    metrics: [
      { label: 'Pipeline depth', value: '5 Stages' },
      { label: 'Instruction IPC', value: '0.96 peak' },
      { label: 'Lut Count', value: '4,280 LUTs' }
    ],
    overview: 'Pipelining introduces high-speed clock cycles but brings data and control hazards. This project micro-architects a complete forwarding path and bypass matrix to optimize throughput.',
    architecture: 'Features a classic 5-stage setup: Fetch (IF), Decode (ID), Execute (EX), Memory (MEM), and Write-back (WB). Leverages synchronous registers to isolate stages.',
    challenges: 'Read-After-Write (RAW) data hazards caused continuous 2-cycle processor stalls, degrading instructions-per-cycle (IPC) to 0.74.',
    solutions: 'Designed a comprehensive bypass matrix routing ALU results directly from MEM and WB stages back to the execute inputs, reducing stalls to 0 cycles.',
    verification: 'Simulated with randomized instruction streams in ModelSim to track state verification under overlapping load-store cycles.',
    simulation: 'Analyzed using timing-annotated ModelSim tests verifying data-forwarding operations across 10,000 randomized cycles.',
    documentation: 'Includes hazard-bypassing tables, timing delay tables, and routing schematics.',
    waveforms: 'Illustrates forwarding pulses where instruction sequence reads from registers just modified by the previous write back stage.',
    diagram: 'Shows the 5 distinct execution stages connected by explicit pipeline control registers.',
    futureImprovements: 'Transitioning to a dual-issue execution pipeline to exceed 1.0 IPC.'
  },
  {
    id: 'coherent-cache',
    slug: 'cache-memory',
    name: 'Cache Memory',
    tagline: 'MESI-Coherent Multi-Core Set Associative L2 Cache',
    category: 'Computer Arch',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop',
    techStack: ['SystemVerilog', 'SymbiYosys', 'SystemVerilog Assertions', 'ModelSim'],
    description: 'A 4-way set associative L2 write-back cache system. Implements tree-based pseudo-LRU line replacement and MESI cache-coherency protocols for multi-core bus systems.',
    metrics: [
      { label: 'Coherence', value: 'MESI Protocol' },
      { label: 'Associativity', value: '4-Way Set' },
      { label: 'Frequency', value: '200 MHz' }
    ],
    overview: 'Ensures absolute memory consistency across multi-cluster processor cores. Tracks cache line states dynamically and responds to global interconnect snoop commands.',
    architecture: 'Includes integrated tag memories, direct SRAM array interfaces, pseudo-LRU age trees, and a state machine implementing standard MESI status (Modified, Exclusive, Shared, Invalid).',
    challenges: 'Overlapping memory write/read misses from separate cores caused rare lockups during stress testing.',
    solutions: 'Developed Snoop Buffer Pending Queues to hold external queries and serialise conflicting transactions safely.',
    verification: 'Formally verified using SystemVerilog Assertions (SVA) inside SymbiYosys, providing absolute proof of coherence and deadlock-free operation.',
    simulation: 'ModelSim logic simulations verifying MESI state transitions under forced cache-line collisions.',
    documentation: 'Complete state transition diagram alongside comprehensive explanation of snooping pathways and bus requests.',
    waveforms: 'Displays the snoop invalidation bus signals transitioning cache lines from SHARED to INVALID on remote write hits.',
    diagram: 'Shows the Tag/Data arrays aligned to snoop buses and LRU logic units.',
    futureImprovements: 'Scaling the coherence scheme to support directory-based tracking for larger core clusters.'
  },
  {
    id: 'apb-uart-periph',
    slug: 'apb-uart',
    name: 'APB UART Peripheral',
    tagline: 'Configurable UART Controller with AMBA APB Bus Interface',
    category: 'RTL Design',
    image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?q=80&w=600&auto=format&fit=crop',
    techStack: ['Verilog', 'AMBA APB', 'FIFO Registers', 'Xilinx Vivado'],
    description: 'Synthesizable UART serial transceiver peripheral mapped to the standard AMBA APB bus protocol. Equipped with dual 16-deep FIFO arrays.',
    metrics: [
      { label: 'FIFO Depth', value: '16 Words' },
      { label: 'Baud Rates', value: 'Configurable' },
      { label: 'Bus Width', value: '32-bit APB' }
    ],
    overview: 'Provides robust asynchronous communication capabilities to synthesizable processor cores. Integrates easily into micro-architectures via a clean APB bus interface.',
    architecture: 'Features transmitter/receiver shifting blocks, a baud rate generator utilizing division registers, and independent Tx/Rx FIFO memory blocks.',
    challenges: 'FIFO overflows and asynchronous clock domain glitches on high transmission speeds.',
    solutions: 'Wrote dual gray-coded address pointer synchronization circuits and robust empty/full check logic with meta-stability filtering.',
    verification: 'Validated using self-checking testbenches verifying register write/read access, baud divisions, and error interrupts.',
    simulation: 'Functional simulations illustrating serial transmit bit streams aligned with correct baud tick rates under GTKWave.',
    documentation: 'User-level registers map detailing interrupt mask registers, baud controls, and parity options.',
    waveforms: 'APB bus transaction cycles showcasing zero-wait state register read/write sequences.',
    diagram: 'Internal blocks mapping APB bus controls to UART transmitter shift lines.',
    futureImprovements: 'Adding direct hardware auto-flow control pins (RTS/CTS).'
  },
  {
    id: 'eight-bit-computer',
    slug: '8-bit-cpu',
    name: '8 bit CPU',
    tagline: 'Custom Discrete TTL Logic Microcomputer',
    category: 'Digital Design',
    image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=600&auto=format&fit=crop',
    techStack: ['Digital Logic', 'Breadboard Design', 'EEPROM Microcode', 'Assembly'],
    description: 'A complete custom-designed 8-bit computer built entirely from discrete 7400-series TTL logic integrated circuits.',
    metrics: [
      { label: 'RAM Capacity', value: '16 Bytes' },
      { label: 'Buses', value: '8-bit common' },
      { label: 'Control Logic', value: 'Microcoded' }
    ],
    overview: 'An educational-focused hardware implementation that isolates every structural block of a processor. Built using discrete chips to provide physical debugging of bus lines.',
    architecture: 'Includes an 8-bit program counter, instruction register, 16-byte RAM, ALU with add/sub gates, accumulator register, and EEPROM microprogram sequencer.',
    challenges: 'Electrical signal bounces and noise glitches on common buses when clock speed exceeded 100 kHz.',
    solutions: 'Wired decoupling bypass capacitors on every chip supply pin and routed common bus rails using star-ground patterns to suppress noise.',
    verification: 'Verified by loading hand-compiled custom assembly programs for Fibonacci calculations and multiplier loops.',
    simulation: 'Trace logs modeled in software mapping instruction register steps to physical pin outputs.',
    documentation: 'Wired schematics, control microcode registers, and instruction-set reference sheets.',
    waveforms: 'Oscilloscope bus probing displaying stable 5V TTL logic level thresholds during clock transitions.',
    diagram: 'Hand-drawn schematics mapping discrete ALU logic gates, buses, and registers.',
    futureImprovements: 'Expanding memory mapping to support up to 256 bytes of RAM.'
  }
];
