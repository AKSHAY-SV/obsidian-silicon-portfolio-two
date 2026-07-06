## Multi-Core Coherency & Cache Miss Overhead

Modern multi-core processors suffer from severe performance bottlenecks when scaling parallel executions:

### 1. Cache Coherency and Stale Data Hazards
In multi-core nodes, Core 0 might modify a memory value locally in its L1 cache while Core 1 continues reading a stale value from its own L1 cache. Resolving this without hardware coordination requires flushing caches to main memory, which creates huge software latency penalties.

### 2. Snoop Broadcast Storm Congestion
A traditional snooping cache controller broadcasts every write transaction to all active cores. As the core count scales beyond four, snoop queries consume over 80% of the crossbar bus bandwidth, starving primary instruction and data flows.
