import { redisClient } from "../config/redis.config.js";

const DEFAULT_TTL = 300; // 5 minutes

const isRedisReady = () => {
  return redisClient && redisClient.isOpen;
};

// Generic get from cache
export const getCache = async (key) => {
  try {
    if (!isRedisReady()) return null;

    const data = await redisClient.get(key);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch (err) {
      console.warn(`⚠️ Failed to parse cache for key "${key}"`);
      return null;
    }
  } catch (err) {
    console.error("❌ Redis getCache error:", err.message);
    return null;
  }
};

// Generic set to cache
export const setCache = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    if (!isRedisReady()) return false;
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error("❌ Redis setCache error:", err.message);
    return false;
  }
};

// Generic delete from cache
export const deleteCache = async (key) => {
  try {
    if (!isRedisReady()) return false;
    await redisClient.del(key);
    return true;
  } catch (err) {
    console.error("❌ Redis deleteCache error:", err.message);
    return false;
  }
};

// Check if cache exists
export const cacheExists = async (key) => {
  try {
    if (!isRedisReady()) return false;
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (err) {
    console.error("❌ Redis cacheExists error:", err.message);
    return false;
  }
};

// Get TTL of a key
export const getCacheTTL = async (key) => {
  try {
    if (!isRedisReady()) return -2;
    return await redisClient.ttl(key); // -2 = key does not exist
  } catch (err) {
    console.error("❌ Redis getCacheTTL error:", err.message);
    return -2;
  }
};

/**
 * Utility function to generate namespaced keys
 
 */
export const generateKey = (prefix, identifier) => {
  return `${prefix}:${identifier}`;
};
