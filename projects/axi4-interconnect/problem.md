## Transaction Latency & Head-of-Line Blocking

Connecting multiple processors and accelerators to shared memory arrays introduces two major routing issues:

### 1. Head-of-Line (HoL) Blocking
When using shared bus architectures, a slow transaction between Master 0 and Slave 0 blocks the entire bus, preventing Master 1 from accessing Slave 1. This blocking can reduce total SoC bandwidth by over 60% in multi-threaded workflows.

### 2. Physical Routing and Slew Degradation
A fully-connected 4x4 multiplexer matrix requires extensive logical feedback loops. When compiled on a sub-micron FD-SOI process, long wire runs introduce parasitic resistance and capacitance, degrading signal slew and limiting performance to under 200 MHz.
