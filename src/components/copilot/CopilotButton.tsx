import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquareCode, Sparkles } from "lucide-react";

interface CopilotButtonProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function CopilotButton({ isOpen, setIsOpen }: CopilotButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Pulse Outer Glowing Rings */}
      {!isOpen && (
        <>
          <span className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-xl animate-pulse" />
          <span className="absolute -inset-1.5 rounded-2xl border border-purple-500/30 animate-ping opacity-30 pointer-events-none" style={{ animationDuration: "3s" }} />
        </>
      )}

      <motion.button
        id="copilot-launcher-button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-300 shadow-[0_8px_32px_rgba(168,85,247,0.25)] hover:shadow-[0_12px_40px_rgba(168,85,247,0.4)] ${
          isOpen
            ? "bg-zinc-900 border-zinc-800 text-purple-400"
            : "bg-gradient-to-tr from-purple-600 via-purple-700 to-fuchsia-600 border-purple-500/50 text-white hover:scale-105 active:scale-95"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Silicon Copilot AI Assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="open"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquareCode className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="closed"
              className="relative"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquareCode className="h-6 w-6" />
              <div className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-zinc-950 flex items-center justify-center border border-purple-500/30">
                <Sparkles className="h-2 w-2 text-purple-300 animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
