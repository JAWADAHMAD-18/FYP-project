import axios from "axios";
import { ApiError } from "./apiError.utills.js";
import { getAmadeusAccessToken } from "../Auth/amadeus.auth.js";
import AMADEUS_CONFIG from "../config/amadeus.config.js";
import { redisClient } from "../config/redis.config.js";

const getAmadeusBaseUrl = () =>
  AMADEUS_CONFIG.baseUrls[AMADEUS_CONFIG.environment] ||
  AMADEUS_CONFIG.baseUrls.test;

const POI_TTL_SECONDS = 4 * 60 * 60; // 4 hours

const isRedisReady = () => redisClient && redisClient.isOpen;

const normalizeCityName = (city) =>
  city ? city.toString().trim().toLowerCase().replace(/\s+/g, " ") : "";

const buildPoiCacheKey = (cityName) =>
  `poi:city:${normalizeCityName(cityName)}`;

const fetchPoisFromApi = async (cityName) => {
  if (!cityName || typeof cityName !== "string" || cityName.trim().length < 2) {
    throw new ApiError(400, "City name is required to fetch POIs");
  }

  try {
    const token = await getAmadeusAccessToken();
    const baseUrl = getAmadeusBaseUrl();

    const { data } = await axios.get(
      `${baseUrl}/v1/reference-data/locations/pois`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          keyword: cityName,
        },
        timeout: 8000,
      }
    );

    const pois = Array.isArray(data?.data) ? data.data : [];

    const cleaned = pois.slice(0, 5).map((poi) => ({
      id: poi.id,
      name: poi.name,
      category: poi.category,
      rank: poi.rank,
      tags: poi.tags,
      // Avoid storing large raw geometry objects; keep only minimal coordinates
      geoCode: poi.geoCode
        ? {
            latitude: poi.geoCode.latitude,
            longitude: poi.geoCode.longitude,
          }
        : null,
    }));

    console.log(
      `CustomPackage: POIs for "${cityName}" fetched from Amadeus API`
    );

    return cleaned;
  } catch (error) {
    const status = error.response?.status || 500;
    const detail =
      error.response?.data?.errors?.[0]?.detail || error.message || "Unknown";

    throw new ApiError(
      status,
      `Failed to fetch POIs for city "${cityName}": ${detail}`
    );
  }
};

export const fetchPOIs = async (cityName) => {
  const cacheKey = buildPoiCacheKey(cityName);

  try {
    if (isRedisReady()) {
      const cachedRaw = await redisClient.get(cacheKey);
      if (cachedRaw) {
        try {
          const cached = JSON.parse(cachedRaw);
          if (Array.isArray(cached) && cached.length) {
            console.log(
              `CustomPackage: POIs for "${cityName}" served from cache`
            );
            return cached;
          }
        } catch {
          // Ignore parse errors and fall through to API
        }
      }
    }
  } catch (err) {
    console.warn(
      `CustomPackage: Redis get failed for POIs "${cityName}":`,
      err.message
    );
  }

  const pois = await fetchPoisFromApi(cityName);

  try {
    if (isRedisReady() && Array.isArray(pois)) {
      await redisClient.setEx(cacheKey, POI_TTL_SECONDS, JSON.stringify(pois));
    }
  } catch (err) {
    console.warn(
      `CustomPackage: Redis set failed for POIs "${cityName}":`,
      err.message
    );
  }

  return pois;
};

// Backwards-compatible alias (if used elsewhere)
export const getPOIsForCity = fetchPOIs;

