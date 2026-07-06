import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { Copy, Check, Terminal, Cpu, Clock, Compass, Pin } from "lucide-react";
import { CopilotMessage } from "../../types/copilot";

interface MessageBubbleProps {
  message: CopilotMessage;
  onFollowUpClick: (q: string) => void;
  onPinToggle?: (id: string) => void;
  isPinned?: boolean;
}

export default function MessageBubble({ message, onFollowUpClick, onPinToggle, isPinned = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === "assistant";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      id={`message-${message.id}`}
      className={`flex flex-col gap-1 w-full ${isAssistant ? "items-start" : "items-end"}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex items-center gap-2 text-[10px] text-zinc-500 font-mono ${isAssistant ? "ml-1.5" : "mr-1.5"}`}>
        {isAssistant ? (
          <>
            <Cpu className="h-3 w-3 text-purple-400" />
            <span>Silicon Copilot</span>
          </>
        ) : (
          <span>User</span>
        )}
        <span className="text-zinc-600">•</span>
        <Clock className="h-3 w-3 text-zinc-600" />
        <span>{message.timestamp}</span>
      </div>

      <div className="flex gap-2.5 max-w-[90%] group relative">
        {isAssistant && (
          <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-purple-950/40 border border-purple-800/30 flex items-center justify-center text-purple-400">
            <Terminal className="h-4 w-4 animate-pulse" />
          </div>
        )}

        <div
          className={`rounded-2xl p-4 text-sm leading-relaxed border ${
            isAssistant
              ? "bg-zinc-900/80 border-zinc-800/80 text-zinc-200"
              : "bg-purple-950/20 border-purple-900/40 text-purple-200"
          }`}
        >
          {isAssistant ? (
            <div className="prose prose-invert prose-xs max-w-none text-zinc-300 font-sans space-y-3">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-sm font-semibold text-zinc-100 font-display mt-2 mb-1">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xs font-semibold text-zinc-100 font-display mt-2 mb-1">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xs font-medium text-zinc-200 mt-1">{children}</h3>,
                  p: ({ children }) => <p className="mb-2 leading-relaxed text-zinc-300">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-zinc-300">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-zinc-300">{children}</ol>,
                  li: ({ children }) => <li className="text-xs">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-purple-300">{children}</strong>,
                  code: ({ inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match && !children.includes("\n");
                    return isInline ? (
                      <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-purple-300 font-mono text-[11px]" {...props}>
                        {children}
                      </code>
                    ) : (
                      <div className="relative my-2 rounded-lg overflow-hidden border border-zinc-800/60 bg-zinc-950/80 font-mono text-[11px]">
                        <div className="flex justify-between items-center px-3 py-1 bg-zinc-900/60 border-b border-zinc-800/40 text-[10px] text-zinc-500">
                          <span>{match ? match[1].toUpperCase() : "RTL"}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ""))}
                            className="text-zinc-500 hover:text-zinc-300 transition-colors"
                            title="Copy code block"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                        <pre className="p-3 overflow-x-auto text-zinc-300">
                          <code {...props}>{children}</code>
                        </pre>
                      </div>
                    );
                  },
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2 rounded-lg border border-zinc-800/80">
                      <table className="min-w-full divide-y divide-zinc-800 text-[11px] font-sans">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-zinc-900/40">{children}</thead>,
                  tbody: ({ children }) => <tbody className="divide-y divide-zinc-800/40 bg-transparent">{children}</tbody>,
                  tr: ({ children }) => <tr>{children}</tr>,
                  th: ({ children }) => <th className="px-3 py-2 text-left font-mono font-medium text-zinc-400">{children}</th>,
                  td: ({ children }) => <td className="px-3 py-1.5 text-zinc-300">{children}</td>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="font-sans text-xs whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Pin bubble content floating overlay button */}
          {isAssistant && onPinToggle && (
            <button
              onClick={() => onPinToggle(message.id)}
              className={`absolute top-2 right-10 p-1.5 rounded-lg border transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                isPinned
                  ? "bg-purple-950/60 border-purple-800/40 text-yellow-400"
                  : "bg-zinc-950/60 border-zinc-800/40 text-zinc-500 hover:text-yellow-400"
              }`}
              title={isPinned ? "Unpin message" : "Pin response for reference"}
            >
              <Pin className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Copy bubble content floating overlay button */}
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800/40 text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="Copy message"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Renders dynamic sources citation badges */}
      {isAssistant && message.sources && message.sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1 ml-11">
          <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1 self-center">
            <Compass className="h-2.5 w-2.5" /> Sources:
          </span>
          {message.sources.map((src, idx) => (
            <span
              key={idx}
              className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-purple-400 border border-zinc-800/60"
            >
              {src}
            </span>
          ))}
        </div>
      )}

      {/* Suggested follows under specific assistant responses */}
      {isAssistant && message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
        <div className="flex flex-col gap-1 mt-2 ml-11 max-w-[80%]">
          {message.suggestedFollowUps.map((followUp, idx) => (
            <button
              key={idx}
              onClick={() => onFollowUpClick(followUp)}
              className="text-left text-xs text-purple-400 hover:text-purple-300 bg-zinc-950/20 hover:bg-purple-950/10 border border-zinc-900 hover:border-purple-900/40 px-3 py-1.5 rounded-xl transition-all duration-200"
            >
              {followUp}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
