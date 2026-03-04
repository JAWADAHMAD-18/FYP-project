import { memo, useEffect, useMemo, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";

function ChatInput({ onSend, disabled, placeholder = "Type a message…" }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  const canSend = useMemo(() => !disabled && text.trim().length > 0, [disabled, text]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend?.(trimmed);
    setText("");
    // Keep focus for quick follow-ups
    requestAnimationFrame(() => inputRef.current?.focus?.());
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  useEffect(() => {
    if (!disabled) return;
    // If we got disabled mid-typing, keep text; no-op.
  }, [disabled]);

  return (
    <div className="p-3 border-t border-gray-100 bg-white">
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="flex-1 resize-none rounded-2xl border border-gray-200 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15 outline-none px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 max-h-32"
        />
        <button
          onClick={send}
          disabled={!canSend}
          className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center transition ${
            canSend
              ? "bg-teal-600 text-white shadow-md hover:shadow-lg"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          aria-label="Send message"
        >
          <SendHorizonal className="w-5 h-5" />
        </button>
      </div>
      <p className="mt-2 text-[11px] text-gray-400">
        Press Enter to send, Shift+Enter for a new line
      </p>
    </div>
  );
}

export default memo(ChatInput);

