# AXI4 Concurrent Interconnect Crossbar

A high-throughput, parameterizable, fully-concurrent 4-master to 4-slave crossbar interconnect designed according to the ARM AMBA AXI4 protocol specification. It serves as the primary system-on-chip routing backplane, enabling non-blocking parallel transaction flows between multiple high-performance master blocks and independent slave memories or co-processors.

## Core Properties
- **AMBA Protocol Compliance**: Full AXI4 Specification
- **Concurrent Connections**: 4 Masters / 4 Slaves (Expandable via design parameters)
- **Data Path Width**: Parameterized 32/64/128-bit
- **Routing Infrastructure**: Separated Read/Write Address, Data, and Response channels
