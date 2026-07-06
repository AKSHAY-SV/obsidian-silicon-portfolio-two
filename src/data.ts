import { Project, TimelineStage, CommitLog, DownloadAsset } from './types';

export const PROJECTS: Project[] = [
  {
    id: 'rv32im-core',
    name: 'RV32IM_PROCESSOR',
    category: 'Computer Arch',
    tagline: 'High-Performance 5-Stage Pipelined RISC-V CPU Core',
    description: 'A fully-synthesizable, cycle-accurate implementation of the RISC-V RV32IM instruction set architecture. Features a 5-stage classic pipeline (Fetch, Decode, Execute, Memory, Write-back) with full data-forwarding, hazard detection, and a parameterizable hardware integer multiplier/divider unit.',
    techStack: ['SystemVerilog', 'Verilator', 'C++ Testbench', 'FPGA (Artix-7)', 'OpenSTA'],
    image: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?q=80&w=600&auto=format&fit=crop',
    metrics: {
      lutCount: '4,280 LUTs',
      timingSlack: '+1.42 ns @ 150MHz',
      area: '0.18 mm²',
      power: '32.4 mW',
      frequency: '180 MHz (TSMC 65nm)'
    },
    specs: [
      { label: 'ISA Extension', value: 'RV32IM (Base Integer + M Extension)' },
      { label: 'Pipeline Depth', value: '5 Stages with Bypass paths' },
      { label: 'Branch Predictor', value: 'Dynamic 2-bit BHT (94% Accuracy)' },
      { label: 'Multiplier Unit', value: 'Pipelined Radix-4 Booth Multiplier' },
      { label: 'L1 Cache', value: 'Direct Mapped, 4KB I-Cache / 4KB D-Cache' },
      { label: 'Verification Suite', value: 'RISCOF (99.8% Suite Coverage)' }
    ],
    challenges: [
      {
        problem: 'RAW (Read-After-Write) Hazards on consecutive arithmetic operations caused 2-cycle stalls in early synthesis rounds, degrading IPC to 0.74.',
        solution: 'Implemented a multi-level Operand Forwarding network mapping ALU outputs and MEM stage registers back to the ID/EX boundary, reducing hazard-related stalls to 0 cycles for general instructions and improving performance to 0.96 IPC.'
      },
      {
        problem: 'Hardware Divider propagation delay dominated the critical path, restricting maximum clock frequency to 80 MHz in physical layout checks.',
        solution: 'Redesigned the division architecture from a single-cycle restoring layout into an 8-cycle state-machine iterative division block, decoupling timing and boosting max frequency to 180 MHz.'
      }
    ],
    files: [
      {
        name: 'RV32IM_Core.v',
        path: 'cores/rv32im/RV32IM_Core.v',
        content: `// =================================================================
// PROJECT: RV32IM_PROCESSOR
// FILE: RV32IM_Core.v
// DESCRIPTION: Main Top Module for Pipelined RISC-V 32-bit CPU
// =================================================================

module RV32IM_Core (
    input  wire        clk,
    input  wire        rst_n,
    
    // Instruction Memory Interface
    output wire [31:0] imem_addr,
    input  wire [31:0] imem_rdata,
    
    // Data Memory Interface
    output wire        dmem_we,
    output wire [31:0] dmem_addr,
    output wire [31:0] dmem_wdata,
    input  wire [31:0] dmem_rdata
);

    // --- PIPELINE REGISTER STAGES ---
    reg [31:0] if_pc, id_pc, ex_pc, mem_pc, wb_pc;
    reg [31:0] id_instr;
    
    // Decode Stage Signals
    wire [4:0]  rs1 = id_instr[19:15];
    wire [4:0]  rs2 = id_instr[24:20];
    wire [4:0]  rd  = id_instr[11:7];
    wire [6:0]  opcode = id_instr[6:0];
    wire [31:0] imm = decode_imm(id_instr);
    
    // Forwarding logic
    wire [1:0] forward_a, forward_b;
    wire [31:0] src_a = (forward_a == 2'b10) ? mem_alu_result :
                        (forward_a == 2'b01) ? wb_result : rf_rdata1;
                        
    // Execution Unit (ALU + Multiplier)
    wire [31:0] alu_out;
    wire        alu_zero;
    
    ALU alu_inst (
        .a(src_a),
        .b(src_b_final),
        .ctrl(alu_ctrl),
        .out(alu_out),
        .zero(alu_zero)
    );
    
    // Instantiate Divider & Multiplier (M-Extension)
    wire [31:0] mult_out;
    M_Extension_Unit m_unit (
        .clk(clk),
        .rst_n(rst_n),
        .rs1_val(src_a),
        .rs2_val(src_b_final),
        .m_op(m_ctrl),
        .out(mult_out)
    );

endmodule`,
        size: '4.8 KB'
      },
      {
        name: 'ALU.v',
        path: 'cores/rv32im/ALU.v',
        content: `// =================================================================
// FILE: ALU.v
// DESCRIPTION: 32-bit Arithmetic Logic Unit with zero flag detection
// =================================================================

module ALU (
    input  wire [31:0] a,
    input  wire [31:0] b,
    input  wire [3:0]  ctrl,
    output reg  [31:0] out,
    output wire        zero
);
    assign zero = (out == 32'b0);

    always @(*) begin
        case (ctrl)
            4'b0000: out = a + b;       // ADD
            4'b1000: out = a - b;       // SUB
            4'b0001: out = a << b[4:0]; // SLL
            4'b0010: out = ($signed(a) < $signed(b)) ? 32'b1 : 32'b0; // SLT
            4'b0100: out = a ^ b;       // XOR
            4'b0110: out = a | b;       // OR
            4'b0111: out = a & b;       // AND
            default: out = 32'b0;
        endcase
    end
endmodule`,
        size: '1.2 KB'
      }
    ],
    codeSnippet: `// Standard RISC-V 5-stage Bypass and Forwarding Matrix
always @(*) begin
    // Forwarding A Matrix
    if (mem_reg_write && (mem_rd != 0) && (mem_rd == ex_rs1))
        forward_a = 2'b10; // Forward from MEM stage
    else if (wb_reg_write && (wb_rd != 0) && (wb_rd == ex_rs1))
        forward_a = 2'b01; // Forward from WB stage
    else
        forward_a = 2'b00; // No forwarding
end`
  },
  {
    id: 'rv32im-soc-processor',
    name: 'RV32IM SoC – 5-Stage Pipelined RISC-V Processor',
    category: 'ASIC',
    tagline: '5-Stage Pipelined RISC-V Processor System on Chip (7nm FinFET)',
    description: 'A fully integrated mixed-signal 5-stage pipelined RISC-V processor co-designed with high-efficiency accelerators, sharing an L1/L2 coherence fabric and interfacing via high-speed APB/AXI4 interconnects.',
    techStack: ['Chisel', 'Verilog', 'TSMC 7nm PDK', 'Synopsys Design Compiler', 'Cadence Innovus'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
    metrics: {
      lutCount: '28.4M Transistors',
      timingSlack: '+0.11 ns @ 1.2GHz',
      area: '12.54 mm²',
      power: '452 mW (Peak)',
      frequency: '1.2 GHz (7nm FinFET)'
    },
    specs: [
      { label: 'Process Node', value: 'TSMC 7nm FinFET N7' },
      { label: 'CPU Cluster', value: '5-Stage Pipelined RV32IM Cores' },
      { label: 'NPU Performance', value: '4.2 TOPS @ 800MHz INT8 Matrix Engine' },
      { label: 'Memory Host', value: 'Integrated LPDDR4/5 Physical Layer (PHY)' },
      { label: 'Interconnect', value: '128-bit AXI4 Non-blocking Ring Network' },
      { label: 'Cache Hierarchy', value: '32KB L1 + Shared 1MB L2 Cache Coherent SRAM' }
    ],
    challenges: [
      {
        problem: 'High IR drop in the core processor region during peak workloads led to severe dynamic voltage fluctuations and setup-time errors.',
        solution: 'Re-architected the power mesh using a dual-grid layout in Metal 7 & Metal 8, doubling standard cell tap densities and placing decaps adjacent to structural groups.'
      },
      {
        problem: 'Clock skew across the 12.54 mm² die boundary exceeded 180ps, causing hold timing violations on deep FIFO registers.',
        solution: 'Deployed Multi-Source Clock Tree Synthesis (MSCTS) via Cadence Innovus, routing a global H-Tree grid using ultra-thick top metal layers to bound skew within 35ps.'
      }
    ],
    files: [
      {
        name: 'RV32IM_SoC_Top.v',
        path: 'soc/rv32im/RV32IM_SoC_Top.v',
        content: `// =================================================================
// PROJECT: RV32IM SoC – 5-Stage Pipelined RISC-V Processor
// FILE: RV32IM_SoC_Top.v
// DESCRIPTION: Top-Level ASIC Chip Envelope & Pin Mappings
// =================================================================

module RV32IM_SoC_Top (
    input  wire        pad_clk_p,
    input  wire        pad_clk_n,
    input  wire        pad_rst_n,
    
    // DDR Memory PHY Pins
    output wire [15:0] ddr_addr,
    inout  wire [31:0] ddr_dq,
    
    // Peripherals (UART, I2C, JTAG)
    input  wire        uart_rx,
    output wire        uart_tx,
    input  wire        jtag_tck,
    input  wire        jtag_tms,
    output wire        jtag_tdo
);

    // Differential Clock Buffers (ASIC Custom)
    wire sys_clk;
    IBUFDS clk_diff_buf (
        .I(pad_clk_p),
        .IB(pad_clk_n),
        .O(sys_clk)
    );

    // Quad Core Cluster Instance
    wire [127:0] axi_m_wdata;
    wire [31:0]  axi_m_addr;
    
    CPU_Cluster_4x cores_inst (
        .clk(sys_clk),
        .rst_n(pad_rst_n),
        .axi_addr(axi_m_addr),
        .axi_wdata(axi_m_wdata)
    );

    // Systolic NPU Core Accel
    NPU_Matrix_Engine npu_inst (
        .clk(sys_clk),
        .rst_n(pad_rst_n),
        .mem_addr(axi_m_addr)
    );

endmodule`,
        size: '6.2 KB'
      }
    ],
    codeSnippet: `// AXI4 Master Burst Interface Adapter
assign axi_awburst = 2'b01; // INCR burst type
assign axi_awsize  = 3'b100; // 128-bit beat transfer widths
assign axi_awlen   = 8'h0F;  // 16 burst beats per cycle transaction`
  },
  {
    id: 'axi4-interconnect',
    name: 'AXI4_CROSSBAR',
    category: 'Computer Arch',
    tagline: 'High-Throughput Non-Blocking AXI4 Crossbar Interconnect',
    description: 'A parameterized 4-Master to 4-Slave AXI4 Switch Core enabling fully concurrent read/write transactions, utilizing custom split-address pathways, credit-based buffer flow control, and dynamic round-robin arbitration modules.',
    techStack: ['SystemVerilog', 'ModelSim', 'SVA (Assertions)', 'UVM', 'FPGA (UltraScale+)'],
    image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=600&auto=format&fit=crop',
    metrics: {
      lutCount: '8,450 LUTs',
      timingSlack: '+2.10 ns @ 250MHz',
      area: '0.09 mm²',
      power: '18.2 mW',
      frequency: '350 MHz (TSMC 65nm)'
    },
    specs: [
      { label: 'Protocols Supported', value: 'AXI4, AXI4-Lite' },
      { label: 'Arbitration Scheme', value: 'Weighted Round-Robin (Dynamic)' },
      { label: 'Data Bus Width', value: '64/128/256-bit configurable' },
      { label: 'Address Channels', value: 'Split Address, Read-Write De-coupled' },
      { label: 'Verification Method', value: 'UVM Agent with Scoreboards & Coverage' }
    ],
    challenges: [
      {
        problem: 'HoL (Head-of-Line) Blocking occurred on Slow Peripheral channels, stalling fast memory transactions during overlapping burst operations.',
        solution: 'Designed and implemented Out-of-Order Transaction ID routing, isolating traffic lanes and allowing non-blocking command pipelines.'
      }
    ],
    files: [
      {
        name: 'AXI4_Crossbar.sv',
        path: 'interconnects/AXI4_Crossbar.sv',
        content: `// Non-Blocking Crossbar Router module`,
        size: '11.4 KB'
      }
    ],
    codeSnippet: `// Out-of-Order Transaction Routing Matrix
always @(*) begin
    for (int i=0; i<NUM_M; i++) begin
        master_granted[i] = (active_req[i] && arbiter_select == i);
    end
end`
  },
  {
    id: 'l2-cache-controller',
    name: 'L2_CACHE_SYSTEM',
    category: 'Verification',
    tagline: 'MESI-Coherent Multi-Core Cache Controller System',
    description: 'A 4-way set associative L2 write-back cache, implementing a pseudo-LRU replacement policy, MESI cache coherence protocol, and complete formal coverage verification mapping complex CPU core coherence matrices.',
    techStack: ['SystemVerilog', 'SymbiYosys', 'SystemVerilog Assertions', 'ModelSim'],
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=600&auto=format&fit=crop',
    metrics: {
      lutCount: '12,240 LUTs',
      timingSlack: '+0.85 ns @ 200MHz',
      area: '0.22 mm²',
      power: '42.5 mW',
      frequency: '200 MHz'
    },
    specs: [
      { label: 'Associativity', value: '4-Way Set Associative' },
      { label: 'Coherency Protocol', value: 'MESI (Modified, Exclusive, Shared, Invalid)' },
      { label: 'Line Replacement', value: 'Pseudo-LRU (Tree-based)' },
      { label: 'Write Policy', value: 'Write-Back with Write-Allocate' }
    ],
    challenges: [
      {
        problem: 'Transient coherency race conditions between CPU0 writing and CPU1 reading simultaneously triggered deadlocks in formal assertions tests.',
        solution: 'Developed an explicit "Snoop Buffer Pending Queue" holding read requests until local cache-lines successfully complete write-back sequences.'
      }
    ],
    files: [
      {
        name: 'L2_Controller.sv',
        path: 'cache/L2_Controller.sv',
        content: `// MESI Coherent State Machine and Snooping Logic`,
        size: '9.3 KB'
      }
    ],
    codeSnippet: `// MESI Coherence State Transitions
always @(*) begin
    case (current_state)
        INVALID:   if (cpu_read_miss)  next_state = SHARED;
        SHARED:    if (cpu_write_hit) next_state = MODIFIED;
        MODIFIED:  if (snoop_read)    next_state = SHARED;
    endcase
end`
  },
  {
    id: 'eight-bit-computer',
    name: '8-BIT_COMPUTER',
    category: 'Computer Arch',
    tagline: 'Classic Accumulator-Based von Neumann 8-Bit Computer',
    description: 'A complete custom accumulator-based 8-bit computer implemented in synthesizable Verilog. Follows a classical von Neumann architecture, coordinated over an 8-bit shared tri-state bus. Features a custom 16-instruction ISA microsequenced by a control unit state machine and verified cycle-by-cycle inside Xilinx Vivado XSim.',
    techStack: ['Verilog HDL', 'Vivado', 'Xilinx XSim', 'Computer Architecture', 'Digital Design'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
    metrics: {
      lutCount: '342 LUTs',
      timingSlack: '+4.12 ns @ 50MHz',
      area: 'FPGA Artix-7 Mapping',
      power: '4.2 mW (Est.)',
      frequency: '50 MHz'
    },
    specs: [
      { label: 'Architecture Type', value: 'Accumulator-based von Neumann' },
      { label: 'Data Width', value: '8-bit Word' },
      { label: 'Address Space', value: '4-bit (16 addressed Bytes)' },
      { label: 'Instruction Set', value: '16 core operations (Custom ISA)' },
      { label: 'Bus Structure', value: '8-bit shared tri-state parallel' },
      { label: 'Verification Tools', value: 'Xilinx Vivado XSim RTL Simulator' }
    ],
    challenges: [
      {
        problem: 'Logical bus contention and dynamic meta-stability risks when multiple registers drive high/low values onto the shared 8-bit bus concurrently.',
        solution: 'Implemented high-impedance tri-state buffers (assign bus = output_enable ? register_data : 8\'bZ) on all modules connected to the shared interconnect. Integrated mutually-exclusive output control signals in the microsequence decoder to ensure at most one transmitter active per T-state.'
      },
      {
        problem: 'Flickering ALU comparison outputs and asynchronous timing loops causing unstable conditional branching flags on LDA, ADD and SUB commands.',
        solution: 'Isolated ALU carry and zero calculation paths by synchronizing physical flag outputs into a dedicated Flags Register. The register is latched on the positive clock edge only when the alu_flags_load control line is active, stabilizing jump calculations.'
      }
    ],
    files: [
      {
        name: 'complete.v',
        path: 'cores/8bit/complete.v',
        content: `// =================================================================\n// PROJECT: 8-BIT_COMPUTER_DESIGN\n// FILE: complete.v\n// DESCRIPTION: Top-level module coordinating upper/lower blocks\n// =================================================================\n\nmodule complete (\n    input wire clk,\n    input wire rst_n,\n    output wire [7:0] out_display\n);\n\n    // --- SHARED TRI-STATE BUS ---\n    wire [7:0] bus;\n\n    // --- CONTROL BUS SIGNALS ---\n    wire [15:0] ctrl;\n    wire [3:0] pc_val, mar_val;\n    wire [7:0] ram_val, ir_val, acc_val, regb_val, alu_val;\n    wire [2:0] flags; // [Carry, Zero, Negative]\n\n    // Upper Layer Instance (Registers & PC)\n    upper upper_inst (\n        .clk(clk),\n        .rst_n(rst_n),\n        .bus(bus),\n        .ctrl(ctrl),\n        .pc_out(pc_val),\n        .mar_out(mar_val),\n        .ir_out(ir_val),\n        .acc_out(acc_val)\n    );\n\n    // Lower Layer Instance (ALU, Reg B, Flags)\n    lower lower_inst (\n        .clk(clk),\n        .rst_n(rst_n),\n        .bus(bus),\n        .ctrl(ctrl),\n        .acc_in(acc_val),\n        .regb_out(regb_val),\n        .alu_out(alu_val),\n        .flags_out(flags)\n    );\n\n    // Control Unit (Microprogrammed State Machine)\n    control_unit cu_inst (\n        .clk(clk),\n        .rst_n(rst_n),\n        .opcode(ir_val[7:4]),\n        .flags(flags),\n        .ctrl(ctrl)\n    );\n\n    // Output Latch Register\n    OutputRegister out_reg (\n        .clk(clk),\n        .load(ctrl[12]), // out_load\n        .in_val(bus),\n        .out_val(out_display)\n    );\n\nendmodule`,
        size: '1.9 KB'
      },
      {
        name: 'control_unit.v',
        path: 'cores/8bit/control_unit.v',
        content: `// =================================================================\n// PROJECT: 8-BIT_COMPUTER_DESIGN\n// FILE: control_unit.v\n// DESCRIPTION: Microsequencer decoder generating control signals\n// =================================================================\n\nmodule control_unit (\n    input wire clk,\n    input wire rst_n,\n    input wire [3:0] opcode,\n    input wire [2:0] flags, // [Carry, Zero, Negative]\n    output reg [15:0] ctrl\n);\n\n    reg [2:0] t_state;\n\n    // T-States Sequencer (6-state clock machine)\n    always @(posedge clk or negedge rst_n) begin\n        if (!rst_n) begin\n            t_state <= 3'd1;\n        end else begin\n            if (t_state == 3'd6) \n                t_state <= 3'd1;\n            else \n                t_state <= t_state + 1'b1;\n        end\n    end\n\n    // Control Signal Bitmaps:\n    // ctrl[0]  = pc_oe,     ctrl[1]  = pc_count\n    // ctrl[2]  = mar_load,   ctrl[3]  = ram_oe\n    // ctrl[4]  = ram_we,     ctrl[5]  = ir_load\n    // ctrl[6]  = ir_oe,      ctrl[7]  = acc_load\n    // ctrl[8]  = acc_oe,     ctrl[9]  = regb_load\n    // ctrl[10] = alu_oe,     ctrl[11] = alu_sub\n    // ctrl[12] = out_load,   ctrl[13] = flags_load\n\n    always @(*) begin\n        ctrl = 16'b0;\n        case (t_state) \n            // Fetch cycle\n            3'd1: ctrl[0] = 1'b1; ctrl[2] = 1'b1; // T1: MAR <- PC\n            3'd2: ctrl[1] = 1'b1;                 // T2: PC <- PC + 1\n            3'd3: ctrl[3] = 1'b1; ctrl[5] = 1'b1; // T3: IR <- RAM[MAR]\n            \n            // Execute cycle (Opcode Decodes)\n            default: begin\n                case (opcode)\n                    4'b0000: begin // LDA\n                        if (t_state == 3'd4) begin ctrl[6] = 1'b1; ctrl[2] = 1'b1; end // MAR <- IR[3:0]\n                        if (t_state == 3'd5) begin ctrl[3] = 1'b1; ctrl[7] = 1'b1; end // Acc <- RAM[MAR]\n                    end\n                    4'b0010: begin // ADD\n                        if (t_state == 3'd4) begin ctrl[6] = 1'b1; ctrl[2] = 1'b1; end // MAR <- IR[3:0]\n                        if (t_state == 3'd5) begin ctrl[3] = 1'b1; ctrl[9] = 1'b1; end // Reg B <- RAM[MAR]\n                        if (t_state == 3'd6) begin ctrl[10] = 1'b1; ctrl[7] = 1'b1; ctrl[13] = 1'b1; end // Acc <- Acc + B, Flags Load\n                    end\n                    4'b0011: begin // SUB\n                        if (t_state == 3'd4) begin ctrl[6] = 1'b1; ctrl[2] = 1'b1; end\n                        if (t_state == 3'd5) begin ctrl[3] = 1'b1; ctrl[9] = 1'b1; end\n                        if (t_state == 3'd6) begin ctrl[10] = 1'b1; ctrl[11] = 1'b1; ctrl[7] = 1'b1; ctrl[13] = 1'b1; end // Acc <- Acc - B, sub bit, Flags Load\n                    end\n                    4'b1110: begin // OUT\n                        if (t_state == 3'd4) begin ctrl[8] = 1'b1; ctrl[12] = 1'b1; end // OutReg <- Acc\n                    end\n                    default: ctrl = 16'b0;\n                endcase\n            end\n        endcase\n    end\n\nendmodule`,
        size: '2.5 KB'
      }
    ],
    codeSnippet: `// Shared tri-state bus interface implementation in Verilog\nassign bus = (pc_oe)   ? pc_out  : \n             (ram_oe)  ? ram_out : \n             (ir_oe)   ? ir_out  : \n             (acc_oe)  ? acc_out : \n             (alu_oe)  ? alu_out : \n             8'bzzzzzzzz;`
  }
];

export const TIMELINE_STAGES: TimelineStage[] = [
  {
    id: '01-rtl',
    name: '01 RTL Entry',
    description: 'Creating parameterizable and synthesizable hardware descriptions in Verilog or SystemVerilog.',
    status: 'done',
    inputFiles: ['Architecture Specifications', 'Memory Maps'],
    outputFiles: ['Core_RTL.sv', 'IP_Blocks.v', 'Linter_Report.log'],
    toolchains: ['VS Code', 'Verible Linter', 'WaveDrom'],
    notes: 'Verify clock domain crossings (CDC) and clear latch-warnings. Ensure all registers have synchronous active-low resets.'
  },
  {
    id: '02-func-sim',
    name: '02 Functional Verification',
    description: 'Exhaustive verification of the RTL behavior using block-level testbenches and system-level co-simulation.',
    status: 'done',
    inputFiles: ['Core_RTL.sv', 'Verification Plan', 'UVM Environment'],
    outputFiles: ['Sim_Trace.vcd', 'Test_Suite.log', 'Functional_Coverage.xml'],
    toolchains: ['Icarus Verilog', 'Cocotb (Python Testbenches)', 'GTKWave'],
    notes: 'Achieved 99.8% code coverage and 98.4% functional cross-coverage. SystemVerilog Assertions (SVA) injected in pipeline decoder.'
  },
  {
    id: '03-synthesis',
    name: '03 RTL Synthesis',
    description: 'Compiling high-level hardware descriptions into gate-level netlists mapped to physical standard cells.',
    status: 'done',
    inputFiles: ['Core_RTL.sv', 'TSMC 65nm / 7nm Liberty Cell Libraries', 'SDC Constraints'],
    outputFiles: ['Gate_Netlist.v', 'Area_Power_Report.rpt', 'Synthesized_SDC.sdc'],
    toolchains: ['Synopsys Design Compiler / Yosys Open SY'],
    notes: 'Clock set to 150MHz. Gate count finalized at 48.2k equivalent 2-input NAND gates.'
  },
  {
    id: '04-lec',
    name: '04 Logic Equivalence (LEC)',
    description: 'Formal mathematical verification ensuring that the synthesized gate netlist exactly matches RTL behavior.',
    status: 'done',
    inputFiles: ['Core_RTL.sv', 'Gate_Netlist.v'],
    outputFiles: ['LEC_Formal_Verification_Report.log'],
    toolchains: ['SymbiYosys / Yosys EQY', 'Cadence Conformal'],
    notes: 'Completed formal verification. Zero non-equivalent keypoints found.'
  },
  {
    id: '05-floorplan',
    name: '05 Floorplanning',
    description: 'Defining core boundaries, die aspect ratio, placement of IO pads, macros, and constructing the power distribution network.',
    status: 'done',
    inputFiles: ['Gate_Netlist.v', 'PDK LEF Files', 'Power Budget specs'],
    outputFiles: ['Floorplan_Def.def', 'Power_Mesh_IR_Report.rpt'],
    toolchains: ['Cadence Innovus', 'OpenROAD'],
    notes: 'Set die core utilization to 65%. Implemented robust VDD/VSS mesh on Metal 7/Metal 8 to prevent dynamic voltage drops.'
  },
  {
    id: '06-placement',
    name: '06 Cell Placement',
    description: 'Placing millions of logical standard cells inside rows defined during the floorplanning stage.',
    status: 'active',
    inputFiles: ['Floorplan_Def.def', 'Gate_Netlist.v'],
    outputFiles: ['Placed_Design.def', 'Congestion_Map.png'],
    toolchains: ['Cadence Innovus', 'OpenROAD RePlace'],
    notes: 'Currently optimizing placement density. Cell density is highly concentrated near the pipelined floating multiplier blocks.'
  },
  {
    id: '07-cts',
    name: '07 Clock Tree Synthesis',
    description: 'Synthesizing the clock distribution network to deliver a stable, balanced clock signal to every flip-flop with minimum skew.',
    status: 'pending',
    inputFiles: ['Placed_Design.def', 'Timing Constraints'],
    outputFiles: ['CTS_Design.def', 'Clock_Skew_Report.rpt'],
    toolchains: ['Cadence Innovus CTS', 'OpenROAD TritonCTS'],
    notes: 'Targets skew < 30ps and clock insertion delay < 1.2ns.'
  },
  {
    id: '08-routing',
    name: '08 Signal Routing',
    description: 'Connecting standard cells and IO pins according to the netlist using physical metal tracks.',
    status: 'pending',
    inputFiles: ['CTS_Design.def'],
    outputFiles: ['Routed_Design.def', 'DRC_Violations.rpt'],
    toolchains: ['Cadence Innovus NanoRoute', 'OpenROAD TritonRoute'],
    notes: 'High-speed signal nets will be routed with shielding parameters on Metal 5.'
  },
  {
    id: '09-lvs-drc',
    name: '09 DRC & LVS Check',
    description: 'Verifying layout design rules (DRC) and proving physical layout matches schematic gate netlist (LVS).',
    status: 'pending',
    inputFiles: ['Routed_Design.def', 'GDSII Cell Views'],
    outputFiles: ['DRC_LVS_Passed.rpt', 'LVS_Comparison_Results.rpt'],
    toolchains: ['KLayout', 'Siemens Calibre'],
    notes: 'Strict physical tape-out checks required for clean mask generation.'
  },
  {
    id: '10-spef-pext',
    name: '10 Parasitic Extraction',
    description: 'Extracting physical wire resistance and capacitance (RC) values to create highly accurate timing simulations.',
    status: 'pending',
    inputFiles: ['Routed_Design.def', 'PDK QRC Tech Files'],
    outputFiles: ['Design_Parasitics.spef'],
    toolchains: ['OpenRCX', 'Synopsys Star-RC'],
    notes: 'Produces standard parasitics log files for final timing calculations.'
  },
  {
    id: '11-sta-signoff',
    name: '11 Static Timing Signoff',
    description: 'Performing signoff static timing analysis (STA) across all process, voltage, and temperature corners.',
    status: 'pending',
    inputFiles: ['Design_Parasitics.spef', 'Gate_Netlist.v', 'PDK Libs', 'SDC Constraints'],
    outputFiles: ['Timing_Violations_Signoff.rpt', 'Hold_Slack.rpt', 'Setup_Slack.rpt'],
    toolchains: ['OpenSTA', 'Synopsys PrimeTime'],
    notes: 'Must achieve zero negative slack on all setup and hold paths under multi-corner analysis.'
  },
  {
    id: '12-gds-tapeout',
    name: '12 GDSII Tape-out',
    description: 'Streaming out the final production-ready layout database file to be sent directly to the semiconductor foundry.',
    status: 'pending',
    inputFiles: ['Clean Physical Layout DEF', 'Foundry Mask Specifications'],
    outputFiles: ['Chip_Layout_Final.gds', 'Tapeout_Manifest.json'],
    toolchains: ['KLayout GDS Writer', 'Foundry Portal'],
    notes: 'Silicon tapeout signoff. Ready for mask manufacturing.'
  }
];

export const COMMITS: CommitLog[] = [
  {
    hash: '0xfa39be4',
    message: 'Merge pull request #42 from core/rv32im-hazard-forwarding-fix',
    branch: 'main',
    timestamp: '2026-06-29 06:12:44'
  },
  {
    hash: '0x32abde8',
    message: 'Add pipelined Radix-4 Booth Multiplier with formal verification proofs',
    branch: 'feature/rv32im-multiplier',
    timestamp: '2026-06-28 14:32:10'
  },
  {
    hash: '0x9924cba',
    message: 'Optimize AXI4 non-blocking crossbar routing matrix to resolve HoL blocking',
    branch: 'main',
    timestamp: '2026-06-27 18:45:00'
  },
  {
    hash: '0xb2cd142',
    message: 'Configure TSMC 7nm dual-power grid in cad-innovus scripts to minimize IR drop',
    branch: 'release/v1.0.0-soc',
    timestamp: '2026-06-26 11:22:15'
  },
  {
    hash: '0x77c229f',
    message: 'Resolve dynamic hazard-forwarding glitch on sequential branches',
    branch: 'fix/hazard-pipeline',
    timestamp: '2026-06-25 09:05:30'
  }
];

export const DOWNLOAD_ASSETS: DownloadAsset[] = [
  // --- Public Design Documents ---
  {
    id: 'design-report',
    name: 'RISCV_5Stage_Pipeline_Report.pdf',
    category: 'Documents',
    icon: 'file-text',
    version: '1.4.2',
    size: '1.4 MB',
    status: 'Official',
    fileType: 'Design Report',
    downloadPath: 'downloads/RISCV_5Stage_Pipeline_Report.pdf',
    downloadCount: 685,
    description: 'Complete microarchitectural specification, pipeline stage boundaries, and hazard forwarding verification results.'
  },
  {
    id: 'white-paper',
    name: 'TSMC7nm_Physical_Design_Whitepaper.pdf',
    category: 'Documents',
    icon: 'file-text',
    version: '1.0.0',
    size: '2.8 MB',
    status: 'Official',
    fileType: 'White Paper',
    downloadPath: 'downloads/TSMC7nm_Physical_Design_Whitepaper.pdf',
    downloadCount: 512,
    description: 'Comprehensive guide covering MSCTS, power grid synthesis, IR drop mitigations, and physical sign-off in Cadence Innovus.'
  },
  {
    id: 'cache-spec',
    name: 'L2_Coherent_Cache_Specification.pdf',
    category: 'Documents',
    icon: 'file-text',
    version: '2.0.1',
    size: '1.1 MB',
    status: 'Official',
    fileType: 'Hardware Spec',
    downloadPath: 'downloads/L2_Coherent_Cache_Specification.pdf',
    downloadCount: 394,
    description: 'Snoop-bus and MOESI hardware coherence protocol design specifications for multi-core configurations.'
  },
  // --- Private Restricted Core Assets ---
  {
    id: 'rv32im-rtl-src',
    name: 'SoC with Custom RISC-V Processor',
    category: 'RTL',
    icon: 'code',
    version: '1.2.0',
    size: '142 KB',
    status: 'Restricted',
    fileType: 'SystemVerilog / RTL Source',
    downloadPath: 'downloads/SoC_RISCV_Processor_RTL.zip',
    downloadCount: 88,
    description: 'Synthesizable SystemVerilog core, 5-stage classic pipeline, hazard detection unit, and Booth multiplier.'
  },
  {
    id: 'axi4-crossbar-test',
    name: 'APB Compliant UART Peripheral with Integrated FSM',
    category: 'Verification',
    icon: 'waveform',
    version: '1.0.4',
    size: '890 KB',
    status: 'Restricted',
    fileType: 'RTL Peripheral Design',
    downloadPath: 'downloads/UART_APB_Peripheral.zip',
    downloadCount: 62,
    description: 'Full peripheral UART controller with registers, baud rate generator, and complete testbench layers.'
  },
  {
    id: 'rv32im-floorplan-def',
    name: 'RV32IM 5-Stage Pipeline Layout',
    category: 'Layouts',
    icon: 'layers',
    version: '0.8.1-beta',
    size: '14.2 MB',
    status: 'Restricted',
    fileType: 'DEF / LEF Layout files',
    downloadPath: 'downloads/RV32IM_5Stage_Floorplan.zip',
    downloadCount: 45,
    description: 'TSMC 65nm cell placement files, DEF floorplan, power mesh configurations, and timing sign-off logs.'
  },
  {
    id: '8-bit-cpu',
    name: '8 Bit Simple Logic CPU',
    category: 'Layouts',
    icon: 'layers',
    version: '1.1.0',
    size: '5.4 MB',
    status: 'Restricted',
    fileType: 'Schematic / FPGA Bitstream',
    downloadPath: 'downloads/EightBitCPU_Design.zip',
    downloadCount: 119,
    description: 'Discrete standard logic block layouts, custom breadboard layout maps, and microcode ROM specifications.'
  },
  {
    id: 'l2-cache-gate-netlist',
    name: 'L2 Cache Coherence Netlist',
    category: 'Netlists',
    icon: 'cpu',
    version: '2.1.0',
    size: '4.1 MB',
    status: 'Restricted',
    fileType: 'Gate-Level Verilog Netlist',
    downloadPath: 'downloads/L2_Cache_Netlist.zip',
    downloadCount: 34,
    description: 'Synthesized gate-level netlist using 7nm cells, cell delay specifications, and power sign-off reports.'
  }
];
