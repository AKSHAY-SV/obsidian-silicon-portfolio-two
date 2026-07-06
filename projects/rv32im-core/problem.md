## Microarchitectural Timing & Hazard Challenges

Developing a high-performance 5-stage classic pipeline introduces severe timing bottlenecks and data dependency risks. The primary engineering concerns addressed during this design cycle include:

### 1. Read-After-Write (RAW) Pipeline Stall Penalties
In standard pipelines, an instruction writing back to a register causes a RAW hazard if a subsequent instruction attempts to read that same register. Unresolved RAW dependencies force the scheduler to inject up to 2 clock stalls (bubbles) per hazard, dragging the CPU instruction-per-cycle (IPC) down to 0.74 in standard benchmark loops.

### 2. Hardware Integer Division Critical Path Dominance
A single-cycle integer divider requires massive combinational carry-lookahead arrays. During baseline layout checks, the division propagation delay dominated the physical critical path, limiting the clock frequency to 80 MHz on a TSMC 65nm cell library.

### 3. Control Hazard Bubble Generation
Unconditional and conditional branches (e.g., `BEQ`, `BNE`) are resolved late in the Execute stage. This delay creates a 2-cycle control bubble for every branch taken, heavily penalizing software flow controls.
