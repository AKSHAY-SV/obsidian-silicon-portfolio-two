## Computer Design Retrospective

### 1. Clock Phase Distribution
Early versions shared the same rising clock edge for instruction decoding and register writeback. This caused timing races when reading the operand address from the instruction register to select memory lines, corrupting writeback values. Isolating the RAM read/write access and using negative-edge triggers for specific storage latches resolved this issue, providing clean timing margins.

### 2. Physical Switch Debouncing
Discrete control buttons on FPGA boards exhibit severe microsecond contact bouncing. Operating the manual execution clock without debouncing logic registered up to 50 false clock cycles per button press. Implementing a synchronous digital debouncer (using a shift register and clock division) fully stabilized manual step execution.
