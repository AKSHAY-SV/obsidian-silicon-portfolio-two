## Cache Architectural Retrospective

### 1. Pseudo-LRU vs. True LRU Area Demands
A true Least Recently Used (LRU) tracking scheme requires `O(N^2)` bits per set, which quickly scales to consume massive SRAM block area. Transitioning the design to a **Pseudo-LRU (PLRU) Tree** configuration reduced the tracking footprint to only `N-1` bits per set. This saved over 32% of control register area with a negligible 1.2% drop in cache hit rate during benchmark simulation runs.

### 2. Snoop Response Latency Matching
In early simulations, snoop signals returning from Core 1 were delayed due to routing congestion. This delay caused the central directory controller to stall, delaying Core 0 read operations. Standardizing snoop return paths using dedicated high-speed routes resolved these stalls, reducing average snoop latency by 40%.
