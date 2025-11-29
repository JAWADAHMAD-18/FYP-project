// ============================================
// REDIS CONFIGURATION
// Travel with Jawad - Jawad Tech Group
// ============================================

import dotenv from 'dotenv';
dotenv.config();

import redis from 'redis';

// Create Redis client
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    // password: process.env.REDIS_PASSWORD, // Uncomment if using password
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

// Reconnection
redisClient.on('reconnecting', () => {
    console.log('🔄 Redis: Reconnecting...');
});

// Connection ended
redisClient.on('end', () => {
    console.log('⚠️  Redis: Connection closed');
});

// Connect to Redis
const connectRedis = async () => {
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
const disconnectRedis = async () => {
    try {
        if (redisClient.isOpen) {
            await redisClient.quit();
            console.log('✅ Redis: Disconnected gracefully');
        }
    } catch (error) {
        console.error('❌ Redis Disconnect Error:', error.message);
    }
};

export {
    redisClient,
    connectRedis,
    disconnectRedis
};