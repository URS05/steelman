/// <reference types="webmcp-types" />

import { searchMockCards } from "@/lib/mockData";
import type { CardStatus, ResearchCard, WebMCPToolResult } from "@/lib/types";

export interface ToolCallbacks {
  addCard: (
    card: Omit<
      ResearchCard,
      "id" | "createdAt" | "status" | "linkedCardIds" | "challengeCount"
    >,
  ) => ResearchCard;
  linkCards: (cardId1: string, cardId2: string) => void;
  getCards: () => ResearchCard[];
  updateCardStatus: (cardId: string, status: CardStatus) => void;
}

function toResult(result: WebMCPToolResult): string {
  return JSON.stringify(result);
}

function readString(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  return typeof value === "string" ? value : "";
}

function readNumber(args: Record<string, unknown>, key: string): number {
  const value = args[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function findCard(cards: ResearchCard[], id: string): ResearchCard | undefined {
  return cards.find((card) => card.id === id);
}

export async function registerWebMCPTools(
  callbacks: ToolCallbacks,
): Promise<AbortController> {
  const controller = new AbortController();

  try {
    if (typeof document === "undefined" || !document.modelContext) {
      console.warn(
        "WebMCP is not available. Enable chrome://flags/#enable-webmcp-testing or open this page in the ChatGPT browser.",
      );
      return controller;
    }

    const modelContext = document.modelContext;
    const tools: WebMCP.ModelContextTool[] = [
      {
        name: "search_topic",
        description:
          "Search for information and evidence about the current research topic. Returns relevant claims and their sources.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            depth: { type: "string", enum: ["shallow", "deep"] },
          },
          required: ["query"],
        },
        execute: async (args) => {
          const query = readString(args, "query");
          const depth = readString(args, "depth") === "deep" ? "deep" : "shallow";
          const matches = searchMockCards(query);
          const limited = depth === "shallow" ? matches.slice(0, 2) : matches;

          if (limited.length > 0) {
            return toResult({
              success: true,
              message: `Found ${limited.length} result(s) for "${query}" (${depth}).`,
              data: limited,
            });
          }

          const generated = callbacks.addCard({
            type: "evidence",
            title: `Search result: ${query}`,
            content:
              depth === "deep"
                ? `Generated deep-dive note on "${query}". No mock evidence matched; verify this claim against primary sources.`
                : `Generated note on "${query}". No mock evidence matched.`,
            source: "Steelman search fallback",
            confidence: depth === "deep" ? 0.45 : 0.3,
          });

          return toResult({
            success: true,
            message: `No mock matches for "${query}". Generated a new evidence card.`,
            data: generated,
          });
        },
      },
      {
        name: "create_evidence_card",
        description:
          "Create a new evidence card on the research board with a claim, supporting content, and source.",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
            source: { type: "string" },
            sourceUrl: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["title", "content", "source", "sourceUrl", "confidence"],
        },
        execute: async (args) => {
          const title = readString(args, "title");
          const content = readString(args, "content");
          const source = readString(args, "source");
          const sourceUrl = readString(args, "sourceUrl");
          const confidence = Math.min(
            1,
            Math.max(0, readNumber(args, "confidence")),
          );

          const card = callbacks.addCard({
            type: "evidence",
            title,
            content,
            source,
            sourceUrl,
            confidence,
          });

          return toResult({
            success: true,
            message: `Created evidence card: ${title}`,
            data: card,
          });
        },
      },
      {
        name: "link_cards",
        description:
          "Link two related cards on the research board to show their relationship.",
        inputSchema: {
          type: "object",
          properties: {
            cardId1: { type: "string" },
            cardId2: { type: "string" },
            reason: { type: "string" },
          },
          required: ["cardId1", "cardId2", "reason"],
        },
        execute: async (args) => {
          const cardId1 = readString(args, "cardId1");
          const cardId2 = readString(args, "cardId2");
          const reason = readString(args, "reason");
          const cards = callbacks.getCards();
          const first = findCard(cards, cardId1);
          const second = findCard(cards, cardId2);

          if (!first || !second) {
            return toResult({
              success: false,
              message: "One or both card IDs were not found on the board.",
            });
          }

          callbacks.linkCards(cardId1, cardId2);

          return toResult({
            success: true,
            message: `Linked "${first.title}" and "${second.title}". Reason: ${reason}`,
            data: { cardId1, cardId2, reason },
          });
        },
      },
      {
        name: "flag_contradiction",
        description:
          "Flag a contradiction between two existing cards and create a contradiction card explaining the conflict.",
        inputSchema: {
          type: "object",
          properties: {
            cardId1: { type: "string" },
            cardId2: { type: "string" },
            explanation: { type: "string" },
          },
          required: ["cardId1", "cardId2", "explanation"],
        },
        execute: async (args) => {
          const cardId1 = readString(args, "cardId1");
          const cardId2 = readString(args, "cardId2");
          const explanation = readString(args, "explanation");
          const cards = callbacks.getCards();
          const first = findCard(cards, cardId1);
          const second = findCard(cards, cardId2);

          if (!first || !second) {
            return toResult({
              success: false,
              message: "One or both card IDs were not found on the board.",
            });
          }

          const contradiction = callbacks.addCard({
            type: "contradiction",
            title: `Contradiction: ${first.title} vs ${second.title}`,
            content: explanation,
            confidence: 0.65,
          });

          callbacks.linkCards(cardId1, cardId2);
          callbacks.linkCards(contradiction.id, cardId1);
          callbacks.linkCards(contradiction.id, cardId2);
          callbacks.updateCardStatus(cardId1, "challenged");
          callbacks.updateCardStatus(cardId2, "challenged");

          return toResult({
            success: true,
            message: `Flagged contradiction between "${first.title}" and "${second.title}".`,
            data: contradiction,
          });
        },
      },
      {
        name: "summarize_research",
        description:
          "Generate a summary card of all accepted evidence on the board so far.",
        inputSchema: {
          type: "object",
          properties: {
            includeContradictions: { type: "boolean" },
          },
          required: ["includeContradictions"],
        },
        execute: async (args) => {
          const includeContradictions =
            typeof args.includeContradictions === "boolean"
              ? args.includeContradictions
              : false;
          const cards = callbacks.getCards();
          const accepted = cards.filter((card) => card.status === "accepted");
          const contradictions = includeContradictions
            ? cards.filter((card) => card.type === "contradiction")
            : [];

          const acceptedLines = accepted.map((card) => `- ${card.title}`);
          const contradictionLines = contradictions.map(
            (card) => `- ${card.title}`,
          );

          const summaryParts = [
            accepted.length > 0
              ? `Accepted findings:\n${acceptedLines.join("\n")}`
              : "No accepted findings yet.",
          ];

          if (includeContradictions) {
            summaryParts.push(
              contradictions.length > 0
                ? `Open contradictions:\n${contradictionLines.join("\n")}`
                : "No contradiction cards on the board.",
            );
          }

          const content = summaryParts.join("\n\n");
          const summary = callbacks.addCard({
            type: "summary",
            title: "Research summary",
            content,
            confidence: accepted.length > 0 ? 0.75 : 0.4,
          });

          return toResult({
            success: true,
            message: content,
            data: summary,
          });
        },
      },
      {
        name: "get_board_state",
        description:
          "Get the current state of the research board including all cards and their statuses. Use this to understand what has already been researched.",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
        execute: async () => {
          const cards = callbacks.getCards();

          return toResult({
            success: true,
            message: `Board currently has ${cards.length} card(s).`,
            data: cards.map((card) => ({
              id: card.id,
              type: card.type,
              title: card.title,
              status: card.status,
              linkedCardIds: card.linkedCardIds,
              challengeCount: card.challengeCount,
              confidence: card.confidence,
            })),
          });
        },
      },
    ];

    for (const tool of tools) {
      await modelContext.registerTool(tool, { signal: controller.signal });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown WebMCP registration error";
    console.warn("Failed to register WebMCP tools:", message);
  }

  return controller;
}
