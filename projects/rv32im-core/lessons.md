## Post-Tapeout Retrospective & Engineering Insights

Synthesizing a custom RISC-V pipelined core yields major microarchitectural insights:

### 1. Register File Clock Edge Selection
In early versions, the register file wrote and read on the positive clock edge. This forced the Instruction Decode stage to wait a full cycle to receive values written during the Write-back stage, generating unnecessary stalls. Transitioning the Register File write port to write on the **negative clock edge** resolved this hazard cleanly in the first half-cycle, eliminating stall requirements for sequential write-read operations.

### 2. Physical Layout Congestion from High Fanout
Global control signals (such as pipeline flush and reset lines) suffer from high physical fanout. During placement and routing checks, these lines caused severe routing blockages around execution multiplexers. Future iterations will include automatic buffer tree insertion structures during early-stage clock tree synthesis to distribute the load cleanly.
