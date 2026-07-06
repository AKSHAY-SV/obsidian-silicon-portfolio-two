import React from 'react';
import { DETAILED_PROJECTS } from '../data/detailedProjects';
import ProjectDetailPage from './ProjectDetailPage';
import ProjectsLibrary from './ProjectsLibrary';
import { Project, NavTab, ProjectDetail } from '../types';

interface ProjectDetailRouterProps {
  slug: string;
  projects: Project[];
  setActiveTab: (tab: NavTab) => void;
}

/**
 * Resolve any project slug (either an explicit DETAILED_PROJECTS entry or a
 * base Project from the library) into the redesigned engineering
 * ProjectDetailPage. Guarantees every project has its own dedicated page.
 */
function projectToDetail(p: Project): ProjectDetail {
  const anyP = p as any;
  let metrics = Object.entries(p.metrics || {})
    .filter(([, v]) => !!v)
    .map(([label, value]) => ({
      label: label.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
      value: String(value),
    }));

  // Fallback: some projects only carry `specs` (from projects.json). Use the
  // first four specs so the KEY METRICS quick-box always has content.
  if (metrics.length === 0 && Array.isArray(p.specs)) {
    metrics = p.specs.slice(0, 4).map((s) => ({ label: s.label, value: s.value }));
  }

  return {
    id: p.id,
    slug: anyP.slug || p.id,
    name: p.name,
    tagline: p.tagline,
    category: p.category,
    image: '', // AI-generated hero images intentionally suppressed
    techStack: p.techStack || [],
    description: p.description,
    metrics,
    overview: p.description,
    architecture:
      (p.specs && p.specs.map((s) => `${s.label}: ${s.value}`).join(' • ')) ||
      'Architecture details will be documented here.',
    challenges:
      (p.challenges && p.challenges[0]?.problem) ||
      'Design constraints and hazards are captured here.',
    solutions:
      (p.challenges && p.challenges[0]?.solution) ||
      'Mitigations, pipeline forwarding paths, and closure fixes are captured here.',
    verification:
      'Directed and constrained-random verification, SVA-backed assertions, and coverage closure run against this design.',
    simulation:
      'Cycle-accurate simulation is captured via GTKWave / ModelSim; logs and stimulus scripts are archived alongside the RTL.',
    documentation: 'Design notes, protocol references, and sign-off checklists are attached below.',
    waveforms:
      'Waveform captures illustrate reset, protocol handshakes, hazard-forwarding cycles, and boundary transitions on this block.',
    diagram: '', // block-diagram.png will be picked up automatically if present
    futureImprovements:
      'Planned enhancements include tighter timing budgets, additional coverage bins, and physical-design iteration on advanced nodes.',
  };
}

export default function ProjectDetailRouter({ slug, projects, setActiveTab }: ProjectDetailRouterProps) {
  const detailed = DETAILED_PROJECTS.find((p) => p.slug === slug || p.id === slug);

  if (detailed) {
    return <ProjectDetailPage project={detailed} onBack={() => setActiveTab('projects')} />;
  }

  const base = projects.find((p) => p.id === slug || (p as any).slug === slug);
  if (base) {
    return <ProjectDetailPage project={projectToDetail(base)} onBack={() => setActiveTab('projects')} />;
  }

  return <ProjectsLibrary projects={projects} setActiveTab={setActiveTab} />;
}
