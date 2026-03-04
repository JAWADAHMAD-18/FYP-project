import { memo } from "react";

function TypingIndicator({ label = "Typing…" }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 px-4 pb-2">
      <span className="inline-flex gap-1">
        <span className="w-1.5 h-1.5 bg-teal-600/70 rounded-full animate-bounce" />
        <span
          className="w-1.5 h-1.5 bg-teal-600/70 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        />
        <span
          className="w-1.5 h-1.5 bg-teal-600/70 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
      </span>
      <span>{label}</span>
    </div>
  );
}

export default memo(TypingIndicator);

