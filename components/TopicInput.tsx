"use client";

import { FormEvent, useState } from "react";

interface TopicInputProps {
  onStart: (topic: string) => void;
  isLoading: boolean;
}

export default function TopicInput({ onStart, isLoading }: TopicInputProps) {
  const [topic, setTopic] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed || isLoading) {
      return;
    }
    onStart(trimmed);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-gray-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-center"
      >
        <input
          type="text"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          disabled={isLoading}
          placeholder="Enter a research topic, e.g. 'Does social media harm teenagers?'"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-colors hover:border-gray-500 focus:border-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-700"
        />
        <button
          type="submit"
          disabled={isLoading || topic.trim().length === 0}
          className="shrink-0 rounded-lg bg-white px-5 py-3 text-sm font-medium text-gray-950 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400 disabled:hover:bg-gray-700"
        >
          {isLoading ? "Starting..." : "Start research"}
        </button>
      </form>
    </div>
  );
}
