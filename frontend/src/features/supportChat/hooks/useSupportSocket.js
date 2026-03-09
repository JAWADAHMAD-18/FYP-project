import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io as createSocketClient } from "socket.io-client";
import { getSocketUrl } from "../config";

const CONNECTION = {
  disconnected: "disconnected",
  connecting: "connecting",
  connected: "connected",
  error: "error",
};

let sharedSocket = null;
let sharedKey = null;

function buildKey({ url, token }) {
  return `${url}::${token || ""}`;
}

export function useSupportSocket({ token, enabled }) {
  const socketUrl = useMemo(() => getSocketUrl(), []);
  const key = useMemo(() => buildKey({ url: socketUrl, token }), [socketUrl, token]);

  const [status, setStatus] = useState(CONNECTION.disconnected);
  const [lastError, setLastError] = useState(null);

  const socketRef = useRef(null);
  const handlersRef = useRef({
    onMessage: null,
    onReady: null,
    onError: null,
    onSystem: null,
    onClosed: null,
    onConversationNew: null,
    onConversationReleased: null,
    onTyping: null,
    onStopTyping: null,
  });

  const setHandlers = useCallback((handlers) => {
    handlersRef.current = { ...handlersRef.current, ...handlers };
  }, []);

  // Stable emitters
  const emitStart = useCallback(() => {
    const s = socketRef.current;
    if (!s) return;
    s.emit("chat:start");
  }, []);

  const emitAccept = useCallback((conversationId) => {
    const s = socketRef.current;
    if (!s || !conversationId) return;
    s.emit("chat:accept", { conversationId });
  }, []);

  const emitClose = useCallback((conversationId) => {
    const s = socketRef.current;
    if (!s || !conversationId) return;
    s.emit("chat:close", { conversationId });
  }, []);

  const emitMessage = useCallback(({ conversationId, text }) => {
    const s = socketRef.current;
    if (!s || !conversationId || !text) return;
    s.emit("chat:message", { conversationId, text });
  }, []);

  const emitJoin = useCallback((conversationId) => {
    const s = socketRef.current;
    if (!s || !conversationId) return;
    s.emit("chat:join", { conversationId });
  }, []);

  const emitTyping = useCallback((conversationId) => {
    const s = socketRef.current;
    if (!s || !conversationId) return;
    s.emit("chat:typing", { conversationId });
  }, []);

  const emitStopTyping = useCallback((conversationId) => {
    const s = socketRef.current;
    if (!s || !conversationId) return;
    s.emit("chat:stopTyping", { conversationId });
  }, []);

  useEffect(() => {
    if (!enabled) {
      setStatus(CONNECTION.disconnected);
      setLastError(null);
      return;
    }

    if (!token) {
      setStatus(CONNECTION.error);
      setLastError("Access token missing");
      return;
    }

    // Reuse singleton when possible; recreate if token/url changes.
    const shouldReuse = sharedSocket && sharedKey === key;
    const socket =
      shouldReuse
        ? sharedSocket
        : createSocketClient(socketUrl, {
            auth: { token },
            transports: ["websocket", "polling"],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 500,
            reconnectionDelayMax: 5000,
            timeout: 20000,
          });

    if (!shouldReuse) {
      // Cleanup old shared socket (token changed / url changed)
      if (sharedSocket) {
        try {
          sharedSocket.removeAllListeners();
          sharedSocket.disconnect();
        } catch {
          // ignore
        }
      }
      sharedSocket = socket;
      sharedKey = key;
    }

    socketRef.current = socket;
    setStatus(socket.connected ? CONNECTION.connected : CONNECTION.connecting);

    const onConnect = () => {
      setStatus(CONNECTION.connected);
      setLastError(null);
    };

    const onDisconnect = () => {
      setStatus(CONNECTION.disconnected);
    };

    const onConnectError = (err) => {
      setStatus(CONNECTION.error);
      setLastError(err?.message || "Socket connection failed");
    };

    const onChatError = (message) => {
      setLastError(message || "Chat error");
      handlersRef.current.onError?.(message);
    };

    const onChatReady = (conversation) => {
      handlersRef.current.onReady?.(conversation);
    };

    const onChatMessage = (message) => {
      handlersRef.current.onMessage?.(message);
    };

    const onChatSystem = (message) => {
      handlersRef.current.onSystem?.(message);
    };

    const onChatClosed = (payload) => {
      handlersRef.current.onClosed?.(payload);
    };

    const onConversationNew = (payload) => {
      handlersRef.current.onConversationNew?.(payload);
    };

    const onConversationReleased = (payload) => {
      handlersRef.current.onConversationReleased?.(payload);
    };

    const onChatTyping = (payload) => {
      handlersRef.current.onTyping?.(payload);
    };

    const onChatStopTyping = (payload) => {
      handlersRef.current.onStopTyping?.(payload);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    socket.on("chat:error", onChatError);
    socket.on("chat:ready", onChatReady);
    socket.on("chat:message", onChatMessage);
    socket.on("chat:system", onChatSystem);
    socket.on("chat:closed", onChatClosed);
    socket.on("conversation:new", onConversationNew);
    socket.on("conversation:released", onConversationReleased);
    socket.on("chat:typing", onChatTyping);
    socket.on("chat:stopTyping", onChatStopTyping);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("chat:error", onChatError);
      socket.off("chat:ready", onChatReady);
      socket.off("chat:message", onChatMessage);
      socket.off("chat:system", onChatSystem);
      socket.off("chat:closed", onChatClosed);
      socket.off("conversation:new", onConversationNew);
      socket.off("conversation:released", onConversationReleased);
      socket.off("chat:typing", onChatTyping);
      socket.off("chat:stopTyping", onChatStopTyping);
      // Keep singleton socket alive for the single global provider; it will be
      // explicitly disconnected when auth token changes or provider unmounts.
    };
  }, [enabled, token, socketUrl, key]);

  return {
    socket: socketRef.current,
    status,
    lastError,
    setHandlers,
    emitStart,
    emitAccept,
    emitClose,
    emitMessage,
    emitJoin,
    emitTyping,
    emitStopTyping,
    CONNECTION,
  };
}

