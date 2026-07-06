## Physical Layout & Timing Synthesis Results

The interconnect has been physically synthesized on a **28nm FD-SOI (Fully Depleted Silicon-on-Insulator)** process node.

### Physical Sign-off Metrics

| Performance Attribute | Metric Value | Analysis Conditions |
|:---|:---|:---|
| **Process Node** | 28nm FD-SOI | Commercial Low-Vth Cells |
| **Max Clock Frequency** | 650 MHz | Nominal 0.90V @ 125°C |
| **Latency (First Word)** | 3 cycles (Master to Slave) | Under zero bus contention |
| **Setup Slack (WNS)** | `+0.42 ns @ 500MHz` | Worst-case Corner |
| **Hold Slack (WNS)** | `+0.05 ns` | Best-case Corner |
| **Active Routing Power** | `14.8 mW @ 500MHz` | Typical-Typical Corner |
| **Dynamic Wire Congestion**| `< 0.8%` | Post-route layer summary |
