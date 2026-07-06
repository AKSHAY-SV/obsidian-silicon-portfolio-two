## Physical Layout Retrospective

### 1. The Importance of Power Grid Optimization
Early synthesis iterations experienced severe clock jitter inside the systolic array boundary during peak matrix multiplications. This was traced back to localized voltage drops on Metal 5 routes supplying the MAC standard cells. Increasing the width of vertical metal straps and introducing MIM decoupling capacitors resolved this timing jitter, reducing clock phase error by 72%.

### 2. High-Speed Clock Tree Balancing
With 256 processing elements operating at 1.2 GHz, balancing clock tree insertion delay is critical to prevent skew-induced hold violations. Implementing a symmetric H-tree clock distribution network ensured skew remained below 14ps across all 256 cell inputs.
