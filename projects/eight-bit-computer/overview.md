# 8-Bit von Neumann Microprogrammed Computer

An educational yet robust 8-bit computer system designed according to the classic SAP-1 (Simple As Possible) and von Neumann architectures. It features an 8-bit shared bidirectional tri-state parallel bus, a microprogrammed control unit with conditional branching flags, an arithmetic logic unit (ALU), and dedicated register layouts. The design is mapped to an FPGA target for physical hardware validation.

## Architectural Elements
- **Word Width**: 8-bit Data Bus / 4-bit Address Bus
- **Memory Capacity**: 16 Bytes of integrated RAM (Expandable via page selectors)
- **Control Strategy**: Microprogrammed Control Unit (6 T-states per instruction cycle)
- **ALU Functionality**: 8-bit Addition, Subtraction, and Zero/Carry flag monitoring
