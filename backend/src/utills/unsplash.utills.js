import axios from "axios";
import { redisClient } from "../config/redis.config.js";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const DEFAULT_DESTINATION_IMAGE = process.env.DEFAULT_DESTINATION_IMAGE || "";

const isRedisReady = () => redisClient && redisClient.isOpen;

const normalizeCityName = (city) =>
  city ? city.toString().trim().toLowerCase().replace(/\s+/g, " ") : "";

const buildCacheKey = (cityName) =>
  `unsplash:city:${normalizeCityName(cityName)}`;

const buildFallbackImage = () => ({
  imageUrl: DEFAULT_DESTINATION_IMAGE || "",
  photographer: null,
  photographerProfile: null,
  imageSource: "fallback",
});

const withTimeout = (promise, ms) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Unsplash request timed out after ${ms}ms`)),
      ms
    );
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });

const fetchFromUnsplashApi = async (cityName) => {
  if (!UNSPLASH_ACCESS_KEY) {
    return buildFallbackImage();
  }

  try {
    const normalized = normalizeCityName(cityName);
    const url = "https://api.unsplash.com/search/photos";

    const { data } = await withTimeout(
      axios.get(url, {
        params: {
          query: normalized || cityName,
          orientation: "landscape",
          per_page: 1,
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
        timeout: 4500,
      }),
      5000
    );

    const photo = Array.isArray(data?.results) ? data.results[0] : null;
    if (!photo) {
      console.warn(
        `CustomPackage: no Unsplash results for city "${cityName}", using fallback image`
      );
      return buildFallbackImage();
    }

    const snapshot = {
      imageUrl: photo.urls?.regular || photo.urls?.small || "",
      photographer: photo.user?.name || null,
      photographerProfile: photo.user?.links?.html || null,
      imageSource: "unsplash",
    };

    console.log(
      `CustomPackage: destination image for "${cityName}" fetched from Unsplash API`
    );

    return snapshot;
  } catch (error) {
    console.warn(
      `CustomPackage: Unsplash API failed for "${cityName}", using fallback image:`,
      error.message
    );
    return buildFallbackImage();
  }
};

export const fetchDestinationImage = async (cityName) => {
  const normalizedCity = normalizeCityName(cityName);
  if (!normalizedCity) {
    return buildFallbackImage();
  }

  const cacheKey = buildCacheKey(normalizedCity);

  try {
    if (isRedisReady()) {
      const cachedRaw = await redisClient.get(cacheKey);
      if (cachedRaw) {
        try {
          const cached = JSON.parse(cachedRaw);
          if (cached && cached.imageUrl) {
            console.log(
              `CustomPackage: destination image for "${cityName}" served from cache`
            );
            return {
              ...cached,
              imageSource: cached.imageSource || "unsplash",
            };
          }
        } catch {
          // Ignore parse errors and fall through to API
        }
      }
    }
  } catch (err) {
    console.warn(
      `CustomPackage: Redis get failed for destination image "${cityName}":`,
      err.message
    );
  }

  const snapshot = await fetchFromUnsplashApi(cityName);

  try {
    if (isRedisReady() && snapshot && snapshot.imageUrl) {
      await redisClient.setEx(cacheKey, 4 * 60 * 60, JSON.stringify(snapshot));
    }
  } catch (err) {
    console.warn(
      `CustomPackage: Redis set failed for destination image "${cityName}":`,
      err.message
    );
  }

  return snapshot;
};

