import { memo, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSupportChat } from "../context/useSupportChat";
import ChatHeader from "./ChatHeader";
import UsersList from "./UsersList";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";

function AdminChatLayout() {
  const {
    isOpen,
    isMinimized,
    adminConversations,
    activeRoom,
    unreadCounts,
    messages,
    isFetchingHistory,
    connectionStatus,
    lastError,
    openChat,
    minimizeChat,
    selectRoom,
    acceptRoom,
    sendText,
    saveScrollPosition,
    getScrollPosition,
    isOtherTyping,
    otherTypingLabel,
    handleTypingChange,
  } = useSupportChat();

  const listRef = useRef(null);
  const endRef = useRef(null);

  const shouldShow = isOpen && !isMinimized;

  const activeConversation = useMemo(() => {
    return (adminConversations || []).find((c) => c?._id === activeRoom) || null;
  }, [adminConversations, activeRoom]);

  const canType = connectionStatus === "connected" || connectionStatus === "connecting";

  const handleSelect = async (conversationId) => {
    if (activeRoom && listRef.current) {
      saveScrollPosition(activeRoom, listRef.current.scrollTop);
    }
    await selectRoom(conversationId);
  };

  useEffect(() => {
    if (!shouldShow) return;
    if (!activeRoom) return;
    if (isFetchingHistory) return;
    const top = getScrollPosition(activeRoom);
    if (listRef.current) {
      listRef.current.scrollTop = top;
    }
  }, [activeRoom, getScrollPosition, isFetchingHistory, shouldShow]);

  useEffect(() => {
    if (!shouldShow) return;
    if (isFetchingHistory) return;
    // Keep admin view near bottom for active room when new messages arrive
    endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [messages?.length, shouldShow, isFetchingHistory]);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed z-[998] top-20 left-0 right-0 bottom-0 bg-white"
        >
          <div className="h-full flex flex-col border-t border-gray-100">
            <ChatHeader
              title="Support Inbox"
              subtitle="Manage live user conversations"
              connectionStatus={connectionStatus}
              onMinimize={minimizeChat}
              rightSlot={
                <button
                  onClick={openChat}
                  className="hidden"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              }
            />

            {lastError ? (
              <div className="px-4 py-2 bg-white border-b border-gray-100">
                <p className="text-xs text-red-600">{lastError}</p>
              </div>
            ) : null}

            <div className="flex-1 grid grid-cols-1 md:grid-cols-[340px_1fr] min-h-0">
              <div className="border-r border-gray-100 min-h-0">
                <UsersList
                  conversations={adminConversations}
                  activeRoom={activeRoom}
                  unreadCounts={unreadCounts}
                  onSelect={handleSelect}
                />
              </div>

              <div className="min-h-0 flex flex-col">
                {!activeRoom ? (
                  <div className="flex-1 flex items-center justify-center text-center px-6">
                    <div>
                      <h4 className="text-lg font-bold text-[#0A1A44]">
                        Select a conversation
                      </h4>
                      <p className="mt-2 text-sm text-gray-600">
                        Choose a user on the left to view messages.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#0A1A44] truncate">
                          {activeConversation?.user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {activeConversation?.user?.email || ""}
                        </p>
                      </div>

                      {activeConversation?.status === "open" &&
                      !activeConversation?.assignedAdmin ? (
                        <button
                          onClick={() => acceptRoom(activeRoom)}
                          className="shrink-0 px-3 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition"
                        >
                          Accept
                        </button>
                      ) : null}
                    </div>

                    <div
                      ref={listRef}
                      className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white py-4 min-h-0"
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
                              side={m?.senderRole === "admin" ? "right" : "left"}
                            />
                          ))}
                          <div ref={endRef} />
                        </>
                      ) : (
                        <div className="px-6 py-10 text-center">
                          <h4 className="text-base font-bold text-[#0A1A44]">
                            No messages yet
                          </h4>
                          <p className="mt-2 text-sm text-gray-600">
                            Accept the chat (if needed) and send a message.
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
                      placeholder="Reply to the user…"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(AdminChatLayout);

