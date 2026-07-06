import { PORTFOLIO_KNOWLEDGE } from "./portfolioKnowledge";

interface CopilotResponse {
  response: string;
  sources: string[];
  followUps: string[];
}

function _generateRawResponse(query: string): CopilotResponse {
  const lowerQuery = query.toLowerCase().trim();

  // 1. RV32IM SOC INTENT
  if (
    lowerQuery.includes("rv32im-soc-processor") ||
    lowerQuery.includes("rv32im-soc") ||
    lowerQuery.includes("soc") ||
    lowerQuery.includes("7nm") ||
    lowerQuery.includes("npu") ||
    lowerQuery.includes("systolic")
  ) {
    return {
      sources: ["Projects (ASIC SoC)", "Core Skills & EDA Tools"],
      followUps: [
        "Tell me more about the physical clock tree synthesis on the RV32IM SoC.",
        "What tools did he use to check the power IR drop?",
        "What's the difference between his single core and SoC projects?"
      ],
      response: `### 🚀 RV32IM SoC – 5-Stage Pipelined RISC-V Processor (7nm FinFET)

The **RV32IM SoC – 5-Stage Pipelined RISC-V Processor** is Akshay Srikrishnan's flagship mixed-signal silicon architecture. It integrates high-efficiency 5-stage pipelined RISC-V cores with dedicated accelerators, sharing a coherent cache hierarchy and communicating over a high-bandwidth, non-blocking 128-bit AXI4 ring network.

#### 📊 Core Physical & Silicon Metrics
| Parameter | Value / Specification |
| :--- | :--- |
| **Silicon Technology Node** | TSMC 7nm FinFET (N7 Process PDK) |
| **Core Frequency** | 1.2 GHz @ Nominal VDD (0.75V) |
| **Silicon Area** | 12.54 mm² |
| **Peak Power Consumption** | 452 mW |
| **Transistor Count** | 28.4 Million |
| **Compute Density** | 4.2 TOPS @ 800MHz (INT8 Matrix) |
| **Interconnect Fabric** | 128-bit Non-Blocking Ring Interconnect (AXI4-compliant) |
| **Memory Interface** | Integrated LPDDR4/5 Physical Layer (PHY) |
| **L2 SRAM Cache** | Shared 1MB Cache Coherent SRAM |

#### 🛠️ Key Microarchitectural Features
1. **CPU Cluster**: 5-Stage Pipelined RV32IM cores. Optimized for low-power control tasks and OS hosting.
2. **Systolic Array Acceleration**: An 800MHz 16x16 MAC (Multiply-Accumulate) array with dedicated activation function units (ReLU, GeLU) and low-latency weight double-buffering.
3. **Power Management**: Deployed adaptive body biasing and dynamic voltage frequency scaling (DVFS) domains.

#### ⚡ Architectural Challenges & Solutions

*   **Dynamic IR Drop in Matrix Engine**:
    *   *Problem*: High MAC density during intensive operations caused dynamic voltage droop exceeding 12% in the core region, triggering setup timing violations.
    *   *Solution*: Re-architected the power grid using a dense dual-mesh layout in Metal 7 (M7) and Metal 8 (M8), doubled the standard cell tap density, and placed decoupling capacitor cells (decaps) directly adjacent to structural multiplier rows.
*   **Clock Skew Boundary Management**:
    *   *Problem*: Routing clock lines across the 12.54 mm² die boundary resulted in over 180ps of clock skew, leading to hold-time violations.
    *   *Solution*: Deployed Multi-Source Clock Tree Synthesis (MSCTS) inside **Cadence Innovus**, routing the global H-Tree grid on ultra-thick top metal layers to minimize routing resistance and bounding clock skew under 35ps.

---

Would you like me to show you the clock constraints or the synthesis scripts used for this 7nm tapeout?`
    };
  }

  // 2. RV32IM CPU INTENT
  if (
    lowerQuery.includes("rv32") ||
    lowerQuery.includes("risc") ||
    lowerQuery.includes("cpu") ||
    lowerQuery.includes("processor") ||
    lowerQuery.includes("pipeline") ||
    lowerQuery.includes("multiplier")
  ) {
    return {
      sources: ["Projects (RTL Core)", "Core Skills & EDA Tools"],
      followUps: [
        "How was the RV32IM processor core verified?",
        "Explain his operand forwarding hazard network.",
        "What's the difference between his single core and SoC projects?"
      ],
      response: `### 🧠 RV32IM_PROCESSOR: High-Performance 5-Stage Pipelined RISC-V CPU

The **RV32IM Core** is a fully-synthesizable, cycle-accurate implementation of the RISC-V RV32IM Instruction Set Architecture (ISA). It features a classical 5-stage pipeline optimized for maximum throughput with hazard-bypassing, a dynamic branch target predictor, and a hardware integer multiplication/division unit.

#### 📊 Hardware Synthesis Metrics
| Parameter | Value |
| :--- | :--- |
| **ISA Extensions** | RV32IM (Integer Base + 'M' Multiply/Divide) |
| **Pipeline Stages** | 5 (Fetch, Decode, Execute, Memory, Write-back) |
| **Logic Utilization** | 4,280 LUTs (Xilinx Artix-7 target) |
| **Fmax (Clock Speed)** | 180 MHz (TSMC 65nm) |
| **Timing Slack** | +1.42 ns @ 150MHz (OpenSTA verified) |
| **Instruction Cache** | 4KB Direct-Mapped L1 I-Cache |
| **Data Cache** | 4KB Direct-Mapped L1 D-Cache |
| **Verification Suite** | RISCOF (99.8% Suite Coverage) |

#### 🔬 Operand Forwarding & Hazard Unit
To achieve an optimal IPC (Instructions Per Cycle) near 1.0, the core implements a forward-bypassing matrix. Here is an architectural segment of the forwarding multiplexer control in **SystemVerilog**:

\`\`\`systemverilog
// Operand Forwarding Controller (Execute Stage)
always_comb begin
  // Default: operands from Decode Register File
  forward_a = 2'b00;
  forward_b = 2'b00;

  // EX Hazard: Forward from MEM stage (ALU output)
  if (mem_reg_write && (mem_rd != 5'd0)) begin
    if (mem_rd == exe_rs1) forward_a = 2'b10;
    if (mem_rd == exe_rs2) forward_b = 2'b10;
  end

  // MEM Hazard: Forward from WB stage (Register File writeback)
  if (wb_reg_write && (wb_rd != 5'd0)) begin
    if (wb_rd == exe_rs1 && !(mem_reg_write && (mem_rd != 5'd0) && (mem_rd == exe_rs1))) begin
      forward_a = 2'b01;
    end
    if (wb_rd == exe_rs2 && !(mem_reg_write && (mem_rd != 5'd0) && (mem_rd == exe_rs2))) begin
      forward_b = 2'b01;
    end
  end
end
\`\`\`

#### ⚡ Key Architectural Challenges & Solutions
*   **RAW (Read-After-Write) Hazards**:
    *   *Problem*: Consecutive dependency-heavy operations caused 2-cycle bubble stalls, which dropped the IPC to 0.74 in RTL simulations.
    *   *Solution*: Developed the operand forwarding bypass logic illustrated above, routing intermediate results directly from execution/writeback buffers back to the execution ALU boundary. This reduced RAW stalls to **0 cycles** for general operations.
*   **Divider Clock Path Limitation**:
    *   *Problem*: A combinational Radix-2 divider dominated the critical path, capping the core clock speed at 80MHz due to large cell delays.
    *   *Solution*: Refactored the divider into an 8-cycle iterative state machine, separating multiplication/division paths and raising the synthesis Fmax to **180 MHz**.`
    };
  }

  // 3. CACHE CONTROLLER / COHERENCE INTENT
  if (
    lowerQuery.includes("cache") ||
    lowerQuery.includes("mesi") ||
    lowerQuery.includes("coherency") ||
    lowerQuery.includes("coherence") ||
    lowerQuery.includes("snoop")
  ) {
    return {
      sources: ["Projects (Memory Cache)", "Core Skills & EDA Tools"],
      followUps: [
        "How did snoop buffers prevent Cache coherence deadlocks?",
        "Which formal tool verified the L2 cache controller?",
        "Explain his MESI cache controller and its challenges."
      ],
      response: `### 💾 L2_CACHE_SYSTEM: MESI-Coherent Multi-Core Cache Controller

Akshay designed a high-performance **L2 Cache Controller** to manage data coherence across a multi-core processor cluster. The design implements a strict **MESI (Modified, Exclusive, Shared, Invalid)** protocol over a shared bus, optimizing multi-threaded data consistency with minimum latency.

#### 📊 Cache Architecture Metrics
| Metric / Feature | Specification |
| :--- | :--- |
| **Associativity** | 4-Way Set Associative |
| **Coherence Protocol** | MESI (Modified, Exclusive, Shared, Invalid) |
| **Replacement Policy** | Pseudo-LRU (Tree-based Binary PLRU) |
| **Write Policy** | Write-Back with Write-Allocate |
| **Verification Tool** | SymbiYosys Formal Verification Suite |
| **Synthesis Footprint** | 12,240 LUTs |
| **Clock Domain** | Synchronous 200 MHz core |

#### ⚡ Coherency State Machine Design
The controller tracking cache lines operates on four distinct stable states. The transition logic is mapped in hardware as follows:
1.  **Invalid (I)**: Line not present or out of date. Read miss initiates a bus request.
2.  **Shared (S)**: Present in this cache and potentially others. Read hit. Write transitions to *Modified*.
3.  **Exclusive (E)**: Only present in this cache and clean. Write transition is silent to *Modified*.
4.  **Modified (M)**: Only present in this cache and dirty. Requires write-back to main memory on eviction.

#### 🛡️ Race Condition Mitigation & Formal verification
*   **The Challenge**: In multi-core simulation rounds, simultaneous write-back commands from CPU0 and read snoops from CPU1 triggered transient race conditions, causing bus deadlocks.
*   **The Solution**: Akshay designed and implemented an explicit **Snoop Buffer Pending Queue**. Read and invalidate snoops are queued and prioritized over standard memory fetches, resolving coherency races.
*   **Formal Verification**: To guarantee zero protocol deadlocks, Akshay wrote SystemVerilog Assertions (SVA) and verified the protocol state transition completeness using **SymbiYosys** and **Yosys-SMTBMC**:

\`\`\`systemverilog
// Formal Assertion: If cache-line is Modified (M), no other cache can hold it
assert_modified_coherence: assert property (
  @(posedge clk) disable iff (rst)
  (cache_state[0] == STATE_MODIFIED) |-> (snoop_bus_line_shared == 1'b0)
);
\`\`\``
    };
  }

  // 4. AXI4 CROSSBAR INTENT
  if (
    lowerQuery.includes("axi") ||
    lowerQuery.includes("crossbar") ||
    lowerQuery.includes("interconnect") ||
    lowerQuery.includes("uvm") ||
    lowerQuery.includes("switch")
  ) {
    return {
      sources: ["Projects (Computer Architecture)", "Core Skills & EDA Tools"],
      followUps: [
        "Explain his dynamic round-robin arbitration scheme.",
        "How was the Out-of-Order transaction ID handled?",
        "Which protocols does the crossbar interconnect support?"
      ],
      response: `### 🔀 AXI4_CROSSBAR: Parameterized Non-Blocking Interconnect Switch

To connect multiple masters (such as CPU cores and DMA engines) to multiple memory and peripheral blocks, Akshay designed a parameterized **4-Master to 4-Slave Non-Blocking AXI4 Crossbar Switch**.

#### 📊 Architecture Specifications
*   **Interface Standard**: AMBA AXI4 (Full burst protocol support) and AXI4-Lite.
*   **Bus Width**: Highly parameterizable (64-bit, 128-bit, or 256-bit).
*   **Arbitration**: Dynamic Weighted Round-Robin (WRR) to balance low-latency access and prevent master starvation.
*   **Topology**: Fully crossbarred, enabling concurrent transaction paths (e.g., Master 0 writing to SRAM while Master 1 reads from DDR5).
*   **Gate Count**: 8,450 LUTs mapped on Xilinx UltraScale+ FPGA.

#### 🧠 Out-of-Order (OoO) ID Routing
A key architectural challenge was **Head-of-Line (HoL) Blocking** when slow slaves (like APB peripherals) stalled fast transactions directed toward the L2 Cache Coherent memory block. 

To solve this, Akshay routed transactions using custom **AXI Transaction IDs**. The crossbar parses incoming IDs, tracks outstanding burst threads in internal reservation queues, and re-orders return packets, allowing faster data bursts to bypass pending peripheral accesses without protocol violations.`
    };
  }

  // 5. ACADEMIC / MIT BENGALURU / EDUCATION INTENT
  if (
    lowerQuery.includes("academic") ||
    lowerQuery.includes("education") ||
    lowerQuery.includes("college") ||
    lowerQuery.includes("mit") ||
    lowerQuery.includes("bengaluru") ||
    lowerQuery.includes("manipal") ||
    lowerQuery.includes("gpa")
  ) {
    return {
      sources: ["Education (MIT Bengaluru)"],
      followUps: [
        "What research papers has Akshay published at MIT Bengaluru?",
        "What certifications does Akshay hold?",
        "What is his academic standing in electronics?"
      ],
      response: `### 🎓 Academic Profile: Akshay Srikrishnan

Akshay is pursuing his **B.Tech in Electronics Engineering** specializing in **VLSI Design & Technology** at the prestigious **Manipal Institute of Technology (MIT), Bengaluru**.

#### 📝 Academic Details
*   **Institution**: Manipal Institute of Technology, Bengaluru (Manipal Academy of Higher Education)
*   **Degree**: Bachelor of Technology (B.Tech)
*   **Branch**: Electronics Engineering
*   **Specialization**: VLSI Design & Technology
*   **Timeline**: 2024 — Present
*   **Academic Standing**: First Class with distinction across all VLSI and core microelectronics courses.

#### 📚 Key Coursework & Focus Areas
1.  **Digital Integrated Circuit Design**: Standard cell layout design rules, static CMOS logic gates, delay calculations (Logical Effort), and dynamic power optimization.
2.  **Computer Architecture**: Pipelining design, cache coherence protocols (MESI), bus interconnections (AMBA), and RISC-V micro-architectures.
3.  **Hardware Description Languages**: SystemVerilog and Verilog for hardware description and advanced testbench verification (UVM/Cocotb).
4.  **Analog Microelectronics**: Transistor-level amplifier design, analog layout layouts, and simulation checks in LTspice and Cadence Virtuoso.

#### 🌟 IEEE & Leadership Roles
*   Active Student Member of the **IEEE Circuits and Systems Society**.
*   Involved in designing and building advanced EDA benchmark code suites for testing modular CPU pipelines.`
    };
  }

  // 6. CERTIFICATIONS INTENT
  if (
    lowerQuery.includes("cert") ||
    lowerQuery.includes("credential") ||
    lowerQuery.includes("arm") ||
    lowerQuery.includes("coursera") ||
    lowerQuery.includes("qualification")
  ) {
    return {
      sources: ["Certifications"],
      followUps: [
        "Show me his Computer Architecture certificate from Arm.",
        "What embedded systems credentials does he have?",
        "Show me his academic timeline at MIT Bengaluru."
      ],
      response: `### 📜 Professional Certifications & Micro-Credentials

Akshay has earned multiple certified credentials from global computer architecture leaders and universities to strengthen his digital circuit and processor engineering fundamentals:

1.  **Computer Architecture Essentials on Arm**
    *   *Issuer*: Arm Education (via Coursera)
    *   *Issued*: June 2026
    *   *Syllabus*: ARM Architecture configurations, processor pipelining pipelines, and hardware-software instruction interfaces.
    *   *Authority*: Verified by Dr. Khaled Benkrid (Senior Director of Education, Arm Ltd).
    *   *Verification ID*: [3NJZHUFQWWDF](https://coursera.org/verify/3NJZHUFQWWDF)

2.  **Embedded Software and Hardware Architecture**
    *   *Issuer*: University of Colorado Boulder
    *   *Issued*: July 2025
    *   *Focus*: Embedded firmware systems, hardware interfaces, timing constraint boundaries, and hardware-software co-design.
    *   *Verification ID*: [8KD3Z90X2O44](https://coursera.org/verify/8KD3Z90X2O44)

3.  **GenAI Basics – How LLMs Work**
    *   *Issuer*: Duke University
    *   *Issued*: June 2025
    *   *Focus*: Large Language Model architectures, embeddings, attention mechanisms, and prompt structures.
    *   *Verification ID*: [T6ZM8VUTF7B7](https://coursera.org/verify/T6ZM8VUTF7B7)

4.  **AI Tools & ChatGPT Workshop**
    *   *Issuer*: be10X
    *   *Issued*: June 2026
    *   *Focus*: AI productivity enhancements, code generation pipelines, and automated engineer workflows.`
    };
  }

  // 7. EDA TOOLS & SKILLS INTENT
  if (
    lowerQuery.includes("tool") ||
    lowerQuery.includes("skills") ||
    lowerQuery.includes("cadence") ||
    lowerQuery.includes("synopsys") ||
    lowerQuery.includes("vivado") ||
    lowerQuery.includes("innovus") ||
    lowerQuery.includes("verilog") ||
    lowerQuery.includes("systemverilog")
  ) {
    return {
      sources: ["Core Skills & EDA Tools"],
      followUps: [
        "Show me his synthesizable hardware projects.",
        "What digital RTL skills does he have?",
        "Explain his MESI cache controller and its challenges."
      ],
      response: `### 🛠️ Hardware Engineering Skills & EDA Tool Suite

Akshay has extensive hands-on experience with industry-standard digital hardware description languages (HDLs), scripting languages, physical design compilation flows, and FPGA programming suites.

#### 🗂️ Core Technical Competency Profile

*   **Hardware Description Languages (HDLs)**:
    *   **SystemVerilog** (98%): Synthesizable RTL, advanced testbenches, assertions (SVA), interface channels.
    *   **Verilog** (98%): Clean gate-level and behavioral digital designs.
    *   **Chisel** (75%): Scala-based modern hardware description.
    *   **VHDL** (65%): Legacy architecture exploration.

*   **Industry EDA Synthesis & Backend Suites**:
    *   **Cadence Innovus** (90%): Physical design place-and-route, clock tree synthesis (CTS), timing closure.
    *   **Synopsys Design Compiler** (90%): High-performance logic synthesis, area optimization, gate-level netlists.
    *   **Synopsys PrimeTime** (85%): Static Timing Analysis (STA), multi-mode multi-corner checks.
    *   **OpenSTA** (88%): Open-source static timing engine.
    *   **Yosys / OpenLane** (92%): Open-source RTL-to-GDSII flow automation.

*   **FPGA Development & Verification**:
    *   **Xilinx Vivado** (95%): Complete bitstream generation, floorplanning, physical constraints (XDC).
    *   **ModelSim / QuestaSim** (90%): Behavioral and post-synthesis waveform simulation.
    *   **Verilator / C++ Testbenches** (85%): Cycle-accurate processor simulation compile.

*   **Systems Programming & Scripting**:
    *   **C / C++** (90% / 85%): Bare-metal embedded systems, simulation models.
    *   **Python / Tcl** (90% / 80%): Synthesis script automation, Cocotb validation scripts.`
    };
  }

  // 8. GENERAL GREETINGS & ABOUT COPILOT
  if (
    lowerQuery.includes("hello") ||
    lowerQuery.includes("hi") ||
    lowerQuery.includes("who are you") ||
    lowerQuery.includes("what is this") ||
    lowerQuery.includes("copilot") ||
    lowerQuery.includes("help") ||
    lowerQuery === ""
  ) {
    return {
      sources: ["Portfolio Knowledge Base"],
      followUps: [
        "What is the RV32IM SoC designed by Akshay?",
        "Tell me about the synthesizable RV32IM Processor Core.",
        "Which EDA and FPGA design tools does Akshay use?"
      ],
      response: `### ⚡ Silicon Copilot Active and Online

Welcome to Akshay Srikrishnan's silicon engineering portfolio hub! I am **Silicon Copilot**, an autonomous AI principal engineering assistant designed by Google DeepMind and Google Design to represent Akshay Srikrishnan's technical achievements and VLSI competencies.

#### 🔬 What I Can Do For You:
*   **Architectural deep dives**: Ask me about the pipeline configuration or hazard forwarding in his synthesizable **RV32IM RISC-V CPU Core**.
*   **Silicon Layout and P&R**: Inquire about the physical clock tree synthesis or dynamic IR drop resolution on the **7nm FinFET RV32IM SoC**.
*   **Coherence & Protocols**: Explore the **L2 Cache Controller** state machine or the **AXI4 Parameterized Crossbar Switch** arbitration rules.
*   **EDA & Verification Skills**: Ask which Synopsys, Cadence, or Xilinx Vivado design suites Akshay commands.

---

*System Diagnostic Status*:
*   **Local Processor Engine**: active (offline-first architecture)
*   **Primary Knowledge Database**: Loaded with 385 nodes of verified RTL specifications.
*   **Current Mode**: Zero-latency GDSII documentation search.`
    };
  }

  // 9. GENERAL DOWNLOADS INTENT
  if (
    lowerQuery.includes("pdf") ||
    lowerQuery.includes("download") ||
    lowerQuery.includes("report")
  ) {
    return {
      sources: ["Portfolio Knowledge Base"],
      followUps: [
        "Show me his academic timeline at MIT Bengaluru.",
        "What certifications does Akshay hold?",
        "What are some key accomplishments of Akshay?"
      ],
      response: `### 📥 Downloadable Architectural Artifacts & Documentation

Engineering assets and technical documents by Akshay Srikrishnan are available through the **Secure Engineering Portal**. Access is gated by administrator approval — submit a request and you will receive a tokenized download link once approved. Here is the verified catalog of protected assets:

1.  **RV32IM Processor Design Report (PDF)**
    *   *Asset*: \`RV32IM_Core_Design_Report.pdf\` (~1.8 MB)
    *   *Scope*: Comprehensive technical report outlining bypass paths, ALU hazard matrices, and Verilator timing waveforms.
2.  **MESI Coherent Cache Specification (PDF)**
    *   *Asset*: \`MESI_Coherent_Cache_Spec.pdf\` (~980 KB)
    *   *Scope*: Architecture specifications containing state transition matrices, snoop pending configurations, and formal SystemVerilog Assertions.
3.  **RV32IM SoC Tapeout Slide Deck (PDF)**
    *   *Asset*: \`RV32IM_SoC_Tapeout_Slides.pdf\` (~3.4 MB)
    *   *Scope*: Presentation slides illustrating core layout DEF boundaries, global clock tree grids, and Innovus floorplan results.`
    };
  }

  // 10. GENERIC FALLBACK SEARCH
  // We scan the portfolio knowledge base to construct a custom answer
  let matchedProject = PORTFOLIO_KNOWLEDGE.projects.find(
    (p) =>
      lowerQuery.includes(p.name.toLowerCase()) ||
      lowerQuery.includes(p.id.toLowerCase()) ||
      p.techStack.some((t) => lowerQuery.includes(t.toLowerCase()))
  );

  if (matchedProject) {
    return {
      sources: [`Projects (${matchedProject.name})`],
      followUps: [
        "What is the RV32IM SoC designed by Akshay?",
        "Tell me about the synthesizable RV32IM Processor Core.",
        "Explain his MESI cache controller and its challenges."
      ],
      response: `### 🔬 Focus on ${matchedProject.name}: ${matchedProject.tagline}

Here is detailed technical information regarding **${matchedProject.name}** as documented in Akshay Srikrishnan's silicon workspace:

*   **Classification**: ${matchedProject.category}
*   **Detailed Specifications**:
    ${matchedProject.specs.map((s) => `*   **${s.label}**: ${s.value}`).join("\n    ")}
*   **Key Performance Metrics**:
    ${Object.entries(matchedProject.metrics)
      .map(([k, v]) => `*   **${k}**: ${v}`)
      .join("\n    ")}

#### 📐 Project Overview
${matchedProject.description}

#### ⚡ Engineering Challenges Solved
${matchedProject.challenges
  .map(
    (c) => `*   **Challenge**: ${c.problem}
    *   **RTL Solution**: ${c.solution}`
  )
  .join("\n")}`
    };
  }

  // Pure fallback
  return {
    sources: ["Portfolio Knowledge Base"],
    followUps: [
      "Tell me about the synthesizable RV32IM Processor Core.",
      "What is the RV32IM SoC designed by Akshay?",
      "Which EDA and FPGA design tools does Akshay use?"
    ],
    response: `### 🔎 Information Search Result for "${query}"

Akshay Srikrishnan's engineering database has registered this request. While there is no exact specific chapter matching your exact terminology, here is the high-level correlation:

*   **Full Name**: Akshay Srikrishnan
*   **Specialty**: Silicon Architect & Digital RTL design engineer.
*   **Core Hardware Focus**: Synthesizable RISC-V cores (RV32IM), 7nm FinFET mixed-signal SoCs, coherent cash hierarchies, and non-blocking AXI interconnect switches.
*   **Primary Academic Institution**: Manipal Institute of Technology, Bengaluru, specializing in VLSI Design & Technology.

Feel free to query specific topics such as the **RV32IM processor pipeline**, **RV32IM SoC area**, **MESI cache states**, or his **Arm certification** to unlock deep SystemVerilog code blocks and physical design metrics!`
  };
}

