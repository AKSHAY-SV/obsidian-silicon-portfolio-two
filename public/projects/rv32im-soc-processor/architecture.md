## Co-processor & Interconnect Architecture

To achieve sub-watt inference, the RV32IM SoC microarchitecture incorporates custom hardware blocks and advanced physical power meshes:

### 1. 16x16 2D Systolic Array Accelerator
The accelerator is designed as a spatial dataflow architecture where processing elements (PE) propagate weights and activation features in step-locked phases:
- **Weight Stationary Mode**: Weights are pre-loaded into internal registers within each PE.
- **Activation Flow**: Input activations flow horizontally from the left, while partial sums accumulate vertically down through the columns.
- **PE Cell Topology**: Each PE houses an 8-bit multiplier-accumulator (MAC) with a 24-bit accumulation register.

```
       [Act In 0] ---> [ PE 0,0 ] ---> [ PE 0,1 ] ---> [ PE 0,2 ]
                           |               |               |
       [Act In 1] ---> [ PE 1,0 ] ---> [ PE 1,1 ] ---> [ PE 1,2 ]
                           |               |               |
                           v               v               v
                      [P-Sum Out0]    [P-Sum Out1]    [P-Sum Out2]
```

### 2. Dual-Power Strap Routing Grid
To mitigate dynamic IR drop across the 16x16 array, a robust power distribution network (PDN) was engineered:
- **Strapping**: Implemented multi-track power strapping on Metal 7 (horizontal) and Metal 8 (vertical).
- **Decoupling Capacitors**: Integrated high-density metal-insulator-metal (MIM) decoupling capacitors directly beneath the systolic array area, stabilizing localized voltage within 2.5% of the nominal 0.7V rail.
