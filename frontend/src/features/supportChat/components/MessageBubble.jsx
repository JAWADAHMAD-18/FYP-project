import { memo } from "react";

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({ message, side = "left" }) {
  const isSystem = message?.type === "system";
  const text = message?.text || "";
  const time = formatTime(message?.createdAt);

  if (isSystem) {
    return (
      <div className="flex justify-center my-3 px-4">
        <div className="text-xs text-gray-600 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
          {text}
        </div>
      </div>
    );
  }

  const isRight = side === "right";

  return (
    <div className={`flex px-4 mb-3 ${isRight ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm border ${
          isRight
            ? "bg-teal-600 text-white border-teal-600"
            : "bg-white text-gray-800 border-gray-100"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {text}
        </p>
        <div
          className={`mt-1 text-[11px] ${
            isRight ? "text-teal-50/90" : "text-gray-400"
          } text-right`}
        >
          {time}
        </div>
      </div>
    </div>
  );
}

export default memo(MessageBubble);

