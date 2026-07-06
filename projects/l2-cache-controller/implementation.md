## MESI State Controller Design

The L2 cache controller is implemented in synthesizable SystemVerilog. Let's inspect the state machine transition block:

```systemverilog
// =================================================================
// SUB-MODULE: MESI_State_Machine
// DESCRIPTION: Manages cache line state transitions based on hits
// =================================================================
module MESI_State_Machine (
    input  wire        clk,
    input  wire        rst_n,
    input  wire [1:0]  current_state,
    input  wire        read_miss,
    input  wire        write_hit,
    input  wire        write_miss,
    input  wire        snoop_write_req,
    output reg  [1:0]  next_state,
    output reg         invalidate_out
);

    // MESI State Definitions
    localparam INVALID   = 2'b00;
    localparam SHARED    = 2'b01;
    localparam EXCLUSIVE = 2'b10;
    localparam MODIFIED  = 2'b11;

    always @(*) begin
        next_state     = current_state;
        invalidate_out = 1'b0;

        case (current_state)
            INVALID: begin
                if (read_miss) begin
                    next_state = SHARED; // Transition to Shared on read miss
                end else if (write_miss) begin
                    next_state = MODIFIED;
                end
            end
            SHARED: begin
                if (write_hit) begin
                    next_state = MODIFIED;
                end else if (snoop_write_req) begin
                    next_state = INVALID;
                    invalidate_out = 1'b1;
                end
            end
            EXCLUSIVE: begin
                if (write_hit) begin
                    next_state = MODIFIED;
                end else if (snoop_write_req) begin
                    next_state = INVALID;
                    invalidate_out = 1'b1;
                end
            end
            MODIFIED: begin
                if (snoop_write_req) begin
                    next_state = INVALID;
                    invalidate_out = 1'b1; // Evict dirty cache line
                end
            end
        endcase
    end

endmodule
```
