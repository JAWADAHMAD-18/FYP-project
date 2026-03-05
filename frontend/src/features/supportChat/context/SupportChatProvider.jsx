import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SupportChatContext } from "./SupportChatContext";
import { useAuth } from "../../../context/useAuth";
import { useSupportSocket } from "../hooks/useSupportSocket";
import {
  getAdminConversationWithMessages,
  getAdminConversations,
  getConversationMessages,
} from "../services/realtimeChatApi";
import SupportChatButton from "../components/SupportChatButton";
import SupportChatWindow from "../components/SupportChatWindow";
import AdminChatLayout from "../components/AdminChatLayout";

function nowIso() {
  return new Date().toISOString();
}

function asArray(x) {
  return Array.isArray(x) ? x : [];
}

function normalizeConversationId(conversationOrId) {
  if (!conversationOrId) return null;
  if (typeof conversationOrId === "string") return conversationOrId;
  return conversationOrId?._id || conversationOrId?.conversationId || null;
}

function messageRoomId(message) {
  return (
    message?.conversation?.toString?.() ||
    message?.conversation ||
    message?.conversationId ||
    null
  );
}

function formatLocalMessage({ conversationId, text, senderRole }) {
  return {
    _id: `local-${conversationId}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`,
    conversation: conversationId,
    senderRole,
    type: "text",
    text,
    seen: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    __local: true,
  };
}

