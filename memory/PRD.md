# Obsidian Silicon Portfolio — PRD

## Original Problem Statement (latest iteration)
Redesign the site into a professional VLSI / Computer Architecture engineering portfolio.
Remove all Resume references. Clean the home page of filler sections. Redesign the About
page as an engineering profile. Redesign project detail pages to show only engineering
outputs (no code snippets, no AI-generated images, waveforms collapsible). Simplify
navigation. Preserve Firebase, SecurePortal, Admin Dashboard, backend, existing project
data, and theme/animations.

## Tech Stack
- Vite 6 + React 19 (TypeScript)
- Tailwind v4, motion/react, lucide-react
- Express (server.ts), Firebase Auth + Firestore
- Preview served by supervisor `app` on port 3000

## What's Implemented (this session)
### 1. Resume completely removed
- Deleted `src/components/Resume.tsx`.
- `NavTab` no longer includes `'resume'`.
- Removed Resume nav item from `TopNavBar` and Resume link from `Footer`.
- Removed the `resume` route, the Resume view, and the terminal `akshay_resume_signoff.sh` modal in `App.tsx` (plus its state / `handleCopyResumeText`).
- Removed the `resume-pdf` entry from `DOWNLOAD_ASSETS` and cleaned all Resume mentions from `portfolioKnowledge.ts`, `localCopilotEngine.ts`, `CopilotWindow.tsx`, `types/copilot.ts`.

### 2. Home page cleaned
- Removed `EngineeringRoadmap` (Silicon Mastery Roadmap) — component deleted.
- Removed `FeaturedProjects` grid — component deleted.
- Removed the “Academic Contributions & Notes / Hardware Publications” section.
- Removed the “Expertise Matrix / Core Technical Disciplines” section.
- Kept: Hero, Workstation Dashboard, RV32IM Showcase, Design Flow Visualizer, Engineering Toolchain.

### 3. About page redesigned (`src/components/About.tsx`)
Fresh engineering profile with six sections:
1. Engineering Philosophy — 3 pillars.
2. Areas of Expertise — 6 domains (Computer Architecture, Digital & RTL, Physical Design, Verification, FPGA, Analog/Mixed-Signal).
3. Design Flow — 9 numbered stages (Spec → Sign-off → Bring-up).
4. Tools & Technologies — 8 grouped tool categories.
5. Verification Methodology — 6 verification layers.
6. Research Interests — 6 forward-looking areas.

All sub-blocks expose `data-testid`s (`philosophy-*`, `expertise-*`, `flow-step-*`, `tools-*`, `verif-layer-*`, `research-*`).

### 4. Project pages redesigned (`src/components/ProjectDetailPage.tsx`)
Engineering-only layout: Overview, Architecture Specs, Structural Block Diagram, Simulation Results, Waveform Results *(collapsible via `toggle-waveforms`)*, Verification Outputs, Synthesis Reports, Timing Analysis (WNS/TNS), Floorplan & Physical Design, GDS/Layout, Future Improvements.
- No code snippets rendered.
- No AI-generated hero images. Real engineering artifacts are loaded from `/public/projects/<slug>/{block-diagram,simulation,waveform,verification,synthesis,timing,floorplan,layout}.png`. If a file isn’t present, a neutral placeholder describes exactly where to drop it.
- Removed the low-opacity AI image background from `ProjectsLibrary` project header.

### 5. Routing / Navigation
- `ProjectsLibrary` `Open Workspace` button renamed to `Open Project` and now calls a new `onOpenProject(slug)` callback wired from `App.tsx`, which sets `projectSlug` state and lets `ProjectDetailRouter` render the redesigned `ProjectDetailPage`. Fallback URL push preserved.
- `ProjectDetailRouter` now converts any base project into a `ProjectDetail` when it isn’t in `DETAILED_PROJECTS`, ensuring every project has its own page. Uses `specs` as fallback source for the KEY METRICS sidebar.
- `App.tsx` only renders `ProjectsLibrary` when `projectSlug` is null, avoiding double render with the detail page.
- Top nav simplified to Home / About / Projects / Contact / Request Access / Portal, each with `data-testid="nav-link-<id>"`.

### 6. Preserved (untouched)
Firebase (`src/firebase/firebase.ts`), SecurePortal, Admin Login / Dashboard, request/access APIs (`api/*`), backend Express handlers, existing PROJECTS data, theme colors, animations, and Silicon Copilot AI assistant.

## Verification
- `npx vite build` → success (~9s, 2200+ modules).
- Testing agent iteration 2: **12/12 feature checks pass**. Only optional improvements (added `data-testid` on nav links; heading copy note is cosmetic).
- Live preview verified: Home / About (all 6 sections) / Projects list / `/projects/rv32im-core` (base fallback) / `/projects/rv32im-processor` (DETAILED) / `/portal` all render correctly.

## Files Changed
Modified: `src/App.tsx`, `src/components/About.tsx`, `src/components/ProjectDetailPage.tsx`, `src/components/ProjectDetailRouter.tsx`, `src/components/ProjectsLibrary.tsx`, `src/components/TopNavBar.tsx`, `src/components/Footer.tsx`, `src/data.ts`, `src/services/portfolioKnowledge.ts`, `src/services/localCopilotEngine.ts`, `src/components/copilot/CopilotWindow.tsx`, `src/types.ts`, `src/types/copilot.ts`.
Deleted: `src/components/Resume.tsx`, `src/components/FeaturedProjects.tsx`, `src/components/EngineeringRoadmap.tsx`.

## Backlog / Next Actions
- Drop real engineering PNGs (block-diagram, waveform, floorplan, layout, timing, etc.) into `/public/projects/<slug>/` — the ProjectDetailPage will pick them up automatically.
- (Optional) Code-split the 1.7 MB main bundle via `manualChunks`.
- (Optional) Reconcile the “Engineering Workstation” heading copy vs the spec wording “Workstation Dashboard”.

