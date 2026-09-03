"use client";

import { useEffect, useState, type RefObject } from "react";
import type { ResearchCard } from "@/lib/types";

interface CardLinkerProps {
  cards: ResearchCard[];
  containerRef: RefObject<HTMLElement | null>;
}

interface LinkLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function uniquePairs(cards: ResearchCard[]): Array<[string, string]> {
  const seen = new Set<string>();
  const pairs: Array<[string, string]> = [];

  for (const card of cards) {
    for (const otherId of card.linkedCardIds) {
      const key = [card.id, otherId].sort().join("::");
      if (seen.has(key)) {
        continue;
      }
      if (!cards.some((candidate) => candidate.id === otherId)) {
        continue;
      }
      seen.add(key);
      pairs.push([card.id, otherId]);
    }
  }

  return pairs;
}

export default function CardLinker({ cards, containerRef }: CardLinkerProps) {
  const [lines, setLines] = useState<LinkLine[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const update = () => {
      const rect = container.getBoundingClientRect();
      const next: LinkLine[] = [];

      for (const [fromId, toId] of uniquePairs(cards)) {
        const fromEl = container.querySelector(`[data-card-id="${fromId}"]`);
        const toEl = container.querySelector(`[data-card-id="${toId}"]`);
        if (!(fromEl instanceof HTMLElement) || !(toEl instanceof HTMLElement)) {
          continue;
        }

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        next.push({
          id: `${fromId}-${toId}`,
          x1: fromRect.left + fromRect.width / 2 - rect.left,
          y1: fromRect.top + fromRect.height / 2 - rect.top,
          x2: toRect.left + toRect.width / 2 - rect.left,
          y2: toRect.top + toRect.height / 2 - rect.top,
        });
      }

      setLines(next);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    window.addEventListener("scroll", update, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update, true);
    };
  }, [cards, containerRef]);

  if (lines.length === 0) {
    return null;
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
      aria-hidden="true"
    >
      {lines.map((line) => (
        <line
          key={line.id}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#6b7280"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
      ))}
    </svg>
  );
}
