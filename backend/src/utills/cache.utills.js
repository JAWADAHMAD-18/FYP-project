import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 0, // Let TTL be always custom
  checkperiod: 120,
  useClones: false,
});

export const TTL = {
  WEATHER: 1800, // 30 min
  HOTELS: 86400, // 24 hr
  FLIGHTS: 900, // 15 min
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

export const cacheService = {
  get: cache.get.bind(cache),
  set: cache.set.bind(cache),
  delete: cache.del.bind(cache),
  clear: cache.flushAll.bind(cache),
  stats: cache.getStats.bind(cache),
};

// Wrapper to auto-cache function results
export const withCache = (fn, keyGenerator, ttl) => {
  return async (...args) => {
    const key = keyGenerator(...args) || JSON.stringify(args);

    const cached = cache.get(key);
    if (cached !== undefined) return cached; // No console.log → faster

    const result = await fn(...args);
    cache.set(key, result, ttl);
    return result;
  };
};
