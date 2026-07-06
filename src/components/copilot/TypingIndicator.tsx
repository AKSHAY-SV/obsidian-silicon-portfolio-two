import React from "react";
import { motion } from "motion/react";

export default function TypingIndicator() {
  return (
    <div id="copilot-typing-indicator" className="flex items-center gap-1.5 py-2 px-3 rounded-2xl bg-zinc-900 border border-zinc-800 w-fit">
      <span className="text-xs text-zinc-400 font-mono mr-1">Analyzing</span>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-purple-500"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
