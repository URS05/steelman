interface AgentStatusProps {
  status: string;
  isActive: boolean;
}

export default function AgentStatus({ status, isActive }: AgentStatusProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-1">
      <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800/90 px-3 py-2 backdrop-blur-sm">
        <span
          className={`h-2 w-2 rounded-full ${
            isActive ? "animate-pulse bg-green-500" : "bg-gray-500"
          }`}
          aria-hidden="true"
        />
      </div>
      <p className="max-w-[220px] text-right text-[11px] leading-tight text-gray-400">
        {status}
      </p>
    </div>
  );
}
