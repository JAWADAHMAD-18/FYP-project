

import { redisClient } from '../config/redis.config.js';

// Session expiry: 2 hours (7200 seconds)
const SESSION_EXPIRY = 7200;

// Maximum messages to store per session (last 8 messages = 4 user + 4 bot)
const MAX_MESSAGES = 8;

/**
 * Get user session from Redis
 * @param {string} sessionId - Unique session identifier
 * @returns {Array} - Array of message objects [{role, content}]
 */
const getUserSession = async (sessionId) => {
    try {
        const sessionKey = `session:${sessionId}`;
        const sessionData = await redisClient.get(sessionKey);

        if (!sessionData) {
            return [];
        }

        const messages = JSON.parse(sessionData);
        return Array.isArray(messages) ? messages : [];
    } catch (error) {
        console.error('Error getting session:', error.message);
        return [];
    }
};

/**
 * Save user session to Redis
 * @param {string} sessionId - Unique session identifier
 * @param {Array} messages - Array of message objects
 * @returns {boolean} - Success status
 */
const saveUserSession = async (sessionId, messages) => {
    try {
        const sessionKey = `session:${sessionId}`;

        // Keep only last MAX_MESSAGES (8 messages)
        const recentMessages = messages.slice(-MAX_MESSAGES);

        // Save with 2-hour expiry
        await redisClient.setEx(
            sessionKey,
            SESSION_EXPIRY,
            JSON.stringify(recentMessages)
        );

        return true;
    } catch (error) {
        console.error(' Error saving session:', error.message);
        return false;
    }
};

/**
 * Add message to session
 * @param {string} sessionId - Unique session identifier
 * @param {string} role - 'user' or 'model'
 * @param {string} content - Message content
 * @returns {boolean} - Success status
 */
const addMessageToSession = async (sessionId, role, content) => {
    try {
        // Get existing session
        const messages = await getUserSession(sessionId);

        // Add new message
        messages.push({ role, content });

        // Save updated session
        return await saveUserSession(sessionId, messages);
    } catch (error) {
        console.error(' Error adding message to session:', error.message);
        return false;
    }
};

/**
 * Clear user session
 * @param {string} sessionId - Unique session identifier
 * @returns {boolean} - Success status
 */
const clearUserSession = async (sessionId) => {
    try {
        const sessionKey = `session:${sessionId}`;
        await redisClient.del(sessionKey);
        return true;
    } catch (error) {
        console.error('Error clearing session:', error.message);
        return false;
    }
};

/**
 * Check if session exists
 * @param {string} sessionId - Unique session identifier
 * @returns {boolean} - Exists status
 */
const sessionExists = async (sessionId) => {
    try {
        const sessionKey = `session:${sessionId}`;
        const exists = await redisClient.exists(sessionKey);
        return exists === 1;
    } catch (error) {
        console.error('Error checking session:', error.message);
        return false;
    }
};

/**
 * Get session TTL (time to live)
 * @param {string} sessionId - Unique session identifier
 * @returns {number} - Seconds remaining (-1 if no expiry, -2 if not exists)
 */
const getSessionTTL = async (sessionId) => {
    try {
        const sessionKey = `session:${sessionId}`;
        const ttl = await redisClient.ttl(sessionKey);
        return ttl;
    } catch (error) {
        console.error('Error getting session TTL:', error.message);
        return -2;
    }
};

/**
 * Get all session keys (for debugging)
 * @returns {Array} - Array of session keys
 */
const getAllSessions = async () => {
    try {
        const keys = await redisClient.keys('session:*');
        return keys;
    } catch (error) {
        console.error('Error getting all sessions:', error.message);
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
    MAX_MESSAGES
};