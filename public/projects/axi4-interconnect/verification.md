## UVM-based Transaction Coverage

The crossbar interconnect is verified using a high-density Universal Verification Methodology (**UVM**) testbench environment:

### 1. Functional Coverage Metrics
- **Crossbar Master/Slave Coverage**: Ensures every master can read and write to every slave concurrently.
- **Back-to-Back Burst Transfers**: Stress-tests credit flow limits with continuous burst reads/writes of 16-word packages.
- **Protocol Error Injection**: Injects unaligned address transfers and illegal burst length parameters to verify slave error responses (`DECERR`, `SLVERR`).

### 2. Formal Property Verification
Using **Synopsys VC Formal**, mathematical properties were written to verify protocol correctness:
- `assert_axi_no_deadlock`: Guarantees address channels can never deadlock under any combination of master requests.
- `assert_order_coherency`: Assures read data responses exactly follow the request sequence ID.
