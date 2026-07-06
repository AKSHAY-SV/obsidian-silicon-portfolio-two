# L2 Coherent Cache Controller

A synthesizable, high-performance Level 2 Cache Controller featuring directory-based hardware coherence according to the MESI (Modified, Exclusive, Shared, Invalid) protocol. It bridges multiple L1 caches with shared system DDR memory, coordinating memory reads, writes, snoop interventions, and cache line evictions.

## Hardware Specifications
- **Cache Association**: 4-Way Set-Associative
- **Coherence Protocol**: MESI (Modified, Exclusive, Shared, Invalid)
- **Directory Structure**: Fully integrated Snoop Filtering Directory
- **Replacement Policy**: Pseudo-LRU (Least Recently Used) tree
