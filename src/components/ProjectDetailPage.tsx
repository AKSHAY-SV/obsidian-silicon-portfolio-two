import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectDetail } from '../types';
import { DOWNLOAD_ASSETS } from '../data';
import {
  ArrowLeft, Cpu, Layers, ShieldCheck, Microscope,
  Sliders, Activity, Image as ImageIcon, Clock, PlayCircle,
  Eye, GitBranch, Grid, Zap, Lock, Unlock, Download,
  CheckCircle, AlertTriangle, HelpCircle, RefreshCw, ZoomIn, ZoomOut, Maximize2,
  Waves, X, Move
} from 'lucide-react';

interface ProjectDetailPageProps {
  project: ProjectDetail;
  onBack: () => void;
}

// Slugs of projects that get the functional waveform accordion viewer
const FIVE_STAGE_SOC_SLUGS = new Set([
  'rv32im-soc-processor',
  'five-stage-pipeline',
  'five-stage-pipe',
  '5-stage-pipeline-riscv',
]);

const resolveAssetUrl = (url: string | undefined | null): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  
  let cleanUrl = url;
  if (cleanUrl.startsWith("/assets/projects/")) {
    cleanUrl = cleanUrl.replace("/assets/projects/", "/projects/");
  }
  
  const base = (import.meta as any).env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : base + "/";
  const normalizedUrl = cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl;
  
  return normalizedBase + normalizedUrl;
};

