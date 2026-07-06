## Chisel-based Core Logic & Synthesis Directives

The NPU accelerator is implemented using **Chisel HDL** (Constructing Hardware in a Scala Embedded Language) which compiles directly into highly structured, synthesizable Verilog.

### Processing Element (PE) Accumulator Kernel (Verilog Output)

```systemverilog
// =================================================================
// SUB-MODULE: Systolic_PE
// DESCRIPTION: Individual multiplier-accumulator with data bypass lanes
// =================================================================
module Systolic_PE (
    input  wire        clk,
    input  wire        rst_n,
    input  wire        en,
    input  wire [7:0]  act_in,     // Activation input from left
    input  wire [7:0]  weight_in,  // Weight input
    input  wire [23:0] psum_in,    // Partial sum from top PE
    output reg  [7:0]  act_out,    // Activation output to right PE
    output reg  [23:0] psum_out    // Partial sum to bottom PE
);

    reg [7:0] r_weight;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            act_out  <= 8'd0;
            psum_out <= 24'd0;
            r_weight <= 8'd0;
        end else if (en) begin
            r_weight <= weight_in;
            act_out  <= act_in;
            // Fused Multiply-Accumulate stage
            psum_out <= psum_in + (act_in * r_weight);
        end
    end

endmodule
```

## System Component Layout
- **`NPU_Top.v`**: Arranges 256 PEs in a grid, matching inputs to weight buffers.
- **`Weight_SRAM_Controller.v`**: Controls reading/writing to localized dual-port scratchpad blocks.
- **`AHB_AXI_Bridge.sv`**: Connects the RISC-V AHB master bus to the high-speed AXI4 memory controller.
