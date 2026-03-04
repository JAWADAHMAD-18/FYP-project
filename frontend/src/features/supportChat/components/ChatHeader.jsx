import { memo } from "react";
import { Minimize2 } from "lucide-react";

function ConnectionDot({ connectionStatus }) {
  const isConnected = connectionStatus === "connected";
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          isConnected ? "bg-white" : "bg-white/70"
        }`}
      />
      <span className="text-xs text-teal-50">
        {isConnected ? "Online" : "Reconnecting…"}
      </span>
    </span>
  );
}

function ChatHeader({
  title = "Live Support",
  subtitle,
  connectionStatus,
  onMinimize,
  rightSlot,
}) {
  return (
    <div className="flex items-center justify-between px-4  bg-teal-600 text-white">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-sm truncate">{title}</h3>
          <ConnectionDot connectionStatus={connectionStatus} />
        </div>
        {subtitle ? (
          <p className="text-xs text-teal-50 mt-0.5 truncate">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {rightSlot}
        <button
          onClick={onMinimize}
          className="p-2 hover:bg-white/15 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Minimize chat"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default memo(ChatHeader);