export default function ProjectDetailPage({ project, onBack }: ProjectDetailPageProps) {
  const slug = project.slug || project.id;

  // --- DYNAMIC ASSETS DISCOVERY STATE ---
  const [discoveredAssets, setDiscoveredAssets] = useState<Record<string, Array<{ name: string; url: string; size: string }>>>({});
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  // Selected asset states for each section
  const [selectedBlockDiagram, setSelectedBlockDiagram] = useState<string | null>(null);
  const [selectedSimulation, setSelectedSimulation] = useState<string | null>(null);
  const [selectedTiming, setSelectedTiming] = useState<string | null>(null);
  const [selectedFloorplan, setSelectedFloorplan] = useState<string | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);

  // Verification waveforms gallery state
  const [activeWaveformIndex, setActiveWaveformIndex] = useState(0);
  const [isFullscreenWaveform, setIsFullscreenWaveform] = useState(false);

  // Floorplan gallery state
  const [activeFloorplanIndex, setActiveFloorplanIndex] = useState(0);
  const [isFullscreenFloorplan, setIsFullscreenFloorplan] = useState(false);

  // Timing gallery state
  const [activeTimingIndex, setActiveTimingIndex] = useState(0);
  const [isFullscreenTiming, setIsFullscreenTiming] = useState(false);

  // GDSII gallery state
  const [activeGdsiiIndex, setActiveGdsiiIndex] = useState(0);
  const [isFullscreenGdsii, setIsFullscreenGdsii] = useState(false);

  // Block Diagram gallery state
  const [activeBlockDiagramIndex, setActiveBlockDiagramIndex] = useState(0);
  const [isFullscreenBlockDiagram, setIsFullscreenBlockDiagram] = useState(false);

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoadingAssets(true);
      try {
        let data;
        try {
          const res = await fetch(`/api/projects/assets?project=${encodeURIComponent(slug)}`);
          if (res.ok) {
            data = await res.json();
          } else {
            throw new Error(`Dynamic asset API returned status ${res.status}`);
          }
        } catch (apiErr) {
          console.warn("Dynamic assets API unavailable, falling back to static manifest...", apiErr);
          const manifestRes = await fetch(resolveAssetUrl("/projects/assets-manifest.json"));
          if (manifestRes.ok) {
            const manifest = await manifestRes.json();
            if (manifest && manifest[slug]) {
              data = {
                success: true,
                project: slug,
                assets: manifest[slug]
              };
            } else {
              throw new Error(`Project slug '${slug}' not found in static assets manifest.`);
            }
          } else {
            throw new Error(`Failed to load static assets manifest: ${manifestRes.status}`);
          }
        }

        if (data && data.success && data.assets) {
          setDiscoveredAssets(data.assets);
          
          // Auto-select first discovered file for each section if any
          const assets = data.assets;
          if (assets["block-diagram"]?.length > 0) setSelectedBlockDiagram(assets["block-diagram"][0].url);
          if (assets["simulation"]?.length > 0) setSelectedSimulation(assets["simulation"][0].url);
          if (assets["timing"]?.length > 0) setSelectedTiming(assets["timing"][0].url);
          if (assets["floorplan"]?.length > 0) setSelectedFloorplan(assets["floorplan"][0].url);
          if (assets["layout"]?.length > 0) setSelectedLayout(assets["layout"][0].url);
        }
      } catch (err) {
        console.error("Failed to discover project assets:", err);
      } finally {
        setIsLoadingAssets(false);
      }
    };
    fetchAssets();
  }, [slug]);

  // --- SECURE DOWNLOAD PERSISTENCE STATE ---
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('secure_portal_token') || null;
  });
  const [allowedProjects, setAllowedProjects] = useState<string[] | null>(() => {
    const saved = localStorage.getItem('secure_portal_allowed');
    return saved ? JSON.parse(saved) : null;
  });
  const [isValidated, setIsValidated] = useState<boolean>(() => {
    return localStorage.getItem('secure_portal_token') !== null;
  });

  const [inputToken, setInputToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [validationSuccess, setValidationSuccess] = useState(false);

  const [downloadingAssetId, setDownloadingAssetId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // --- TOKEN AUTO-CHECK ON URL MOUNT ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      handleValidateToken(urlToken);
      // Clean query parameter from URL bar to keep it secure
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const handleValidateToken = async (portalToken: string) => {
    if (!portalToken.trim()) return;
    setIsValidating(true);
    setValidationError('');
    setValidationSuccess(false);

    try {
      const response = await fetch(`/api/downloads/init?token=${encodeURIComponent(portalToken.trim())}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setValidationError(data.error || 'Invalid or expired secure portal token.');
        setIsValidated(false);
        setToken(null);
        setAllowedProjects(null);
        localStorage.removeItem('secure_portal_token');
        localStorage.removeItem('secure_portal_allowed');
        return;
      }

      setToken(portalToken.trim());
      const allowed = Array.isArray(data.allowedProjects) ? data.allowedProjects : [];
      setAllowedProjects(allowed);
      setIsValidated(true);
      setValidationSuccess(true);

      // Persist in client memory
      localStorage.setItem('secure_portal_token', portalToken.trim());
      localStorage.setItem('secure_portal_allowed', JSON.stringify(allowed));
    } catch (err: any) {
      setValidationError(err?.message || 'Error occurred during token verification.');
      setIsValidated(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDisconnectPortal = () => {
    setToken(null);
    setAllowedProjects(null);
    setIsValidated(false);
    setValidationSuccess(false);
    setInputToken('');
    localStorage.removeItem('secure_portal_token');
    localStorage.removeItem('secure_portal_allowed');
  };

  // Resolve matching restricted asset for this project
  const getProjectAsset = () => {
    const mapping: Record<string, string> = {
      'rv32im-soc-processor': 'rv32im-rtl-src',
      '5-stage-pipeline-riscv': 'rv32im-floorplan-def',
      'uart': 'uart-rtl-src',
      'cache-memory': 'cache-rtl-src',
      '8-bit-cpu': '8-bit-cpu-rtl-src'
    };
    const assetId = mapping[project.id] || mapping[slug];
    if (!assetId) return null;
    return DOWNLOAD_ASSETS.find(a => a.id === assetId) || null;
  };

  const activeAsset = getProjectAsset();

  const handleDownloadAsset = async (assetId: string) => {
    if (!token) return;
    setDownloadingAssetId(assetId);
    setDownloadError(null);

    try {
      const response = await fetch('/api/downloads/request-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, projectId: assetId })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to authorize secure download.');
      }

      if (data.downloadUrl) {
        // Trigger download
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('No download path returned by server.');
      }
    } catch (err: any) {
      setDownloadError(err?.message || 'Authorization failed. Token might be expired or restricted.');
    } finally {
      setDownloadingAssetId(null);
    }
  };

  // Check if activeAsset is authorized under this session
  const isAssetAuthorized = () => {
    if (!isValidated || !allowedProjects) return false;
    if (allowedProjects.length === 0) return true; // Empty means all
    return activeAsset ? allowedProjects.includes(activeAsset.id) : false;
  };

  const simulationWaveforms = discoveredAssets["simulation"] || [];

  const floorplanAssets = discoveredAssets["floorplan"] || [];
  const timingAssets = discoveredAssets["timing"] || [];
  const gdsiiAssets = discoveredAssets["gdsii"] || discoveredAssets["gds"] || [];

  const blockDiagramAssetsRaw = discoveredAssets["block-diagram"] || [];
  const blockDiagramImages = blockDiagramAssetsRaw.length > 0
    ? blockDiagramAssetsRaw
    : [{
        name: "Microarchitectural Block Diagram",
        url: selectedBlockDiagram || (project.diagram && (/^(https?:)?\/\//.test(project.diagram) || project.diagram?.startsWith('/')) ? project.diagram : `/projects/${slug}/block-diagram.png`),
        size: "N/A"
      }];

  const formatCaption = (filename: string, defaultSuffix: string): string => {
    if (!filename) return "";
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    const abbreviations: Record<string, string> = {
      "apb": "APB",
      "cpu": "CPU",
      "uart": "UART",
      "gpio": "GPIO",
      "plic": "PLIC",
      "spi": "SPI",
      "sram": "SRAM",
      "soc": "SoC",
      "gds": "GDS",
      "gdsii": "GDSII"
    };

    const words = nameWithoutExt.split(/[-_]/).map(word => {
      const lower = word.toLowerCase();
      if (abbreviations[lower]) {
        return abbreviations[lower];
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    });

    return `${words.join(" ")} ${defaultSuffix}`;
  };

  const getCaptionFromFilename = (filename: string): string => {
    if (!filename) return "";
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    const abbreviations: Record<string, string> = {
      "apb": "APB",
      "cpu": "CPU",
      "uart": "UART",
      "gpio": "GPIO",
      "plic": "PLIC",
      "spi": "SPI",
      "sram": "SRAM",
      "soc": "SoC"
    };

    const words = nameWithoutExt.split("-").map(word => {
      const lower = word.toLowerCase();
      if (abbreviations[lower]) {
        return abbreviations[lower];
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    });

    return `${words.join(" ")} Functional Verification`;
  };

  return (
    <div className="w-full min-h-screen bg-[#070709] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" id="project-detail-container">
      {/* Structural silicon grid decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(167,139,250,0.005)_1px,transparent_1px),linear-gradient(to_bottom,rgba(167,139,250,0.005)_1px,transparent_1px)] bg-[size:3rem_3rem] z-0 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-[#a78bfa]/[0.015] rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="mx-auto max-w-5xl relative z-10 space-y-12">
        {/* Navigation back button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <button
            onClick={onBack}
            data-testid="btn-back-to-projects"
            className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-900 bg-slate-950/50 hover:bg-[#a78bfa]/5 hover:border-[#a78bfa]/25 font-mono text-xs uppercase tracking-widest text-[#a78bfa] transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            // BACK_TO_PORTFOLIO
          </button>
        </motion.div>

        {/* Hero Board */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[#0a0a0f] p-6 sm:p-10 relative overflow-hidden shadow-2xl"
          id="project-hero"
        >
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#a78bfa]/30 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded px-2.5 py-0.5 bg-[#a78bfa]/10 border border-[#a78bfa]/20 font-mono text-[10px] font-bold text-[#a78bfa] uppercase tracking-wider">
                <Cpu className="h-3 w-3 animate-pulse" />
                {project.category}
              </div>

              <h1 data-testid="project-title" className="font-sans text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-none">
                {project.name}
              </h1>

              <p className="font-mono text-xs sm:text-sm text-[#a78bfa]/70 uppercase font-semibold tracking-wider">
                {project.tagline}
              </p>

              <p className="font-sans text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded bg-[#0d0d12] border border-[rgba(255,255,255,0.05)] px-3 py-1 font-mono text-[10px] text-slate-400 shadow-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Core Metrics Summary */}
            <div className="md:col-span-4 rounded-xl bg-[#040406]/90 border border-slate-900 p-5 space-y-4 font-mono text-xs shadow-inner">
              <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-[rgba(255,255,255,0.05)] pb-2">
                // SYSTEM CORE METRICS
              </span>
              <div className="space-y-3">
                {project.metrics.map((metric, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center pb-2 border-b border-[rgba(255,255,255,0.03)] last:border-0 last:pb-0"
                  >
                    <span className="text-slate-400">{metric.label}:</span>
                    <span className="text-[#a78bfa] font-black text-right">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Modules Stack */}
        <div className="space-y-10">
          
          {/* Section 01: Overview, Objectives, Features */}
          <Section index="01" title="Overview & Objectives" icon={<Sliders className="h-4 w-4" />}>
            <div className="space-y-6">
              <p className="font-sans text-sm text-slate-300 leading-relaxed">{project.overview}</p>
              
              {/* Split Columns: Design Objectives & Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Design Objectives */}
                <div className="rounded-lg bg-[#040406]/50 border border-[rgba(255,255,255,0.03)] p-5 space-y-3">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#a78bfa] border-b border-[rgba(255,255,255,0.05)] pb-1.5 flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    Design Objectives
                  </h4>
                  <ul className="space-y-2 font-sans text-xs text-slate-400 list-none pl-0">
                    {project.designObjectives ? (
                      project.designObjectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa] mt-1.5 shrink-0" />
                          <span>{obj}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa] mt-1.5 shrink-0" />
                          <span>Implement parameterizable pipeline registers matching target clock boundaries.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa] mt-1.5 shrink-0" />
                          <span>Establish synthesizable logic models matching designated specifications.</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Key Features */}
                <div className="rounded-lg bg-[#040406]/50 border border-[rgba(255,255,255,0.03)] p-5 space-y-3">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#a78bfa] border-b border-[rgba(255,255,255,0.05)] pb-1.5 flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    Key Architecture Features
                  </h4>
                  <ul className="space-y-2 font-sans text-xs text-slate-400 list-none pl-0">
                    {project.features ? (
                      project.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa] mt-1.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start gap-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa] mt-1.5 shrink-0" />
                          <span>Synchronous reset register file cells.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa] mt-1.5 shrink-0" />
                          <span>AMBA bus slave protocols compatibility.</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </Section>

          {/* Section 02: Architecture Specifications */}
          <Section index="02" title="Architecture Specifications" icon={<Layers className="h-4 w-4" />}>
            <div className="space-y-4">
              {(project.id === 'rv32im-soc-processor' || project.id === '5-stage-pipeline-riscv') ? (
                <>
                  <p className="font-sans text-sm text-slate-300 leading-relaxed">
                    The proposed System-on-Chip (SoC) is built around a 32-bit RV32IM 5-stage pipelined RISC-V processor developed entirely in Verilog HDL. The processor interfaces with Instruction Memory, Data Memory, an AXI Address Decoder, and an APB Interconnect. The APB subsystem provides memory-mapped communication with GPIO, UART, SPI, Timer, and PLIC peripherals, resulting in a modular and scalable SoC architecture that has been functionally verified through RTL simulation and successfully implemented through the complete RTL-to-GDSII physical design flow.
                  </p>
                  
                  {/* Microarchitectural Design Overview card */}
                  <div className="rounded-lg border border-[rgba(255,255,255,0.04)] bg-[#040406]/40 p-4 font-mono text-[11px] text-slate-400 space-y-2">
                    <span className="text-[#a78bfa] block font-bold">// MICROARCHITECTURAL DESIGN OVERVIEW</span>
                    <p className="font-sans text-xs text-slate-300 leading-relaxed">
                      The processor implements a classic 5-stage pipeline consisting of Instruction Fetch (IF), Instruction Decode (ID), Execute (EX), Memory Access (MEM), and Write Back (WB) stages. Pipeline efficiency is improved using dedicated pipeline registers, data forwarding, hazard detection, branch flushing, and a write-before-read register file. Memory transactions are routed through the AXI Address Decoder, while peripheral accesses are managed through the APB Interconnect, enabling efficient communication with all integrated peripherals.
                    </p>
                  </div>

                  {/* Three compact specification cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1 */}
                    <div className="rounded-lg border border-[rgba(255,255,255,0.04)] bg-[#040406]/40 p-4 font-mono text-[11px] text-slate-400 space-y-2">
                      <span className="text-[#a78bfa] block font-bold">// PROCESSOR</span>
                      <div className="space-y-1 text-slate-300 font-sans text-xs">
                        <p>• Architecture: RV32IM</p>
                        <p>• Data Width: 32-bit</p>
                        <p>• Pipeline: 5 Stages (IF, ID, EX, MEM, WB)</p>
                        <p>• Language: Verilog HDL</p>
                        <p className="pt-1 font-bold text-[10px] text-slate-400 font-mono">// FEATURES</p>
                        <div className="pl-3 text-slate-400 text-[11px] space-y-0.5">
                          <p>- Data Forwarding</p>
                          <p>- Hazard Detection</p>
                          <p>- Branch Flushing</p>
                          <p>- MAC Accelerator</p>
                        </div>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="rounded-lg border border-[rgba(255,255,255,0.04)] bg-[#040406]/40 p-4 font-mono text-[11px] text-slate-400 space-y-2">
                      <span className="text-[#a78bfa] block font-bold">// MEMORY SYSTEM</span>
                      <div className="space-y-1 text-slate-300 font-sans text-xs">
                        <p>• Instruction ROM</p>
                        <p>• Data RAM</p>
                        <p>• AXI Address Decoder</p>
                        <p>• Memory-Mapped Architecture</p>
                        <p>• Instruction &amp; Data Separation</p>
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div className="rounded-lg border border-[rgba(255,255,255,0.04)] bg-[#040406]/40 p-4 font-mono text-[11px] text-slate-400 space-y-2">
                      <span className="text-[#a78bfa] block font-bold">// PERIPHERAL SUBSYSTEM</span>
                      <div className="space-y-1 text-slate-300 font-sans text-xs">
                        <p>• APB Interconnect</p>
                        <p>• GPIO</p>
                        <p>• UART</p>
                        <p>• SPI</p>
                        <p>• Timer</p>
                        <p>• Platform-Level Interrupt Controller (PLIC)</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-sans text-sm text-slate-300 leading-relaxed">{project.architecture}</p>
                  
                  {/* Structural microarchitecture details */}
                  <div className="rounded-lg border border-[rgba(255,255,255,0.04)] bg-[#040406]/40 p-4 font-mono text-[11px] text-slate-400 space-y-2">
                    <span className="text-[#a78bfa] block font-bold">// MICROARCHITECTURAL LOGIC DECLARATION</span>
                    <p className="font-sans text-xs leading-relaxed">
                      The design executes strictly isolated register stages mapped to logical entities. Under concurrent read access profiles, a prioritized internal bypass routing module establishes forward connections directly from downstream write buffer cells to input ports, avoiding timing degradation.
                    </p>
                  </div>
                </>
              )}
            </div>
          </Section>

          {/* Section 03: Structural Block Diagram */}
          <Section index="03" title="Structural Block Diagram" icon={<GitBranch className="h-4 w-4" />}>
            <div className="space-y-4">
              <p className="font-sans text-xs text-slate-400 leading-relaxed">
                Multi-bus microarchitectural floorplan block detailing synchronous registers, logical units, memory access points, and control signals distribution routing paths.
              </p>

              {/* Dynamic asset picker */}
              {discoveredAssets["block-diagram"] && discoveredAssets["block-diagram"].length > 0 && (
                <div className="p-3 bg-[#a78bfa]/5 border border-[#a78bfa]/10 rounded-lg flex flex-col gap-1.5 font-mono text-[10px]">
                  <span className="text-[#a78bfa] uppercase tracking-wider font-bold">// DISCOVERED BLOCK DIAGRAMS ({discoveredAssets["block-diagram"].length}):</span>
                  <div className="flex flex-wrap gap-2">
                    {discoveredAssets["block-diagram"].map((file, idx) => (
                      <button
                        key={file.name}
                        onClick={() => {
                          setSelectedBlockDiagram(file.url);
                          setActiveBlockDiagramIndex(idx);
                        }}
                        className={`px-2 py-0.5 rounded border text-left transition-all flex items-center gap-1.5 cursor-pointer ${selectedBlockDiagram === file.url ? 'bg-[#a78bfa]/20 border-[#a78bfa]/40 text-white font-bold' : 'bg-[#040406]/60 border-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        <ImageIcon className="h-3 w-3" />
                        <span>{file.name}</span>
                        <span className="text-slate-600 font-bold">({file.size})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <EngineeringViewer
                src={selectedBlockDiagram || (project.diagram && (/^(https?:)?\/\//.test(project.diagram) || project.diagram?.startsWith('/')) ? project.diagram : `/projects/${slug}/block-diagram.png`)}
                alt={`${project.name} — Block Diagram`}
                fallbackType="block"
                projectId={project.id}
                onEnlarge={() => setIsFullscreenBlockDiagram(true)}
              />
            </div>
          </Section>

          {/* Section 04: Simulation Outputs & Waveforms */}
          <Section index="04" title="Simulation Outputs &amp; Waveforms" icon={<PlayCircle className="h-4 w-4" />}>
            <div className="space-y-6">
              <p className="font-sans text-sm text-slate-300 leading-relaxed">
                Hardware-level timing trace outputs and logic verification waveforms captured during simulation cycles of SoC sub-modules. Click any waveform to enter fullscreen inspection mode.
              </p>

              {simulationWaveforms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 rounded-xl border border-dashed border-slate-800 bg-[#040406]/30 text-center space-y-3">
                  <Waves className="h-8 w-8 text-slate-600 animate-pulse" />
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
                    No Functional Verification uploaded.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Large Preview Container */}
                  <div className="relative group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#040406]/90 overflow-hidden flex flex-col">
                    {/* Header Bar */}
                    <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.04)] bg-[#08080c] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                          Active Trace: {simulationWaveforms[activeWaveformIndex]?.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">
                        [{activeWaveformIndex + 1} / {simulationWaveforms.length}] • {simulationWaveforms[activeWaveformIndex]?.size}
                      </span>
                    </div>

                    {/* Image Area */}
                    <div className="relative min-h-[320px] sm:min-h-[420px] max-h-[500px] flex items-center justify-center p-6 bg-[#020204]">
                      {/* Left cycling arrow */}
                      <button
                        onClick={() => setActiveWaveformIndex(prev => (prev - 1 + simulationWaveforms.length) % simulationWaveforms.length)}
                        className="absolute left-4 z-10 p-2.5 rounded-full border border-slate-800 bg-black/60 text-slate-400 hover:text-white hover:border-[#a78bfa]/50 hover:bg-[#a78bfa]/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Previous Waveform"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>

                      {/* Display Image */}
                      <div
                        onClick={() => setIsFullscreenWaveform(true)}
                        className="w-full h-full flex items-center justify-center cursor-zoom-in relative max-h-[380px] sm:max-h-[400px]"
                      >
                        <img
                          src={resolveAssetUrl(simulationWaveforms[activeWaveformIndex]?.url)}
                          alt={getCaptionFromFilename(simulationWaveforms[activeWaveformIndex]?.name)}
                          referrerPolicy="no-referrer"
                          className="max-w-full max-h-full object-contain hover:scale-[1.01] transition-transform duration-300"
                        />
                        
                        {/* Hover Overlay Zoom Prompt */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <div className="px-3.5 py-2 rounded-lg bg-black/80 border border-slate-800 text-white font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-xl">
                            <Maximize2 className="h-3 w-3 text-[#a78bfa]" />
                            <span>Click to Enlarge</span>
                          </div>
                        </div>
                      </div>

                      {/* Right cycling arrow */}
                      <button
                        onClick={() => setActiveWaveformIndex(prev => (prev + 1) % simulationWaveforms.length)}
                        className="absolute right-4 z-10 p-2.5 rounded-full border border-slate-800 bg-black/60 text-slate-400 hover:text-white hover:border-[#a78bfa]/50 hover:bg-[#a78bfa]/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Next Waveform"
                      >
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </button>
                    </div>

                    {/* Footer Caption */}
                    <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.04)] bg-[#08080c] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#a78bfa] block">
                          // Capture Legend
                        </span>
                        <h4 className="font-sans text-sm sm:text-base font-black text-white uppercase tracking-wide">
                          {getCaptionFromFilename(simulationWaveforms[activeWaveformIndex]?.name)}
                        </h4>
                      </div>
                      <button
                        onClick={() => setIsFullscreenWaveform(true)}
                        className="font-mono text-[10px] uppercase tracking-wider text-[#a78bfa] hover:text-white border border-[#a78bfa]/20 hover:border-[#a78bfa]/65 bg-[#a78bfa]/5 hover:bg-[#a78bfa]/15 rounded-lg px-4 py-2 transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                      >
                        <Maximize2 className="h-3 w-3" />
                        <span>Enlarge Capture</span>
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Selector Grid */}
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      // Dynamic Waveform Gallery ({simulationWaveforms.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {simulationWaveforms.map((file, idx) => {
                        const isActive = idx === activeWaveformIndex;
                        return (
                          <button
                            key={file.name}
                            onClick={() => setActiveWaveformIndex(idx)}
                            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-2 cursor-pointer group hover:bg-[#0c0c12] ${isActive ? 'bg-[#0c0c12] border-[#a78bfa]/50 shadow-lg shadow-[#a78bfa]/5' : 'bg-[#040406]/60 border-slate-900 hover:border-slate-700'}`}
                          >
                            {/* Tiny Image Thumbnail */}
                            <div className="w-full h-16 rounded bg-black flex items-center justify-center overflow-hidden border border-[rgba(255,255,255,0.02)]">
                              <img
                                src={resolveAssetUrl(file.url)}
                                alt={getCaptionFromFilename(file.name)}
                                referrerPolicy="no-referrer"
                                className="max-w-full max-h-full object-contain opacity-50 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                            <div className="space-y-0.5 truncate w-full">
                              <span className={`font-sans text-[10px] font-bold tracking-wide block truncate transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                {getCaptionFromFilename(file.name).replace(" Functional Verification", "")}
                              </span>
                              <span className="font-mono text-[9px] text-slate-600 block">
                                {file.size}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Section 05: Timing Reports & Analysis */}
          <Section index="05" title="Timing Reports &amp; Analysis" icon={<Clock className="h-4 w-4" />}>
            <div className="space-y-6">
              <p className="font-sans text-sm text-slate-300 leading-relaxed">
                Static timing analysis reports indicating setup and hold Slack, critical paths, and frequency parameters.
              </p>

              {timingAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 rounded-xl border border-dashed border-slate-800 bg-[#040406]/30 text-center space-y-3">
                  <Clock className="h-8 w-8 text-slate-600 animate-pulse" />
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
                    No Timing Analysis uploaded.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Large Preview Container */}
                  <div className="relative group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#040406]/90 overflow-hidden flex flex-col">
                    {/* Header Bar */}
                    <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.04)] bg-[#08080c] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                          Active Report: {timingAssets[activeTimingIndex]?.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">
                        [{activeTimingIndex + 1} / {timingAssets.length}] • {timingAssets[activeTimingIndex]?.size}
                      </span>
                    </div>

                    {/* Image Area */}
                    <div className="relative min-h-[320px] sm:min-h-[420px] max-h-[500px] flex items-center justify-center p-6 bg-[#020204]">
                      {/* Left cycling arrow */}
                      {timingAssets.length > 1 && (
                        <button
                          onClick={() => setActiveTimingIndex(prev => (prev - 1 + timingAssets.length) % timingAssets.length)}
                          className="absolute left-4 z-10 p-2.5 rounded-full border border-slate-800 bg-black/60 text-slate-400 hover:text-white hover:border-[#a78bfa]/50 hover:bg-[#a78bfa]/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Previous Timing Report"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                      )}

                      {/* Display Image */}
                      <div
                        onClick={() => setIsFullscreenTiming(true)}
                        className="w-full h-full flex items-center justify-center cursor-zoom-in relative max-h-[380px] sm:max-h-[400px]"
                      >
                        <img
                          src={resolveAssetUrl(timingAssets[activeTimingIndex]?.url)}
                          alt={formatCaption(timingAssets[activeTimingIndex]?.name, "Timing Report")}
                          referrerPolicy="no-referrer"
                          className="max-w-full max-h-full object-contain hover:scale-[1.01] transition-transform duration-300"
                        />
                        
                        {/* Hover Overlay Zoom Prompt */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <div className="px-3.5 py-2 rounded-lg bg-black/80 border border-slate-800 text-white font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-xl">
                            <Maximize2 className="h-3 w-3 text-[#a78bfa]" />
                            <span>Click to Enlarge</span>
                          </div>
                        </div>
                      </div>

                      {/* Right cycling arrow */}
                      {timingAssets.length > 1 && (
                        <button
                          onClick={() => setActiveTimingIndex(prev => (prev + 1) % timingAssets.length)}
                          className="absolute right-4 z-10 p-2.5 rounded-full border border-slate-800 bg-black/60 text-slate-400 hover:text-white hover:border-[#a78bfa]/50 hover:bg-[#a78bfa]/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Next Timing Report"
                        >
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </button>
                      )}
                    </div>

                    {/* Footer Caption */}
                    <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.04)] bg-[#08080c] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#a78bfa] block">
                          // Timing Analysis
                        </span>
                        <h4 className="font-sans text-sm sm:text-base font-black text-white uppercase tracking-wide">
                          {formatCaption(timingAssets[activeTimingIndex]?.name, "Timing Report")}
                        </h4>
                      </div>
                      <button
                        onClick={() => setIsFullscreenTiming(true)}
                        className="font-mono text-[10px] uppercase tracking-wider text-[#a78bfa] hover:text-white border border-[#a78bfa]/20 hover:border-[#a78bfa]/65 bg-[#a78bfa]/5 hover:bg-[#a78bfa]/15 rounded-lg px-4 py-2 transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                      >
                        <Maximize2 className="h-3 w-3" />
                        <span>Enlarge Capture</span>
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Selector Grid */}
                  {timingAssets.length > 1 && (
                    <div className="space-y-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        // Timing Reports Gallery ({timingAssets.length})
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {timingAssets.map((file, idx) => {
                          const isActive = idx === activeTimingIndex;
                          return (
                            <button
                              key={file.name}
                              onClick={() => setActiveTimingIndex(idx)}
                              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-2 cursor-pointer group hover:bg-[#0c0c12] ${isActive ? 'bg-[#0c0c12] border-[#a78bfa]/50 shadow-lg shadow-[#a78bfa]/5' : 'bg-[#040406]/60 border-slate-900 hover:border-slate-700'}`}
                            >
                              {/* Tiny Image Thumbnail */}
                              <div className="w-full h-16 rounded bg-black flex items-center justify-center overflow-hidden border border-[rgba(255,255,255,0.02)]">
                                <img
                                  src={resolveAssetUrl(file.url)}
                                  alt={formatCaption(file.name, "Timing Report")}
                                  referrerPolicy="no-referrer"
                                  className="max-w-full max-h-full object-contain opacity-50 group-hover:opacity-100 transition-opacity"
                                />
                              </div>
                              <div className="space-y-0.5 truncate w-full">
                                <span className={`font-sans text-[10px] font-bold tracking-wide block truncate transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                  {formatCaption(file.name, "").trim()}
                                </span>
                                <span className="font-mono text-[9px] text-slate-600 block">
                                  {file.size}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* Section 06: Floorplan & Physical Design */}
          <Section index="06" title="Floorplan &amp; Physical Design" icon={<Grid className="h-4 w-4" />}>
            <div className="space-y-6">
              <p className="font-sans text-sm text-slate-300 leading-relaxed">
                Physical floorplan designs showing core placement boundaries, SRAM macros, standard cell areas, and power grid planning.
              </p>

              {floorplanAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 rounded-xl border border-dashed border-slate-800 bg-[#040406]/30 text-center space-y-3">
                  <Grid className="h-8 w-8 text-slate-600 animate-pulse" />
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
                    No Floorplan uploaded.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Large Preview Container */}
                  <div className="relative group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#040406]/90 overflow-hidden flex flex-col">
                    {/* Header Bar */}
                    <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.04)] bg-[#08080c] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                          Active Floorplan: {floorplanAssets[activeFloorplanIndex]?.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">
                        [{activeFloorplanIndex + 1} / {floorplanAssets.length}] • {floorplanAssets[activeFloorplanIndex]?.size}
                      </span>
                    </div>

                    {/* Image Area */}
                    <div className="relative min-h-[320px] sm:min-h-[420px] max-h-[500px] flex items-center justify-center p-6 bg-[#020204]">
                      {/* Left cycling arrow */}
                      {floorplanAssets.length > 1 && (
                        <button
                          onClick={() => setActiveFloorplanIndex(prev => (prev - 1 + floorplanAssets.length) % floorplanAssets.length)}
                          className="absolute left-4 z-10 p-2.5 rounded-full border border-slate-800 bg-black/60 text-slate-400 hover:text-white hover:border-[#a78bfa]/50 hover:bg-[#a78bfa]/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Previous Floorplan"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                      )}

                      {/* Display Image */}
                      <div
                        onClick={() => setIsFullscreenFloorplan(true)}
                        className="w-full h-full flex items-center justify-center cursor-zoom-in relative max-h-[380px] sm:max-h-[400px]"
                      >
                        <img
                          src={resolveAssetUrl(floorplanAssets[activeFloorplanIndex]?.url)}
                          alt={formatCaption(floorplanAssets[activeFloorplanIndex]?.name, "Physical Floorplan")}
                          referrerPolicy="no-referrer"
                          className="max-w-full max-h-full object-contain hover:scale-[1.01] transition-transform duration-300"
                        />
                        
                        {/* Hover Overlay Zoom Prompt */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <div className="px-3.5 py-2 rounded-lg bg-black/80 border border-slate-800 text-white font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-xl">
                            <Maximize2 className="h-3 w-3 text-[#a78bfa]" />
                            <span>Click to Enlarge</span>
                          </div>
                        </div>
                      </div>

                      {/* Right cycling arrow */}
                      {floorplanAssets.length > 1 && (
                        <button
                          onClick={() => setActiveFloorplanIndex(prev => (prev + 1) % floorplanAssets.length)}
                          className="absolute right-4 z-10 p-2.5 rounded-full border border-slate-800 bg-black/60 text-slate-400 hover:text-white hover:border-[#a78bfa]/50 hover:bg-[#a78bfa]/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Next Floorplan"
                        >
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </button>
                      )}
                    </div>

                    {/* Footer Caption */}
                    <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.04)] bg-[#08080c] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#a78bfa] block">
                          // Floorplan &amp; Physical Design
                        </span>
                        <h4 className="font-sans text-sm sm:text-base font-black text-white uppercase tracking-wide">
                          {formatCaption(floorplanAssets[activeFloorplanIndex]?.name, "Physical Floorplan")}
                        </h4>
                      </div>
                      <button
                        onClick={() => setIsFullscreenFloorplan(true)}
                        className="font-mono text-[10px] uppercase tracking-wider text-[#a78bfa] hover:text-white border border-[#a78bfa]/20 hover:border-[#a78bfa]/65 bg-[#a78bfa]/5 hover:bg-[#a78bfa]/15 rounded-lg px-4 py-2 transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                      >
                        <Maximize2 className="h-3 w-3" />
                        <span>Enlarge Capture</span>
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Selector Grid */}
                  {floorplanAssets.length > 1 && (
                    <div className="space-y-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        // Floorplan Gallery ({floorplanAssets.length})
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {floorplanAssets.map((file, idx) => {
                          const isActive = idx === activeFloorplanIndex;
                          return (
                            <button
                              key={file.name}
                              onClick={() => setActiveFloorplanIndex(idx)}
                              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-2 cursor-pointer group hover:bg-[#0c0c12] ${isActive ? 'bg-[#0c0c12] border-[#a78bfa]/50 shadow-lg shadow-[#a78bfa]/5' : 'bg-[#040406]/60 border-slate-900 hover:border-slate-700'}`}
                            >
                              {/* Tiny Image Thumbnail */}
                              <div className="w-full h-16 rounded bg-black flex items-center justify-center overflow-hidden border border-[rgba(255,255,255,0.02)]">
                                <img
                                  src={resolveAssetUrl(file.url)}
                                  alt={formatCaption(file.name, "Physical Floorplan")}
                                  referrerPolicy="no-referrer"
                                  className="max-w-full max-h-full object-contain opacity-50 group-hover:opacity-100 transition-opacity"
                                />
                              </div>
                              <div className="space-y-0.5 truncate w-full">
                                <span className={`font-sans text-[10px] font-bold tracking-wide block truncate transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                  {formatCaption(file.name, "").trim()}
                                </span>
                                <span className="font-mono text-[9px] text-slate-600 block">
                                  {file.size}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* Section 07: Layout & GDSII Mask */}
          <Section index="07" title="Layout &amp; GDSII Mask" icon={<Activity className="h-4 w-4" />}>
            <div className="space-y-6">
              <p className="font-sans text-sm text-slate-300 leading-relaxed">
                Silicon boundary physical layouts mapping poly-gates, diffusion areas, multi-layer metal grids, and contact vias.
              </p>

              {gdsiiAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 rounded-xl border border-dashed border-slate-800 bg-[#040406]/30 text-center space-y-3">
                  <Activity className="h-8 w-8 text-slate-600 animate-pulse" />
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
                    No GDSII uploaded.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Large Preview Container */}
                  <div className="relative group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#040406]/90 overflow-hidden flex flex-col">
                    {/* Header Bar */}
                    <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.04)] bg-[#08080c] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                          Active Layout: {gdsiiAssets[activeGdsiiIndex]?.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">
                        [{activeGdsiiIndex + 1} / {gdsiiAssets.length}] • {gdsiiAssets[activeGdsiiIndex]?.size}
                      </span>
                    </div>

                    {/* Image Area */}
                    <div className="relative min-h-[320px] sm:min-h-[420px] max-h-[500px] flex items-center justify-center p-6 bg-[#020204]">
                      {/* Left cycling arrow */}
                      {gdsiiAssets.length > 1 && (
                        <button
                          onClick={() => setActiveGdsiiIndex(prev => (prev - 1 + gdsiiAssets.length) % gdsiiAssets.length)}
                          className="absolute left-4 z-10 p-2.5 rounded-full border border-slate-800 bg-black/60 text-slate-400 hover:text-white hover:border-[#a78bfa]/50 hover:bg-[#a78bfa]/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Previous Layout"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                      )}

                      {/* Display Image */}
                      <div
                        onClick={() => setIsFullscreenGdsii(true)}
                        className="w-full h-full flex items-center justify-center cursor-zoom-in relative max-h-[380px] sm:max-h-[400px]"
                      >
                        <img
                          src={resolveAssetUrl(gdsiiAssets[activeGdsiiIndex]?.url)}
                          alt={formatCaption(gdsiiAssets[activeGdsiiIndex]?.name, "GDSII Mask Layout")}
                          referrerPolicy="no-referrer"
                          className="max-w-full max-h-full object-contain hover:scale-[1.01] transition-transform duration-300"
                        />
                        
                        {/* Hover Overlay Zoom Prompt */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <div className="px-3.5 py-2 rounded-lg bg-black/80 border border-slate-800 text-white font-mono text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-xl">
                            <Maximize2 className="h-3 w-3 text-[#a78bfa]" />
                            <span>Click to Enlarge</span>
                          </div>
                        </div>
                      </div>

                      {/* Right cycling arrow */}
                      {gdsiiAssets.length > 1 && (
                        <button
                          onClick={() => setActiveGdsiiIndex(prev => (prev + 1) % gdsiiAssets.length)}
                          className="absolute right-4 z-10 p-2.5 rounded-full border border-slate-800 bg-black/60 text-slate-400 hover:text-white hover:border-[#a78bfa]/50 hover:bg-[#a78bfa]/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Next Layout"
                        >
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </button>
                      )}
                    </div>

                    {/* Footer Caption */}
                    <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.04)] bg-[#08080c] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#a78bfa] block">
                          // Layout &amp; GDSII Mask
                        </span>
                        <h4 className="font-sans text-sm sm:text-base font-black text-white uppercase tracking-wide">
                          {formatCaption(gdsiiAssets[activeGdsiiIndex]?.name, "GDSII Mask Layout")}
                        </h4>
                      </div>
                      <button
                        onClick={() => setIsFullscreenGdsii(true)}
                        className="font-mono text-[10px] uppercase tracking-wider text-[#a78bfa] hover:text-white border border-[#a78bfa]/20 hover:border-[#a78bfa]/65 bg-[#a78bfa]/5 hover:bg-[#a78bfa]/15 rounded-lg px-4 py-2 transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                      >
                        <Maximize2 className="h-3 w-3" />
                        <span>Enlarge Capture</span>
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Selector Grid */}
                  {gdsiiAssets.length > 1 && (
                    <div className="space-y-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        // Layout Gallery ({gdsiiAssets.length})
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {gdsiiAssets.map((file, idx) => {
                          const isActive = idx === activeGdsiiIndex;
                          return (
                            <button
                              key={file.name}
                              onClick={() => setActiveGdsiiIndex(idx)}
                              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-2 cursor-pointer group hover:bg-[#0c0c12] ${isActive ? 'bg-[#0c0c12] border-[#a78bfa]/50 shadow-lg shadow-[#a78bfa]/5' : 'bg-[#040406]/60 border-slate-900 hover:border-slate-700'}`}
                            >
                              {/* Tiny Image Thumbnail */}
                              <div className="w-full h-16 rounded bg-black flex items-center justify-center overflow-hidden border border-[rgba(255,255,255,0.02)]">
                                <img
                                  src={resolveAssetUrl(file.url)}
                                  alt={formatCaption(file.name, "GDSII Mask Layout")}
                                  referrerPolicy="no-referrer"
                                  className="max-w-full max-h-full object-contain opacity-50 group-hover:opacity-100 transition-opacity"
                                />
                              </div>
                              <div className="space-y-0.5 truncate w-full">
                                <span className={`font-sans text-[10px] font-bold tracking-wide block truncate transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                  {formatCaption(file.name, "").trim()}
                                </span>
                                <span className="font-mono text-[9px] text-slate-600 block">
                                  {file.size}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* Section 08: Secure Engineering Downloads (INTEGRATED) */}
          <Section index="08" title="Secure Engineering Downloads" icon={<ShieldCheck className="h-4 w-4 text-emerald-400 animate-pulse" />}>
            <div className="space-y-6">
              <p className="font-sans text-sm text-slate-300 leading-relaxed">
                Access to restricted silicon source codes, synthesizable RTL files, gate netlists, and physical DEF floorplans is strictly limited to authorized personnel.
              </p>

              {activeAsset ? (
                <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0c0c11] overflow-hidden">
                  
                  {/* Header Lock Bar */}
                  <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.05)] bg-[#121217] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isValidated ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {isValidated ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </div>
                      <div>
                        <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest block">VAULT_ASSET_STATUS</span>
                        <span className="font-mono text-xs font-black uppercase text-white tracking-wide">
                          {isValidated ? 'SESSION AUTHORIZED' : 'VAULT LOCKED'}
                        </span>
                      </div>
                    </div>

                    {isValidated && (
                      <button
                        onClick={handleDisconnectPortal}
                        className="font-mono text-[10px] uppercase tracking-wider text-slate-500 hover:text-white border border-slate-800 hover:border-slate-700 rounded px-2.5 py-1 transition-all cursor-pointer"
                      >
                        Disconnect Session
                      </button>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-6">
                    {/* Locked View */}
                    {!isValidated ? (
                      <div className="space-y-5">
                        <div className="rounded-lg border border-dashed border-amber-500/20 bg-amber-500/[0.02] p-4 flex items-start gap-3">
                          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="font-mono text-xs font-black uppercase text-amber-400 tracking-wide">Restricted Access Required</span>
                            <p className="font-sans text-xs text-slate-400 leading-relaxed">
                              This file ({activeAsset.name}) is protected under cryptographic token protocols. Please enter your administrator-issued Portal Token below to unlock direct file downloads.
                            </p>
                          </div>
                        </div>

                        {/* Verification input */}
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={inputToken}
                              onChange={(e) => setInputToken(e.target.value)}
                              placeholder="Enter your Portal Token..."
                              className="w-full bg-[#040406] border border-slate-800 focus:border-[#a78bfa]/50 focus:ring-1 focus:ring-[#a78bfa]/50 text-white font-mono text-xs rounded-lg px-4 py-2.5 placeholder-slate-600 transition-all outline-none"
                            />
                          </div>
                          <button
                            onClick={() => handleValidateToken(inputToken)}
                            disabled={isValidating || !inputToken.trim()}
                            className="bg-[#a78bfa] hover:bg-[#b59dfb] disabled:bg-slate-900 disabled:text-slate-600 text-slate-950 font-mono text-xs uppercase font-black tracking-widest rounded-lg px-5 py-2.5 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                          >
                            {isValidating ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                VALIDATING...
                              </>
                            ) : (
                              <>
                                <Unlock className="h-3.5 w-3.5" />
                                UNLOCK_VAULT
                              </>
                            )}
                          </button>
                        </div>

                        {validationError && (
                          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 font-mono text-[11px] leading-relaxed flex items-center gap-2.5">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>{validationError}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Authorized View
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#040406] border border-[rgba(255,255,255,0.03)]">
                          <div className="space-y-1">
                            <span className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-wider block">TARGET CORE ASSET</span>
                            <span className="font-sans text-sm font-black text-white">{activeAsset.name}</span>
                            <div className="flex items-center gap-3 pt-1">
                              <span className="font-mono text-[10px] text-slate-400">Size: <span className="text-[#a78bfa] font-bold">{activeAsset.size}</span></span>
                              <span className="h-1 w-1 rounded-full bg-slate-700" />
                              <span className="font-mono text-[10px] text-slate-400">Ver: <span className="text-[#a78bfa] font-bold">{activeAsset.version}</span></span>
                              <span className="h-1 w-1 rounded-full bg-slate-700" />
                              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold uppercase tracking-widest">{activeAsset.category}</span>
                            </div>
                          </div>

                          {isAssetAuthorized() ? (
                            <button
                              onClick={() => handleDownloadAsset(activeAsset.id)}
                              disabled={downloadingAssetId === activeAsset.id}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs uppercase font-black tracking-widest rounded-lg px-6 py-3 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 shrink-0"
                            >
                              {downloadingAssetId === activeAsset.id ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  AUTHORIZING...
                                </>
                              ) : (
                                <>
                                  <Download className="h-3.5 w-3.5" />
                                  DOWNLOAD SOURCE (ZIP)
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-amber-400 font-mono text-xs max-w-sm flex items-start gap-2.5">
                              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                              <span>Your token is valid, but it is restricted. It does not carry permission to evict this specific project package.</span>
                            </div>
                          )}
                        </div>

                        {downloadError && (
                          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-400 font-mono text-[11px] flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>{downloadError}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-900 bg-[#040406]/30 p-8 text-center font-mono text-xs text-slate-500 leading-relaxed">
                  <Lock className="h-5 w-5 mx-auto mb-2 text-slate-700" />
                  <span>No restricted assets associated with this project.</span>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Bottom Portfolio Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-6 border-t border-[rgba(255,255,255,0.05)] text-center"
        >
          <button
            onClick={onBack}
            data-testid="btn-back-to-projects-bottom"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#a78bfa]/30 bg-[#a78bfa]/5 hover:bg-[#a78bfa]/15 font-mono text-xs font-bold uppercase tracking-widest text-[#a78bfa] transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            // RETURN_TO_PORTFOLIO
          </button>
        </motion.div>

        <AnimatePresence>
          {isFullscreenWaveform && (
            <FullscreenGalleryViewer
              images={simulationWaveforms}
              activeIndex={activeWaveformIndex}
              onClose={() => setIsFullscreenWaveform(false)}
              onPrev={() => setActiveWaveformIndex(idx => (idx - 1 + simulationWaveforms.length) % simulationWaveforms.length)}
              onNext={() => setActiveWaveformIndex(idx => (idx + 1) % simulationWaveforms.length)}
              getCaption={getCaptionFromFilename}
            />
          )}

          {isFullscreenFloorplan && (
            <FullscreenGalleryViewer
              images={floorplanAssets}
              activeIndex={activeFloorplanIndex}
              onClose={() => setIsFullscreenFloorplan(false)}
              onPrev={() => setActiveFloorplanIndex(idx => (idx - 1 + floorplanAssets.length) % floorplanAssets.length)}
              onNext={() => setActiveFloorplanIndex(idx => (idx + 1) % floorplanAssets.length)}
              getCaption={(name) => formatCaption(name, "Physical Floorplan")}
            />
          )}

          {isFullscreenTiming && (
            <FullscreenGalleryViewer
              images={timingAssets}
              activeIndex={activeTimingIndex}
              onClose={() => setIsFullscreenTiming(false)}
              onPrev={() => setActiveTimingIndex(idx => (idx - 1 + timingAssets.length) % timingAssets.length)}
              onNext={() => setActiveTimingIndex(idx => (idx + 1) % timingAssets.length)}
              getCaption={(name) => formatCaption(name, "Timing Report")}
            />
          )}

          {isFullscreenGdsii && (
            <FullscreenGalleryViewer
              images={gdsiiAssets}
              activeIndex={activeGdsiiIndex}
              onClose={() => setIsFullscreenGdsii(false)}
              onPrev={() => setActiveGdsiiIndex(idx => (idx - 1 + gdsiiAssets.length) % gdsiiAssets.length)}
              onNext={() => setActiveGdsiiIndex(idx => (idx + 1) % gdsiiAssets.length)}
              getCaption={(name) => formatCaption(name, "GDSII Mask Layout")}
            />
          )}

          {isFullscreenBlockDiagram && (
            <FullscreenGalleryViewer
              images={blockDiagramImages}
              activeIndex={activeBlockDiagramIndex}
              onClose={() => setIsFullscreenBlockDiagram(false)}
              onPrev={() => {
                if (blockDiagramImages.length > 1) {
                  const nextIdx = (activeBlockDiagramIndex - 1 + blockDiagramImages.length) % blockDiagramImages.length;
                  setActiveBlockDiagramIndex(nextIdx);
                  setSelectedBlockDiagram(blockDiagramImages[nextIdx].url);
                }
              }}
              onNext={() => {
                if (blockDiagramImages.length > 1) {
                  const nextIdx = (activeBlockDiagramIndex + 1) % blockDiagramImages.length;
                  setActiveBlockDiagramIndex(nextIdx);
                  setSelectedBlockDiagram(blockDiagramImages[nextIdx].url);
                }
              }}
              getCaption={(name) => formatCaption(name, "Block Diagram")}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Fullscreen Waveform Gallery Viewer Component
// -----------------------------------------------------------------------------
function FullscreenGalleryViewer({
  images,
  activeIndex,
  onClose,
  onPrev,
  onNext,
  getCaption
}: {
  images: Array<{ name: string; url: string; size: string }>;
  activeIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  getCaption: (name: string) => string;
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDragging = React.useRef(false);
  const start = React.useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const scrollPos = React.useRef(0);

  React.useEffect(() => {
    // Save current scroll position when modal opens
    scrollPos.current = window.scrollY;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        onPrev();
        reset();
      }
      if (e.key === 'ArrowRight') {
        onNext();
        reset();
      }
      if (e.key === '+' || e.key === '=') setScale((s) => Math.min(s + 0.25, 6));
      if (e.key === '-' || e.key === '_') setScale((s) => Math.max(s - 0.25, 0.25));
      if (e.key === '0') reset();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      // Restore scroll position exactly on unmount
      window.scrollTo(0, scrollPos.current);
    };
  }, [onClose, onPrev, onNext]);

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const current = images[activeIndex];
  if (!current) return null;

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale((s) => Math.min(Math.max(s + delta, 0.25), 6));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    isDragging.current = true;
    start.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setOffset({
      x: start.current.ox + (e.clientX - start.current.x),
      y: start.current.oy + (e.clientY - start.current.y),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] bg-[#050508]/90 backdrop-blur-md flex flex-col"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => { isDragging.current = false; }}
      onMouseLeave={() => { isDragging.current = false; }}
      onClick={(e) => {
        // Close if clicking the main container background
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Floating Close Button in top-right, always visible */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="fixed top-6 right-6 z-[110] h-10 w-10 flex items-center justify-center rounded-full border border-[rgba(255,255,255,0.15)] bg-[#0a0a10]/80 text-slate-300 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-colors cursor-pointer shadow-lg"
        title="Close (ESC)"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Header toolbar */}
      <div 
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0e]/90 z-10"
      >
        <div className="space-y-0.5">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#a78bfa] block">
            // Fullscreen Engineering Asset Viewer
          </span>
          <span className="font-sans text-sm font-black text-white uppercase tracking-wide">
            {getCaption(current.name)}
          </span>
        </div>
        
        <div className="flex items-center gap-2 pr-12">
          {/* Zoom Level indicator and buttons */}
          <button
            onClick={() => setScale(s => Math.max(s - 0.25, 0.25))}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-[rgba(255,255,255,0.06)] bg-[#121218] text-slate-300 hover:text-white hover:border-[#a78bfa]/40 hover:bg-[#1a1a20] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="font-mono text-xs text-slate-400 w-16 text-center select-none">
            {(scale * 100).toFixed(0)}%
          </span>
          <button
            onClick={() => setScale(s => Math.min(s + 0.25, 6))}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-[rgba(255,255,255,0.06)] bg-[#121218] text-slate-300 hover:text-white hover:border-[#a78bfa]/40 hover:bg-[#1a1a20] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={reset}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-[rgba(255,255,255,0.06)] bg-[#121218] text-slate-300 hover:text-white hover:border-[#a78bfa]/40 hover:bg-[#1a1a20] transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main image canvas with Left/Right arrows */}
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        className="flex-1 relative flex items-center justify-center overflow-hidden select-none"
      >
        {/* Left Arrow */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
              reset();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute left-6 z-10 p-4 rounded-full border border-slate-800 bg-[#0a0a0f]/80 text-slate-300 hover:text-white hover:border-[#a78bfa]/50 hover:bg-[#a78bfa]/10 transition-all cursor-pointer"
            title="Previous (ArrowLeft)"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        {/* Scalable, draggable Image */}
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          className="w-full h-full flex items-center justify-center"
          style={{ cursor: scale > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default' }}
        >
          <img
            src={resolveAssetUrl(current.url)}
            alt={getCaption(current.name)}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
              maxWidth: '85%',
              maxHeight: '85%',
            }}
            className="object-contain"
          />
        </div>

        {/* Right Arrow */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
              reset();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute right-6 z-10 p-4 rounded-full border border-slate-800 bg-[#0a0a0f]/80 text-slate-300 hover:text-white hover:border-[#a78bfa]/50 hover:bg-[#a78bfa]/10 transition-all cursor-pointer"
            title="Next (ArrowRight)"
          >
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </button>
        )}
      </div>

      {/* Footer controls / info */}
      <div 
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="px-6 py-4 border-t border-[rgba(255,255,255,0.05)] bg-[#0a0a0e]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 font-mono text-[10px] uppercase tracking-widest z-10"
      >
        <div className="flex items-center gap-2">
          <span>Asset {activeIndex + 1} of {images.length}</span>
          {current.size && current.size !== "N/A" && (
            <>
              <span className="text-slate-800">•</span>
              <span className="text-slate-400">{current.size}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Move className="h-3 w-3" /> Drag to Pan</span>
          <span>Scroll to Zoom</span>
          <span>Arrows to Navigate</span>
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Layout Section Helper
// -----------------------------------------------------------------------------
function Section({
  index,
  title,
  icon,
  children,
}: {
  index: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45 }}
      className="space-y-4 font-sans"
      id={`section-${index}`}
    >
      <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.05)] pb-2">
        <span className="font-mono text-[10px] font-bold text-[#a78bfa] bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded px-1.5 py-0.5">
          {index}
        </span>
        <span className="text-[#a78bfa]">{icon}</span>
        <h3 className="font-sans text-sm sm:text-base font-black uppercase tracking-wider text-white">
          {title}
        </h3>
      </div>
      <div className="rounded-xl border border-[rgba(255,255,255,0.04)] bg-[#09090c]/80 p-5 sm:p-6 space-y-2 relative overflow-hidden">
        {children}
      </div>
    </motion.section>
  );
}

// -----------------------------------------------------------------------------
// Interactive CAD / Waveform Viewer Component
// -----------------------------------------------------------------------------
interface EngineeringViewerProps {
  src: string;
  alt: string;
  fallbackType: 'block' | 'waveform' | 'timing' | 'floorplan' | 'gds';
  projectId: string;
  onEnlarge?: () => void;
}

function EngineeringViewer({ src, alt, fallbackType, projectId, onEnlarge }: EngineeringViewerProps) {
  const [failed, setFailed] = useState(false);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // GDS Specific state: layer toggles
  const [gdsLayers, setGdsLayers] = useState({
    OD_Active: true,
    PO_Poly: true,
    M1_Metal1: true,
    M2_Metal2: true,
    VIA_Vias: true
  });

  // Timing STA path selection
  const [staPathTab, setStaPathTab] = useState<'path1' | 'path2'>('path1');

  // Simulation interactive cycle
  const [simCycle, setSimCycle] = useState(2);

  // Floorplan hover item
  const [fpHover, setFpHover] = useState<string | null>(null);

  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

  const renderVectorFallback = () => {
    switch (fallbackType) {
      case 'block':
        return (
          <div className="w-full h-full flex flex-col justify-between p-4 bg-[#040406]/90 relative overflow-hidden" style={{ minHeight: '380px' }}>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#a78bfa] block mb-2 border-b border-[rgba(255,255,255,0.03)] pb-1">// HIGH-FIDELITY CORE BLOCK OVERVIEW</span>
            
            <div className="flex-1 flex items-center justify-center">
              <svg viewBox="0 0 800 400" className="w-full max-h-[320px] h-auto text-slate-400 select-none">
                <g stroke="#2d2d3d" strokeWidth="1.5" fill="none">
                  {/* Bus Grid lines */}
                  <path d="M 100 200 L 700 200" stroke="#a78bfa" strokeWidth="2.5" strokeDasharray="4 4" className="animate-pulse" />
                  <path d="M 220 150 L 220 200" />
                  <path d="M 380 150 L 380 200" />
                  <path d="M 540 150 L 540 200" />
                  <path d="M 380 200 L 380 270" />

                  {/* Core Blocks */}
                  <g fill="#09090d" stroke="#4c4c5c" strokeWidth="1.5">
                    {/* CPU Core */}
                    <rect x="140" y="50" width="160" height="100" rx="6" className="hover:stroke-[#a78bfa] transition-colors duration-200 cursor-pointer" />
                    {/* L1 Cache */}
                    <rect x="320" y="70" width="120" height="80" rx="6" className="hover:stroke-[#a78bfa] transition-colors duration-200 cursor-pointer" />
                    {/* NPU Matrix Array */}
                    <rect x="460" y="50" width="160" height="100" rx="6" className="hover:stroke-[#a78bfa] transition-colors duration-200 cursor-pointer" />
                    {/* AXI4 Interconnect */}
                    <rect x="120" y="180" width="560" height="40" rx="4" fill="#0c0c14" stroke="#a78bfa" strokeWidth="1.5" />
                    {/* APB Bridge */}
                    <rect x="300" y="270" width="160" height="70" rx="6" className="hover:stroke-[#a78bfa] transition-colors duration-200 cursor-pointer" />
                  </g>

                  {/* CPU Internal registers */}
                  <rect x="155" y="75" width="50" height="30" rx="2" fill="#12121c" stroke="#333" />
                  <rect x="235" y="75" width="50" height="30" rx="2" fill="#12121c" stroke="#333" />
                </g>

                {/* Text overlay labels */}
                <g fill="#fff" fontFamily="monospace" fontSize="10" fontWeight="bold" textAnchor="middle">
                  <text x="220" y="105">CPU_CORE</text>
                  <text x="180" y="93" fill="#a78bfa" fontSize="8">ALU</text>
                  <text x="260" y="93" fill="#a78bfa" fontSize="8">PC</text>
                  
                  <text x="380" y="110">L1_CACHE</text>
                  <text x="380" y="125" fill="#a78bfa" fontSize="8">(MESI)</text>
                  
                  <text x="540" y="105">MATRIX_NPU</text>
                  <text x="540" y="120" fill="#a78bfa" fontSize="8">INT8 array</text>
                  
                  <text x="400" y="205" fill="#a78bfa" fontSize="11" letterSpacing="0.2em">128-BIT AXI4 INTERCONNECT MATRIX</text>
                  
                  <text x="380" y="305">APB_BRIDGE</text>
                  <text x="380" y="322" fill="#888" fontSize="8">UART / SPI / GPIO</text>
                </g>
              </svg>
            </div>
            
            <div className="flex justify-between items-center mt-3 border-t border-[rgba(255,255,255,0.03)] pt-2 text-[10px] font-mono text-slate-500">
              <span>Status: <span className="text-[#a78bfa] font-bold">Synthesizable RTL Block Schematic</span></span>
              <span>Grid scale: 1.0mm</span>
            </div>
          </div>
        );

      case 'waveform':
        return (
          <div className="w-full h-full flex flex-col justify-between p-4 bg-[#040406]/90 relative overflow-hidden" style={{ minHeight: '380px' }}>
            <div className="flex justify-between items-center mb-3 border-b border-[rgba(255,255,255,0.03)] pb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#a78bfa]">// TIMING LOGIC ANALYZER TRACES</span>
              <div className="flex items-center gap-1 bg-[#121217] rounded border border-slate-800 p-0.5">
                <button
                  onClick={() => setSimCycle(Math.max(1, simCycle - 1))}
                  className="font-mono text-[9px] px-2 py-0.5 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  &lt; Prev
                </button>
                <span className="font-mono text-[9px] text-[#a78bfa] font-bold px-2">Cycle {simCycle}</span>
                <button
                  onClick={() => setSimCycle(Math.min(5, simCycle + 1))}
                  className="font-mono text-[9px] px-2 py-0.5 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  Next &gt;
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center font-mono">
              <svg viewBox="0 0 800 240" className="w-full max-h-[220px] h-auto text-slate-400 select-none">
                {/* Horizontal reference lines */}
                <path d="M 0 40 L 800 40" stroke="#12121a" />
                <path d="M 0 80 L 800 80" stroke="#12121a" />
                <path d="M 0 120 L 800 120" stroke="#12121a" />
                <path d="M 0 160 L 800 160" stroke="#12121a" />

                {/* Interactive cursor line */}
                <path d={`M ${150 + simCycle * 100} 0 L ${150 + simCycle * 100} 220`} stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3 3" />
                <rect x={115 + simCycle * 100} y="5" width="70" height="15" rx="3" fill="#a78bfa" />
                <text x={150 + simCycle * 100} y="16" fill="#000" fontSize="8" fontWeight="bold" textAnchor="middle">CYC_{simCycle}</text>

                {/* Labels */}
                <g fill="#667" fontSize="9" fontWeight="bold">
                  <text x="30" y="30">SYS_CLK</text>
                  <text x="30" y="70">SYS_RST_N</text>
                  <text x="30" y="110">PSEL</text>
                  <text x="30" y="150">PENABLE</text>
                  <text x="30" y="190">PADDR[7:0]</text>
                </g>

                {/* Logic Waves */}
                <g stroke="#334" strokeWidth="1.5" fill="none">
                  {/* CLK */}
                  <path d="M 150 35 L 200 35 L 200 15 L 250 15 L 250 35 L 300 35 L 300 15 L 350 15 L 350 35 L 400 35 L 400 15 L 450 15 L 450 35 L 500 35 L 500 15 L 550 15 L 550 35 L 600 35 L 600 15 L 650 15 L 650 35 L 700 35" stroke="#4a4a5a" />
                  
                  {/* RST */}
                  <path d="M 150 75 L 250 75 L 250 55 L 700 55" stroke="#10b981" strokeWidth="2" />

                  {/* PSEL */}
                  <path d="M 150 115 L 350 115 L 350 95 L 550 95 L 550 115 L 700 115" stroke="#a78bfa" strokeWidth="2" />

                  {/* PENABLE */}
                  <path d="M 150 155 L 450 155 L 450 135 L 550 135 L 550 155 L 700 155" stroke="#c084fc" strokeWidth="2" />

                  {/* PADDR HEX BUS */}
                  <path d="M 150 185 L 350 185 L 360 175 L 540 175 L 550 185 L 700 185 M 350 175 L 360 185 L 540 185 L 550 175" stroke="#60a5fa" strokeWidth="2" />
                  <text x="450" y="184" fill="#60a5fa" fontSize="8" fontWeight="bold" textAnchor="middle">0x0000_14C0</text>
                </g>
              </svg>
            </div>

            <div className="flex justify-between items-center mt-3 border-t border-[rgba(255,255,255,0.03)] pt-2 text-[10px] font-mono text-slate-500">
              <span>Interactive simulation traces // Cycle-accurate verification</span>
              <span>Simulator: Vivado XSim</span>
            </div>
          </div>
        );

      case 'timing':
        return (
          <div className="w-full h-full flex flex-col justify-between p-4 bg-[#040406]/90 relative overflow-hidden" style={{ minHeight: '380px' }}>
            <div className="flex justify-between items-center mb-3 border-b border-[rgba(255,255,255,0.03)] pb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#a78bfa]">// CRITICAL TIMING PATH TREE (STA)</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setStaPathTab('path1')}
                  className={`font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded border transition-all cursor-pointer ${staPathTab === 'path1' ? 'bg-[#a78bfa]/20 text-[#a78bfa] border-[#a78bfa]/40 font-bold' : 'bg-[#121217] text-slate-500 border-slate-800'}`}
                >
                  Reg_to_Reg Path
                </button>
                <button
                  onClick={() => setStaPathTab('path2')}
                  className={`font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded border transition-all cursor-pointer ${staPathTab === 'path2' ? 'bg-[#a78bfa]/20 text-[#a78bfa] border-[#a78bfa]/40 font-bold' : 'bg-[#121217] text-slate-500 border-slate-800'}`}
                >
                  In_to_Reg Path
                </button>
              </div>
            </div>

            {/* Timing path node diagram */}
            <div className="flex-1 flex flex-col justify-center space-y-5 px-4 font-mono">
              <div className="flex items-center justify-between gap-2.5">
                
                {/* Node 1 Launch */}
                <div className="p-3 bg-[#0d0d14] rounded-lg border border-slate-800 max-w-[150px] text-center">
                  <span className="text-[8px] text-slate-500 block uppercase">Launch Register</span>
                  <span className="text-[10px] text-white font-bold block mt-1">DFF_REG_0/CK</span>
                  <span className="text-[8px] text-[#a78bfa] block mt-0.5">Delay: +0.00ns</span>
                </div>

                <div className="flex-1 h-[2px] bg-gradient-to-r from-[#a78bfa]/60 to-amber-500/60 relative">
                  <span className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#121217] text-[8px] text-[#a78bfa] px-1.5 border border-slate-800 rounded font-bold">
                    {staPathTab === 'path1' ? 'Net: +0.12ns' : 'Net: +0.42ns'}
                  </span>
                </div>

                {/* Node 2 Buffer */}
                <div className="p-3 bg-[#0d0d14] rounded-lg border border-slate-800 max-w-[150px] text-center">
                  <span className="text-[8px] text-slate-500 block uppercase">Combinational Logic</span>
                  <span className="text-[10px] text-white font-bold block mt-1">ADD_32/CELL_X2</span>
                  <span className="text-[8px] text-amber-400 block mt-0.5">
                    {staPathTab === 'path1' ? 'Delay: +0.45ns' : 'Delay: +1.12ns'}
                  </span>
                </div>

                <div className="flex-1 h-[2px] bg-gradient-to-r from-amber-500/60 to-[#a78bfa]/60 relative">
                  <span className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#121217] text-[8px] text-[#a78bfa] px-1.5 border border-slate-800 rounded font-bold">
                    {staPathTab === 'path1' ? 'Net: +0.08ns' : 'Net: +0.22ns'}
                  </span>
                </div>

                {/* Node 3 Capture */}
                <div className="p-3 bg-[#0d0d14] rounded-lg border border-slate-800 max-w-[150px] text-center">
                  <span className="text-[8px] text-slate-500 block uppercase">Capture Register</span>
                  <span className="text-[10px] text-white font-bold block mt-1">DFF_REG_1/D</span>
                  <span className="text-[8px] text-[#a78bfa] block mt-0.5">Setup time: +0.05ns</span>
                </div>
              </div>

              {/* Progress Arrival VS Required bar chart */}
              <div className="space-y-2 border-t border-[rgba(255,255,255,0.03)] pt-4 text-[10px]">
                <div className="flex justify-between text-slate-400">
                  <span>Data Arrival Time (Actual Path):</span>
                  <span className="text-white font-bold">
                    {staPathTab === 'path1' ? '0.70 ns' : '1.81 ns'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Data Required Time (Clock Period):</span>
                  <span className="text-white font-bold">2.12 ns</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: staPathTab === 'path1' ? '33%' : '85%' }}
                  />
                  <div className="absolute right-0 top-0 bottom-0 w-[15%] bg-red-500/30 border-l border-red-500/50" />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>Arrival Delay</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-wider">
                    {staPathTab === 'path1' ? 'SLACK: +1.42ns (MET)' : 'SLACK: +0.31ns (MET)'}
                  </span>
                  <span>Required Deadline</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3 border-t border-[rgba(255,255,255,0.03)] pt-2 text-[10px] font-mono text-slate-500">
              <span>STA Tool report: <span className="text-emerald-400 font-bold">OpenSTA 1.1</span></span>
              <span>Clock constraint check: Setup</span>
            </div>
          </div>
        );

      case 'floorplan':
        return (
          <div className="w-full h-full flex flex-col justify-between p-4 bg-[#040406]/90 relative overflow-hidden" style={{ minHeight: '380px' }}>
            <div className="flex justify-between items-center mb-3 border-b border-[rgba(255,255,255,0.03)] pb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#a78bfa]">// INTERACTIVE PHYSICAL CORE BOUNDARY (DEF)</span>
              <span className="font-mono text-[9px] text-slate-500">Hover regions to inspect density</span>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
              <svg viewBox="0 0 400 400" className="w-full max-h-[300px] h-auto text-slate-400 select-none">
                <g fill="none" strokeWidth="1.5">
                  {/* Outer chip pad-ring */}
                  <rect x="20" y="20" width="360" height="360" rx="10" stroke="#a78bfa" strokeWidth="2.5" strokeDasharray="6 3" />
                  
                  {/* Power Rings (VDD/VSS) */}
                  <rect x="35" y="35" width="330" height="330" rx="6" stroke="#4c1d95" strokeWidth="1.5" />
                  <rect x="42" y="42" width="316" height="316" rx="4" stroke="#c084fc" strokeWidth="1" />

                  {/* IO Pads along the boundary */}
                  <g fill="#121217" stroke="#444" strokeWidth="1">
                    <rect x="50" y="25" width="15" height="15" />
                    <rect x="100" y="25" width="15" height="15" />
                    <rect x="150" y="25" width="15" height="15" />
                    <rect x="200" y="25" width="15" height="15" />
                    <rect x="250" y="25" width="15" height="15" />
                    <rect x="300" y="25" width="15" height="15" />
                    
                    <rect x="25" y="100" width="15" height="15" />
                    <rect x="25" y="200" width="15" height="15" />
                    <rect x="25" y="300" width="15" height="15" />

                    <rect x="360" y="100" width="15" height="15" />
                    <rect x="360" y="200" width="15" height="15" />
                    <rect x="360" y="300" width="15" height="15" />
                  </g>

                  {/* Large Macros SRAM */}
                  <g strokeWidth="1.5">
                    <rect
                      x="60" y="60" width="100" height="110" rx="3"
                      fill={fpHover === 'sram0' ? '#a78bfa/10' : '#0a0a10'}
                      stroke={fpHover === 'sram0' ? '#a78bfa' : '#444'}
                      onMouseEnter={() => setFpHover('sram0')}
                      onMouseLeave={() => setFpHover(null)}
                      className="transition-all duration-200 cursor-pointer"
                    />
                    <rect
                      x="240" y="60" width="100" height="110" rx="3"
                      fill={fpHover === 'sram1' ? '#a78bfa/10' : '#0a0a10'}
                      stroke={fpHover === 'sram1' ? '#a78bfa' : '#444'}
                      onMouseEnter={() => setFpHover('sram1')}
                      onMouseLeave={() => setFpHover(null)}
                      className="transition-all duration-200 cursor-pointer"
                    />

                    {/* Standard cells layout logic area */}
                    <rect
                      x="60" y="200" width="280" height="140" rx="4"
                      fill={fpHover === 'core' ? '#a78bfa/5' : '#050508'}
                      stroke={fpHover === 'core' ? '#a78bfa' : '#444'}
                      strokeDasharray="4 2"
                      onMouseEnter={() => setFpHover('core')}
                      onMouseLeave={() => setFpHover(null)}
                      className="transition-all duration-200 cursor-pointer"
                    />
                  </g>
                </g>

                {/* Grid labels */}
                <g fill="#778" fontFamily="monospace" fontSize="8" fontWeight="bold">
                  <text x="110" y="115" textAnchor="middle">SRAM_L1_INST</text>
                  <text x="110" y="127" fill="#a78bfa" fontSize="6" textAnchor="middle">Size: 4KB // Density: 92%</text>
                  
                  <text x="290" y="115" textAnchor="middle">SRAM_L1_DATA</text>
                  <text x="290" y="127" fill="#a78bfa" fontSize="6" textAnchor="middle">Size: 4KB // Density: 90%</text>
                  
                  <text x="200" y="260" textAnchor="middle" fontSize="10">CORE_LOGIC_ROWS</text>
                  <text x="200" y="275" fill="#a78bfa" fontSize="7" textAnchor="middle">Gate count: 38.4k NAND // Height: cell rows x24</text>
                </g>
              </svg>

              {/* Dynamic physical stats panel floating overlay */}
              <AnimatePresence>
                {fpHover && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-4 right-4 bg-[#0d0d12]/95 border border-slate-800 p-3 rounded-lg font-mono text-[9px] text-slate-400 space-y-1 shadow-2xl"
                  >
                    <span className="text-[#a78bfa] font-bold block uppercase border-b border-slate-800 pb-1">// PLACEMENT INFO</span>
                    {fpHover === 'sram0' && (
                      <>
                        <span className="block text-white">Module: SRAM_L1_I_MACRO</span>
                        <span className="block">Coords: (X: 120, Y: 450)</span>
                        <span className="block">Power rails: M3/M4 mesh VDD</span>
                      </>
                    )}
                    {fpHover === 'sram1' && (
                      <>
                        <span className="block text-white">Module: SRAM_L1_D_MACRO</span>
                        <span className="block">Coords: (X: 740, Y: 450)</span>
                        <span className="block">Power rails: M3/M4 mesh VDD</span>
                      </>
                    )}
                    {fpHover === 'core' && (
                      <>
                        <span className="block text-white">Module: CPU_CORE_LOGIC_AREA</span>
                        <span className="block">Coords: (X: 120, Y: 120)</span>
                        <span className="block">Macro Cells: 12,842 standard gates</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-between items-center mt-3 border-t border-[rgba(255,255,255,0.03)] pt-2 text-[10px] font-mono text-slate-500">
              <span>Die boundary configuration // Pad ratio: 1.2:1</span>
              <span>Cadence Innovus Floorplanner</span>
            </div>
          </div>
        );

      case 'gds':
        return (
          <div className="w-full h-full flex flex-col justify-between p-4 bg-[#040406]/90 relative overflow-hidden" style={{ minHeight: '380px' }}>
            <div className="flex justify-between items-center mb-3 border-b border-[rgba(255,255,255,0.03)] pb-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#a78bfa]">// INTERACTIVE SILICON LAYOUT MASK (GDSII)</span>
              
              {/* Layer checkboxes legends */}
              <div className="flex flex-wrap gap-2.5">
                {Object.entries(gdsLayers).map(([key, val]) => (
                  <label key={key} className="flex items-center gap-1.5 cursor-pointer font-mono text-[8px] text-slate-400 hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={() => setGdsLayers(prev => ({ ...prev, [key]: !val }))}
                      className="accent-[#a78bfa] h-3 w-3 rounded border-slate-800 bg-slate-900 focus:ring-0"
                    />
                    <span className="uppercase">{key.split('_')[1]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <svg viewBox="0 0 300 300" className="w-full max-h-[260px] h-auto select-none">
                <g strokeWidth="0.5">
                  {/* Grid background */}
                  <path d="M 0 0 L 300 300 M 300 0 L 0 300 M 0 150 L 300 150 M 150 0 L 150 300" stroke="#12121c" strokeWidth="0.5" />

                  {/* Layer OD (Active Diffusion) */}
                  {gdsLayers.OD_Active && (
                    <g fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="0.5">
                      <rect x="50" y="50" width="80" height="20" />
                      <rect x="180" y="50" width="60" height="40" />
                      <rect x="50" y="150" width="200" height="30" />
                    </g>
                  )}

                  {/* Layer PO (Poly Silicon Gate) */}
                  {gdsLayers.PO_Poly && (
                    <g fill="#ef4444" fillOpacity="0.25" stroke="#ef4444" strokeWidth="0.5">
                      <rect x="80" y="40" width="10" height="40" />
                      <rect x="200" y="30" width="10" height="80" />
                      <rect x="120" y="140" width="15" height="50" />
                      <rect x="180" y="140" width="15" height="50" />
                    </g>
                  )}

                  {/* Layer M1 (Metal 1 Routing) */}
                  {gdsLayers.M1_Metal1 && (
                    <g fill="#3b82f6" fillOpacity="0.25" stroke="#3b82f6" strokeWidth="0.5">
                      <path d="M 30 100 L 270 100 L 270 110 L 30 110 Z" />
                      <path d="M 30 200 L 270 200 L 270 210 L 30 210 Z" />
                      <rect x="85" y="80" width="8" height="140" />
                    </g>
                  )}

                  {/* Layer M2 (Metal 2 Routing) */}
                  {gdsLayers.M2_Metal2 && (
                    <g fill="#a78bfa" fillOpacity="0.25" stroke="#a78bfa" strokeWidth="0.5">
                      <rect x="145" y="10" width="10" height="280" />
                      <path d="M 100 130 L 220 130 L 220 140 L 100 140 Z" />
                    </g>
                  )}

                  {/* Layer VIA (Silicon Connections) */}
                  {gdsLayers.VIA_Vias && (
                    <g fill="#fbbf24" fillOpacity="0.8" stroke="#d97706" strokeWidth="0.5">
                      <rect x="81" y="101" width="8" height="8" />
                      <rect x="146" y="101" width="8" height="8" />
                      <rect x="146" y="131" width="8" height="8" />
                      <rect x="201" y="201" width="8" height="8" />
                    </g>
                  )}
                </g>

                {/* Legend coordinates pointer */}
                <g fill="#556" fontFamily="monospace" fontSize="6">
                  <text x="5" y="295">X_COORD: 1.4281μm</text>
                  <text x="240" y="295">Y_COORD: 0.8540μm</text>
                </g>
              </svg>
            </div>

            <div className="flex justify-between items-center mt-3 border-t border-[rgba(255,255,255,0.03)] pt-2 text-[10px] font-mono text-slate-500">
              <span>Streaming: <span className="text-slate-400 font-bold">GDSII binary mask layout [Future Support]</span></span>
              <span>Cell pitch: 28nm track limit</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isGdsOrLayout = fallbackType === 'gds' || fallbackType === 'floorplan';

  return (
    <div className="mt-4 flex flex-col rounded-xl border border-[rgba(255,255,255,0.05)] bg-[#050508] overflow-hidden">
      
      {/* Zoom and Fullscreen Control Bar */}
      <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.04)] bg-[#0a0a0e] flex items-center justify-between text-xs text-slate-400 font-mono">
        <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Eye className="h-3.5 w-3.5 text-[#a78bfa]" />
          {alt}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(s => clamp(s - 0.2, 0.5, 4))}
            className="p-1 rounded hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px] w-12 text-center text-slate-500 font-bold">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(s => clamp(s + 0.2, 0.5, 4))}
            className="p-1 rounded hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <span className="h-3 w-[1px] bg-slate-800" />
          <button
            onClick={() => {
              if (onEnlarge) {
                onEnlarge();
              } else {
                setIsFullscreen(!isFullscreen);
              }
            }}
            className="p-1 rounded hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        className={`relative overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-[100] bg-[#040406]/98 flex flex-col justify-center' : 'min-h-[380px]'}`}
        style={{ cursor: scale > 1 ? 'grab' : 'default' }}
      >
        {isFullscreen && (
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setIsFullscreen(false)}
              className="bg-slate-900 border border-slate-800 text-white font-mono text-[10px] uppercase font-bold tracking-wider rounded px-3 py-1.5 hover:bg-slate-800 cursor-pointer"
            >
              Close Fullscreen
            </button>
          </div>
        )}

        <div
          className="w-full h-full flex items-center justify-center p-2"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
            minHeight: isFullscreen ? '100vh' : '380px'
          }}
        >
          {failed || !src ? (
            renderVectorFallback()
          ) : (
            <img
              src={resolveAssetUrl(src)}
              alt={alt}
              onError={() => setFailed(true)}
              onClick={() => {
                if (onEnlarge) {
                  onEnlarge();
                } else {
                  setIsFullscreen(true);
                }
              }}
              className="max-w-full max-h-[500px] object-contain select-none cursor-zoom-in"
            />
          )}
        </div>
      </div>

      {/* Footer annotation info */}
      <div className="px-4 py-2 border-t border-[rgba(255,255,255,0.04)] bg-[#0a0a0f]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-500 font-mono">
        <span>File reference: <span className="text-slate-400">{failed ? `Fallback Vector CAD CAD_${fallbackType.toUpperCase()}` : src}</span></span>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Verification engine status: <span className="text-emerald-400 font-bold font-mono">Active</span></span>
        </div>
      </div>
    </div>
  );
}
