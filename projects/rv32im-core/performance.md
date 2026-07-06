## ASIC Synthesis & Power, Performance, Area (PPA) Results

The design is synthesized using **Synopsys Design Compiler (DC)** and routed using **OpenROAD** on a commercial **TSMC 65nm LP standard-cell library**.

### Post-Routing Synthesis Report

| Performance Attribute | Metric Value | Analysis Corner |
|:---|:---|:---|
| **Target Clock Frequency** | 180 MHz | WC Corner, 1.08V, 125°C |
| **Setup Slack (WNS)** | `+1.42 ns @ 150MHz` | WC Corner, 1.08V, 125°C |
| **Hold Slack (WNS)** | `+0.08 ns` | BC Corner, 1.32V, -40°C |
| **Total Dynamic Power** | `32.4 mW` | Typical-Typical, 1.20V, 25°C |
| **Leakage Power** | `1.84 mW` | WC Corner, 1.08V, 125°C |
| **Physical Core Area** | `0.18 mm²` | Post-route boundaries |
| **Total Gate Equivalent** | `4,280 standard cells` | Post-synthesis check |

## Critical Path Timing Analysis

The physical layout critical path flows from the instruction decode register file output, through the bypass multiplexers, down to the multi-stage division control register file input.
The total combinatorial path contains 18 cell stages, fully compliant with setup constraints at 150 MHz operating clocks.
