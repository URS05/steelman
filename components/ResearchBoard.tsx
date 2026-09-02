"use client";

import ClaimCard from "@/components/ClaimCard";
import type {
  CardActionHandler,
  CardType,
  ResearchSession,
} from "@/lib/types";

interface ResearchBoardProps {
  session: ResearchSession;
  onAccept: CardActionHandler;
  onChallenge: CardActionHandler;
  onDismiss: CardActionHandler;
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
    <div className="flex flex-col gap-8 bg-gray-950">
      {TYPE_ORDER.map((type) => {
        const cards = session.cards.filter((card) => card.type === type);
        if (cards.length === 0) {
          return null;
        }

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
