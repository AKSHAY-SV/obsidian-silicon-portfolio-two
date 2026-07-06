import { useState, useEffect, useCallback, useRef } from "react";
import { CopilotMessage, CopilotAnalytics } from "../types/copilot";
import { sanitizeStreamingMarkdown } from "../services/responseFormatter";
import { generateLocalResponse } from "../services/localCopilotEngine";

const STORAGE_KEY = "silicon_copilot_messages";
const ANALYTICS_KEY = "silicon_copilot_local_analytics";

export const SUGGESTED_QUESTIONS = [
  "What is the RV32IM SoC designed by Akshay?",
  "Tell me about the synthesizable RV32IM Processor Core.",
  "Which EDA and FPGA design tools does Akshay use?",
  "What certifications does Akshay hold?",
  "Show me his academic timeline at MIT Bengaluru.",
  "Explain his MESI cache controller and its challenges."
];

export function useCopilot() {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<CopilotAnalytics>({
    interactionsCount: 0,
    averageConversationLength: 0,
    mostAskedQuestions: [],
    popularProjects: [],
  });

  const [workspaceMode, setWorkspaceModeState] = useState<'compact' | 'fullscreen' | null>(() => {
    return sessionStorage.getItem("silicon_copilot_workspace_mode") as 'compact' | 'fullscreen' | null;
  });
  const [selectedMode, setSelectedModeState] = useState<string>(() => {
    return localStorage.getItem("silicon_copilot_response_mode") || "RTL Engineer";
  });
  const [pinnedMessages, setPinnedMessages] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("silicon_copilot_pinned") || "[]");
    } catch (e) {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [visitedPages, setVisitedPages] = useState<string[]>([]);
  const [openedProjects, setOpenedProjects] = useState<string[]>([]);
  const [researchArticlesViewed, setResearchArticlesViewed] = useState<string[]>([]);
  const [searches, setSearches] = useState<string[]>([]);
  const [currentProject, setCurrentProject] = useState("");

  const setWorkspaceMode = useCallback((mode: 'compact' | 'fullscreen' | null) => {
    setWorkspaceModeState(mode);
    if (mode) {
      sessionStorage.setItem("silicon_copilot_workspace_mode", mode);
    } else {
      sessionStorage.removeItem("silicon_copilot_workspace_mode");
    }
  }, []);

  const setSelectedMode = useCallback((mode: string) => {
    setSelectedModeState(mode);
    localStorage.setItem("silicon_copilot_response_mode", mode);
  }, []);

  const togglePinMessage = useCallback((id: string) => {
    setPinnedMessages(prev => {
      const updated = prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id];
      localStorage.setItem("silicon_copilot_pinned", JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    const syncContext = () => {
      try {
        const pages = JSON.parse(sessionStorage.getItem("silicon_copilot_visited_pages") || "[]");
        const projects = JSON.parse(sessionStorage.getItem("silicon_copilot_opened_projects") || "[]");
        const papers = JSON.parse(sessionStorage.getItem("silicon_copilot_research_viewed") || "[]");
        const searchTerms = JSON.parse(sessionStorage.getItem("silicon_copilot_searches") || "[]");
        const currentProj = sessionStorage.getItem("silicon_copilot_current_project") || "";

        setVisitedPages(pages);
        setOpenedProjects(projects);
        setResearchArticlesViewed(papers);
        setSearches(searchTerms);
        setCurrentProject(currentProj);
      } catch (e) {
        console.error("Sync error in Copilot hook", e);
      }
    };

    syncContext();
    const interval = setInterval(syncContext, 1000);
    window.addEventListener("silicon_copilot_sync", syncContext);
    return () => {
      clearInterval(interval);
      window.removeEventListener("silicon_copilot_sync", syncContext);
    };
  }, []);

  const abortControllerRef = useRef<AbortController | null>(null);
  const streamIntervalRef = useRef<any>(null);

  // Load chat history and analytics from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved messages", e);
      }
    }

    const savedAnalytics = localStorage.getItem(ANALYTICS_KEY);
    if (savedAnalytics) {
      try {
        setAnalytics(JSON.parse(savedAnalytics));
      } catch (e) {
        console.error("Failed to parse saved analytics", e);
      }
    }
  }, []);

  // Save messages to localStorage when updated
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [messages]);

  // Track analytics locally
  const trackInteraction = useCallback((userQuestion: string, detectedProjectName?: string) => {
    // 1. Update local analytics in state & local storage
    const updatedAnalytics = { ...analytics };
    updatedAnalytics.interactionsCount += 1;

    // Track question
    const qLower = userQuestion.toLowerCase().trim();
    const existingQ = updatedAnalytics.mostAskedQuestions.find(q => q.question.toLowerCase() === qLower);
    if (existingQ) {
      existingQ.count += 1;
    } else {
      updatedAnalytics.mostAskedQuestions.push({ question: userQuestion, count: 1 });
    }
    updatedAnalytics.mostAskedQuestions.sort((a, b) => b.count - a.count);
    updatedAnalytics.mostAskedQuestions = updatedAnalytics.mostAskedQuestions.slice(0, 5);

    // Track project if present
    if (detectedProjectName) {
      const existingP = updatedAnalytics.popularProjects.find(p => p.projectName === detectedProjectName);
      if (existingP) {
        existingP.count += 1;
      } else {
        updatedAnalytics.popularProjects.push({ projectName: detectedProjectName, count: 1 });
      }
      updatedAnalytics.popularProjects.sort((a, b) => b.count - a.count);
      updatedAnalytics.popularProjects = updatedAnalytics.popularProjects.slice(0, 5);
    }

    // Calculate conversation length average
    const userMsgCount = messages.filter(m => m.role === "user").length + 1;
    updatedAnalytics.averageConversationLength = Math.round(
      ((updatedAnalytics.averageConversationLength * (updatedAnalytics.interactionsCount - 1) + userMsgCount) /
        updatedAnalytics.interactionsCount) *
        10
    ) / 10;

    setAnalytics(updatedAnalytics);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(updatedAnalytics));
  }, [analytics, messages]);

  // Auto detect which parts of the portfolio are cited in the response text
  const attributeSources = (text: string): string[] => {
    const sources: string[] = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes("rv32im") || lowerText.includes("pipeline") || lowerText.includes("eight-bit") || lowerText.includes("register") || lowerText.includes("lut")) {
      sources.push("Projects (RTL Core)");
    }
    if (lowerText.includes("rv32im-soc") || lowerText.includes("soc") || lowerText.includes("7nm") || lowerText.includes("finfet") || lowerText.includes("innovus")) {
      sources.push("Projects (ASIC SoC)");
    }
    if (lowerText.includes("cache") || lowerText.includes("mesi") || lowerText.includes("coherency") || lowerText.includes("snoop")) {
      sources.push("Projects (Memory Cache)");
    }
    if (lowerText.includes("manipal") || lowerText.includes("b.tech") || lowerText.includes("mit") || lowerText.includes("electronics")) {
      sources.push("Education (MIT Bengaluru)");
    }
    if (lowerText.includes("arm") || lowerText.includes("coursera") || lowerText.includes("embedded") || lowerText.includes("ucb") || lowerText.includes("duke")) {
      sources.push("Certifications");
    }
    if (lowerText.includes("systemverilog") || lowerText.includes("verilog") || lowerText.includes("vivado") || lowerText.includes("synopsys")) {
      sources.push("Core Skills & EDA Tools");
    }

    if (sources.length === 0) {
      sources.push("Portfolio Knowledge Base");
    }

    return Array.from(new Set(sources));
  };

  // Send message implementation with simulated high-fidelity streaming
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Identify if question matches any project keyword
    let detectedProject: string | undefined = undefined;
    const contentLower = content.toLowerCase();
    if (contentLower.includes("rv32im") || contentLower.includes("cpu") || contentLower.includes("processor")) {
      detectedProject = "RV32IM Processor";
    } else if (contentLower.includes("rv32im-soc") || contentLower.includes("7nm") || contentLower.includes("soc")) {
      detectedProject = "RV32IM SoC";
    } else if (contentLower.includes("axi") || contentLower.includes("crossbar") || contentLower.includes("interconnect")) {
      detectedProject = "AXI4 Interconnect";
    } else if (contentLower.includes("cache") || contentLower.includes("mesi")) {
      detectedProject = "L2 Cache Controller";
    }

    // Record interaction analytics
    trackInteraction(content, detectedProject);

    // Create user message
    const userMessage: CopilotMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    // Prepare message history
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Create container for assistant message
    const assistantMessageId = `msg-${Date.now()}-assistant`;
    const newAssistantMessage: CopilotMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, newAssistantMessage]);

    // Setup abort controller to allow stopping mid-generation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Generate highly detailed technical local response
      const localResult = generateLocalResponse(content, selectedMode);
      const fullText = localResult.response;
      const sources = localResult.sources;
      const followUps = localResult.followUps;

      // Simulate streaming chunks
      let currentIndex = 0;
      const stepIncrement = 35; // Characters per step
      const stepInterval = 15; // Speed of step

      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }

      streamIntervalRef.current = setInterval(() => {
        if (abortController.signal.aborted) {
          if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
          }
          return;
        }

        currentIndex += stepIncrement;
        const currentSlice = fullText.slice(0, currentIndex);
        const sanitizedSlice = sanitizeStreamingMarkdown(currentSlice);

        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: sanitizedSlice }
              : msg
          )
        );

        if (currentIndex >= fullText.length) {
          if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
          }

          // Complete message with attributes
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: fullText,
                    sources,
                    suggestedFollowUps: followUps
                  }
                : msg
            )
          );
          setIsLoading(false);
          abortControllerRef.current = null;
        }
      }, stepInterval);

    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Copilot streaming generation aborted.");
      } else {
        console.error("Copilot stream fetch failure", err);
        setError(err.message || "An unexpected error occurred. Please try again.");
        // Clean up the incomplete assistant message if empty
        setMessages(prev => prev.filter(m => m.id !== assistantMessageId || m.content.length > 0));
      }
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, isLoading, trackInteraction]);

  // Cancel any active streaming request
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    setIsLoading(false);
  }, []);

  // Regenerate last response
  const regenerateLastResponse = useCallback(() => {
    if (messages.length < 2 || isLoading) return;

    // Find the last user message
    const history = [...messages];
    let lastUserIndex = -1;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === "user") {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const lastUserMessage = history[lastUserIndex];
    // Keep history up to that last user message and call send
    const cleanedHistory = history.slice(0, lastUserIndex);
    setMessages(cleanedHistory);
    sendMessage(lastUserMessage.content);
  }, [messages, isLoading, sendMessage]);

  // Clear chat logs
  const clearConversation = useCallback(() => {
    stopGeneration();
    setMessages([]);
    setError(null);
  }, [stopGeneration]);

  // Helper to generate dynamic suggested questions based on keywords found in model output
  const generateFollowUps = (text: string): string[] => {
    const textLower = text.toLowerCase();
    const followUps: string[] = [];

    if (textLower.includes("rv32im") || textLower.includes("processor")) {
      followUps.push("How was the RV32IM processor core verified?");
      followUps.push("What's the difference between his single core and SoC projects?");
    }
    if (textLower.includes("rv32im-soc") || textLower.includes("7nm")) {
      followUps.push("Tell me more about the physical clock tree synthesis on the RV32IM SoC.");
      followUps.push("What tools did he use to check power IR drop?");
    }
    if (textLower.includes("cache") || textLower.includes("mesi")) {
      followUps.push("How did snoop buffers prevent Cache coherence deadlocks?");
      followUps.push("Which formal tool verified the L2 cache controller?");
    }
    if (textLower.includes("manipal") || textLower.includes("mit")) {
      followUps.push("What research papers has Akshay published at MIT Bengaluru?");
      followUps.push("What is his GPA/Academic standing in electronics?");
    }

    // Default general follow-ups
    if (followUps.length < 2) {
      followUps.push("Show me Akshay's synthesizable hardware projects.");
      followUps.push("What digital RTL skills does he have?");
    }

    return Array.from(new Set(followUps)).slice(0, 3);
  };

  return {
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
    
    // Full Screen and Engineering Workspace additions
    workspaceMode,
    setWorkspaceMode,
    selectedMode,
    setSelectedMode,
    pinnedMessages,
    togglePinMessage,
    searchQuery,
    setSearchQuery,
    
    // Session Context parameters
    visitedPages,
    openedProjects,
    researchArticlesViewed,
    searches,
    currentProject,
  };
}
