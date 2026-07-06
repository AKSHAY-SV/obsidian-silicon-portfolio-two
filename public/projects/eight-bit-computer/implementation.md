## Verilog Microsequencer Implementation

The computer is written in synthesizable Verilog HDL, matching standard discrete TTL IC (74-series) logical behaviors.

### Microprogram Vector Map & Decode States (RTL)

```verilog
// =================================================================
// SUB-MODULE: Microprogram_CU
// DESCRIPTION: Generates the 16-bit master control word based on state
// =================================================================
module Microprogram_CU (
    input  wire       clk,
    input  wire       rst_n,
    input  wire [3:0] opcode,
    input  wire [1:0] flags, // [Carry, Zero]
    output reg  [15:0] ctrl  // 16-bit Master Control Word
);

    reg [2:0] t_state;

    // T-State Ring Counter (Sequences 1 through 6)
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            t_state <= 3'd1;
        end else begin
            if (t_state == 3'd6)
                t_state <= 3'd1;
            else
                t_state <= t_state + 1'b1;
        end
    end

    // Bitmask Indices:
    // ctrl[0]  = pc_oe,      ctrl[1]  = pc_count
    // ctrl[2]  = mar_load,    ctrl[3]  = ram_oe
    // ctrl[4]  = ram_we,      ctrl[5]  = ir_load
    // ctrl[6]  = ir_oe,       ctrl[7]  = acc_load
    // ctrl[8]  = acc_oe,      ctrl[9]  = regb_load
    // ctrl[10] = alu_oe,      ctrl[11] = alu_sub
    // ctrl[12] = out_load,    ctrl[13] = flags_load

    always @(*) begin
        ctrl = 16'b0;
        case (t_state)
            // --- Fetch Cycle ---
            3'd1: begin ctrl[0] = 1'b1; ctrl[2] = 1'b1; end // T1: MAR <- PC
            3'd2: begin ctrl[1] = 1'b1; end                 // T2: PC <- PC + 1
            3'd3: begin ctrl[3] = 1'b1; ctrl[5] = 1'b1; end // T3: IR <- RAM[MAR]

            // --- Execute Cycle ---
            default: begin
                case (opcode)
                    4'b0000: begin // LDA (Load Accumulator)
                        if (t_state == 3'd4) begin ctrl[6] = 1'b1; ctrl[2] = 1'b1; end // MAR <- IR[3:0]
                        if (t_state == 3'd5) begin ctrl[3] = 1'b1; ctrl[7] = 1'b1; end // ACC <- RAM
                    end
                    4'b0010: begin // ADD (Add to Accumulator)
                        if (t_state == 3'd4) begin ctrl[6] = 1'b1; ctrl[2] = 1'b1; end // MAR <- IR[3:0]
                        if (t_state == 3'd5) begin ctrl[3] = 1'b1; ctrl[9] = 1'b1; end // REG B <- RAM
                        if (t_state == 3'd6) begin ctrl[10] = 1'b1; ctrl[7] = 1'b1; ctrl[13] = 1'b1; end // ACC <- ALU, Load Flags
                    end
                    default: ctrl = 16'b0;
                endcase
            end
        endcase
    end

endmodule
```
