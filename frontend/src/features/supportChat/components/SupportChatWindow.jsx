import { memo, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSupportChat } from "../context/useSupportChat";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";

function SupportChatWindow() {
  const {
    isOpen,
    isMinimized,
    messages,
    isFetchingHistory,
    connectionStatus,
    sendText,
    minimizeChat,
    lastError,
    isOtherTyping,
    otherTypingLabel,
    handleTypingChange,
  } = useSupportChat();

  const endRef = useRef(null);
  const listRef = useRef(null);

  const shouldShow = isOpen && !isMinimized;

  const canType = connectionStatus === "connected" || connectionStatus === "connecting";

  const subtitle = useMemo(() => {
    if (connectionStatus === "connected") return "We typically reply in a few minutes";
    return "Trying to reconnect…";
  }, [connectionStatus]);

  useEffect(() => {
    if (!shouldShow) return;
    // Auto-scroll to bottom when open and new messages arrive
    endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [shouldShow, messages?.length]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed z-[999] bottom-28 right-8 left-0 md:left-auto md:w-96 md:max-w-md"
        >
          <div
            className="mx-4 md:mx-0 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-2xl flex flex-col max-h-[75vh] md:max-h-[80vh]"
            style={{
              boxShadow:
                "0 20px 60px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)",
            }}
          >
            <ChatHeader
              title="TripFusion Support"
              subtitle={subtitle}
              connectionStatus={connectionStatus}
              onMinimize={minimizeChat}
            />

            {lastError ? (
              <div className="px-4 py-2 bg-white border-b border-gray-100">
                <p className="text-xs text-red-600">{lastError}</p>
              </div>
            ) : null}

            <div
              ref={listRef}
              className="flex-1 min-h-0 overflow-y-auto bg-gradient-to-b from-gray-50 to-white py-4"
            >
              {isFetchingHistory ? (
                <div className="px-4 space-y-3">
                  <div className="h-10 w-3/4 bg-gray-100 rounded-2xl animate-pulse" />
                  <div className="h-10 w-2/3 bg-gray-100 rounded-2xl animate-pulse ml-auto" />
                  <div className="h-10 w-3/4 bg-gray-100 rounded-2xl animate-pulse" />
                </div>
              ) : messages?.length ? (
                <>
                  {messages.map((m) => (
                    <MessageBubble
                      key={m?._id || `${m?.createdAt}-${m?.text}`}
                      message={m}
                      side={m?.senderRole === "user" ? "right" : "left"}
                    />
                  ))}
                  <div ref={endRef} />
                </>
              ) : (
                <div className="px-6 py-10 text-center">
                  <h4 className="text-base font-bold text-[#0A1A44]">
                    Need help with your trip?
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    Start a live chat with our support team.
                  </p>
                </div>
              )}
            </div>

            {isOtherTyping && (
              <TypingIndicator label={otherTypingLabel} />
            )}

            <ChatInput
              onSend={sendText}
              disabled={!canType}
               onChangeText={handleTypingChange}
              placeholder="Write to support…"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(SupportChatWindow);

