import { redisClient } from "../config/redis.config.js";

export const TTL = {
  WEATHER: 1800, // 30 min
  HOTELS: 3600, // 1 hour
  FLIGHTS: 3600, // 1 hour
  CITY: 86400, // 24 hr for city lookups
};

export const cacheKey = {
  weather: (location, start, end) => `weather:${location}:${start}:${end}`,
  hotels: (location) => `hotels:${location}`,
  hotelSearch: (city, checkIn, checkOut, adults) =>
    `hotels:${city}:${checkIn}:${checkOut}:${adults}`,
  city: (city) => `city:${city}`,
  flights: (originCity, destinationCity, start, end, adults) =>
    `flights:${originCity}-${destinationCity}:${start}:${end}:${adults}`,
};

const isRedisReady = () => redisClient && redisClient.isOpen;

const safeParse = (value) => {
  if (value === null || value === undefined) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const cacheService = {
  get: async (key) => {
    if (!isRedisReady()) return undefined;
    const raw = await redisClient.get(key);
    if (raw === null) return undefined;
    return safeParse(raw);
  },
  set: async (key, value, ttlSeconds = TTL.WEATHER) => {
    if (!isRedisReady()) return false;
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  },
  delete: async (key) => {
    if (!isRedisReady()) return false;
    await redisClient.del(key);
    return true;
  },
  clear: async () => {
    if (!isRedisReady()) return false;
    // Namespace-aware clearing can be added later; for now no-op
    return true;
  },
  stats: async () => {
    // Basic stub for compatibility; real metrics can be added later
    return {
      keys: null,
      hits: null,
      misses: null,
    };
  },
};

// Wrapper to auto-cache function results
export const withCache = (fn, keyGenerator, ttl) => {
  return async (...args) => {
    const key = keyGenerator(...args) || JSON.stringify(args);

    if (isRedisReady()) {
      const cachedRaw = await redisClient.get(key);
      const cached = safeParse(cachedRaw);
      if (cached !== null) {
        return cached;
      }
    }

    const result = await fn(...args);
    if (isRedisReady()) {
      await redisClient.setEx(key, ttl, JSON.stringify(result));
    }
    return result;
  };
};
