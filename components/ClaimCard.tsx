"use client";

"use client";

import type { CardActionHandler, CardStatus, CardType, ResearchCard } from "@/lib/types";

interface ClaimCardProps {
  card: ResearchCard;
  onAccept: CardActionHandler;
  onChallenge: CardActionHandler;
  onDismiss: CardActionHandler;
}

const STATUS_BORDER: Record<CardStatus, string> = {
  pending: "border-white",
  accepted: "border-green-500",
  challenged: "border-yellow-400",
  dismissed: "border-gray-600 opacity-50",
};

const TYPE_BADGE: Record<CardType, string> = {
  claim: "bg-blue-500/20 text-blue-300",
  evidence: "bg-emerald-500/20 text-emerald-300",
  contradiction: "bg-amber-500/20 text-amber-300",
  summary: "bg-violet-500/20 text-violet-300",
};

const CONFIDENCE_WIDTH: Record<number, string> = {
  0: "w-0",
  5: "w-[5%]",
  10: "w-[10%]",
  15: "w-[15%]",
  20: "w-[20%]",
  25: "w-[25%]",
  30: "w-[30%]",
  35: "w-[35%]",
  40: "w-[40%]",
  45: "w-[45%]",
  50: "w-1/2",
  55: "w-[55%]",
  60: "w-[60%]",
  65: "w-[65%]",
  70: "w-[70%]",
  75: "w-3/4",
  80: "w-[80%]",
  85: "w-[85%]",
  90: "w-[90%]",
  95: "w-[95%]",
  100: "w-full",
};

function confidenceWidthClass(confidence: number): string {
  const clamped = Math.min(1, Math.max(0, confidence));
  const pct = Math.round(clamped * 20) * 5;
  return CONFIDENCE_WIDTH[pct] ?? "w-0";
}

export default function ClaimCard({
  card,
  onAccept,
  onChallenge,
  onDismiss,
}: ClaimCardProps) {
  const actionsDisabled =
    card.status === "accepted" || card.status === "dismissed";

  const sourceLabel = card.source ?? card.sourceUrl;

  return (
    <article
      className={`relative flex h-full flex-col rounded-xl border bg-gray-800 p-4 text-white transition-colors ${STATUS_BORDER[card.status]}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_BADGE[card.type]}`}
        >
          {card.type}
        </span>
        {card.status === "challenged" && (
          <span className="rounded-full bg-yellow-400/20 px-2 py-0.5 text-[10px] font-medium text-yellow-300">
            {card.challengeCount}
          </span>
        )}
      </div>

      <h3 className="mb-2 text-sm font-semibold leading-snug text-white">
        {card.title}
      </h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-300">
        {card.content}
      </p>

      {sourceLabel && (
        <p className="mb-3 truncate text-xs text-gray-400">
          {card.sourceUrl ? (
            <a
              href={card.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 underline-offset-2 transition-colors hover:text-white hover:underline"
            >
              {sourceLabel}
            </a>
          ) : (
            sourceLabel
          )}
        </p>
      )}

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-gray-400">
          <span>Confidence</span>
          <span>{Math.round(card.confidence * 100)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
          <div
            className={`h-full rounded-full bg-green-500 ${confidenceWidthClass(card.confidence)}`}
          />
        </div>
      </div>

      <div className="mt-auto flex gap-2">
        <button
          type="button"
          disabled={actionsDisabled}
          onClick={() => onAccept(card.id)}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:border-green-500 hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-700 disabled:hover:bg-gray-900"
        >
          ✓ Accept
        </button>
        <button
          type="button"
          disabled={actionsDisabled}
          onClick={() => onChallenge(card.id)}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:border-yellow-400 hover:bg-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-700 disabled:hover:bg-gray-900"
        >
          ⚡ Challenge
        </button>
        <button
          type="button"
          disabled={actionsDisabled}
          onClick={() => onDismiss(card.id)}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:border-gray-500 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-700 disabled:hover:bg-gray-900"
        >
          ✕ Dismiss
        </button>
      </div>
    </article>
  );
}
