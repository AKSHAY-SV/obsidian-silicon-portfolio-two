import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Cpu } from 'lucide-react';
import { PROJECTS } from '../data';
import { Project } from '../types';

interface ProjectsLibraryProps {
  projects?: Project[];
  setActiveTab?: (tab: string | any) => void;
  onOpenProject?: (slug: string) => void;
}

/**
 * Projects overview page — clean grid of project cards.
 *
 * Each card shows only:
 *   • Project title
 *   • One-line short description
 *   • Status badge (Completed / In Progress / Tapeout Ready …)
 *   • "View Project" button that routes to the dedicated ProjectDetailPage.
 *
 * No expanded rows, no code files, no filters, no dropdowns, no verification
 * blocks — those live exclusively on the dedicated project page.
 */
export default function ProjectsLibrary({ projects, setActiveTab, onOpenProject }: ProjectsLibraryProps = {}) {
  const [projectsList, setProjectsList] = useState<Project[]>(projects || PROJECTS);

  // Sync when parent passes new projects (App.tsx also fetches projects.json).
  useEffect(() => {
    if (projects && projects.length > 0) setProjectsList(projects);
  }, [projects]);

  // Best-effort dynamic fetch — mirrors the previous library behaviour so the
  // page still loads when the parent hasn't supplied a projects array.
  useEffect(() => {
    if (projects && projects.length > 0) return;
    fetch('/projects/projects.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProjectsList(data);
      })
      .catch(() => {
        setProjectsList(PROJECTS);
      });
  }, []);

  const handleOpen = (proj: Project) => {
    const slug = (proj as any).slug || proj.id;
    if (onOpenProject) {
      onOpenProject(slug);
      return;
    }
    // URL fallback so deep-link navigation still works.
    window.history.pushState({ tab: 'projects', slug }, '', `/projects/${slug}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const card = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <div className="py-16 text-slate-100" id="projects-page">
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12"
      >
        {/* Page header */}
        <motion.div variants={card} className="space-y-3 border-b border-[rgba(255,255,255,0.06)] pb-8">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#a78bfa] flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#a78bfa] animate-pulse" />
            // ENGINEERING PROJECTS
          </span>
          <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
            Silicon
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] via-[#c084fc] to-[#e879f9]">
              {' '}Design Portfolio
            </span>
          </h1>
          <p className="max-w-3xl font-sans text-sm sm:text-base text-slate-400 leading-relaxed">
            A curated selection of digital, verification and physical-design projects. Open any card to
            see the full engineering write-up, waveforms, reports and layout artifacts.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsList.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              variants={card}
              onOpen={() => handleOpen(proj)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Project Card
// -----------------------------------------------------------------------------

function ProjectCard({
  project,
  variants,
  onOpen,
}: {
  project: Project;
  variants: any;
  onOpen: () => void;
}) {
  const anyP = project as any;
  const status = anyP.status || 'Tapeout Ready';
  const badge = statusStyle(status);

  return (
    <motion.article
      variants={variants}
      whileHover={{ y: -4, borderColor: 'rgba(167, 139, 250, 0.35)' }}
      transition={{ duration: 0.2 }}
      data-testid={`project-card-${project.id}`}
      className="group relative flex h-full flex-col rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#0c0c10] p-6 overflow-hidden hover:bg-[#101015] transition-colors"
    >
      {/* Purple accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#a78bfa]/40 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />

      {/* Category + status row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#a78bfa] bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded px-2 py-0.5">
          <Cpu className="h-3 w-3" />
          {project.category}
        </span>
        <span
          data-testid={`project-status-${project.id}`}
          className={`font-mono text-[9px] font-bold uppercase tracking-wider rounded px-2 py-0.5 border ${badge}`}
        >
          {status}
        </span>
      </div>

      {/* Title */}
      <h3
        className="font-sans text-lg sm:text-xl font-black tracking-tight text-white uppercase leading-tight mb-3 group-hover:text-[#e9d5ff] transition-colors"
        data-testid={`project-title-${project.id}`}
      >
        {project.name}
      </h3>

      {/* One-line short description (falls back to tagline). */}
      {project.tagline && (
        <p className="font-sans text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2 mb-6">
          {project.tagline}
        </p>
      )}

      {/* Spacer so button always sits at the bottom */}
      <div className="flex-1" />

      {/* View Project button */}
      <button
        onClick={onOpen}
        data-testid={`view-project-${project.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#5b21b6] to-[#7c3aed] border border-[#a78bfa]/40 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-[#5b21b6]/25 cursor-pointer"
      >
        View Project
        <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
    </motion.article>
  );
}

function statusStyle(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('progress'))
    return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
  if (s.includes('complete') || s.includes('tapeout') || s.includes('verified'))
    return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
  return 'text-slate-300 bg-slate-500/10 border-slate-500/20';
}
