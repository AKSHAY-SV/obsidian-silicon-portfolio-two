import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Waves, ZoomIn, ZoomOut, X, Move, RefreshCcw } from 'lucide-react';

interface VerificationModule {
  id: string;
  title: string;
  image: string; // path under /public where the real waveform PNG will live
  notes?: string; // reserved for future notes injection
}

interface VerificationWaveformsProps {
  slug: string; // project slug — used to resolve /public/projects/<slug>/waveforms/<id>.png
}

/**
 * "Functional Verification Waveforms" — an engineering-grade waveform viewer
 * with collapsible accordions per verification module. Every accordion is
 * collapsed by default and holds an empty scalable image slot; when a real
 * PNG is dropped under /public/projects/<slug>/waveforms/, it auto-renders,
 * scales to fit, and can be opened in a fullscreen zoom-and-pan modal.
 *
 * This component intentionally ships NO sample waveforms, decorative graphics
 * or AI-generated visuals — placeholders stay empty until the engineer uploads
 * the real simulation images.
 */
export default function VerificationWaveforms({ slug }: VerificationWaveformsProps) {
  const modules: VerificationModule[] = [
    { id: 'cpu', title: 'CPU Verification' },
    { id: 'sram', title: 'SRAM Verification' },
    { id: 'apb-bus', title: 'APB Bus Verification' },
    { id: 'gpio', title: 'GPIO Verification' },
    { id: 'timer', title: 'Timer Verification' },
    { id: 'uart', title: 'UART Verification' },
    { id: 'spi', title: 'SPI Verification' },
    { id: 'plic', title: 'PLIC Verification' },
    { id: 'memory-decoder', title: 'Memory Decoder Verification' },
    { id: 'complete-soc', title: 'Complete SoC Verification' },
  ].map((m) => {
    const base = (import.meta as any).env.BASE_URL || "/";
    const normalizedBase = base.endsWith("/") ? base : base + "/";
    return { ...m, image: `${normalizedBase}projects/${slug}/waveforms/${m.id}.png` };
  });

  // All accordions closed by default.
  const [openId, setOpenId] = useState<string | null>(null);

  // Fullscreen preview state
  const [preview, setPreview] = useState<{ src: string; alt: string } | null>(null);

  return (
    <div className="mt-2 space-y-4" data-testid="functional-verification-waveforms">
      <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)] pb-2">
        <Waves className="h-4 w-4 text-[#a78bfa]" />
        <h4 className="font-sans text-sm sm:text-base font-black uppercase tracking-wider text-white">
          Functional Verification Waveforms
        </h4>
      </div>

      <div className="space-y-3">
        {modules.map((m) => (
          <VerificationAccordion
            key={m.id}
            module={m}
            isOpen={openId === m.id}
            onToggle={() => setOpenId((prev) => (prev === m.id ? null : m.id))}
            onOpenFullscreen={(src, alt) => setPreview({ src, alt })}
          />
        ))}
      </div>

      <AnimatePresence>
        {preview && (
          <FullscreenViewer
            src={preview.src}
            alt={preview.alt}
            onClose={() => setPreview(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Single Accordion Row
// -----------------------------------------------------------------------------
function VerificationAccordion({
  module: m,
  isOpen,
  onToggle,
  onOpenFullscreen,
}: {
  module: VerificationModule;
  isOpen: boolean;
  onToggle: () => void;
  onOpenFullscreen: (src: string, alt: string) => void;
}) {
  return (
    <div
      data-testid={`verif-accordion-${m.id}`}
      className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0c0c0f] overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`verif-content-${m.id}`}
        data-testid={`verif-toggle-${m.id}`}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#101015] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#a78bfa]/70" />
          <span className="font-sans text-sm sm:text-[15px] font-bold uppercase tracking-wide text-white">
            {m.title}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-[#a78bfa]' : ''
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            id={`verif-content-${m.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-[rgba(255,255,255,0.04)]">
              {/* Waveform slot */}
              <WaveformSlot
                src={m.image}
                alt={`${m.title} — waveform`}
                testid={`waveform-${m.id}`}
                onOpenFullscreen={onOpenFullscreen}
              />

              {/* Verification notes */}
              <div
                data-testid={`verif-notes-${m.id}`}
                className="rounded-lg border border-dashed border-[rgba(255,255,255,0.08)] bg-[#0a0a0e] px-4 py-3"
              >
                <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[#a78bfa] mb-1">
                  // Verification Notes
                </span>
                <p className="font-sans text-xs text-slate-500 leading-relaxed">
                  Technical description, coverage summary, and assertion status for
                  the <span className="text-slate-300 font-semibold">{m.title}</span> block
                  will be added here.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Empty-first Waveform Slot
// -----------------------------------------------------------------------------
function WaveformSlot({
  src,
  alt,
  testid,
  onOpenFullscreen,
}: {
  src: string;
  alt: string;
  testid: string;
  onOpenFullscreen: (src: string, alt: string) => void;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="mt-4 rounded-xl border border-dashed border-[rgba(255,255,255,0.08)] bg-[#08080b] min-h-[280px] flex items-center justify-center overflow-hidden"
      data-testid={`${testid}-slot`}
    >
      {failed || !src ? (
        <div className="text-center px-6 py-10 space-y-2">
          <Waves className="h-8 w-8 text-slate-700 mx-auto" />
          <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
            Waveform image pending upload
          </p>
          <p className="font-sans text-[11px] text-slate-600 max-w-md mx-auto">
            Drop the real simulation capture at{' '}
            <span className="text-slate-400 font-semibold">{src}</span> to render it here.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onOpenFullscreen(src, alt)}
          data-testid={`${testid}-open`}
          className="w-full flex items-center justify-center p-4 group cursor-zoom-in"
          aria-label={`Open ${alt} in fullscreen viewer`}
        >
          <img
            src={src}
            alt={alt}
            onError={() => setFailed(true)}
            className="max-w-full max-h-[520px] w-auto h-auto object-contain group-hover:opacity-95 transition-opacity"
          />
        </button>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Fullscreen Viewer with Zoom + Pan
// -----------------------------------------------------------------------------
function FullscreenViewer({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setScale((s) => clamp(s + 0.25, 0.25, 6));
      if (e.key === '-' || e.key === '_') setScale((s) => clamp(s - 0.25, 0.25, 6));
      if (e.key === '0') {
        setScale(1);
        setOffset({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', onKey);
    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale((s) => clamp(s + delta, 0.25, 6));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    isDragging.current = true;
    start.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setOffset({
      x: start.current.ox + (e.clientX - start.current.x),
      y: start.current.oy + (e.clientY - start.current.y),
    });
  };
  const endDrag = () => {
    isDragging.current = false;
  };

  const reset = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      data-testid="waveform-fullscreen"
      className="fixed inset-0 z-[100] bg-[#050508]/95 backdrop-blur-md flex flex-col"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-6 py-3 border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0e]/80">
        <span className="font-mono text-[11px] uppercase tracking-widest text-[#a78bfa] truncate">
          {alt}
        </span>
        <div className="flex items-center gap-2">
          <ZoomButton
            onClick={() => setScale((s) => clamp(s - 0.25, 0.25, 6))}
            aria="Zoom out"
            testid="zoom-out"
          >
            <ZoomOut className="h-4 w-4" />
          </ZoomButton>
          <span className="font-mono text-[10px] text-slate-400 w-14 text-center">
            {(scale * 100).toFixed(0)}%
          </span>
          <ZoomButton
            onClick={() => setScale((s) => clamp(s + 0.25, 0.25, 6))}
            aria="Zoom in"
            testid="zoom-in"
          >
            <ZoomIn className="h-4 w-4" />
          </ZoomButton>
          <ZoomButton onClick={reset} aria="Reset zoom" testid="zoom-reset">
            <RefreshCcw className="h-4 w-4" />
          </ZoomButton>
          <ZoomButton onClick={onClose} aria="Close" testid="zoom-close">
            <X className="h-4 w-4" />
          </ZoomButton>
        </div>
      </div>

      {/* Image canvas */}
      <div
        className="flex-1 overflow-hidden flex items-center justify-center select-none"
        style={{ cursor: scale > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
          className="pointer-events-none"
        />
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-center gap-4 px-6 py-2 border-t border-[rgba(255,255,255,0.04)] bg-[#0a0a0e]/70 font-mono text-[10px] uppercase tracking-widest text-slate-500">
        <span className="flex items-center gap-1.5">
          <Move className="h-3 w-3" /> drag to pan
        </span>
        <span>scroll to zoom</span>
        <span>ESC to close</span>
      </div>
    </motion.div>
  );
}

function ZoomButton({
  onClick,
  children,
  aria,
  testid,
}: {
  onClick: () => void;
  children: React.ReactNode;
  aria: string;
  testid: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      data-testid={testid}
      className="h-8 w-8 flex items-center justify-center rounded-md border border-[rgba(255,255,255,0.06)] bg-[#121218] text-slate-300 hover:text-white hover:border-[#a78bfa]/40 hover:bg-[#1a1a20] transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}
