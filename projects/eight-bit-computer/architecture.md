## Register & Microprogrammer Control Architecture

To achieve clean register-transfer operations without contention, two key design patterns are implemented:

### 1. High-Impedance Tri-State Buffer Interface
All modules connected to the shared 8-bit bus utilize high-impedance tri-state outputs. The top-level control bus distributes mutually-exclusive output enable signals, ensuring that at most one transmitter drives the bus at any given moment:

```
  [ Register A ]        [ Register B ]        [ Program Counter ]
    | (acc_oe)            | (regb_oe)           | (pc_oe)
    v                     v                     v
===[=================== SHARED 8-BIT BUS =====================]===
```

When no output enable line is active, the bus floats safely in a high-impedance state (`8'bzzzzzzzz`), preventing metadata corruption.

### 2. Microsequenced Control Unit (MCU)
The heart of the computer is a microprogrammed control state machine operating in 6 distinctive T-states:
- **T1, T2, T3 (Fetch Cycle)**: Move the PC to the MAR, increment the PC, and load the Instruction Register from RAM.
- **T4, T5, T6 (Execute Cycle)**: Generate control vector bitmasks to route register values through the ALU or commit them back.
- **Synchronized Flags Register**: To prevent flag flickering, Carry and Zero flags are latched into a dedicated register on the rising edge of the clock ONLY when the `flags_load` line is asserted, stabilizing jump operations.
