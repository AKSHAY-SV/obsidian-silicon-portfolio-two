## FPGA-Based Hardware Verification

Verifying a discrete-style design requires rigorous logic analysis and physical validation of bus signals.

### 1. Vivado XSim RTL Simulations
The complete computer, RAM, and Microsequencer are verified using Vivado's XSim simulator:
- **Test Programs**: Pre-loaded memory programs calculate Fibonnaci sequences and count up/down cycles.
- **Trace Outputs**: Monitored the 16-bit control bus to ensure zero bus conflicts.

### 2. Logic Analyzer Hardware Probing
Once synthesized and loaded onto a Digilent Basys 3 board, the design was physically validated using an external logic analyzer:
- **Probes**: Placed on the 8 physical bus pins and the clock line.
- **Result**: Confirmed clean high-impedance transitions at 10 MHz operating speeds, with zero bus contention.