export function SupportChatProvider({ children }) {
  const { user, accessToken, isAuthenticated } = useAuth();
  const isAdmin = user?.isAdmin === true;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);

  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [adminConversations, setAdminConversations] = useState([]);

  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [lastChatError, setLastChatError] = useState(null);

  const uiRef = useRef({
    isOpen: false,
    isMinimized: false,
    activeRoom: null,
    isAdmin: false,
    userId: null,
  });

  useEffect(() => {
    uiRef.current = {
      isOpen,
      isMinimized,
      activeRoom,
      isAdmin,
      userId: user?._id || user?.id || null,
    };
  }, [isOpen, isMinimized, activeRoom, isAdmin, user]);

  const scrollPositionsRef = useRef(new Map());

  const socketEnabled = Boolean(accessToken && isAuthenticated);
  const {
    status: connectionStatus,
    lastError: lastSocketError,
    setHandlers,
    emitStart,
    emitAccept,
    emitMessage,
    emitJoin,
    emitTyping,
    emitStopTyping,
    CONNECTION,
  } = useSupportSocket({ token: accessToken, enabled: socketEnabled });

  const [typingByRoom, setTypingByRoom] = useState({});

  const clearUnread = useCallback((roomId) => {
    if (!roomId) return;
    setUnreadCounts((prev) => {
      if (!prev?.[roomId]) return prev;
      const next = { ...prev };
      delete next[roomId];
      return next;
    });
  }, []);

  const bumpUnread = useCallback((roomId) => {
    if (!roomId) return;
    setUnreadCounts((prev) => ({
      ...(prev || {}),
      [roomId]: (prev?.[roomId] || 0) + 1,
    }));
  }, []);

  const appendMessage = useCallback((incoming) => {
    const roomId = messageRoomId(incoming);
    if (!roomId) return;

    setMessagesByRoom((prev) => {
      const existing = prev?.[roomId] || [];

      // Deduplicate by Mongo _id.
      const incomingId = incoming?._id;
      if (incomingId && existing.some((m) => m?._id === incomingId)) {
        return prev;
      }

      // If server echoes our own message, try to replace the optimistic local one.
      const maybeLocalIdx =
        incoming?.senderRole &&
        typeof incoming?.text === "string" &&
        existing.findIndex(
          (m) =>
            m?.__local === true &&
            m?.senderRole === incoming?.senderRole &&
            m?.text === incoming?.text
        );

      let nextRoom = existing;
      if (maybeLocalIdx >= 0) {
        nextRoom = existing.slice();
        nextRoom.splice(maybeLocalIdx, 1, incoming);
      } else {
        nextRoom = [...existing, incoming];
      }

      return { ...(prev || {}), [roomId]: nextRoom };
    });

    const { isOpen: openNow, isMinimized: minimizedNow, activeRoom: activeNow, isAdmin: adminNow } =
      uiRef.current;

    const shouldCountUnread = adminNow
      ? roomId !== activeNow
      : !openNow || minimizedNow;

    if (shouldCountUnread) bumpUnread(roomId);
  }, [bumpUnread]);

  const loadUserHistory = useCallback(async (conversationId) => {
    if (!conversationId) return;
    setIsFetchingHistory(true);
    setLastChatError(null);
    try {
      const messages = await getConversationMessages(conversationId, {
        page: 1,
        limit: 50,
      });
      setMessagesByRoom((prev) => ({
        ...(prev || {}),
        [conversationId]: asArray(messages),
      }));
      clearUnread(conversationId);
    } catch (err) {
      setLastChatError(err?.message || "Failed to load chat history");
    } finally {
      setIsFetchingHistory(false);
    }
  }, [clearUnread]);

  const loadAdminList = useCallback(async () => {
    setLastChatError(null);
    try {
      const conversations = await getAdminConversations();
      setAdminConversations(asArray(conversations));
    } catch (err) {
      setLastChatError(err?.message || "Failed to load conversations");
    }
  }, []);

  const loadAdminRoom = useCallback(async (conversationId) => {
    if (!conversationId) return;
    setIsFetchingHistory(true);
    setLastChatError(null);
    try {
      const result = await getAdminConversationWithMessages(conversationId, {
        page: 1,
        limit: 50,
      });
      const messages = asArray(result?.messages);
      setMessagesByRoom((prev) => ({
        ...(prev || {}),
        [conversationId]: messages,
      }));
      clearUnread(conversationId);
    } catch (err) {
      setLastChatError(err?.message || "Failed to load conversation");
    } finally {
      setIsFetchingHistory(false);
    }
  }, [clearUnread]);

  const openChat = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsOpen(true);
    setIsMinimized(false);
    setLastChatError(null);

    if (!isAdmin) {
      // Create/join the current user's conversation room via socket.
      // Avoid re-starting if we already have an active room in this session.
      if (!uiRef.current.activeRoom) {
        emitStart();
      } else if (uiRef.current.activeRoom) {
        clearUnread(uiRef.current.activeRoom);
      }
    } else {
      // Admin panel: load conversations when opening.
      loadAdminList();
    }
  }, [clearUnread, emitStart, isAdmin, isAuthenticated, loadAdminList]);

  const openChatWithMessage = useCallback(
    (text) => {
      const trimmed = typeof text === "string" ? text.trim() : "";
      if (!trimmed) return;
      if (!isAuthenticated) return;

      pendingAutoMessageRef.current = trimmed;

      setIsOpen(true);
      setIsMinimized(false);
      setLastChatError(null);

      if (!isAdmin) {
        if (!uiRef.current.activeRoom) {
          emitStart();
        } else if (uiRef.current.activeRoom) {
          clearUnread(uiRef.current.activeRoom);
        }
      } else {
        loadAdminList();
      }
    },
    [clearUnread, emitStart, isAdmin, isAuthenticated, loadAdminList]
  );

  const minimizeChat = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximizeChat = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    if (activeRoom) clearUnread(activeRoom);
  }, [activeRoom, clearUnread]);

  const closeUi = useCallback(() => {
    // Requirement: minimize collapses UI but keeps socket alive.
    setIsMinimized(true);
  }, []);

  const selectRoom = useCallback(
    async (conversationId) => {
      const id = normalizeConversationId(conversationId);
      if (!id) return;

      setActiveRoom(id);
      clearUnread(id);

      if (isAdmin) {
        emitJoin(id);
        await loadAdminRoom(id);
      }
    },
    [clearUnread, emitJoin, isAdmin, loadAdminRoom]
  );

  const acceptRoom = useCallback(
    async (conversationId) => {
      const id = normalizeConversationId(conversationId);
      if (!id) return;
      emitAccept(id);
      // Refresh list since backend doesn't emit an assignment update payload.
      loadAdminList();
    },
    [emitAccept, loadAdminList]
  );

  const sendText = useCallback(
    (text) => {
      const trimmed = typeof text === "string" ? text.trim() : "";
      if (!trimmed) return;
      if (!activeRoom) return;

      const senderRole = isAdmin ? "admin" : "user";
      const local = formatLocalMessage({
        conversationId: activeRoom,
        text: trimmed,
        senderRole,
      });

      setMessagesByRoom((prev) => {
        const existing = prev?.[activeRoom] || [];
        return { ...(prev || {}), [activeRoom]: [...existing, local] };
      });

      emitMessage({ conversationId: activeRoom, text: trimmed });
    },
    [activeRoom, emitMessage, isAdmin]
  );

  // Local typing debounce per active room
  const typingControlRef = useRef({ isTyping: false, timeoutId: null });

  const handleTypingChange = useCallback(
    (text) => {
      if (!activeRoom) return;
      const trimmed = typeof text === "string" ? text.trim() : "";
      const ctrl = typingControlRef.current;

      if (!trimmed) {
        if (ctrl.isTyping) {
          emitStopTyping(activeRoom);
          ctrl.isTyping = false;
        }
        if (ctrl.timeoutId) {
          clearTimeout(ctrl.timeoutId);
          ctrl.timeoutId = null;
        }
        return;
      }

      if (!ctrl.isTyping) {
        emitTyping(activeRoom);
        ctrl.isTyping = true;
      }

      if (ctrl.timeoutId) {
        clearTimeout(ctrl.timeoutId);
      }
      ctrl.timeoutId = setTimeout(() => {
        if (ctrl.isTyping) {
          emitStopTyping(activeRoom);
          ctrl.isTyping = false;
        }
        ctrl.timeoutId = null;
      }, 2000);
    },
    [activeRoom, emitStopTyping, emitTyping]
  );

  const saveScrollPosition = useCallback((roomId, scrollTop) => {
    if (!roomId) return;
    scrollPositionsRef.current.set(roomId, scrollTop);
  }, []);

  const getScrollPosition = useCallback((roomId) => {
    if (!roomId) return 0;
    return scrollPositionsRef.current.get(roomId) || 0;
  }, []);

  useEffect(() => {
    setHandlers({
      onError: (message) => setLastChatError(message || "Chat error"),
      onReady: (conversation) => {
        const id = normalizeConversationId(conversation);
        if (!id) return;
        setActiveRoom(id);
        clearUnread(id);
        loadUserHistory(id);
      },
      onMessage: (message) => appendMessage(message),
      onSystem: (message) => appendMessage(message),
      onClosed: (payload) => {
        const id = normalizeConversationId(payload?.conversationId);
        if (!id) return;
        appendMessage({
          _id: `system-closed-${id}-${Date.now()}`,
          conversation: id,
          senderRole: "admin",
          type: "system",
          text: "This conversation has been closed by support.",
          createdAt: nowIso(),
          updatedAt: nowIso(),
        });
      },
      onConversationNew: () => {
        if (uiRef.current.isAdmin) {
          loadAdminList();
        }
      },
      onTyping: (payload) => {
        const roomId = normalizeConversationId(payload?.conversationId);
        const role = payload?.senderRole;
        if (!roomId || !role) return;
        setTypingByRoom((prev) => {
          const current = prev?.[roomId] || { user: false, admin: false };
          const next = { ...current };
          if (role === "user") next.user = true;
          if (role === "admin") next.admin = true;
          return { ...(prev || {}), [roomId]: next };
        });
      },
      onStopTyping: (payload) => {
        const roomId = normalizeConversationId(payload?.conversationId);
        const role = payload?.senderRole;
        if (!roomId || !role) return;
        setTypingByRoom((prev) => {
          const current = prev?.[roomId];
          if (!current) return prev || {};
          const next = { ...current };
          if (role === "user") next.user = false;
          if (role === "admin") next.admin = false;
          return { ...(prev || {}), [roomId]: next };
        });
      },
    });
  }, [appendMessage, clearUnread, loadAdminList, loadUserHistory, setHandlers]);

  // Ensure admins rejoin the active conversation room after reconnects.
  const lastJoinedRoomRef = useRef(null);
  useEffect(() => {
    if (!isAdmin) return;
    if (connectionStatus !== CONNECTION.connected) return;
    if (!activeRoom) return;

    const key = String(activeRoom);
    if (lastJoinedRoomRef.current === key) return;

    emitJoin(activeRoom);
    lastJoinedRoomRef.current = key;
  }, [activeRoom, connectionStatus, CONNECTION.connected, emitJoin, isAdmin]);

  // Auto-send a queued message once a room becomes active
  const pendingAutoMessageRef = useRef(null);
  useEffect(() => {
    if (!activeRoom) return;
    const pending = pendingAutoMessageRef.current;
    if (!pending) return;
    pendingAutoMessageRef.current = null;
    sendText(pending);
  }, [activeRoom, sendText]);

  // Reset state on logout
  useEffect(() => {
    if (socketEnabled) return;
    setIsOpen(false);
    setIsMinimized(false);
    setActiveRoom(null);
    setMessagesByRoom({});
    setUnreadCounts({});
    setAdminConversations([]);
    setIsFetchingHistory(false);
    setLastChatError(null);
    scrollPositionsRef.current.clear();
  }, [socketEnabled]);

  const totalUnread = useMemo(() => {
    return Object.values(unreadCounts || {}).reduce((sum, n) => sum + (n || 0), 0);
  }, [unreadCounts]);

  const value = useMemo(
    () => ({
      // UI state
      isOpen,
      isMinimized,
      isAdmin,
      activeRoom,

      // Data
      messages: activeRoom ? messagesByRoom?.[activeRoom] || [] : [],
      messagesByRoom,
      unreadCounts,
      totalUnread,
      adminConversations,

      // Status
      isFetchingHistory,
      connectionStatus,
      CONNECTION,
      lastError: lastChatError || lastSocketError,

      // Typing (for UI)
      isOtherTyping:
        activeRoom && typingByRoom
          ? isAdmin
            ? !!typingByRoom[activeRoom]?.user
            : !!typingByRoom[activeRoom]?.admin
          : false,
      otherTypingLabel: isAdmin
        ? "Traveler is typing…"
        : "Support is typing…",

      // Actions
      openChat,
      openChatWithMessage,
      handleTypingChange,
      minimizeChat,
      maximizeChat,
      closeUi,
      selectRoom,
      acceptRoom,
      sendText,
      clearUnread,
      loadAdminList,
      loadAdminRoom,
      saveScrollPosition,
      getScrollPosition,
    }),
    [
      isOpen,
      isMinimized,
      isAdmin,
      activeRoom,
      messagesByRoom,
      unreadCounts,
      totalUnread,
      adminConversations,
      isFetchingHistory,
      connectionStatus,
      CONNECTION,
      lastChatError,
      lastSocketError,
      openChat,
      openChatWithMessage,
      handleTypingChange,
      minimizeChat,
      maximizeChat,
      closeUi,
      selectRoom,
      acceptRoom,
      sendText,
      clearUnread,
      loadAdminList,
      loadAdminRoom,
      saveScrollPosition,
      getScrollPosition,
      typingByRoom,
    ]
  );

  return (
    <SupportChatContext.Provider value={value}>
      {children}
      {/* Global render targets */}
      {!isAdmin && <SupportChatButton />}
      {!isAdmin && <SupportChatWindow />}
      {isAdmin && <AdminChatLayout />}
    </SupportChatContext.Provider>
  );
}