---

## Iteration 3 — Projects Overview Redesign (Card Grid)

### What Changed
- **`src/components/ProjectsLibrary.tsx`** completely rewritten (~180 lines) as a clean `motion.article` grid. Each card shows only: category badge, colour-coded status badge (`project-status-<id>`), title (`project-title-<id>`), one-line tagline, and a single `VIEW PROJECT` button (`view-project-<id>`). No filters, sort bars, folder dropdowns, code files, waveform previews, workspace panels, or `<pre><code>` blocks anywhere on the overview.
- Deleted legacy library-internal workspace components: `ProjectWorkspace.tsx`, `RTLExplorer.tsx`, `ASICFlow.tsx`, `SimPipeline.tsx`, `SimCache.tsx`, `SimMemory.tsx`, `RV32IMSoCDetail.tsx`, `EightBitComputerDetail.tsx`.
- **`src/App.tsx`** — introduced a `navigateTab(tab)` wrapper that clears `projectSlug` on every tab switch (top nav + footer + Copilot + back buttons). This fixes the minor regression where clicking `nav-link-projects` while on a detail page didn't return to the grid.
- Bundle size reduced from ~1.7 MB → ~1.57 MB.

### Verification
- `vite build` → success.
- Testing agent iteration 3 → **100% frontend success**, 5/5 cards present, 5/5 `VIEW PROJECT` buttons wired, no `<pre>`/`<code>` on `/projects`, `rv32im-core` + `rv32im-soc-processor` both navigate to their dedicated detail pages, Portal / About / TopNav all unaffected.

### Preserved
Firebase, SecurePortal, Admin, backend Express handlers, `ProjectDetailPage` (unchanged), `ProjectDetailRouter`, dark theme, motion animations, spacing language.

---

## Iteration 4 — Functional Verification Waveforms Viewer (RV32IM SoC only)

### Scope
Only the Simulation Results section of the **5-Stage Pipelined CPU SoC** project (`rv32im-soc-processor`, also matched by legacy slugs `five-stage-pipeline` / `five-stage-pipe`). No other page, route, backend, Firebase, styling, or navigation touched.

### What Changed
- **New component** `src/components/verification/VerificationWaveforms.tsx` (~350 lines):
  - 10 collapsible accordions (all closed by default, single-open behaviour): `cpu`, `sram`, `apb-bus`, `gpio`, `timer`, `uart`, `spi`, `plic`, `memory-decoder`, `complete-soc`.
  - Each accordion contains one large empty centered `WaveformSlot` — no sample or AI graphic — with copy “Waveform image pending upload”. When a real PNG is dropped at `/public/projects/rv32im-soc-processor/waveforms/<id>.png` the slot auto-populates, scales while preserving aspect ratio, and becomes clickable.
  - Clicking the populated waveform opens a full-screen `FullscreenViewer` with zoom (buttons, `+/-`, mousewheel), pan (mouse drag when zoom > 100 %), reset (`0` key), and `Esc` to close.
  - Below every waveform slot a small `Verification Notes` dashed-border card is rendered as the future notes home.
  - Accessibility: accordion buttons carry `aria-expanded` and `aria-controls`; content panels have matching `id="verif-content-<id>"`.
- **Integration**: `src/components/ProjectDetailPage.tsx` imports the new component and renders it only when the current project’s slug is in `FIVE_STAGE_SOC_SLUGS`. Placement is the tail of Section 04 (Simulation Results), so the existing simulation copy and slot remain intact.

### Verification
- `vite build` → success.
- Testing agent iteration 4 → **100 % frontend pass**. All 10 accordions in the exact required order, all collapsed by default, single-open toggling verified, empty-first placeholder confirmed with zero `<img>` in unpopulated slots, guarded off for other projects (`/projects/rv32im-core` has 0 subsection instances), rest of the ProjectDetailPage and TopNav untouched.

### Upload Instructions
Drop the real simulation captures at these exact paths (any PNG/JPG that can be scaled by the browser):
```
/public/projects/rv32im-soc-processor/waveforms/cpu.png
/public/projects/rv32im-soc-processor/waveforms/sram.png
/public/projects/rv32im-soc-processor/waveforms/apb-bus.png
/public/projects/rv32im-soc-processor/waveforms/gpio.png
/public/projects/rv32im-soc-processor/waveforms/timer.png
/public/projects/rv32im-soc-processor/waveforms/uart.png
/public/projects/rv32im-soc-processor/waveforms/spi.png
/public/projects/rv32im-soc-processor/waveforms/plic.png
/public/projects/rv32im-soc-processor/waveforms/memory-decoder.png
/public/projects/rv32im-soc-processor/waveforms/complete-soc.png
```
After upload, each corresponding accordion auto-renders the image; clicking it launches the zoom/pan viewer.

---

## Iteration 5 — Real Block Diagram uploaded (RV32IM SoC)

- Uploaded engineer-provided PNG to `/app/public/projects/rv32im-soc-processor/block-diagram.png` (~676 KB). Auto-picked up by `ArtifactImage` in Section 03 (Structural Block Diagram) at URL `/projects/rv32im-soc-processor/block-diagram.png`.
- **`ProjectDetailPage.tsx`** — Section 03 image source hardened: `project.diagram` is now only honoured when it looks like a URL (`http(s)://` or starts with `/`); otherwise the path derived from `artifact('block-diagram.png')` is used. This prevents legacy `ProjectDetail.diagram` description strings from becoming broken `<img src>`s across DETAILED_PROJECTS entries.
- No other page/backend touched.
