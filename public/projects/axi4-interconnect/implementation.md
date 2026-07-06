## Parameterized Interconnect Design

The design is implemented in parameterized SystemVerilog, permitting simple changes to master/slave counts and data widths.

### Dual-Arbiter Multiplexer Route Selection (RTL)

```systemverilog
// =================================================================
// SUB-MODULE: AXI4_Channel_Arbiter
// DESCRIPTION: Round-robin arbiter for routing matrix channel access
// =================================================================
module AXI4_Channel_Arbiter #(
    parameter MASTERS = 4
)(
    input  wire                 clk,
    input  wire                 rst_n,
    input  wire [MASTERS-1:0]   req,
    output reg  [MASTERS-1:0]   gnt
);

    reg [MASTERS-1:0] pointer;

    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            gnt     <= 4'b0;
            pointer <= 4'b1;
        end else begin
            case (pointer)
                4'b0001: begin
                    if (req[0]) begin gnt <= 4'b0001; pointer <= 4'b0010; end
                    else if (req[1]) begin gnt <= 4'b0010; pointer <= 4'b0100; end
                    else if (req[2]) begin gnt <= 4'b0100; pointer <= 4'b1000; end
                    else if (req[3]) begin gnt <= 4'b1000; pointer <= 4'b0001; end
                end
                4'b0010: begin
                    if (req[1]) begin gnt <= 4'b0010; pointer <= 4'b0100; end
                    else if (req[2]) begin gnt <= 4'b0100; pointer <= 4'b1000; end
                    else if (req[3]) begin gnt <= 4'b1000; pointer <= 4'b0001; end
                    else if (req[0]) begin gnt <= 4'b0001; pointer <= 4'b0010; end
                end
                default: gnt <= 4'b0;
            endcase
        end
    end

endmodule
```
