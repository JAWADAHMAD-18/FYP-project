import { memo, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSupportChat } from "../context/useSupportChat";
import { useAuth } from "../../../context/useAuth";
import { adminUpdateCustomPackageStatus } from "../../../services/customPackage.api";
import ChatHeader from "./ChatHeader";
import UsersList from "./UsersList";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";

function AdminChatLayout({ navigate: navigateProp }) {
  const navigateHook = useNavigate();
  const navigate = navigateProp || navigateHook;

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: null,
    requestId: null,
    loading: false,
  });
  const { user } = useAuth();
  const {
    isOpen,
    isMinimized,
    sortedAdminConversations,
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
    closeRoom,
    sendText,
    saveScrollPosition,
    getScrollPosition,
    isOtherTyping,
    otherTypingLabel,
    handleTypingChange,
    incomingNotification,
    dismissIncomingNotification,
  } = useSupportChat();

  const listRef = useRef(null);
  const endRef = useRef(null);
  const chatInputRef = useRef(null);

  const shouldShow = isOpen && !isMinimized;

  const activeConversation = useMemo(() => {
    return (sortedAdminConversations || []).find(
      (c) => (c?._id != null ? String(c._id) : null) === activeRoom
    ) || null;
  }, [sortedAdminConversations, activeRoom]);

  const canType = connectionStatus === "connected" || connectionStatus === "connecting";

  const handleSelect = async (conversationId) => {
    if (activeRoom && listRef.current) {
      saveScrollPosition(activeRoom, listRef.current.scrollTop);
    }
    await selectRoom(conversationId);
  };

  const openConfirmModal = useCallback((action, requestId) => {
    setConfirmModal({ open: true, action, requestId, loading: false });
  }, []);

  const handleConfirmModalConfirm = useCallback(async () => {
    const { action, requestId } = confirmModal;
    if (!requestId || !activeRoom) return;
    setConfirmModal((p) => ({ ...p, loading: true }));
    try {
      if (action === "accept") {
        await adminUpdateCustomPackageStatus(requestId, "finalized", {});
        sendText(
          "Your custom package has been approved. We've locked in the selected flights and hotels."
        );
      } else {
        await adminUpdateCustomPackageStatus(requestId, "cancelled");
        sendText(
          "Your custom package request has been declined. Please reach out if you'd like to discuss alternatives."
        );
      }
      setConfirmModal({ open: false, action: null, requestId: null, loading: false });
    } catch (e) {
      setConfirmModal((p) => ({ ...p, loading: false }));
    }
  }, [confirmModal.action, confirmModal.requestId, activeRoom, sendText]);

  const handleConfirmModalCancel = useCallback(() => {
    if (!confirmModal.loading) {
      setConfirmModal({ open: false, action: null, requestId: null, loading: false });
    }
  }, [confirmModal.loading]);

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

  const notificationSenderName = useMemo(() => {
    if (!incomingNotification?.roomId) return "Traveler";
    const c = (sortedAdminConversations || []).find(
      (conv) => String(conv?._id) === incomingNotification.roomId
    );
    return c?.user?.name || "Traveler";
  }, [incomingNotification?.roomId, sortedAdminConversations]);

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
          {incomingNotification && (
            <div
              role="alert"
              className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-10 rounded-xl border border-teal-200 bg-white shadow-lg p-4 flex items-start gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#0A1A44]">
                  {notificationSenderName}
                </p>
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                  {incomingNotification.preview}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    selectRoom(incomingNotification.roomId);
                    dismissIncomingNotification?.();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700"
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={dismissIncomingNotification}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
            </div>
          )}

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
                  conversations={sortedAdminConversations}
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
                      {activeConversation?.status === "assigned" &&
                      String(activeConversation?.assignedAdmin) ===
                        String(user?._id || user?.id) ? (
                        <button
                          onClick={() => closeRoom(activeRoom)}
                          className="shrink-0 px-3 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
                        >
                          Close Chat
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
                              onReply={() => chatInputRef.current?.focus?.()}
                              onViewDetails={(requestId) => {
                                navigate("/admin/custom-package/" + requestId);
                              }}
                              onAccept={(requestId) =>
                                openConfirmModal("accept", requestId)
                              }
                              onReject={(requestId) =>
                                openConfirmModal("reject", requestId)
                              }
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
                      inputRef={chatInputRef}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Accept/Reject confirmation modal */}
          {confirmModal.open && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={confirmModal.loading ? undefined : handleConfirmModalCancel}
              />
              <div
                role="alertdialog"
                aria-modal="true"
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-lg font-semibold text-[#0A1A44] mb-2">
                  {confirmModal.action === "accept"
                    ? "Accept custom package?"
                    : "Reject custom package?"}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {confirmModal.action === "accept"
                    ? "This will finalize the package and notify the user."
                    : "This will cancel the request and notify the user."}
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleConfirmModalCancel}
                    disabled={confirmModal.loading}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmModalConfirm}
                    disabled={confirmModal.loading}
                    className={`px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50 ${
                      confirmModal.action === "accept"
                        ? "bg-teal-600 hover:bg-teal-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {confirmModal.loading ? "Processing…" : confirmModal.action === "accept" ? "Accept" : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(AdminChatLayout);

