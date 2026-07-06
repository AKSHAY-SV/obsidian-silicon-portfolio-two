## Post-Routing Synthesis & Performance Reports

The design was synthesized using **Synopsys Design Compiler** targeting a **TSMC 65nm GP process**.

### Post-Routing Synthesis Report

| Performance Attribute | Metric Value | Analysis Corner / Operating Condition |
|:---|:---|:---|
| **Process Node** | TSMC 65nm GP | Commercial Standard Cells |
| **Max Clock Frequency** | 450 MHz | WC Corner, 0.90V, 125°C |
| **Snoop Latency** | 1 clock cycle | Standard L1 snoop query |
| **Setup Slack (WNS)** | `+0.28 ns @ 400MHz` | Worst-case Corner |
| **Total Dynamic Power** | `18.2 mW @ 400MHz` | Typical-Typical, 1.2V |
| **Leakage Power** | `0.45 mW` | Worst-case Corner |
| **Total Gate Equivalent**| `14.2k standard cells`| Central control logic only |
