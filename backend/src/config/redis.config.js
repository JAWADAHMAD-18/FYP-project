// ============================================
// REDIS CONFIGURATION (ES MODULE VERSION)
// Travel with Jawad - Jawad Tech Group
// ============================================

import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Create Redis client
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('❌ Redis: Too many reconnection attempts');
                return new Error('Redis reconnection failed');
            }
            // Reconnect after 1 second
            return 1000;
        }
    }
});

// Error handling
redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err.message);
});

// Connection success
redisClient.on('connect', () => {
    console.log('✅ Redis: Connecting...');
});

redisClient.on('ready', () => {
    console.log('✅ Redis: Connected and ready');
});

// Reconnecting
redisClient.on('reconnecting', () => {
    console.log('🔄 Redis: Reconnecting...');
});

// Connection ended
redisClient.on('end', () => {
    console.log('⚠️ Redis: Connection closed');
});

// Connect to Redis
export const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error('❌ Redis Connection Error:', error.message);
        throw error;
    }
};

// Graceful shutdown
export const disconnectRedis = async () => {
    try {
        if (redisClient.isOpen) {
            await redisClient.quit();
            console.log('✅ Redis: Disconnected gracefully');
        }
    } catch (error) {
        console.error('❌ Redis Disconnect Error:', error.message);
    }
};

export { redisClient };
