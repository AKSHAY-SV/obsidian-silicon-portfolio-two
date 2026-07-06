## Formal Assertion-based Verification

Verifying cache coherence controllers requires high-integrity formal math checkers to guarantee system consistency.

### 1. SymbiYosys Coherence Checker
The design was formally verified using **SymbiYosys**:
- **Goal**: Formally prove that two separate master caches can never hold a cache line in the `Modified` state simultaneously.
- **Verification Strategy**: Configured bounded-model checks running over 25 induction iterations, confirming no state safety breaches.

### 2. SVA (SystemVerilog Assertions)
Critical assertions integrated into the snoop filter logic:
- `assert_coherence_exclusive`: Proves that if cache 0 has a line in the `Modified` state, all other caches hold that line in the `Invalid` state.
- `assert_lru_no_loop`: Proves the Pseudo-LRU replacement state machine never locks or returns invalid eviction targets.
