import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, X, Trash2, Cpu, Sparkles, Terminal, ShieldAlert, Zap, BarChart2, MessageSquare, 
  CornerDownLeft, Play, RefreshCw, Pin, Search, FileDown, Activity, FileText, 
  CheckSquare, Layers, Settings, HelpCircle, Maximize2, Minimize2, BookOpen, Compass
} from "lucide-react";
import { SUGGESTED_QUESTIONS } from "../../hooks/useCopilot";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import SuggestionCard from "./SuggestionCard";
import { PipelineDiagram, SoCDiagram, CoherenceDiagram } from "./ArchitectureDiagrams";

interface CopilotWindowProps {
  copilotState: {
    messages: any[];
    isOpen: boolean;
    isLoading: boolean;
    error: string | null;
    analytics: any;
    setIsOpen: (open: boolean) => void;
    sendMessage: (content: string) => Promise<void>;
    stopGeneration: () => void;
    clearConversation: () => void;
    regenerateLastResponse: () => void;
    
    // Upgraded Workspace states
    workspaceMode: 'compact' | 'fullscreen' | null;
    setWorkspaceMode: (mode: 'compact' | 'fullscreen' | null) => void;
    selectedMode: string;
    setSelectedMode: (mode: string) => void;
    pinnedMessages: string[];
    togglePinMessage: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    
    // Session context stats
    visitedPages: string[];
    openedProjects: string[];
    researchArticlesViewed: string[];
    searches: string[];
    currentProject: string;
  };
}

