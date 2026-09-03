"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { registerWebMCPTools } from "@/lib/webmcp";
import type { CardStatus, ResearchCard, ResearchSession } from "@/lib/types";

type AddCardInput = Omit<
  ResearchCard,
  "id" | "createdAt" | "status" | "linkedCardIds" | "challengeCount"
>;

type BoardAction =
  | { type: "START_SESSION"; session: ResearchSession }
  | { type: "ADD_CARD"; card: ResearchCard }
  | { type: "UPDATE_STATUS"; cardId: string; status: CardStatus }
  | { type: "LINK_CARDS"; cardId1: string; cardId2: string }
  | { type: "CHALLENGE_CARD"; cardId: string }
  | { type: "SET_AGENT_STATUS"; status: string };

const INITIAL_SESSION: ResearchSession = {
  id: "",
  topic: "",
  cards: [],
  createdAt: 0,
  isAgentActive: false,
  agentStatus: "Idle",
};

function uniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids));
}

function boardReducer(
  state: ResearchSession,
  action: BoardAction,
): ResearchSession {
  switch (action.type) {
    case "START_SESSION":
      return action.session;
    case "ADD_CARD":
      return {
        ...state,
        cards: [...state.cards, action.card],
      };
    case "UPDATE_STATUS":
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === action.cardId
            ? { ...card, status: action.status }
            : card,
        ),
      };
    case "LINK_CARDS":
      return {
        ...state,
        cards: state.cards.map((card) => {
          if (card.id === action.cardId1) {
            return {
              ...card,
              linkedCardIds: uniqueIds([...card.linkedCardIds, action.cardId2]),
            };
          }
          if (card.id === action.cardId2) {
            return {
              ...card,
              linkedCardIds: uniqueIds([...card.linkedCardIds, action.cardId1]),
            };
          }
          return card;
        }),
      };
    case "CHALLENGE_CARD":
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === action.cardId
            ? {
                ...card,
                status: "challenged",
                challengeCount: card.challengeCount + 1,
              }
            : card,
        ),
        agentStatus: "Card challenged — looking deeper...",
        isAgentActive: true,
      };
    case "SET_AGENT_STATUS":
      return {
        ...state,
        agentStatus: action.status,
        isAgentActive: action.status.trim().length > 0,
      };
    default:
      return state;
  }
}

export function useResearchBoard() {
  const [session, dispatch] = useReducer(boardReducer, INITIAL_SESSION);
  const sessionRef = useRef(session);

  const apply = useCallback((action: BoardAction): ResearchSession => {
    const next = boardReducer(sessionRef.current, action);
    sessionRef.current = next;
    dispatch(action);
    return next;
  }, []);

  const startSession = useCallback(
    (topic: string) => {
      apply({
        type: "START_SESSION",
        session: {
          id: uuidv4(),
          topic,
          cards: [],
          createdAt: Date.now(),
          isAgentActive: true,
          agentStatus: "Waiting for the agent to start researching...",
        },
      });
    },
    [apply],
  );

  const addCard = useCallback(
    (card: AddCardInput): ResearchCard => {
      const created: ResearchCard = {
        ...card,
        id: uuidv4(),
        createdAt: Date.now(),
        status: "pending",
        linkedCardIds: [],
        challengeCount: 0,
      };
      apply({ type: "ADD_CARD", card: created });
      return created;
    },
    [apply],
  );

  const updateCardStatus = useCallback(
    (cardId: string, status: CardStatus) => {
      apply({ type: "UPDATE_STATUS", cardId, status });
    },
    [apply],
  );

  const linkCards = useCallback(
    (cardId1: string, cardId2: string) => {
      apply({ type: "LINK_CARDS", cardId1, cardId2 });
    },
    [apply],
  );

  const challengeCard = useCallback(
    (cardId: string) => {
      apply({ type: "CHALLENGE_CARD", cardId });
    },
    [apply],
  );

  const getCards = useCallback((): ResearchCard[] => {
    return sessionRef.current.cards;
  }, []);

  const setAgentStatus = useCallback(
    (status: string) => {
      apply({ type: "SET_AGENT_STATUS", status });
    },
    [apply],
  );

  useEffect(() => {
    let cancelled = false;
    let controller: AbortController | undefined;

    void registerWebMCPTools({
      addCard,
      linkCards,
      getCards,
      updateCardStatus,
    }).then((registered) => {
      if (cancelled) {
        registered.abort();
        return;
      }
      controller = registered;
    });

    return () => {
      cancelled = true;
      controller?.abort();
    };
  }, [addCard, linkCards, getCards, updateCardStatus]);

  return {
    session,
    startSession,
    addCard,
    updateCardStatus,
    linkCards,
    challengeCard,
    getCards,
    setAgentStatus,
  };
}
