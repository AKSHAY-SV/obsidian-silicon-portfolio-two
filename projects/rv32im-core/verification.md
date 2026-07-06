## Verification Framework & Compliance Logs

Achieving functional correctness on CPU architectures requires comprehensive, multi-modal verification methodologies. This project utilizes Verilator co-simulations, RISCOF compliance validation, and SystemVerilog Assertions (SVA).

### 1. Cycle-Accurate Verilator Testbench
The RTL code is compiled into high-speed C++ models using **Verilator**. This allows for running extensive firmware sequences, compiling GCC-generated binaries directly, and executing them on the simulated processor core at over 2 million cycles per second.

```cpp
// Sample section of the C++ cycle driver
while (!verilator_top->is_finished()) {
    verilator_top->clk = !verilator_top->clk;
    verilator_top->eval();
    trace_vcd->dump(main_time++);
}
```

### 2. Architectural Compliance (RISCOF)
The processor undergoes continuous integration verification mapping against the official **RISC-V Compliance Framework (RISCOF)**:
- **Test suite**: `rv32i_m/`
- **Total test cases run**: 482
- **Pass rate**: `100.0%`
- **Result signature**: Match-verified against spike ISA golden simulator.

### 3. Key SystemVerilog Assertions (SVA)
Assertions are compiled inline to monitor critical safety rules during dynamic simulations:
- `assert_rf_write_exclusive`: Assures two internal modules never drive the same register write port concurrently.
- `assert_pipeline_no_undefined_instruction`: Assures any instruction flowing out of the decode stage is fully mapped in the decode space.
