## Physical FPGA Mapping and Timing Performance

The design is mapped to a Xilinx Artix-7 (XC7A35T) FPGA utilizing Xilinx Vivado.

### Post-Implementation FPGA Synthesis Report

| Performance Attribute | Metric Value | Analysis Conditions |
|:---|:---|:---|
| **FPGA Target Board** | Digilent Basys 3 | Artix-7 XC7A35T |
| **Max Clock Frequency** | 25 MHz | Setup-safe operating clock |
| **Slice LUT Count** | `124 LUTs (< 1%)` | Highly compact discrete layout |
| **Register Count** | `84 Flip-Flops` | Distributed across registers |
| **Block RAM Blocks** | `1 Block RAM` | Configured as 16x8 memory |
| **Total Thermal Power** | `1.4 mW @ 10 MHz` | Low-power passive state |
