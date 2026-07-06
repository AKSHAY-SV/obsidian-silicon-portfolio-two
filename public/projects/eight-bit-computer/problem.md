## Bus Contention and Asynchronous Flag Latches

Developing a robust discrete-style 8-bit bus processor introduces distinct physical hardware challenges:

### 1. Dynamic Shared Bus Contention
With all registers (Accumulator, Register B, Program Counter, Instruction Register) connected to a single 8-bit parallel bus, any timing overlap between output enable signals causes short-circuits. This bus contention degrades signal integrity and risks damaging discrete hardware chips.

### 2. Asynchronous ALU Flag Flickering
When performing additions or subtractions, the ALU's ripple-carry propagation delays cause flag outputs (Carry and Zero) to flicker before settling. Utilizing these flickering flags directly for conditional branch calculations leads to unstable and unpredictable software jumps.
