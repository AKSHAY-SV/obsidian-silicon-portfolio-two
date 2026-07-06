## Crossbar Routing & Flow Control Architecture

To maximize bandwidth and resolve HoL blocking, the interconnect implements a fully concurrent crossbar architecture with decoupled arbiters:

### 1. Decoupled Read/Write Channel Interconnect Matrices
Rather than routing address and data together, the design separates routing logic into 5 independent physical channel routing matrices:
- Write Address (`AW`)
- Write Data (`W`)
- Write Response (`B`)
- Read Address (`AR`)
- Read Data (`R`)

Each channel possesses independent dual-port multiplexers and priority encoders, allowing simultaneous read and write flows to different targets without channel resource conflicts.

### 2. Credit-Based Queue Flow Control
To prevent fast masters from overwhelming slow slaves, the crossbar incorporates **Credit-Based Credit Flow Controllers** at each boundary:
- Slaves advertise available buffer capacity (credits) back to masters.
- Crossbar routing multiplexers only issue transactions if the target slave register contains sufficient credits, eliminating head-of-line transaction timeouts.
