export type CardStatus = "pending" | "accepted" | "challenged" | "dismissed";
export type CardType = "claim" | "evidence" | "contradiction" | "summary";

export interface ResearchCard {
  id: string;
  type: CardType;
  title: string;
  content: string;
  source?: string;
  sourceUrl?: string;
  status: CardStatus;
  linkedCardIds: string[];
  createdAt: number;
  challengeCount: number;
  confidence: number;
}

export interface ResearchSession {
  id: string;
  topic: string;
  cards: ResearchCard[];
  createdAt: number;
  isAgentActive: boolean;
  agentStatus: string;
}

export interface WebMCPToolResult {
  success: boolean;
  message: string;
  data?: unknown;
}

export type CardActionHandler = (cardId: string) => void;
