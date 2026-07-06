# RV32IM_PROCESSOR Pipelined CPU Core

The RV32IM CPU Core is a parameterizable, synthesizable, cycle-accurate implementation of the 32-bit RISC-V base integer Instruction Set Architecture (ISA) with the "M" extension for integer hardware multiplication and division. The design is optimized for power-efficiency and predictable low-latency real-time control in embedded controller contexts.

## High-Level Specifications
- **Instruction Set Support**: RV32I, RV32M
- **Pipeline Depth**: Classic 5-Stage Scalar (Fetch, Decode, Execute, Memory, Writeback)
- **Bus Interface**: Native 32-bit SRAM-style / customizable AXI4-Lite wrapper
- **L1 Cache Interface**: 4KB Direct-Mapped split Harvard configuration (I-Cache and D-Cache)

## Structural Design Blueprint
```
                   +-----------------------------------------------------------+
                   |                 RV32IM CORE ARCHITECTURE                  |
                   +-----------------------------------------------------------+
                   |                                                           |
 [Instruction]     |   +-------+     +--------+     +-------+     +--------+   |
    Fetch   ======>|==>| DECODE|====>| EX/ALU |====>| MEMORY|====>| REG-WB |   |
    Stage          |   +-------+     +--------+     +-------+     +--------+   |
                   |       ^             ^              ^             |        |
                   |       |             |              |             |        |
                   |       +-------------+--------------+-------------+        |
                   |               Operand Forwarding bypass bus               |
                   +-----------------------------------------------------------+
```
The architecture minimizes global stalling registers by distributing hazard detection to decode-stage logic and utilizing bypass registers to forward active results.
