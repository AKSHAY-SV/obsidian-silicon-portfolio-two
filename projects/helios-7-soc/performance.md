## 7nm FinFET Physical Implementation Sign-off

The HELIOS-7 physical layout was taped-out under a commercial **TSMC 7nm FinFET process** utilizing Cadence Innovus for placing and routing.

### Post-Layout Sign-off Metrics

| Parameter Attribute | Metric Value | Analysis Corner / Operating Condition |
|:---|:---|:---|
| **Process Node** | TSMC 7nm FinFET | CLN7G Process Library |
| **MAC Clock Frequency** | 1.2 GHz | Nominal 0.70V @ 85°C |
| **Total Equivalent Gates** | 18.4 Million Gates | Post-synthesis Cell Count |
| **Peak Performance** | `614.4 GOPS (INT8)` | Peak systolic array throughput |
| **Active Power Density** | `142 mW / mm²` | Peak inference run loop |
| **Total Silicon Area** | `2.42 mm²` | Including Pad Ring |
| **Dynamic IR Drop** | `< 22 mV (3.1%)` | Multi-track Metal 8 power strap grid |
