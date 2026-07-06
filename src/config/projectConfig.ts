export interface ProjectConfig {
  id: string;
  title: string;
  downloadKey: string;
  description: string;
  version: string;
}

export const PROJECTS_CONFIG: Record<string, ProjectConfig> = {
  'rv32im-rtl-src': {
    id: 'rv32im-rtl-src',
    title: 'SoC with Custom RISC-V Processor',
    downloadKey: 'soc_riscv_processor',
    description: 'System-on-Chip design incorporating a custom single-core RISC-V CPU, memory controllers, and peripheral buses.',
    version: '1.2.0'
  },
  'axi4-crossbar-test': {
    id: 'axi4-crossbar-test',
    title: 'APB Compliant UART Peripheral with Integrated FSM',
    downloadKey: 'apb_uart_fsm',
    description: 'A robust and fully compliant APB bus integrated UART communication module with custom FSM control.',
    version: '1.0.4'
  },
  'rv32im-floorplan-def': {
    id: 'rv32im-floorplan-def',
    title: 'RV32IM 5-Stage Pipeline',
    downloadKey: 'rv32im_5stage_pipeline',
    description: 'RTL layout, hazard-bypass unit, and full clock-tree floorplan definition for a five-stage pipelined processor.',
    version: '0.8.1-beta'
  },
  '8-bit-cpu': {
    id: '8-bit-cpu',
    title: '8 Bit CPU',
    downloadKey: '8bit_cpu',
    description: 'RTL description, ISA specifications, and simulation model for an accumulator-based 8-bit digital processor architecture.',
    version: '0.8.1-beta'
  },
  'l2-cache-gate-netlist': {
    id: 'l2-cache-gate-netlist',
    title: 'Cache Memory',
    downloadKey: 'l2_cache_memory',
    description: '4-way set-associative level 2 (L2) cache controller with write-back policy and MESI coherency protocol.',
    version: '2.1.0'
  }
};
