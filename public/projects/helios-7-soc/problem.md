## Microarchitectural & Memory Wall Bottlenecks

Edge inference engines suffer from two primary engineering bottlenecks:

### 1. The Von Neumann Memory Wall
Executing deep neural networks requires streaming millions of weights from memory. Transferring weights over a traditional shared system bus dominates power consumption, often requiring 100x more energy than the actual Multiply-Accumulate (MAC) computation.

### 2. Physical Clock Distribution & Dynamic IR Drops
Operating a massive array of 256 MAC multipliers at 1.2 GHz triggers sharp dynamic current transients. These spikes create localized voltage (IR) drops across the power distribution mesh, threatening cell timing stability and triggering setup violations during physical design layout.
