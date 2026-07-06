## Verification Suite & Floating-Point Model Checking

To verify matrix multiplication correctness across extreme tensor domains, the RV32IM SoC platform utilizes a modern co-verification framework:

### 1. Cocotb (Python) & PyTorch Co-simulation
Instead of writing complex mathematical checkers in SystemVerilog, the testbench is written in Python using **Cocotb**:
- **Reference Model**: Generates golden tensor results in **PyTorch** or **NumPy**.
- **Stimulus Feed**: Drives matrix arrays and activations directly into the Verilator/VCS-compiled RTL model over virtual GPIB interfaces.
- **Assertion Metrics**: Monitors outputs per cycle, logging maximum error bounds.

### 2. Physical CDC and Linting Checks
- **Snooping and Crossing Checking**: Multi-clock domains between the RV32IMAC controller (running at 400 MHz) and the Systolic Array (running at 1.2 GHz) are isolated using asynchronous dual-clock FIFOs.
- **SpyGlass Linting**: Validated with zero critical structural warnings.
