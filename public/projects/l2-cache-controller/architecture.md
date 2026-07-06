## Directory-based Coherence & Snoop Filtering Architecture

To guarantee absolute memory coherence and reduce bus congestion, the controller integrates a dynamic snoop controller and set directory:

### 1. MESI Cache-line State Transition Engine
The cache controller operates a hardware finite-state machine tracking the coherence states of each 64-byte line:
- **Modified (M)**: The line is valid in only one L1 cache and is dirty (contains newer data than main memory).
- **Exclusive (E)**: The line is present in only one L1 cache, matching main memory.
- **Shared (S)**: The line is present in multiple L1 caches, matching main memory.
- **Invalid (I)**: The line does not contain valid data.

### 2. Integrated Snoop Filtering Directory
To eliminate broadcast storms, a dedicated central directory tracks which core owns which cache lines. When a write hit occurs, instead of broadcasting a snoop write query globally, the controller queries the directory and routes point-to-point invalidation signals exclusively to the affected cores, preserving 75% of bus bandwidth.