export default function CopilotWindow({ copilotState }: CopilotWindowProps) {
  const {
    messages,
    isOpen,
    isLoading,
    error,
    analytics,
    setIsOpen,
    sendMessage,
    stopGeneration,
    clearConversation,
    regenerateLastResponse,
    
    // Upgraded Workspace states
    workspaceMode,
    setWorkspaceMode,
    selectedMode,
    setSelectedMode,
    pinnedMessages,
    togglePinMessage,
    searchQuery,
    setSearchQuery,
    
    // Session context stats
    visitedPages,
    openedProjects,
    researchArticlesViewed,
    searches,
    currentProject,
  } = copilotState;

  const [input, setInput] = useState("");
  const [showAnalyticsTab, setShowAnalyticsTab] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleSuggestionClick = (question: string) => {
    sendMessage(question);
  };

  const isFullscreen = workspaceMode === 'fullscreen';

  // Search inside conversation logic
  const filteredMessages = searchQuery.trim() === ""
    ? messages
    : messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()));

  // Context-Aware Suggestions based on explored elements
  const getContextSuggestions = () => {
    const list: string[] = [];
    if (currentProject.includes("RV32IM") || visitedPages.includes("home")) {
      list.push("Pipeline Hazards & Forwarding on RV32IM");
      list.push("How does the M-extension multiplier optimize integer division?");
    }
    if (openedProjects.includes("RV32IM SoC – 5-Stage Pipelined RISC-V Processor") || currentProject.includes("rv32im-soc")) {
      list.push("RV32IM SoC Area & TSMC 7nm Tapeout");
      list.push("AXI4 Crossbar Interconnect arbitration rules");
    }
    if (visitedPages.includes("research")) {
      list.push("Summarize the main semiconductor breakthrough from the research");
    }
    // Default fallback questions to keep interface active
    if (list.length < 3) {
      list.push("Tell me about the synthesizable RV32IM Processor Core.");
      list.push("What is the RV32IM SoC designed by Akshay?");
      list.push("Which EDA and FPGA design tools does Akshay use?");
    }
    return Array.from(new Set(list)).slice(0, 3);
  };

  // Welcome Screen (First Launch Experience)
  if (workspaceMode === null) {
    return (
      <motion.div
        id="copilot-welcome-modal"
        className="fixed bottom-24 right-6 w-[440px] max-w-[calc(100vw-3rem)] h-[620px] max-h-[calc(100vh-8rem)] rounded-3xl backdrop-blur-xl bg-zinc-950/95 border border-purple-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_40px_rgba(168,85,247,0.2)] flex flex-col overflow-hidden z-50 font-sans p-6 text-center justify-between"
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center space-y-4 my-auto">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-purple-900/40 to-zinc-900 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <Cpu className="h-9 w-9 animate-pulse text-purple-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-ping" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold font-display text-zinc-100 tracking-tight">
              Akshay's Engineering Workspace
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Flagship AI Architecture & RTL Assistant
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60 max-w-sm text-left">
            <p className="text-xs leading-relaxed text-zinc-300">
              Welcome to the workspace. I am fully integrated into the portfolio state to explain every pipeline register, tapeout logic block, and certification. Choose your interface:
            </p>
          </div>
        </div>

        <div className="space-y-3 mt-auto">
          <button
            onClick={() => setWorkspaceMode("fullscreen")}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide uppercase transition-all duration-300 cursor-pointer shadow-[0_4px_20px_rgba(168,85,247,0.3)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.5)] transform hover:-translate-y-0.5"
          >
            Launch Full Screen Workspace (Recommended)
          </button>
          
          <button
            onClick={() => setWorkspaceMode("compact")}
            className="w-full py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-medium text-xs tracking-wide uppercase transition-all duration-300 cursor-pointer"
          >
            Continue in Compact Mode
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      id="copilot-window"
      className={
        isFullscreen
          ? "fixed inset-4 md:inset-8 lg:inset-12 w-auto max-w-none h-auto max-h-none rounded-3xl backdrop-blur-xl bg-zinc-950/95 border border-purple-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(168,85,247,0.15)] flex flex-row overflow-hidden z-50 font-sans"
          : "fixed bottom-24 right-6 w-[440px] max-w-[calc(100vw-3rem)] h-[620px] max-h-[calc(100vh-8rem)] rounded-3xl backdrop-blur-xl bg-zinc-950/90 border border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(168,85,247,0.15)] flex flex-col overflow-hidden z-50 font-sans"
      }
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      
      {/* 1. LEFT SIDEBAR PANEL (Only rendered if Fullscreen) */}
      {isFullscreen && (
        <div className="w-80 border-r border-zinc-850 p-5 hidden lg:flex flex-col space-y-6 bg-zinc-950/40">
          <div>
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-purple-400" />
              Selected Engineering Mode
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {["RTL Engineer", "ASIC Engineer", "Embedded Engineer", "Student", "Recruiter", "Interviewer"].map(mode => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-3 py-2 text-left rounded-xl border text-[10px] font-mono font-bold transition-all duration-300 ${
                    selectedMode === mode
                      ? "bg-purple-950/30 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                      : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:border-zinc-700/80 hover:text-zinc-200"
                  }`}
                >
                  {mode.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-5 pr-1 scrollbar-thin">
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-800/40 pb-2">
              <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              Session Memory State
            </h4>

            {/* Visited Channels */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-zinc-600 block">VISITED_CHANNELS</span>
              <div className="flex flex-wrap gap-1">
                {visitedPages.length === 0 ? (
                  <span className="text-[10px] font-mono text-zinc-600 italic">None registered</span>
                ) : (
                  visitedPages.map(page => (
                    <span key={page} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-400 capitalize">
                      {page}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Explored Silicon */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-zinc-600 block">EXPLORED_SILICON</span>
              <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                {openedProjects.length === 0 ? (
                  <span className="text-zinc-600 italic">None registered</span>
                ) : (
                  openedProjects.map(proj => (
                    <div key={proj} className="flex items-center gap-1.5 text-purple-300">
                      <span>↳</span> <span className="truncate">{proj}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Expanded Papers */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-zinc-600 block">RESEARCH_PAPERS_EXPANDED</span>
              <div className="space-y-1 text-[10px] font-mono text-zinc-400">
                {researchArticlesViewed.length === 0 ? (
                  <span className="text-zinc-600 italic">None registered</span>
                ) : (
                  researchArticlesViewed.map(paper => (
                    <div key={paper} className="flex items-start gap-1 text-emerald-400">
                      <span className="shrink-0">✓</span> <span className="line-clamp-2 leading-tight">{paper}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Session Summary Card */}
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-2">
              <span className="text-[9px] font-mono text-zinc-500 block">SESSION_SUMMARY</span>
              <div className="text-[10px] leading-relaxed text-zinc-400 space-y-1">
                <p>• Conversations parsed: <strong className="text-white">{messages.length}</strong> nodes</p>
                <p>• Active context: <strong className="text-purple-400">{currentProject || "General Silicon Portfolio"}</strong></p>
                <p>• Diagnostics: <span className="text-emerald-500">Normal</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800/40">
            <button
              onClick={clearConversation}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-red-950/20 border border-zinc-800 hover:border-red-900/40 text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear Workspace Memory
            </button>
          </div>
        </div>
      )}

      {/* 2. MIDDLE PANEL (Active Conversational Core) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950/30">
        
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-850 bg-zinc-900/20">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="h-9 w-9 rounded-xl bg-purple-900/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Cpu className="h-5 w-5 animate-pulse" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-ping" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold font-display text-zinc-100 flex items-center gap-1.5">
                Silicon Copilot
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300">
                  v1.5
                </span>
                {isFullscreen && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
                    Full Workspace
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono">
                {showAnalyticsTab ? "System Diagnostic Monitor" : `Active mode: ${selectedMode}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Analytics monitor Toggle */}
            <button
              onClick={() => setShowAnalyticsTab(!showAnalyticsTab)}
              className={`p-2 rounded-xl border transition-all duration-200 ${
                showAnalyticsTab
                  ? "bg-purple-950/40 border-purple-800/40 text-purple-400"
                  : "bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
              title="Local Analytics Diagnostic Monitor"
            >
              <BarChart2 className="h-4 w-4" />
            </button>

            {/* Toggle Workspace Layout Size */}
            <button
              onClick={() => setWorkspaceMode(isFullscreen ? "compact" : "fullscreen")}
              className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-all duration-200"
              title={isFullscreen ? "Return to Compact View" : "Expand to Full Screen Workspace"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            {/* Minimize / Hide Assist button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-all duration-200"
              title="Minimize"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* CHAT DISPLAY SCREEN */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" ref={scrollContainerRef}>
          <AnimatePresence mode="wait">
            {showAnalyticsTab ? (
              /* ANALYTICS TERMINAL VIEW */
              <motion.div
                key="analytics"
                className="space-y-4 font-mono text-xs text-zinc-400 h-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 text-purple-400 border-b border-zinc-800/40 pb-2 mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-semibold text-zinc-300">COPILOT_DIAGNOSTICS.sh</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <div className="text-zinc-500 text-[10px]">TOTAL_INTERACTIONS</div>
                    <div className="text-xl font-bold font-sans text-purple-400 mt-1">
                      {analytics.interactionsCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <div className="text-zinc-500 text-[10px]">AVG_CONV_LENGTH</div>
                    <div className="text-xl font-bold font-sans text-purple-400 mt-1">
                      {analytics.averageConversationLength} <span className="text-xs font-mono text-zinc-500">msgs</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 space-y-2.5">
                  <div className="text-zinc-400 text-[11px] border-b border-zinc-800/60 pb-1.5 font-sans font-medium flex items-center justify-between">
                    <span>MOST REFERENCED PROJECTS</span>
                    <span className="text-[9px] text-zinc-600 font-mono">COUNT</span>
                  </div>
                  {analytics.popularProjects.length === 0 ? (
                    <div className="text-[11px] text-zinc-600 italic py-1">No references registered yet.</div>
                  ) : (
                    <div className="space-y-1.5">
                      {analytics.popularProjects.map((p: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-[11px]">
                          <span className="text-purple-300">↳ {p.projectName}</span>
                          <span className="text-zinc-500">{p.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 space-y-2.5">
                  <div className="text-zinc-400 text-[11px] border-b border-zinc-800/60 pb-1.5 font-sans font-medium flex items-center justify-between">
                    <span>POPULAR USER QUERIES</span>
                    <span className="text-[9px] text-zinc-600 font-mono">COUNT</span>
                  </div>
                  {analytics.mostAskedQuestions.length === 0 ? (
                    <div className="text-[11px] text-zinc-600 italic py-1">No questions captured yet.</div>
                  ) : (
                    <div className="space-y-1.5">
                      {analytics.mostAskedQuestions.map((q: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-start text-[11px] gap-4">
                          <span className="text-zinc-300 truncate">↳ "{q.question}"</span>
                          <span className="text-zinc-500 flex-shrink-0">{q.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-zinc-600 flex items-center gap-1.5 pt-2">
                  <Zap className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                  <span>Gemini API Stream Client: OK (gemini-3.5-flash)</span>
                </div>
              </motion.div>
            ) : filteredMessages.length === 0 ? (
              /* EMPTY CONVERSATION SMART GREETING VIEW */
              <motion.div
                key="empty"
                className="flex flex-col items-center justify-center text-center h-full py-6 space-y-6 max-w-xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-purple-900/30 to-zinc-900 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                    <Cpu className="h-8 w-8 animate-pulse text-purple-400" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h4 className="text-base font-bold font-display text-zinc-100">
                      Welcome to Akshay's Engineering Workspace
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                      I can explain every engineering project, architecture decision, research article and technical skill showcased in this portfolio. What would you like to explore today?
                    </p>
                  </div>
                </div>

                {/* BENTO GRID SUGGESTED TOPICS */}
                <div className="w-full space-y-3">
                  <div className="text-[10px] text-zinc-500 font-mono text-left tracking-wider uppercase ml-1 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
                    Context-Aware Suggestions
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {getContextSuggestions().map((question, idx) => (
                      <SuggestionCard
                        key={idx}
                        question={question}
                        onClick={handleSuggestionClick}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ACTIVE CONVERSATION MESSAGES */
              <motion.div
                key="chat"
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {filteredMessages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onFollowUpClick={handleSuggestionClick}
                    onPinToggle={togglePinMessage}
                    isPinned={pinnedMessages.includes(message.id)}
                  />
                ))}

                {isLoading && messages[messages.length - 1]?.content === "" && (
                  <TypingIndicator />
                )}

                {error && (
                  <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-900/40 text-red-400 text-xs flex items-start gap-2.5">
                    <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-400" />
                    <div className="space-y-1">
                      <p className="font-semibold font-display">Connection Interrupted</p>
                      <p className="text-red-400/80 leading-relaxed">{error}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* INPUT FORM FOOTER CONTROLS */}
        <div className="p-4 border-t border-zinc-850 bg-zinc-900/10">
          
          {/* Subtle Proactive suggestions triggers */}
          {!isLoading && messages.length > 0 && !showAnalyticsTab && (
            <div className="mb-2 flex items-center justify-start gap-1">
              {currentProject !== "" && !messages[messages.length-1].content.includes("walkthrough") && (
                <button
                  onClick={() => sendMessage(`I noticed you've been exploring my ${currentProject}. Would you like a walkthrough of the pipeline?`)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-800/40 text-purple-300 hover:bg-purple-900/40 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 text-purple-400 animate-pulse" />
                  Pipeline Walkthrough Suggestion
                </button>
              )}
              {openedProjects.length >= 2 && (
                <button
                  onClick={() => sendMessage("Compare the physical implementation and power footprints of the designs.")}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 hover:bg-indigo-900/40 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Layers className="h-3 w-3 text-indigo-400" />
                  Compare Mapped Projects
                </button>
              )}
            </div>
          )}

          {!showAnalyticsTab && (
            <form onSubmit={handleSubmit} className="flex gap-2 relative items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Query hardware design capabilities..."
                disabled={isLoading}
                className="flex-1 bg-zinc-900 hover:bg-zinc-850/80 focus:bg-zinc-900 text-zinc-100 placeholder-zinc-500 text-xs rounded-2xl pl-4 pr-11 py-3.5 border border-zinc-800 hover:border-zinc-700/80 focus:border-purple-800/60 focus:outline-none transition-all"
              />

              <div className="absolute right-2 flex items-center gap-1">
                {isLoading ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    className="p-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-purple-100 hover:text-white transition-colors cursor-pointer"
                    title="Stop generating"
                  >
                    <motion.div
                      className="h-3 w-3 bg-white"
                      animate={{ scale: [1, 0.8, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      input.trim()
                        ? "bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                        : "bg-zinc-800/40 text-zinc-600 cursor-not-allowed"
                    }`}
                    title="Send message"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </form>
          )}

          {showAnalyticsTab && (
            <div className="text-center">
              <button
                onClick={() => setShowAnalyticsTab(false)}
                className="text-xs text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1.5 mx-auto py-1"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Return to Active Assistant Chat</span>
              </button>
            </div>
          )}

          {!isLoading && messages.length >= 2 && !showAnalyticsTab && (
            <div className="flex justify-between items-center mt-2.5 px-1">
              <span className="text-[10px] text-zinc-500 font-mono">
                Press Enter <CornerDownLeft className="inline h-2 w-2 text-zinc-600" /> to dispatch
              </span>
              <button
                onClick={regenerateLastResponse}
                className="text-[10px] text-zinc-500 hover:text-purple-400 font-mono flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> Regenerate response
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR PANEL (Only rendered if Fullscreen for diagrams/pins) */}
      {isFullscreen && (
        <div className="w-80 border-l border-zinc-850 p-5 hidden xl:flex flex-col space-y-6 bg-zinc-950/40 overflow-y-auto scrollbar-thin">
          {/* Search inside conversation input box */}
          <div>
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-purple-400" />
              Search Conversation
            </h4>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter chat history..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-3 pr-9 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-purple-800"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Expandable Diagrams */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800/40 pb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-purple-400" />
              Interactive Blueprints
            </h4>
            <PipelineDiagram />
            <SoCDiagram />
            <CoherenceDiagram />
          </div>

          {/* Reference pins board */}
          <div className="flex-1 space-y-3">
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800/40 pb-2 flex items-center gap-1.5">
              <Pin className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
              Pinned Reference notes
            </h4>
            {pinnedMessages.length === 0 ? (
              <p className="text-[10px] font-mono text-zinc-600 italic">No pinned registers or instructions. Click the pin icon on any assistant response to keep it here.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin">
                {pinnedMessages.map(msgId => {
                  const msg = messages.find(m => m.id === msgId);
                  if (!msg) return null;
                  return (
                    <div key={msgId} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5 relative group">
                      <button
                        onClick={() => togglePinMessage(msgId)}
                        className="absolute top-2 right-2 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Unpin"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="text-[9px] font-mono text-zinc-500 flex items-center gap-1">
                        <Terminal className="h-3 w-3 text-purple-400" /> msg-{msgId.substring(0,6)}
                      </div>
                      <p className="text-[10px] text-zinc-300 line-clamp-3 leading-relaxed font-sans">{msg.content.replace(/[#*`>]/g, "")}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Text/JSON exporters */}
          <div className="pt-2 border-t border-zinc-800/40">
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <FileDown className="h-3.5 w-3.5 text-indigo-400" />
              Export Conversation
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const content = JSON.stringify(messages, null, 2);
                  const blob = new Blob([content], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `silicon_copilot_session_${Date.now()}.json`;
                  a.click();
                }}
                className="py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[9px] font-mono text-zinc-400 hover:text-white transition-all cursor-pointer text-center"
              >
                JSON
              </button>
              <button
                onClick={() => {
                  const content = messages.map(m => `[${m.role.toUpperCase()} - ${m.timestamp}]\n${m.content}\n\n`).join("");
                  const blob = new Blob([content], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `silicon_copilot_session_${Date.now()}.txt`;
                  a.click();
                }}
                className="py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[9px] font-mono text-zinc-400 hover:text-white transition-all cursor-pointer text-center"
              >
                Plain Text
              </button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}
