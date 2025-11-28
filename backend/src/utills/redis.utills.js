// ============================================
// REDIS UTILITIES - SESSION MANAGEMENT
// Travel with Jawad - Jawad Tech Group
// ============================================

import { redisClient } from '../config/redis.config.js';

// Session expiry: 2 hours (7200 seconds)
export const SESSION_EXPIRY = 7200;

// Maximum messages to store per session
export const MAX_MESSAGES = 8;

/**
 * Get user session from Redis
 */
export const getUserSession = async (sessionId) => {
    try {
        const sessionKey = `session:${sessionId}`;
        const sessionData = await redisClient.get(sessionKey);

        if (!sessionData) return [];

        const messages = JSON.parse(sessionData);
        return Array.isArray(messages) ? messages : [];
    } catch (error) {
        console.error('❌ Error getting session:', error.message);
        return [];
    }
};

/**
 * Save user session to Redis
 */
export const saveUserSession = async (sessionId, messages) => {
    try {
        const sessionKey = `session:${sessionId}`;

        const recentMessages = messages.slice(-MAX_MESSAGES);

        await redisClient.setEx(
            sessionKey,
            SESSION_EXPIRY,
            JSON.stringify(recentMessages)
        );

        return true;
    } catch (error) {
        console.error('❌ Error saving session:', error.message);
        return false;
    }
};

/**
 * Add message to session
 */
export const addMessageToSession = async (sessionId, role, content) => {
    try {
        const messages = await getUserSession(sessionId);

        messages.push({ role, content });

        return await saveUserSession(sessionId, messages);
    } catch (error) {
        console.error('❌ Error adding message to session:', error.message);
        return false;
    }
};

/**
 * Clear user session
 */
export const clearUserSession = async (sessionId) => {
    try {
        const sessionKey = `session:${sessionId}`;
        await redisClient.del(sessionKey);
        return true;
    } catch (error) {
        console.error('❌ Error clearing session:', error.message);
        return false;
    }
};

/**
 * Check if session exists
 */
export const sessionExists = async (sessionId) => {
    try {
        const sessionKey = `session:${sessionId}`;
        const exists = await redisClient.exists(sessionKey);
        return exists === 1;
    } catch (error) {
        console.error('❌ Error checking session:', error.message);
        return false;
    }
};

/**
 * Get session TTL
 */
export const getSessionTTL = async (sessionId) => {
    try {
        const sessionKey = `session:${sessionId}`;
        const ttl = await redisClient.ttl(sessionKey);
        return ttl;
    } catch (error) {
        console.error('❌ Error getting session TTL:', error.message);
        return -2;
    }
};

/**
 * Get all sessions
 */
export const getAllSessions = async () => {
    try {
        const keys = await redisClient.keys('session:*');
        return keys;
    } catch (error) {
        console.error('❌ Error getting all sessions:', error.message);
        return [];
    }
};
