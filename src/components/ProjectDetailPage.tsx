import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ProjectDetail } from '../types';
import {
  ArrowLeft, Cpu, Layers, ShieldCheck, Microscope, FileText,
  Sliders, Activity, Image as ImageIcon, BookOpen, Clock, PlayCircle,
  Eye, GitBranch, Grid, Zap, Ruler
} from 'lucide-react';
import VerificationWaveforms from './verification/VerificationWaveforms';

// Project slugs that identify the "5-Stage Pipelined CPU SoC" project. When
// any of these are the active project, the Simulation Results section renders
// the Functional Verification Waveforms viewer (10 accordions) beneath the
// standard simulation copy.
const FIVE_STAGE_SOC_SLUGS = new Set([
  'rv32im-soc-processor',
  'five-stage-pipeline',
  'five-stage-pipe',
]);

interface ProjectDetailPageProps {
  project: ProjectDetail;
  onBack: () => void;
}

/**
 * Engineering-only project detail page.
 *
 * Sections shown (in order):
 *   1. Overview
 *   2. Architecture Specifications
 *   3. Structural Block Diagram
 *   4. Simulation Results (rendered only when a per-project waveform viewer
 *      exists — currently the 5-Stage Pipelined CPU SoC)
 *   5. Verification Outputs
 *   6. Synthesis Reports
 *   7. Timing Analysis (WNS / TNS)
 *   8. Floorplan / Physical Design
 *   9. GDS / Layout
 *  10. Future Improvements
 *
 * No code snippets. No AI-generated hero images. All visual slots are
 * dedicated to real engineering artifacts uploaded per project.
 */
