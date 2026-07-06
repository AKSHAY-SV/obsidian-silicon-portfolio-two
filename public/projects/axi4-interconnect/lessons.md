## Interconnect Architectural Retrospective

### 1. Dual-Port Buffering vs. Shared Channels
Early design iterations utilized single-port RAM blocks to buffer write channels across slave ports. This approach suffered from severe write-response contention. Refactoring the buffers to use true dual-port flip-flop arrays resolved these layout bottlenecks, increasing overall interconnect throughput by 42% at a minor 8% cost in silicon area.

### 2. Multi-Master Address Arbitration Skew
Routing multiple address buses into a central round-robin arbiter introduces substantial wire delays. Standardizing on a tree of distributed fast arbiters (binary priority chains) reduced combinational gate depth, allowing the clock frequency to scale from 400 MHz to 650 MHz.
