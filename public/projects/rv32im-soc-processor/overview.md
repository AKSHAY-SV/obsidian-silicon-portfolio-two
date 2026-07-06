# RV32IM SoC – 5-Stage Pipelined RISC-V Processor

The RV32IM SoC is a high-efficiency processor engineered in a commercial 7nm FinFET standard-cell technology. It integrates high-efficiency 5-stage pipelined RISC-V cores co-designed with dedicated accelerators tailored for high-throughput computation.

## Core Features
- **Process Technology**: TSMC 7nm FinFET
- **Neural Accelerator**: 16x16 Systolic Array processing INT8/INT16 matrix weights
- **Host Processor**: 32-bit RV32IMAC controller coordinating execution tasks
- **Bus Infrastructure**: Integrated high-throughput AXI4 multi-master interconnect matrix

## SoC Architecture Block Diagram
```
+-----------------------------------------------------------+
|                    RV32IM SYSTEM ON CHIP                  |
+-----------------------------------------------------------+
|  +--------------+        AXI4         +----------------+  |
|  | RISC-V Host  |<===================>| Systolic Array |  |
|  | RV32IMAC CPU |  Interconnect Bus   | Matrix NPU     |  |
|  +--------------+                     +----------------+  |
|         ^                                      ^          |
|         | SRAM Interface                       | SRAM     |
|         v                                      v          |
|  +--------------+                     +----------------+  |
|  | 512KB L2     |                     | 2MB Weight/Act |  |
|  | Cache Memory |                     | SRAM Buffer    |  |
|  +--------------+                     +----------------+  |
+-----------------------------------------------------------+
```
The design maps dedicated SRAM banks close to the execution registers to prevent memory bottlenecks during deep inference loops.
