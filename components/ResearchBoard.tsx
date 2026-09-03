"use client";

import { useRef } from "react";
import CardLinker from "@/components/CardLinker";
import ClaimCard from "@/components/ClaimCard";
import type { CardType, ResearchSession } from "@/lib/types";

interface ResearchBoardProps {
  session: ResearchSession;
  onAccept: (cardId: string) => void;
  onChallenge: (cardId: string) => void;
  onDismiss: (cardId: string) => void;
}

const TYPE_ORDER: CardType[] = [
  "claim",
  "evidence",
  "contradiction",
  "summary",
];

const TYPE_LABEL: Record<CardType, string> = {
  claim: "Claims",
  evidence: "Evidence",
  contradiction: "Contradictions",
  summary: "Summary",
};

export default function ResearchBoard({
  session,
  onAccept,
  onChallenge,
  onDismiss,
}: ResearchBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);

  if (session.cards.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-950 px-6 py-16">
        <p className="text-center text-sm text-gray-400">
          Ask the agent to start researching...
        </p>
      </div>
    );
  }

  return (
    <div ref={boardRef} className="relative flex flex-col gap-8 bg-gray-950">
      <CardLinker cards={session.cards} containerRef={boardRef} />
      {TYPE_ORDER.filter((type) =>
        session.cards.some((card) => card.type === type),
      ).map((type) => {
        const cards = session.cards.filter((card) => card.type === type);

        return (
          <section key={type} className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {TYPE_LABEL[type]}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <ClaimCard
                  key={card.id}
                  card={card}
                  onAccept={onAccept}
                  onChallenge={onChallenge}
                  onDismiss={onDismiss}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
