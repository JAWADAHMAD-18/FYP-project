import { redisClient } from "../config/redis.config.js";

// Session expiry: 2 hours (7200 seconds)
const SESSION_EXPIRY = 7200;
//TODO: redis ki etension try out karo local machine kijaggah
// Maximum messages per session (last 4 user + 4 model)
const MAX_MESSAGES = 8;

// Check Redis availability
const isRedisReady = () => {
  return redisClient && redisClient.isOpen;
};

const getUserSession = async (sessionId) => {
  try {
    if (!isRedisReady()) {
      console.warn("⚠️ Redis not connected (getUserSession)");
      return [];
    }

    const sessionKey = `session:${sessionId}`;
    const sessionData = await redisClient.get(sessionKey);

    if (!sessionData) return [];

    const messages = JSON.parse(sessionData);
    return Array.isArray(messages) ? messages : [];
  } catch (error) {
    console.error("❌ Error getting session:", error.message);
    return [];
  }
};

const saveUserSession = async (sessionId, messages) => {
  try {
    if (!isRedisReady()) {
      console.warn("⚠️ Redis not connected (saveUserSession)");
      return false;
    }

    const sessionKey = `session:${sessionId}`;
    const recentMessages = messages.slice(-MAX_MESSAGES);

    await redisClient.setEx(
      sessionKey,
      SESSION_EXPIRY,
      JSON.stringify(recentMessages)
    );

    return true;
  } catch (error) {
    console.error("❌ Error saving session:", error.message);
    return false;
  }
};

// Add message to session
const addMessageToSession = async (sessionId, role, content) => {
  try {
    if (!isRedisReady()) {
      console.warn("⚠️ Redis not connected (addMessageToSession)");
      return false;
    }

    const messages = await getUserSession(sessionId);
    messages.push({ role, content });

    return await saveUserSession(sessionId, messages);
  } catch (error) {
    console.error("❌ Error adding message:", error.message);
    return false;
  }
};

// Clear user session
const clearUserSession = async (sessionId) => {
  try {
    if (!isRedisReady()) {
      console.warn("⚠️ Redis not connected (clearUserSession)");
      return false;
    }

    const sessionKey = `session:${sessionId}`;
    await redisClient.del(sessionKey);
    return true;
  } catch (error) {
    console.error("❌ Error clearing session:", error.message);
    return false;
  }
};

// Check if session exists
const sessionExists = async (sessionId) => {
  try {
    if (!isRedisReady()) return false;

    const sessionKey = `session:${sessionId}`;
    const exists = await redisClient.exists(sessionKey);
    return exists === 1;
  } catch (error) {
    console.error("❌ Error checking session:", error.message);
    return false;
  }
};

// Get session TTL
const getSessionTTL = async (sessionId) => {
  try {
    if (!isRedisReady()) return -2;

    const sessionKey = `session:${sessionId}`;
    return await redisClient.ttl(sessionKey);
  } catch (error) {
    console.error("❌ Error getting TTL:", error.message);
    return -2;
  }
};

// Get all sessions (DEV ONLY)
const getAllSessions = async () => {
  try {
    if (!isRedisReady()) return [];

    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️ getAllSessions disabled in production");
      return [];
    }

    return await redisClient.keys("session:*");
  } catch (error) {
    console.error("❌ Error getting sessions:", error.message);
    return [];
  }
};

export {
  getUserSession,
  saveUserSession,
  addMessageToSession,
  clearUserSession,
  sessionExists,
  getSessionTTL,
  getAllSessions,
  SESSION_EXPIRY,
  MAX_MESSAGES,
};
