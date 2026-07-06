## Hardware Description Implementation

The RV32IM CPU Core is implemented in fully-synthesizable, parameterizable IEEE-1800 SystemVerilog. Let's inspect the core forwarding comparator module:

```systemverilog
// =================================================================
// SUB-MODULE: Forwarding Unit
// DESCRIPTION: Computes control selection for ALU operand multiplexers
// =================================================================
module Forwarding_Unit (
    input  wire [4:0]  id_ex_rs1,
    input  wire [4:0]  id_ex_rs2,
    input  wire [4:0]  ex_mem_rd,
    input  wire [4:0]  mem_wb_rd,
    input  wire        ex_mem_reg_write,
    input  wire        mem_wb_reg_write,
    output reg  [1:0]  forward_a,
    output reg  [1:0]  forward_b
);

    always @(*) begin
        // --- Forward A Decision Logic ---
        if (ex_mem_reg_write && (ex_mem_rd != 5'd0) && (ex_mem_rd == id_ex_rs1)) begin
            forward_a = 2'b10; // Forward from EX/MEM output
        end
        else if (mem_wb_reg_write && (mem_wb_rd != 5'd0) && (mem_wb_rd == id_ex_rs1)) begin
            forward_a = 2'b01; // Forward from MEM/WB output
        end
        else begin
            forward_a = 2'b00; // Load directly from Register File
        end

        // --- Forward B Decision Logic ---
        if (ex_mem_reg_write && (ex_mem_rd != 5'd0) && (ex_mem_rd == id_ex_rs2)) begin
            forward_b = 2'b10; // Forward from EX/MEM output
        end
        else if (mem_wb_reg_write && (mem_wb_rd != 5'd0) && (mem_wb_rd == id_ex_rs2)) begin
            forward_b = 2'b01; // Forward from MEM/WB output
        end
        else begin
            forward_b = 2'b00; // Load directly from Register File
        end
    end

endmodule
```

## Register-Transfer Level (RTL) Directory Map

The core structure is divided into clean, decoupled files:
- **`RV32IM_Core.v`**: Main top-level module coordinating execution lanes and pipeline registers.
- **`ALU.v`**: 32-bit execution logic with single-cycle zero flag, subtraction, shifts, and comparisons.
- **`M_Extension_Unit.sv`**: Implements 16-cycle and 8-cycle Booth multipliers and dividers.
