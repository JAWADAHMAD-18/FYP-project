import axios from "axios";
import { ApiError } from "./apiError.utills.js";
import { withCache, cacheKey, TTL } from "./cache.utills.js";

const OPENTRIPMAP_API_KEY = process.env.OPENTRIPMAP_API_KEY;
const BASE = "https://api.opentripmap.com/0.1";

const validateLocation = (location) => {
  location = (location || "").trim();
  if (location.length < 2)
    throw new ApiError(400, "Location must be at least 2 characters");
  return location;
};

const axiosWithRetry = async (url, options, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios.get(url, { ...options, timeout: 5000 });
    } catch (err) {
      if (attempt === retries) throw err; // final failure
    }
  }
};

const getLocationDetails = withCache(
  async (location) => {
    const safeLocation = encodeURIComponent(location);
    const { data } = await axiosWithRetry(`${BASE}/en/places/geoname`, {
      params: { name: safeLocation, apikey: OPENTRIPMAP_API_KEY },
    });
    if (!data) throw new ApiError(404, `Location not found: ${location}`);
    return data;
  },
  (location) => `location:${location}`,
  TTL.HOTELS
);

const getHotelDetails = withCache(
  async (id) => {
    try {
      const { data } = await axiosWithRetry(`${BASE}/en/places/xid/${id}`, {
        params: { apikey: OPENTRIPMAP_API_KEY },
      });
      return data;
    } catch (error) {
      console.error(`Error fetching hotel details for ${id}:`, error.message);
      return null;
    }
  },
  (id) => `hotel:${id}`,
  TTL.HOTELS
);

export const getHotelsForLocation = withCache(
  async (location) => {
    location = validateLocation(location);

    // Get coordinates
    const { lat, lon } = await getLocationDetails(location);

    // Fetch nearby hotels (radius 4km, limit 10)
    const { data: list } = await axiosWithRetry(`${BASE}/en/places/radius`, {
      params: {
        radius: 4000,
        lat,
        lon,
        kinds: "hotels",
        limit: 6,
        apikey: OPENTRIPMAP_API_KEY,
      },
    });

    // Fetch detailed info for each hotel in parallel
    const details = await Promise.all(list.map((h) => getHotelDetails(h.xid)));

    // Map final result
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