function adaptResponseToMode(baseResponse: string, mode: string, query: string): string {
  const modeLower = mode.toLowerCase();
  
  if (modeLower.includes("student")) {
    return `> 🎓 **Engineering Mode: Student (Pedagogical Viewpoint)**
> *This response is customized with simplified analogies and key microelectronics concept highlights.*

${baseResponse}

---
#### 📚 Student Study Corner: VLSI Analogy
*   **Pipeline Stages Analogy**: Think of a 5-stage CPU pipeline like an assembly line for washing dishes. One person washes (Fetch), one rinses (Decode), one scrubs (Execute), one dries (Memory), and one puts away (Writeback). Instead of waiting for one dish to go through all steps before starting the next, a new dish enters the line every clock cycle!
*   **MESI Coherence Analogy**: Imagine 4 kids drawing on whiteboards. If kid A changes a drawing (Modified), they must tell everyone else so they don't look at old drawings (Invalidate). If they are just looking (Shared), they can all read without talking!
*   **FinFET (7nm Node) Analogy**: Traditional flat transistors are like doors that leak air at the bottom. FinFET is like wrapping a door on three sides (a 3D "fin") to completely seal it, allowing virtually zero leakage current when turned off!`;
  }
  
  if (modeLower.includes("recruiter")) {
    return `> 💼 **Engineering Mode: Recruiter (Professional Fit)**
> *This response highlights Akshay's industrial engineering value, team collaboration competence, and technical mastery.*

${baseResponse}

---
#### 🌟 Professional Fit & Placement Highlights
*   **Hardware Tapeout Ready**: Akshay has concrete micro-architecture models validated down to TSMC 7nm technology PDK specifications.
*   **Advanced Toolchain Command**: Mastery of industry-standard physical design suites (**Cadence Innovus**, **Synopsys Design Compiler**, **Synopsys PrimeTime**) as well as FPGA design flows (**Xilinx Vivado**).
*   **Academic Excellence**: Active leader at MIT Bengaluru, backed by professional credentials verified by **Arm Education** (Verification ID: 3NJZHUFQWWDF) and **University of Colorado Boulder**.
*   **Core Value**: He is fully equipped to hit the ground running on digital design, RTL synthesis, formal validation, and physical clock tree routing tasks in top-tier semiconductor teams.`;
  }
  
  if (modeLower.includes("rtl") || modeLower.includes("rtl engineer")) {
    return `> 💻 **Engineering Mode: RTL Engineer (Logic Design Focus)**
> *Customized with detailed hardware description rules, synthesis directives, and structural logic parameters.*

${baseResponse}

---
#### 🛠️ RTL Compiler & Logic Synthesis Guidelines
*   **Clock-Gating Cell Insertion**: To minimize dynamic power dissipation, Akshay configures integrated clock-gating (ICG) cells in the synthesizable RTL.
*   **CDC (Clock Domain Crossing)**: Deploys double-flop synchronizers and asynchronous FIFOs with gray-coded pointers for safe data crossing across asynchronous clock boundaries.
*   **Synthesis Constraints**: Structural RTL design is fully compliant with modern synthesis constraints, avoiding latch generation and checking for clean combinational feedback loops.`;
  }
  
  if (modeLower.includes("asic") || modeLower.includes("asic engineer")) {
    return `> 🛰️ **Engineering Mode: ASIC Engineer (Physical Design Focus)**
> *Customized with 7nm FinFET PDK layout rules, physical boundary parameters, and clock tree layout specs.*

${baseResponse}

---
#### 📐 ASIC Physical Implementation Constraints (GDSII)
*   **Power Distribution Network (PDN)**: Mapped using thick copper layers (Metal 7 & Metal 8) with a dual-grid mesh topology to keep peak dynamic IR voltage droops below 5% at the cell terminals.
*   **MSCTS (Multi-Source Clock Tree Synthesis)**: Clock lines are routed via balanced global H-Tree networks inside Innovus, checking hold-time closure with strict Static Timing Analysis (STA) across all Multi-Corner Multi-Mode (MCMM) views.
*   **Antenna Rule Violations**: Cleared using structural diode insertion on long metal segments to prevent gate-oxide breakdown during plasma etching.`;
  }
  
  if (modeLower.includes("embedded")) {
    return `> 🔌 **Engineering Mode: Embedded Engineer (Hardware/Software Co-Design)**
> *Customized with memory registers, firmware APIs, and hardware-software interface boundaries.*

${baseResponse}

---
#### 💾 Low-Level Hardware Interface & Bare-Metal Driver Map
*   **Memory-Mapped Registers**: Peripheral controls are fully memory-mapped, enabling direct access via C pointer register dereferences.
*   **Interrupt Latency Optimization**: Interrupt Service Routines (ISRs) are optimized for low clock-cycle counts, with immediate register-file state saving and restoring.
*   **AXI DMA Transfer Interfaces**: Interfaced with high-speed burst DMA engines to offload memory copying transactions from the primary RISC-V execution pipeline core.`;
  }
  
  if (modeLower.includes("interviewer")) {
    return `> 📋 **Engineering Mode: Technical Interviewer (Challenge Viewpoint)**
> *Customized with deep architectural challenge breakdowns, validation proofs, and candidate screening quiz questions.*

${baseResponse}

---
#### 🧠 Candidate Screening Quiz - Challenge Akshay's Design:
*   *Q1*: How does your hazard forwarding network handle back-to-back Load-to-Use dependencies? (Answer: Load-to-Use dependencies cannot be solved purely by forwarding; the compiler or hazard unit must insert a 1-cycle stall bubble).
*   *Q2*: In your MESI cache controller, how do you handle simultaneous Bus Read and Local Write transactions to the same cacheline index without causing a coherence deadlock?
*   *Q3*: What specific timing closure techniques did you use when Cadence Innovus encountered congestion-induced routing delays in the Systolic Array NPU?`;
  }
  
  return baseResponse;
}

export function generateLocalResponse(query: string, mode: string = "RTL Engineer"): CopilotResponse {
  const rawResult = _generateRawResponse(query);
  return {
    ...rawResult,
    response: adaptResponseToMode(rawResult.response, mode, query)
  };
}
