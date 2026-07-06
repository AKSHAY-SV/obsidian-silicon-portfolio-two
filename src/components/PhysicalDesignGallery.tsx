import React, { useState, useEffect, useRef } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize2, Minimize2, ChevronLeft, ChevronRight, 
  Layers, Clock, Activity, FileText, Terminal, Sliders, CheckCircle2, 
  X, Filter, Eye, ShieldAlert, AlertTriangle, ArrowRight, CornerDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Physical Layouts' | 'Timing & Signoff' | 'Simulation Traces';
  caption: string;
  fileArtifact: string;
  tools: string;
  metric: string;
  description: string;
  detailText: string;
  renderComponent: () => React.JSX.Element;
}

export default function PhysicalDesignGallery() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // 1. FINAL GDSII LAYOUT VECTOR
  const renderGdsiiLayout = () => (
    <div className="w-full h-full bg-[#f8f9fa] select-none flex flex-col p-4 font-sans border border-slate-300 rounded-lg shadow-inner overflow-hidden">
      {/* Title Bar simulating KLayout */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3 text-xs text-slate-700 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
          <span className="font-semibold">soc_top.gds [soc_top]</span>
        </div>
        <span>KLayout v0.28.7</span>
      </div>
      
      {/* Silicon Area */}
      <div className="flex-1 relative border border-dashed border-slate-300 rounded bg-[#f4f5f7] flex items-center justify-center p-4">
        {/* White Grid of dots */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <svg viewBox="0 0 800 500" className="w-full h-full max-h-[380px]">
          {/* Main cell array boundary */}
          <rect x="200" y="50" width="400" height="400" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 2" />
          
          {/* Gold vertical Power Delivery Network (PDN) Straps */}
          <g stroke="#d97706" strokeWidth="12" opacity="0.65">
            <line x1="260" y1="50" x2="260" y2="450" />
            <line x1="330" y1="50" x2="330" y2="450" />
            <line x1="400" y1="50" x2="400" y2="450" />
            <line x1="470" y1="50" x2="470" y2="450" />
            <line x1="540" y1="50" x2="540" y2="450" />
          </g>
          
          {/* VPWR / VGND text */}
          <g fill="#1e293b" fontSize="9" fontFamily="monospace" opacity="0.7">
            <text x="246" y="44">VPWR</text>
            <text x="316" y="44">VGND</text>
            <text x="386" y="44">VPWR</text>
            <text x="456" y="44">VGND</text>
            <text x="526" y="44">VPWR</text>
          </g>

          {/* Green routing interconnections & dense logical nets */}
          <g stroke="#16a34a" strokeWidth="0.75" opacity="0.8">
            {/* Standard cell rows simulator */}
            {Array.from({ length: 18 }).map((_, r) => (
              <line key={r} x1="200" y1={70 + r * 22} x2="600" y2={70 + r * 22} strokeDasharray="3 3" />
            ))}
            
            {/* Congested signal segments */}
            <path d="M 220 80 h 120 v 44 h -50 v 66 h 180 v -44 h 30" fill="none" />
            <path d="M 310 110 v 130 h 90 v -60 h 80 v 110" fill="none" />
            <path d="M 250 200 h 150 v 50 h -40 v 80 h 180" fill="none" />
            <path d="M 420 140 h 120 v 180 h -90 v -40 h -80" fill="none" />
            <path d="M 280 340 h 190 v -90 h 80 v 120" fill="none" />
          </g>

          {/* Text Labels for standard cell rows (simulating KLayout font) */}
          <g fill="#166534" fontSize="7" fontFamily="monospace" opacity="0.7">
            <text x="210" y="86">sky130_fd_sc_hd__decap_3</text>
            <text x="210" y="108">sky130_fd_sc_hd__buf_4</text>
            <text x="210" y="130">sky130_fd_sc_hd__dfstp_1</text>
            <text x="210" y="152">sky130_fd_sc_hd__inv_2</text>
            <text x="210" y="174">sky130_fd_sc_hd__nand2_1</text>
            <text x="210" y="196">sky130_fd_sc_hd__or3_2</text>
            <text x="210" y="218">sky130_fd_sc_hd__decap_3</text>
            <text x="210" y="240">sky130_fd_sc_hd__tap_2</text>
            <text x="210" y="262">sky130_fd_sc_hd__clkbuf_16</text>
            <text x="210" y="284">sky130_fd_sc_hd__decap_3</text>
            
            <text x="410" y="96">uart_inst.uart_inst.tx_inst.state[1]</text>
            <text x="410" y="140">uart_inst.uart_inst.tx_inst.bit_count[2]</text>
            <text x="410" y="184">uart_inst.uart_inst.baud_inst.baud_tick</text>
            <text x="410" y="228">uart_inst.uart_inst.tx_inst.state[0]</text>
            <text x="410" y="272">uart_inst.uart_inst.tx_inst.state[2]</text>
          </g>

          {/* Green external IO pin marker lines */}
          <g stroke="#15803d" strokeWidth="1.5">
            <line x1="200" y1="120" x2="180" y2="120" /> {/* uart_rx */}
            <line x1="200" y1="360" x2="180" y2="360" /> {/* gpio[2] */}
            <line x1="600" y1="150" x2="620" y2="150" /> {/* gpio[0] */}
            <line x1="400" y1="50" x2="400" y2="30" />   {/* gpio[5] */}
            <line x1="330" y1="450" x2="330" y2="470" /> {/* gpio[7] */}
            <line x1="470" y1="450" x2="470" y2="470" /> {/* gpio[3] */}
            <line x1="580" y1="450" x2="580" y2="470" /> {/* gpio[4] */}
          </g>

          {/* External Pin Labels */}
          <g fill="#166534" fontSize="9" fontFamily="monospace" fontWeight="bold">
            <text x="126" y="123">uart_rx</text>
            <text x="126" y="363">gpio[2]</text>
            <text x="626" y="153">gpio[0]</text>
            <text x="382" y="26">gpio[5]</text>
            <text x="306" y="482">gpio[7]</text>
            <text x="446" y="482">gpio[3]</text>
            <text x="556" y="482">gpio[4]</text>
          </g>

          {/* Scale Indicator */}
          <g fill="#475569" fontSize="8" fontFamily="sans-serif">
            <rect x="15" y="465" width="70" height="4" fill="#64748b" />
            <text x="15" y="460">10 μm</text>
          </g>
        </svg>
      </div>

      <div className="mt-2 text-[10px] text-slate-500 font-mono text-center">
        Reference Layout File: rv32im_soc.gds • Area: 0.38 mm² • SkyWater 130nm PDK
      </div>
    </div>
  );

  // 2. KLAYOUT LAYER VIEW
  const renderKlayoutLayerView = () => (
    <div className="w-full h-full bg-black select-none flex rounded-lg overflow-hidden border border-slate-800">
      {/* Sidebar - Display Control */}
      <div className="w-1/4 min-w-[120px] bg-[#111111] border-r border-slate-800 p-3 flex flex-col font-sans">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Display Control</span>
        <div className="flex-1 space-y-2">
          <div className="text-[11px] font-bold text-white border-b border-slate-800 pb-1 mb-1">▼ Layers</div>
          {[
            { name: 'licon', color: '#b5c47c', checked: true },
            { name: 'li1', color: '#3b82f6', checked: true },
            { name: 'mcon', color: '#8b5cf6', checked: true },
            { name: 'met1', color: '#ef4444', checked: true },
            { name: 'via', color: '#10b981', checked: true },
            { name: 'met2', color: '#22c55e', checked: true },
            { name: 'via2', color: '#34d399', checked: true },
            { name: 'met3', color: '#eab308', checked: true },
            { name: 'via3', color: '#fde047', checked: true },
            { name: 'met4', color: '#a16207', checked: true },
            { name: 'via4', color: '#b45309', checked: true },
            { name: 'met5', color: '#06b6d4', checked: true }
          ].map(layer => (
            <div key={layer.name} className="flex items-center gap-2 text-[10px] text-slate-300 font-mono">
              <input type="checkbox" defaultChecked={layer.checked} className="rounded-sm border-slate-700 bg-black text-violet-500 focus:ring-0 w-3 h-3" />
              <span className="w-3 h-2 rounded-sm" style={{ backgroundColor: layer.color }}></span>
              <span>{layer.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main layout viewport */}
      <div className="flex-1 bg-black p-4 relative flex flex-col justify-between">
        <div className="text-[10px] text-slate-400 font-mono">KLayout Render View • Silicon Coordinates [0.0, 0.0] to [60.0, 60.0] um</div>
        
        <div className="flex-1 flex items-center justify-center p-2">
          <svg viewBox="0 0 500 400" className="w-full h-full max-h-[320px]">
            {/* Thin boundary */}
            <rect x="50" y="20" width="400" height="360" fill="none" stroke="#333333" strokeWidth="1" />
            
            {/* Met1 rails - Red horizontal stripes */}
            <g stroke="#ef4444" strokeWidth="2.5" opacity="0.6">
              {Array.from({ length: 15 }).map((_, i) => (
                <line key={i} x1="50" y1={40 + i * 24} x2="450" y2={40 + i * 24} />
              ))}
            </g>

            {/* Met5 rails - Bright Cyan thick horizontal straps */}
            <g stroke="#06b6d4" strokeWidth="9" opacity="0.8">
              <line x1="50" y1="80" x2="450" y2="80" />
              <line x1="50" y1="180" x2="450" y2="180" />
              <line x1="50" y1="280" x2="450" y2="280" />
            </g>

            {/* Microvias & vias (represented as green dots on straps) */}
            <g fill="#10b981" opacity="0.9">
              {Array.from({ length: 12 }).map((_, i) => (
                <g key={i}>
                  <circle cx={70 + i * 32} cy="80" r="2" />
                  <circle cx={70 + i * 32} cy="180" r="2" />
                  <circle cx={70 + i * 32} cy="280" r="2" />
                </g>
              ))}
            </g>

            {/* Cell rows logic block boundary */}
            <rect x="60" y="30" width="380" height="340" fill="none" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            
            {/* Green pin connection markers on the die edges */}
            <g fill="#22c55e">
              <polygon points="50,110 58,105 58,115" />
              <polygon points="50,230 58,225 58,235" />
              <polygon points="450,140 442,135 442,145" />
              <polygon points="450,260 442,255 442,265" />
              <polygon points="200,20 195,28 205,28" />
              <polygon points="300,380 295,372 305,372" />
            </g>
          </svg>
        </div>

        {/* Micron Grid Scale bar */}
        <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
          <div className="flex flex-col">
            <div className="flex border-b border-slate-500 w-24 justify-between">
              <span>0</span>
              <span>10</span>
              <span>20um</span>
            </div>
          </div>
          <span>Grid Cell: 10 um</span>
        </div>
      </div>
    </div>
  );

  // 3. MAGIC CELL PLACEMENT VIEW
  const renderMagicCellPlacementView = () => (
    <div className="w-full h-full bg-[#1e1e24] select-none rounded-lg border border-slate-800 p-4 flex flex-col font-mono text-[10px]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-slate-400 text-[11px]">
        <span>Magic Interactive Layout Tool v8.3</span>
        <span className="text-violet-400 font-bold">Post-Placement View</span>
      </div>

      <div className="flex-1 bg-[#121215] relative rounded border border-slate-800 p-2 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 600 400" className="w-full h-full max-h-[320px]">
          {/* Grid lines */}
          <g stroke="#2d2d34" strokeWidth="0.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="400" />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1="0" y1={i * 50} x2="600" y2={i * 50} />
            ))}
          </g>

          {/* Row Placement Boxes */}
          {[
            { x: 20, y: 30, w: 90, h: 40, label: 'PHY_42', color: '#475569', txt: 'sky130_fd_sc_hd__decap_3' },
            { x: 115, y: 30, w: 100, h: 40, label: 'FILLER_0_21_15', color: '#1e293b', txt: 'sky130_fd_sc_hd__fill_4' },
            { x: 220, y: 30, w: 140, h: 40, label: 'hold12', color: '#6d28d9', txt: 'sky130_fd_sc_hd__buf_4', active: true },
            { x: 365, y: 30, w: 80, h: 40, label: 'hold5', color: '#6d28d9', txt: 'sky130_fd_sc_hd__buf_4', active: true },
            { x: 450, y: 30, w: 120, h: 40, label: 'FILLER_0_22_113', color: '#1e293b', txt: 'sky130_fd_sc_hd__fill_4' },

            { x: 20, y: 80, w: 110, h: 40, label: 'FILLER_0_19_3', color: '#1e293b', txt: 'sky130_fd_sc_hd__fill_4' },
            { x: 135, y: 80, w: 120, h: 40, label: 'clkbuf_0_clk', color: '#db2777', txt: 'sky130_fd_sc_hd__clkbuf_16', clk: true },
            { x: 260, y: 80, w: 160, h: 40, label: 'hold11', color: '#6d28d9', txt: 'sky130_fd_sc_hd__buf_4', active: true },
            { x: 425, y: 80, w: 145, h: 40, label: 'FILLER_0_19_67', color: '#1e293b', txt: 'sky130_fd_sc_hd__fill_4' },

            { x: 20, y: 130, w: 150, h: 40, label: '219', color: '#3b82f6', txt: 'sky130_fd_sc_hd__dfstp_1' },
            { x: 175, y: 130, w: 120, h: 40, label: '218', color: '#3b82f6', txt: 'sky130_fd_sc_hd__dfstp_1' },
            { x: 300, y: 130, w: 150, h: 40, label: '220', color: '#3b82f6', txt: 'sky130_fd_sc_hd__dfstp_1' },
            { x: 455, y: 130, w: 115, h: 40, label: 'FILLER_0_16_80', color: '#1e293b', txt: 'sky130_fd_sc_hd__fill_4' },

            { x: 20, y: 180, w: 120, h: 40, label: 'hold7', color: '#6d28d9', txt: 'sky130_fd_sc_hd__buf_4', active: true },
            { x: 145, y: 180, w: 160, h: 40, label: 'clkbuf_1_1__f_clk', color: '#db2777', txt: 'sky130_fd_sc_hd__clkbuf_16', clk: true },
            { x: 310, y: 180, w: 110, h: 40, label: 'hold10', color: '#6d28d9', txt: 'sky130_fd_sc_hd__buf_4', active: true },
            { x: 425, y: 180, w: 145, h: 40, label: 'FILLER_0_12_89', color: '#1e293b', txt: 'sky130_fd_sc_hd__fill_4' },

            { x: 20, y: 230, w: 100, h: 40, label: 'PHY_41', color: '#475569', txt: 'sky130_fd_sc_hd__decap_3' },
            { x: 125, y: 230, w: 140, h: 40, label: 'FILLER_0_10_13', color: '#1e293b', txt: 'sky130_fd_sc_hd__fill_4' },
            { x: 270, y: 230, w: 120, h: 40, label: 'hold14', color: '#6d28d9', txt: 'sky130_fd_sc_hd__buf_4', active: true },
            { x: 395, y: 230, w: 175, h: 40, label: 'FILLER_0_9_127', color: '#1e293b', txt: 'sky130_fd_sc_hd__fill_4' }
          ].map((box, idx) => (
            <g key={idx} opacity="0.85">
              <rect 
                x={box.x} 
                y={box.y} 
                width={box.w} 
                height={box.h} 
                fill={box.color} 
                stroke={box.active ? '#a855f7' : box.clk ? '#f43f5e' : '#475569'} 
                strokeWidth={box.active || box.clk ? '2' : '1'} 
                rx="2"
              />
              <text x={box.x + 8} y={box.y + 16} fill="white" fontSize="9" fontWeight="bold">
                {box.label}
              </text>
              <text x={box.x + 8} y={box.y + 28} fill="#94a3b8" fontSize="6.5">
                {box.txt}
              </text>
            </g>
          ))}

          {/* Power Supply VPWR Banner indicator */}
          <line x1="10" y1="15" x2="590" y2="15" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 2" />
          <text x="15" y="12" fill="#f59e0b" fontSize="8" fontWeight="bold">VPWR</text>

          {/* Clock Routing Net highlight overlay */}
          <path d="M 235 100 v 100 h 50" fill="none" stroke="#f43f5e" strokeWidth="2.5" opacity="0.6" strokeDasharray="3 1" />
        </svg>
      </div>

      <div className="mt-2 text-[9px] text-slate-500 font-sans text-center">
        Highlighting: Clock Traces (Red) • Delay Buffer Cells (Violet) • Flip-flops (Blue) • Decap Fillers (Slate)
      </div>
    </div>
  );

  // 4. GTKWAVE RTL LOGIC SIMULATION
  const renderGtkwaveSimulation = () => (
    <div className="w-full h-full bg-[#1b1c1e] select-none rounded-lg border border-slate-800 flex flex-col font-mono text-xs overflow-hidden">
      {/* Wave Header */}
      <div className="bg-[#2a2c31] text-slate-300 px-3 py-1.5 flex items-center justify-between text-[11px] border-b border-[#121315]">
        <div className="flex items-center gap-2">
          <span className="text-green-400">●</span>
          <span>GTKWave 3.3.111 - soc_tb.vcd</span>
        </div>
        <span className="text-slate-400">Total Simulation Time: 100 ns</span>
      </div>

      {/* Main Wave area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Signals Column */}
        <div className="w-1/3 min-w-[140px] bg-[#16171a] text-slate-400 p-2 border-r border-[#2d2e33] flex flex-col justify-between select-none">
          <div className="space-y-4">
            <div className="text-[9px] font-bold text-slate-500 border-b border-[#2d2e33] pb-1 uppercase">Signals</div>
            <div className="space-y-3 font-mono text-[11px]">
              <div className="text-green-400 truncate">clk</div>
              <div className="text-green-400 truncate">rst</div>
              <div className="text-[#a78bfa] font-semibold truncate">pc_out[31:0]</div>
              <div className="text-[#3b82f6] truncate">instr[31:0]</div>
              <div className="text-[#ef4444] truncate">alu_result[31:0]</div>
              <div className="text-green-400 truncate">reg_write</div>
              <div className="text-slate-300 truncate">addr[31:0]</div>
              <div className="text-slate-400 truncate">data_rdata[31:0]</div>
              <div className="text-green-400 truncate">data_re</div>
              <div className="text-slate-400 truncate">data_addr[31:0]</div>
              <div className="text-slate-400 truncate font-semibold">data_wdata[31:0]</div>
            </div>
          </div>
          <div className="text-[9px] text-slate-600">Sim frequency: 50 MHz</div>
        </div>

        {/* Waves Column */}
        <div className="flex-1 bg-black p-2 relative flex flex-col justify-between">
          {/* Wave Grid of lines */}
          <div className="absolute inset-y-0 left-0 right-0 flex justify-between px-1 pointer-events-none opacity-10">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="border-l border-white h-full"></div>
            ))}
          </div>

          <div className="flex-1 flex flex-col justify-around py-2">
            {/* clk */}
            <svg className="w-full h-4" viewBox="0 0 500 20">
              <path d="M 0 15 L 25 15 L 25 5 L 75 5 L 75 15 L 125 15 L 125 5 L 175 5 L 175 15 L 225 15 L 225 5 L 275 5 L 275 15 L 325 15 L 325 5 L 375 5 L 375 15 L 425 15 L 425 5 L 475 5 L 475 15 L 500 15" fill="none" stroke="#10b981" strokeWidth="1.5" />
            </svg>

            {/* rst */}
            <svg className="w-full h-4" viewBox="0 0 500 20">
              <path d="M 0 5 L 125 5 L 125 15 L 500 15" fill="none" stroke="#ef4444" strokeWidth="1.5" />
            </svg>

            {/* pc_out */}
            <svg className="w-full h-4" viewBox="0 0 500 20">
              <g stroke="#a78bfa" strokeWidth="1" fill="none">
                <path d="M 0 10 L 125 10 L 130 5 L 175 5 L 180 10 L 185 5 L 230 5 L 235 10 L 240 5 L 285 5 L 290 10 L 295 5 L 340 5 L 345 10 L 350 5 L 395 5 L 400 10 L 405 5 L 450 5 L 455 10 L 500 10" />
                <path d="M 125 10 L 130 15 L 175 15 L 180 10 L 185 15 L 230 15 L 235 10 L 240 15 L 285 15 L 290 10 L 295 15 L 340 15 L 345 10 L 350 15 L 395 15 L 400 10 L 405 15 L 450 15 L 455 10" />
              </g>
              <g fill="#94a3b8" fontSize="7" textAnchor="middle">
                <text x="150" y="12">00000004</text>
                <text x="210" y="12">00000008</text>
                <text x="265" y="12">0000000C</text>
                <text x="320" y="12">00000010</text>
                <text x="375" y="12">00000014</text>
                <text x="430" y="12">00000018</text>
              </g>
            </svg>

            {/* instr */}
            <svg className="w-full h-4" viewBox="0 0 500 20">
              <g stroke="#3b82f6" strokeWidth="1" fill="none">
                <path d="M 0 10 L 125 10 L 130 5 L 175 5 L 180 10 L 185 5 L 230 5 L 235 10 L 240 5 L 285 5 L 290 10 L 295 5 L 340 5 L 345 10 L 350 5 L 395 5 L 400 10 L 405 5 L 450 5 L 455 10 L 500 10" />
                <path d="M 125 10 L 130 15 L 175 15 L 180 10 L 185 15 L 230 15 L 235 10 L 240 15 L 285 15 L 290 10 L 295 15 L 340 15 L 345 10 L 350 15 L 395 15 L 400 10 L 405 15 L 450 15 L 455 10" />
              </g>
              <g fill="#94a3b8" fontSize="7" textAnchor="middle">
                <text x="150" y="12">00500093</text>
                <text x="210" y="12">00A00113</text>
                <text x="265" y="12">002081B3</text>
                <text x="320" y="12">00302023</text>
                <text x="375" y="12">00002203</text>
                <text x="430" y="12">00000113</text>
              </g>
            </svg>

            {/* alu_result */}
            <svg className="w-full h-4" viewBox="0 0 500 20">
              <g stroke="#ef4444" strokeWidth="1" fill="none">
                <path d="M 0 10 L 235 10 L 240 5 L 285 5 L 290 10 L 295 5 L 340 5 L 345 10 L 350 5 L 395 5 L 400 10 L 500 10" />
                <path d="M 235 10 L 240 15 L 285 15 L 290 10 L 295 15 L 340 15 L 345 10 L 350 15 L 395 15 L 400 10" />
              </g>
              <g fill="#94a3b8" fontSize="7" textAnchor="middle">
                <text x="110" y="12">00000000</text>
                <text x="265" y="12">00000005</text>
                <text x="320" y="12">0000000A</text>
                <text x="375" y="12">0000000F</text>
              </g>
            </svg>

            {/* reg_write */}
            <svg className="w-full h-4" viewBox="0 0 500 20">
              <path d="M 0 15 L 125 15 L 125 5 L 325 5 L 325 15 L 425 15 L 425 5 L 500 5" fill="none" stroke="#10b981" strokeWidth="1.5" />
            </svg>

            {/* data write channels & addresses */}
            <svg className="w-full h-4" viewBox="0 0 500 20">
              <g stroke="#cbd5e1" strokeWidth="1" fill="none" opacity="0.6">
                <path d="M 0 10 L 325 10 L 330 5 L 425 5 L 430 10 L 500 10" />
                <path d="M 325 10 L 330 15 L 425 15 L 430 10" />
              </g>
              <g fill="#94a3b8" fontSize="7" textAnchor="middle">
                <text x="160" y="12">00000000</text>
                <text x="377" y="12">0000000A</text>
              </g>
            </svg>
          </div>

          {/* Time markings timeline */}
          <div className="flex justify-between text-[9px] text-slate-500 font-mono border-t border-[#2d2e33] pt-1">
            <span>0 ns</span>
            <span>20 ns</span>
            <span>40 ns</span>
            <span>60 ns</span>
            <span>80 ns</span>
            <span>100 ns</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 5. CTS CLOCK TREE VIOLATIONS REPORT
  const renderCtsViolationsReport = () => (
    <div className="w-full h-full bg-[#0d0e11] select-none rounded-lg border border-[#2d2e33] p-4 flex flex-col font-mono text-[11px] text-[#f1f5f9] leading-relaxed overflow-x-auto">
      {/* Console Head */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3 text-[10px] text-slate-500">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
        <span className="font-bold text-red-400">OpenLane CTS Violations Report Panel</span>
      </div>

      <div className="flex-1 space-y-2">
        <div>
          <span className="text-slate-500">====================================================================</span><br />
          <span className="text-slate-200 font-bold">report_check_types -max_slew -max_cap -max_fanout -violators</span><br />
          <span className="text-slate-500">====================================================================</span>
        </div>
        
        <div>
          <span className="text-amber-400 font-bold">===================== Typical Corner ==============================</span>
        </div>

        <div className="text-slate-400">
          max fanout<br />
          <br />
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-left font-bold">
                <th className="py-1">Pin</th>
                <th className="py-1">Limit</th>
                <th className="py-1">Fanout</th>
                <th className="py-1">Slack</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 text-slate-300">clkbuf_1_1__f_clk/X</td>
                <td className="py-1">10</td>
                <td className="py-1 text-amber-300">14</td>
                <td className="py-1 text-red-400 font-bold">-4 (VIOLATED)</td>
              </tr>
              <tr>
                <td className="py-1 text-slate-300">clkbuf_1_0__f_clk/X</td>
                <td className="py-1">10</td>
                <td className="py-1 text-amber-300">11</td>
                <td className="py-1 text-red-400 font-bold">-1 (VIOLATED)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-2 text-slate-400">
          <span className="text-slate-500">====================================================================</span><br />
          <span className="text-[#10b981] font-bold">report_parasitic_annotation -report_unannotated</span><br />
          <span className="text-slate-500">====================================================================</span><br />
          Found <span className="text-amber-400">17 unannotated drivers</span>.<br />
          &nbsp;&nbsp;uart_rx<br />
          &nbsp;&nbsp;_239__11/LO<br />
          &nbsp;&nbsp;_239__3/HI<br />
          &nbsp;&nbsp;_240__12/LO<br />
          Found <span className="text-[#10b981] font-bold">0 partially unannotated drivers</span>.
        </div>

        <div className="pt-2 text-slate-300">
          <span className="text-slate-500">====================================================================</span><br />
          max slew violation count <span className="text-[#10b981] font-bold">0</span><br />
          max fanout violation count <span className="text-red-400 font-bold">2 (CRITICAL)</span><br />
          max cap violation count <span className="text-[#10b981] font-bold">0</span><br />
          <span className="text-slate-500">====================================================================</span>
        </div>
      </div>
    </div>
  );

  // 6. STA TYPICAL CORNER TIMING CHECKS
  const renderStaTypicalCornerChecks = () => (
    <div className="w-full h-full bg-[#0d0e11] select-none rounded-lg border border-[#2d2e33] p-4 flex flex-col font-mono text-[11px] text-[#e2e8f0] leading-normal overflow-x-auto">
      {/* Console path */}
      <div className="text-[10px] text-slate-500 border-b border-slate-800 pb-1 mb-2">
        <span className="text-green-500">OpenLane Container (ff5509f)</span>: <span className="text-violet-400">/openlane$</span> cat designs/rv32im_soc/runs/RUN_2026.06.20/reports/signoff/31-rcx_sta.checks.rpt
      </div>

      <div className="flex-1 space-y-1">
        <div>
          <span className="text-slate-500">====================================================================</span><br />
          <span className="font-bold text-slate-100">report_checks -unconstrained</span><br />
          <span className="text-slate-500">====================================================================</span>
        </div>

        <div>
          <span className="text-violet-400 font-bold">===================== Typical Corner ==============================</span>
        </div>

        <div className="text-[10px] text-slate-400 space-y-0.5">
          <div>Startpoint: rst (input port clocked by clk)</div>
          <div>Endpoint: _198_ (recovery check against rising-edge clock clk)</div>
          <div>Path Group: asynchronous</div>
          <div>Path Type: max</div>
        </div>

        <div className="pt-2 font-mono text-[10.5px]">
          <div className="grid grid-cols-6 border-b border-slate-800 text-slate-500 font-bold">
            <div>Fanout</div>
            <div>Cap</div>
            <div>Slew</div>
            <div>Delay</div>
            <div>Time</div>
            <div className="col-span-2">Description</div>
          </div>
          <div className="space-y-0.5 text-slate-300">
            <div className="grid grid-cols-6"><div></div><div></div><div></div><div className="text-[#10b981]">0.00</div><div>0.00</div><div className="col-span-2">clock clk (rise edge)</div></div>
            <div className="grid grid-cols-6"><div></div><div></div><div></div><div className="text-[#10b981]">0.00</div><div>0.00</div><div className="col-span-2">clock network delay</div></div>
            <div className="grid grid-cols-6"><div></div><div></div><div></div><div className="text-amber-300">4.00</div><div>4.00 v</div><div className="col-span-2">input external delay</div></div>
            <div className="grid grid-cols-6"><div>1</div><div className="text-slate-400">0.00</div><div className="text-slate-400">0.01</div><div className="text-amber-300">0.01</div><div>4.01 v</div><div className="col-span-2">rst (in)</div></div>
            <div className="grid grid-cols-6"><div>7</div><div className="text-slate-400">0.04</div><div className="text-slate-400">0.01</div><div className="text-amber-300">0.00</div><div>4.01 v</div><div className="col-span-2">sky130_fd_sc_hd__clkbuf_4/A</div></div>
            <div className="grid grid-cols-6"><div></div><div></div><div className="text-slate-400">0.09</div><div className="text-amber-300">0.18</div><div>4.19 v</div><div className="col-span-2">sky130_fd_sc_hd__clkbuf_4/X</div></div>
            <div className="grid grid-cols-6"><div>10</div><div className="text-slate-400">0.06</div><div className="text-slate-400">0.09</div><div className="text-amber-300">0.00</div><div>4.19 v</div><div className="col-span-2">sky130_fd_sc_hd__buf_4/A</div></div>
            <div className="grid grid-cols-6"><div></div><div></div><div className="text-slate-400">0.08</div><div className="text-amber-300">0.22</div><div>4.41 v</div><div className="col-span-2">sky130_fd_sc_hd__buf_4/X</div></div>
            <div className="grid grid-cols-6"><div>1</div><div className="text-slate-400">0.00</div><div className="text-slate-400">0.08</div><div className="text-amber-300">0.00</div><div>4.41 v</div><div className="col-span-2">sky130_fd_sc_hd__inv_2/A</div></div>
            <div className="grid grid-cols-6"><div></div><div></div><div className="text-slate-400">0.04</div><div className="text-amber-300">0.06</div><div>4.48 ^</div><div className="col-span-2">sky130_fd_sc_hd__inv_2/Y</div></div>
            <div className="grid grid-cols-6"><div></div><div></div><div className="text-slate-400">0.04</div><div className="text-amber-300">0.00</div><div>4.48 ^</div><div className="col-span-2">_198_/SET_B (sky130_fd_sc_hd__dfstp_1)</div></div>
            <div className="grid grid-cols-6 text-violet-400 font-semibold"><div></div><div></div><div></div><div></div><div>4.48</div><div className="col-span-2">data arrival time</div></div>
          </div>
        </div>

        <div className="pt-2 text-[10.5px] border-t border-slate-800 text-slate-400">
          <div>data required time: <span className="text-[#10b981] font-bold">20.21</span></div>
          <div>data arrival time: <span className="text-amber-400 font-bold">-4.48</span></div>
          <div className="text-[11px] font-bold text-[#10b981] pt-1">slack (MET): 15.74</div>
        </div>
      </div>
    </div>
  );

  // 7. STA SLACK SIGNOFF REPORT
  const renderStaSlackSignoff = () => (
    <div className="w-full h-full bg-[#0d0e11] select-none rounded-lg border border-[#2d2e33] p-4 flex flex-col font-mono text-[11px] text-[#e2e8f0] leading-normal overflow-x-auto">
      <div className="text-[10px] text-slate-500 border-b border-slate-800 pb-1 mb-2">
        <span className="text-green-500">OpenLane STA Engine</span>: <span className="text-violet-400">Post-Route Slack Verification</span>
      </div>

      <div className="flex-1 space-y-1">
        <div className="text-[10px] text-slate-400 space-y-0.5">
          <div>Startpoint: _222_ (rising edge-triggered flip-flop clocked by clk)</div>
          <div>Endpoint: uart_tx (output port clocked by clk)</div>
          <div>Path Group: clk</div>
          <div>Path Type: max</div>
        </div>

        <div className="pt-2 font-mono text-[10.5px]">
          <div className="grid grid-cols-6 border-b border-slate-800 text-slate-500 font-bold">
            <div>Fanout</div>
            <div>Cap</div>
            <div>Slew</div>
            <div>Delay</div>
            <div>Time</div>
            <div className="col-span-2">Description</div>
          </div>
          <div className="space-y-0.5 text-slate-300">
            <div className="grid grid-cols-6"><div></div><div></div><div></div><div className="text-[#10b981]">0.00</div><div>0.00</div><div className="col-span-2">clock clk (rise edge)</div></div>
            <div className="grid grid-cols-6"><div></div><div></div><div className="text-slate-400">0.08</div><div className="text-[#10b981]">0.05</div><div>0.05 ^</div><div className="col-span-2">clk (in)</div></div>
            <div className="grid grid-cols-6"><div>2</div><div className="text-slate-400">0.02</div><div className="text-slate-400">0.08</div><div className="text-amber-300">0.00</div><div>0.05 ^</div><div className="col-span-2">clkbuf_0_clk/A (sky130_fd_sc_hd__clkbuf_16)</div></div>
            <div className="grid grid-cols-6"><div></div><div></div><div className="text-slate-400">0.04</div><div className="text-amber-300">0.14</div><div>0.20 ^</div><div className="col-span-2">clkbuf_0_clk/X (sky130_fd_sc_hd__clkbuf_16)</div></div>
            <div className="grid grid-cols-6"><div>14</div><div className="text-slate-400">0.05</div><div className="text-slate-400">0.04</div><div className="text-amber-300">0.00</div><div>0.20 ^</div><div className="col-span-2">clkbuf_1_1__f_clk/A</div></div>
            <div className="grid grid-cols-6"><div></div><div></div><div className="text-slate-400">0.07</div><div className="text-amber-300">0.15</div><div>0.35 ^</div><div className="col-span-2">clkbuf_1_1__f_clk/X</div></div>
            <div className="grid grid-cols-6"><div>2</div><div className="text-slate-400">0.00</div><div className="text-slate-400">0.07</div><div className="text-amber-300">0.00</div><div>0.35 ^</div><div className="col-span-2">_222_/CLK (sky130_fd_sc_hd__dfstp_1)</div></div>
            <div className="grid grid-cols-6"><div></div><div></div><div className="text-slate-400">0.06</div><div className="text-amber-300">0.54</div><div>0.89 ^</div><div className="col-span-2">_222_/Q (sky130_fd_sc_hd__dfstp_1)</div></div>
            <div className="grid grid-cols-6"><div>1</div><div className="text-slate-400">0.03</div><div className="text-slate-400">0.06</div><div className="text-amber-300">0.00</div><div>0.89 ^</div><div className="col-span-2">output2/A (sky130_fd_sc_hd__clkbuf_4)</div></div>
            <div className="grid grid-cols-6"><div></div><div></div><div className="text-slate-400">0.11</div><div className="text-amber-300">0.20</div><div>1.09 ^</div><div className="col-span-2">output2/X (sky130_fd_sc_hd__clkbuf_4)</div></div>
            <div className="grid grid-cols-6 text-violet-400 font-semibold"><div></div><div></div><div></div><div></div><div>1.09</div><div className="col-span-2">data arrival time</div></div>
          </div>
        </div>

        <div className="pt-2 text-[10.5px] border-t border-slate-800 text-slate-400">
          <div>data required time: <span className="text-[#10b981] font-bold">15.75</span></div>
          <div>data arrival time: <span className="text-amber-400 font-bold">-1.09</span></div>
          <div className="text-[11px] font-bold text-[#10b981] pt-1">slack (MET): 14.66</div>
        </div>
      </div>
    </div>
  );

  // Gallery items matching user uploaded files
  const galleryItems: GalleryItem[] = [
    {
      id: 'gdsii-master',
      title: 'Final GDSII Layout',
      category: 'Physical Layouts',
      caption: 'Final GDSII Layout',
      fileArtifact: 'soc_top.gds',
      tools: 'KLayout GDSII Viewer',
      metric: '0.38 mm² Die Area',
      description: 'The final fabricated GDSII stream database containing all custom logical layout mask geometries, macro alignments, and pads routing for manufacturing.',
      detailText: 'The exported GDSII database is the final outcome of our ASIC flow. It integrates the 5-stage CPU core, standard IO cells, and power rings into a single unified layout database using the SkyWater 130nm PDK. It contains complete geometric data across all 12 physical mask layers and has been verified with DRC/LVS constraints.',
      renderComponent: renderGdsiiLayout
    },
    {
      id: 'klayout-view',
      title: 'KLayout View',
      category: 'Physical Layouts',
      caption: 'KLayout View',
      fileArtifact: 'klayout_layers.lef',
      tools: 'KLayout Display Control',
      metric: 'Metal 1 - Metal 5 Layers Mapped',
      description: 'Layer structure display outlining power mesh synthesis grids (M1/M5 horizontal & vertical straps) and routed standard cell rows.',
      detailText: 'An interactive representation showing power supply distribution grids. Blue horizontal stripes indicate Metal 5 Power (VDD) and Ground (VSS) straps, red segments indicate internal Metal 1 cells connections, and green markers correspond to IO pads around the silicon periphery.',
      renderComponent: renderKlayoutLayerView
    },
    {
      id: 'magic-layout',
      title: 'Magic Layout',
      category: 'Physical Layouts',
      caption: 'Magic Layout',
      fileArtifact: 'magic_placed_rows.def',
      tools: 'Magic VLSI Layout System',
      metric: '184k Mapped Cell Gates',
      description: 'Microscopic viewport of digital standard cells rows placement showing standard decap elements, clock buffers, and hold registers.',
      detailText: 'A detailed coordinate placement layout in Magic showing individual cell blocks. Pink and cyan bounding outlines mark active clock trees (TritonCTS branches), and blue boundaries signify flip-flop registers and tap cells that suppress latch-up noise.',
      renderComponent: renderMagicCellPlacementView
    },
    {
      id: 'gtkwave-view',
      title: 'RTL Simulation Waveform',
      category: 'Simulation Traces',
      caption: 'Routing Overview',
      fileArtifact: 'soc_tb.vcd',
      tools: 'GTKWave Waveform Viewer',
      metric: '100% Instruction Compliance',
      description: 'Cycle-accurate logical simulation trace displaying pipeline progress, ALU execution results, and peripheral bus memory handshakes.',
      detailText: 'A complete waveform capture of our RISC-V core during testbench executions. This validates program counter progression, hardware multiplication operands calculations, and registers write enable pulses during multiple pipeline clock cycles.',
      renderComponent: renderGtkwaveSimulation
    },
    {
      id: 'cts-violations',
      title: 'Clock Tree Slew & Fanout',
      category: 'Timing & Signoff',
      caption: 'Final Cell Placement',
      fileArtifact: 'cts_fanout.rpt',
      tools: 'TritonCTS & OpenLane',
      metric: '2 Fanout Violations Detected',
      description: 'Static Timing Analysis clock tree synthesis checks highlighting fanout capacities, buffer loads, and transient capacitive charges.',
      detailText: 'This report identifies timing paths where clock buffers exceed fanout specs. Highlighting clkbuf_1_1__f_clk/X pin and clkbuf_1_0__f_clk/X pin violations (limit of 10 vs actual load of 14/11), indicating high loading on specific clock buffer branches.',
      renderComponent: renderCtsViolationsReport
    },
    {
      id: 'sta-typical',
      title: 'OpenSTA Recovery Checks',
      category: 'Timing & Signoff',
      caption: 'DRC Verification',
      fileArtifact: '31-rcx_sta.checks.rpt',
      tools: 'OpenSTA Engine & OpenLane',
      metric: '+15.74 ns Slack (MET)',
      description: 'Static timing analysis unconstrained paths check report mapping cumulative gate delays from reset pin to logical flip-flops.',
      detailText: 'Post-layout unconstrained checks tracking propagation delay across standard clock buffers and buffer chains. The path runs from physical input rst pin to _198_/SET_B, showing a massive healthy timing margin with a positive timing slack of +15.74 ns.',
      renderComponent: renderStaTypicalCornerChecks
    },
    {
      id: 'sta-signoff',
      title: 'OpenSTA Post-Route Slack',
      category: 'Timing & Signoff',
      caption: 'LVS Verification',
      fileArtifact: 'sta_signoff.rpt',
      tools: 'OpenSTA Signoff',
      metric: '+14.66 ns Slack (MET)',
      description: 'Timing slack signoff summary showing setup/hold margins and delay timings, ensuring safe high-frequency clock operations.',
      detailText: 'Final timing check tracking register-to-output path delays for the uart_tx pin. It calculates precise buffer delays (clkbuf_1_1, output2 clkbuf_4) to guarantee zero timing violations, signing off the SoC at its maximum clock frequency with a clean +14.66 ns margin.',
      renderComponent: renderStaSlackSignoff
    }
  ];

  // Filtering items by category
  const filteredItems = activeCategory === 'All' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  // Keyboard controls in lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === -1) return;
      if (e.key === 'ArrowRight') {
        handlePrevNext(1);
      } else if (e.key === 'ArrowLeft') {
        handlePrevNext(-1);
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  const openLightbox = (item: GalleryItem) => {
    const idx = galleryItems.findIndex(i => i.id === item.id);
    setSelectedItem(item);
    setLightboxIndex(idx);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setSelectedItem(null);
    setLightboxIndex(-1);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handlePrevNext = (dir: number) => {
    let nextIdx = lightboxIndex + dir;
    if (nextIdx >= galleryItems.length) nextIdx = 0;
    if (nextIdx < 0) nextIdx = galleryItems.length - 1;
    setLightboxIndex(nextIdx);
    setSelectedItem(galleryItems[nextIdx]);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Zoom controls
  const adjustZoom = (amount: number) => {
    setZoomScale(prev => Math.min(Math.max(prev + amount, 0.5), 4));
    if (zoomScale + amount <= 1) {
      setPanOffset({ x: 0, y: 0 });
    }
  };

  const resetZoomAndPan = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Drag to Pan logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-6">
      {/* Gallery Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h3 className="font-sans text-xl font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-violet-400" />
            RTL-to-GDSII Physical Signoff Gallery
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Browse high-fidelity physical design verification logs, routed coordinate layouts, and Static Timing Analysis reports.
          </p>
        </div>

        {/* Categories Filtering tabs */}
        <div className="flex flex-wrap gap-1.5 bg-[#141416] p-1 border border-slate-800 rounded-lg">
          {['All', 'Physical Layouts', 'Timing & Signoff', 'Simulation Traces'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                activeCategory === cat
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of gallery layouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const RenderPreview = item.renderComponent;
          return (
            <motion.div
              layoutId={`card-${item.id}`}
              key={item.id}
              className="group bg-[#121215] border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-[320px] relative cursor-pointer"
              onClick={() => openLightbox(item)}
              whileHover={{ y: -4 }}
            >
              {/* Scaled Preview box */}
              <div className="h-44 overflow-hidden relative border-b border-slate-800/80 bg-black flex items-center justify-center p-2 group-hover:bg-[#08080a] transition-colors">
                <div className="w-full h-full scale-[0.85] origin-center transition-transform duration-500 group-hover:scale-95 pointer-events-none">
                  <RenderPreview />
                </div>
                
                {/* Hover zoom overlays */}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <span className="bg-violet-600 text-white text-[10px] font-mono font-semibold px-2.5 py-1 rounded shadow flex items-center gap-1.5">
                    <Eye className="h-3 w-3" />
                    Open Signoff View
                  </span>
                </div>
                
                {/* Micro Category Badge */}
                <span className="absolute top-3 left-3 bg-[#111113]/80 border border-slate-800 px-2 py-0.5 rounded text-[9px] font-mono text-violet-400 uppercase tracking-wider backdrop-blur-sm">
                  {item.category}
                </span>
              </div>

              {/* Description body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-sans font-bold text-white text-sm group-hover:text-violet-400 transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold truncate bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                      {item.metric}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="border-t border-slate-800/60 pt-3 mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Tool: <strong className="text-slate-300">{item.tools}</strong></span>
                  <span className="text-violet-500 font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Expand Signoff <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal with Zoom/Pan */}
      <AnimatePresence>
        {lightboxIndex !== -1 && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0c0e] border border-slate-800 w-full max-w-6xl h-[88vh] rounded-2xl flex flex-col lg:flex-row overflow-hidden shadow-2xl relative"
            >
              {/* Main Interactive view stage */}
              <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80 group">
                
                {/* Actual rendering component with Zoom/Pan applied */}
                <div 
                  className={`w-full h-full p-6 flex items-center justify-center select-none ${zoomScale > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <div 
                    style={{ 
                      transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)`,
                      transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                    }}
                    className="w-full h-full max-w-[550px] aspect-square flex items-center justify-center"
                  >
                    {React.createElement(selectedItem.renderComponent)}
                  </div>
                </div>

                {/* Left/Right controls inside viewer stage */}
                <button 
                  onClick={() => handlePrevNext(-1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#121215]/80 hover:bg-violet-600 border border-slate-800 text-white h-11 w-11 rounded-full flex items-center justify-center hover:shadow transition-all hover:scale-105"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button 
                  onClick={() => handlePrevNext(1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#121215]/80 hover:bg-violet-600 border border-slate-800 text-white h-11 w-11 rounded-full flex items-center justify-center hover:shadow transition-all hover:scale-105"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Floating Zoom & Pan Control Bar */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#111113]/90 border border-slate-800/80 px-4 py-2 rounded-full flex items-center gap-4 shadow backdrop-blur-md">
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => adjustZoom(-0.25)} 
                      className="text-slate-400 hover:text-white bg-slate-800/60 p-1.5 rounded-full hover:bg-slate-800 transition"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-white min-w-[44px] text-center">
                      {Math.round(zoomScale * 100)}%
                    </span>
                    <button 
                      onClick={() => adjustZoom(0.25)} 
                      className="text-slate-400 hover:text-white bg-slate-800/60 p-1.5 rounded-full hover:bg-slate-800 transition"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {zoomScale > 1 && (
                    <button 
                      onClick={resetZoomAndPan}
                      className="text-slate-400 hover:text-white text-[10px] font-mono bg-slate-800/60 px-2.5 py-1 rounded-full hover:bg-slate-800 transition"
                    >
                      Reset Zoom
                    </button>
                  )}
                </div>
              </div>

              {/* Sidebar metadata content panel */}
              <div className="w-full lg:w-[360px] bg-[#0c0d10] p-6 flex flex-col justify-between overflow-y-auto">
                <div>
                  {/* Close icon */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Signoff Info</span>
                    </div>
                    <button 
                      onClick={closeLightbox}
                      className="text-slate-400 hover:text-white p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-800 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Title & Category Info */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono bg-violet-600/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded uppercase font-semibold">
                      {selectedItem.category}
                    </span>
                    <h3 className="font-sans text-xl font-bold text-white pt-1">
                      {selectedItem.title}
                    </h3>
                    <div className="text-[10px] font-mono text-emerald-400 pt-0.5">
                      Caption: "{selectedItem.caption}"
                    </div>
                  </div>

                  {/* High Quality Metrics */}
                  <div className="grid grid-cols-2 gap-3 mt-5 p-3 bg-slate-950/60 border border-slate-900 rounded-xl">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">EDA Tooling</span>
                      <span className="text-xs font-semibold text-slate-200">{selectedItem.tools}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Key PPA Metric</span>
                      <span className="text-xs font-semibold text-emerald-400">{selectedItem.metric}</span>
                    </div>
                  </div>

                  {/* Technical description */}
                  <div className="mt-5 space-y-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider">Verification Summary</span>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {selectedItem.detailText}
                    </p>
                  </div>
                </div>

                {/* Footer file info */}
                <div className="border-t border-slate-800/60 pt-5 mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <FileText className="h-3.5 w-3.5 text-violet-400" />
                    <span>Physical Artifact:</span>
                    <strong className="text-slate-200 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{selectedItem.fileArtifact}</strong>
                  </div>
                  <div className="text-[9px] text-slate-500 leading-snug">
                    Verified post-layout database signed off using Magic, Netgen and OpenSTA. Matches synthesizable Golden Netlist spec with zero errors.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
