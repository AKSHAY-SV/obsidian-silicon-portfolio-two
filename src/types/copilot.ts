export type MessageRole = 'user' | 'assistant' | 'system';

export interface CopilotMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string; // ISO String or displayable time
  sources?: string[]; // e.g. ["Projects", "Documents", "Certifications"]
  suggestedFollowUps?: string[];
}

export interface CopilotSession {
  messages: CopilotMessage[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CopilotAnalytics {
  interactionsCount: number;
  averageConversationLength: number;
  mostAskedQuestions: { question: string; count: number }[];
  popularProjects: { projectName: string; count: number }[];
}
