"use client";

import AgentStatus from "@/components/AgentStatus";
import ResearchBoard from "@/components/ResearchBoard";
import TopicInput from "@/components/TopicInput";
import { useResearchBoard } from "@/hooks/useResearchBoard";

export default function Home() {
  const { session, startSession, updateCardStatus, challengeCard } =
    useResearchBoard();

  if (!session.topic) {
    return (
      <TopicInput onStart={startSession} isLoading={session.isAgentActive} />
    );
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-gray-950">
      <AgentStatus
        status={session.agentStatus}
        isActive={session.isAgentActive}
      />

      <header className="px-16 pb-4 pt-6">
        <h1 className="text-center text-xl font-semibold tracking-tight text-white md:text-2xl">
          {session.topic}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-8 md:px-8">
        <ResearchBoard
          session={session}
          onAccept={(cardId) => updateCardStatus(cardId, "accepted")}
          onChallenge={challengeCard}
          onDismiss={(cardId) => updateCardStatus(cardId, "dismissed")}
        />
      </main>

      <footer className="px-4 py-3 text-center text-[11px] text-gray-500">
        WebMCP tools active — open this page in ChatGPT browser or Chrome with #enable-webmcp-testing flag
      </footer>
    </div>
  );
}
