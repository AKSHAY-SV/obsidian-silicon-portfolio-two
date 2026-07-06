import React from "react";
import { motion } from "motion/react";
import { Sparkles, Terminal } from "lucide-react";

interface SuggestionCardProps {
  question: string;
  onClick: (q: string) => void;
}

export default function SuggestionCard({ question, onClick }: SuggestionCardProps) {
  return (
    <motion.button
      id={`suggestion-card-${question.replace(/\s+/g, "-").toLowerCase()}`}
      onClick={() => onClick(question)}
      className="group flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900/60 hover:bg-purple-950/20 border border-zinc-800 hover:border-purple-800/40 text-left transition-all duration-300 w-full"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex-shrink-0 mt-0.5 rounded-md p-1 bg-zinc-800 group-hover:bg-purple-900/40 text-zinc-400 group-hover:text-purple-400 transition-colors">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-zinc-300 group-hover:text-zinc-100 font-sans leading-relaxed">
          {question}
        </p>
      </div>
    </motion.button>
  );
}