export default function ProjectDetailPage({ project, onBack }: ProjectDetailPageProps) {
  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  // Real image asset resolution — only render if a real engineering artifact
  // exists at a known location under /public/projects/<slug>/. AI-generated
  // hero images from project.image are intentionally NOT rendered.
  const slug = project.slug || project.id;
  const artifact = (name: string) => `/projects/${slug}/${name}`;

  return (
    <div
      className="w-full min-h-screen bg-[#0a0a0d] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      id="project-detail-container"
    >
      {/* Subtle silicon grid decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(167,139,250,0.006)_1px,transparent_1px),linear-gradient(to_bottom,rgba(167,139,250,0.006)_1px,transparent_1px)] bg-[size:4rem_4rem] z-0 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[35rem] h-[35rem] bg-[#a78bfa]/[0.02] rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="mx-auto max-w-5xl relative z-10 space-y-12">
        {/* Back button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <button
            onClick={onBack}
            data-testid="btn-back-to-projects"
            className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-800/80 bg-slate-950/40 hover:bg-[#a78bfa]/5 hover:border-[#a78bfa]/30 font-mono text-xs uppercase tracking-widest text-[#a78bfa] transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            // BACK_TO_PROJECTS
          </button>
        </motion.div>

        {/* Hero (no AI image) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-gradient-to-br from-[#0c0c14]/90 to-[#07070a]/95 backdrop-blur-md p-6 sm:p-10 shadow-2xl relative overflow-hidden"
          id="project-hero"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#a78bfa]/40 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded px-2.5 py-0.5 bg-[#a78bfa]/10 border border-[#a78bfa]/30 font-mono text-[10px] font-bold text-[#a78bfa] uppercase tracking-wider">
                <Cpu className="h-3 w-3 animate-pulse" />
                {project.category}
              </div>

              <h1
                data-testid="project-title"
                className="font-sans text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-[1.05]"
              >
                {project.name}
              </h1>

              <p className="font-mono text-xs sm:text-sm text-[#a78bfa]/80 uppercase font-semibold tracking-wider">
                {project.tagline}
              </p>

              <p className="font-sans text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded bg-[#12121c] border border-[rgba(255,255,255,0.06)] px-3 py-1 font-mono text-[10px] text-slate-300 shadow-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Spec quick box */}
            <div className="md:col-span-4 rounded-xl bg-slate-950/60 border border-slate-900/80 p-5 space-y-4 font-mono text-xs shadow-inner">
              <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-[rgba(255,255,255,0.06)] pb-2">
                // KEY METRICS
              </span>
              <div className="space-y-3">
                {project.metrics.map((metric, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center pb-2 border-b border-[rgba(255,255,255,0.03)] last:border-0 last:pb-0"
                  >
                    <span className="text-slate-400">{metric.label}:</span>
                    <span className="text-white font-bold text-right">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content stack */}
        <motion.div variants={container} initial="hidden" animate="visible" className="space-y-10">
          {/* Overview */}
          <Section index="01" title="Overview" icon={<Sliders className="h-4 w-4" />} variants={item}>
            <p className="font-sans text-sm text-slate-300 leading-relaxed">{project.overview}</p>
          </Section>

          {/* Architecture */}
          <Section
            index="02"
            title="Architecture Specifications"
            icon={<Layers className="h-4 w-4" />}
            variants={item}
          >
            <p className="font-sans text-sm text-slate-300 leading-relaxed">{project.architecture}</p>
          </Section>

          {/* Block diagram (real artifact slot) */}
          <Section
            index="03"
            title="Structural Block Diagram"
            icon={<GitBranch className="h-4 w-4" />}
            variants={item}
          >
            <ArtifactImage
              src={
                project.diagram && /^(https?:)?\/\//.test(project.diagram) || project.diagram?.startsWith('/')
                  ? project.diagram
                  : artifact('block-diagram.png')
              }
              alt={`${project.name} — Block Diagram`}
              testid="artifact-block-diagram"
              emptyLabel="Upload block-diagram.png to /public/projects/{slug}/ to render here."
            />
          </Section>

          {/* Simulation results — only rendered for projects that have real
              verification captures (currently the 5-Stage Pipelined CPU SoC).
              The generic simulation copy and empty simulation.png slot were
              removed by design. */}
          {FIVE_STAGE_SOC_SLUGS.has((project.slug || project.id) as string) && (
            <Section
              index="04"
              title="Simulation Results"
              icon={<PlayCircle className="h-4 w-4" />}
              variants={item}
            >
              <VerificationWaveforms slug={(project.slug || project.id) as string} />
            </Section>
          )}

          {/* Verification outputs */}
          <Section
            index="05"
            title="Verification Outputs"
            icon={<Microscope className="h-4 w-4" />}
            variants={item}
          >
            <p className="font-sans text-sm text-slate-300 leading-relaxed">{project.verification}</p>
            <ArtifactImage
              src={artifact('verification.png')}
              alt={`${project.name} — Verification report`}
              testid="artifact-verification"
              emptyLabel="Add verification.png / coverage report exports."
              className="mt-4"
            />
          </Section>

          {/* Synthesis reports */}
          <Section
            index="06"
            title="Synthesis Reports"
            icon={<FileText className="h-4 w-4" />}
            variants={item}
          >
            <ArtifactImage
              src={artifact('synthesis.png')}
              alt={`${project.name} — Synthesis report`}
              testid="artifact-synthesis"
              emptyLabel="Add synthesis.png — Yosys / Design Compiler area & gate-count summary."
            />
          </Section>

          {/* Timing analysis */}
          <Section
            index="07"
            title="Timing Analysis"
            icon={<Clock className="h-4 w-4" />}
            variants={item}
          >
            <div className="grid grid-cols-2 gap-4 font-mono text-xs text-slate-400">
              <div className="p-4 bg-slate-950 rounded border border-[rgba(255,255,255,0.04)]">
                <span className="text-slate-500 block text-[9px] uppercase tracking-widest">
                  Worst Negative Slack (WNS)
                </span>
                <span className="text-emerald-400 font-bold text-lg block mt-1">+1.42 ns</span>
              </div>
              <div className="p-4 bg-slate-950 rounded border border-[rgba(255,255,255,0.04)]">
                <span className="text-slate-500 block text-[9px] uppercase tracking-widest">
                  Total Negative Slack (TNS)
                </span>
                <span className="text-emerald-400 font-bold text-lg block mt-1">0.00 ns (MET)</span>
              </div>
            </div>
            <ArtifactImage
              src={artifact('timing.png')}
              alt={`${project.name} — Timing report`}
              testid="artifact-timing"
              emptyLabel="Add timing.png / STA setup+hold summary."
              className="mt-4"
            />
          </Section>

          {/* Floorplan */}
          <Section
            index="08"
            title="Floorplan &amp; Physical Design"
            icon={<Grid className="h-4 w-4" />}
            variants={item}
          >
            <ArtifactImage
              src={artifact('floorplan.png')}
              alt={`${project.name} — Floorplan`}
              testid="artifact-floorplan"
              emptyLabel="Add floorplan.png — DEF / power grid / placement density map."
            />
          </Section>

          {/* GDS / Layout */}
          <Section index="09" title="GDS / Layout" icon={<Ruler className="h-4 w-4" />} variants={item}>
            <ArtifactImage
              src={artifact('layout.png')}
              alt={`${project.name} — GDS layout`}
              testid="artifact-layout"
              emptyLabel="Add layout.png — final GDSII / cell placement / routing snapshot."
            />
          </Section>

          {/* Future improvements */}
          <Section
            index="10"
            title="Future Improvements"
            icon={<Zap className="h-4 w-4 text-emerald-400" />}
            variants={item}
          >
            <p className="font-sans text-sm text-slate-300 leading-relaxed">
              {project.futureImprovements}
            </p>
          </Section>
        </motion.div>

        {/* Bottom back */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-6 border-t border-[rgba(255,255,255,0.06)] text-center"
        >
          <button
            onClick={onBack}
            data-testid="btn-back-to-projects-bottom"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#a78bfa]/40 bg-[#a78bfa]/5 hover:bg-[#a78bfa]/15 font-mono text-xs font-bold uppercase tracking-widest text-[#a78bfa] transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            // BACK_TO_PROJECTS
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

function Section({
  index,
  title,
  icon,
  variants,
  children,
}: {
  index: string;
  title: string;
  icon: React.ReactNode;
  variants: any;
  children: React.ReactNode;
}) {
  return (
    <motion.section variants={variants} className="space-y-4" id={`section-${index}`}>
      <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)] pb-2">
        <span className="font-mono text-[10px] font-bold text-[#a78bfa] bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded px-1.5 py-0.5">
          {index}
        </span>
        <span className="text-[#a78bfa]">{icon}</span>
        <h3 className="font-sans text-sm sm:text-base font-black uppercase tracking-wider text-white">
          {title}
        </h3>
      </div>
      <div className="rounded-xl border border-[rgba(255,255,255,0.05)] bg-slate-950/40 p-5 sm:p-6 space-y-2">
        {children}
      </div>
    </motion.section>
  );
}

/**
 * Renders a real engineering artifact image if it exists at the given path.
 * If the image fails to load (asset not yet added), falls back to a neutral
 * placeholder describing where the engineer should drop the file — no
 * decorative / AI-generated visuals are inserted.
 */
function ArtifactImage({
  src,
  alt,
  testid,
  emptyLabel,
  className = '',
}: {
  src: string;
  alt: string;
  testid: string;
  emptyLabel: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        data-testid={`${testid}-empty`}
        className={`rounded-lg border border-dashed border-[rgba(255,255,255,0.08)] bg-[#0d0d12] p-8 text-center font-mono text-[11px] text-slate-500 leading-relaxed ${className}`}
      >
        <ImageIcon className="h-6 w-6 text-slate-600 mx-auto mb-2" />
        <span>{emptyLabel}</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#08080b] overflow-hidden ${className}`}
      data-testid={testid}
    >
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className="w-full h-auto max-h-[520px] object-contain bg-[#050508]"
      />
      <div className="border-t border-[rgba(255,255,255,0.05)] px-4 py-2 flex items-center gap-2">
        <Eye className="h-3 w-3 text-slate-500" />
        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">{alt}</span>
      </div>
    </div>
  );
}
