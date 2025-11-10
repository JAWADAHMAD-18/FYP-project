import axios from "axios";
import { ApiError } from "./apiError.utills.js";
import { withCache, cacheKey, TTL } from "./cache.utills.js";
import { externalApiLimiter } from "./rateLimiter.utills.js";

const OPENTRIPMAP_API_KEY = process.env.OPENTRIPMAP_API_KEY;
const BASE = "https://api.opentripmap.com/0.1";

// Validate location
const validateLocation = (location) => {
  location = (location || "").trim();
  if (location.length < 2)
    throw new ApiError(400, "Location must be at least 2 characters");
  return location;
};

// Get location coordinates (cached)
const getLocationDetails = withCache(
  async (location) => {
    const { data } = await axios.get(`${BASE}/en/places/geoname`, {
      params: { name: location, apikey: OPENTRIPMAP_API_KEY },
    });

    if (!data) throw new ApiError(404, `Location not found: ${location}`);
    return data;
  },
  (location) => `location:${location}`,
  TTL.HOTELS
);

// Get hotel detail (cached)
const getHotelDetails = withCache(
  async (id) => {
    try {
      const { data } = await axios.get(`${BASE}/en/places/xid/${id}`, {
        params: { apikey: OPENTRIPMAP_API_KEY },
      });
      return data;
    } catch {
      return null; // Silent fail, handled later
    }
  },
  (id) => `hotel:${id}`,
  TTL.HOTELS
);

// Main: get hotels for location (cached)
export const getHotelsForLocation = withCache(
  async (location) => {
    location = validateLocation(location);

    const { lat, lon } = await getLocationDetails(location);

    const { data: list } = await axios.get(`${BASE}/en/places/radius`, {
      params: {
        radius: 2000,
        lat,
        lon,
        kinds: "hotels",
        limit: 10,
        apikey: OPENTRIPMAP_API_KEY,
      },
    });

    const details = await Promise.all(list.map((h) => getHotelDetails(h.xid)));

    return list
      .map((h, i) => {
        const d = details[i];
        if (!d) return null;

        return {
          name: h.name,
          rating: h.rate || "N/A",
          location: {
            lat: h.point.lat,
            lon: h.point.lon,
            address: d.address || {},
          },
          description: d.info?.descr || "",
          priceLevel: d.price_level || "Contact for prices",
          phone: d.phone,
          website: d.url,
          preview: d.preview || null,
        };
      })
      .filter(Boolean);
  },
  (location) => cacheKey.hotels(location),
  TTL.HOTELS
);
