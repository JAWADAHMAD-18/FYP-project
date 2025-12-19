import axios from "axios";
import { ApiError } from "./apiError.utills.js";
import { withCache, cacheKey, TTL } from "./cache.utills.js";
import { getAmadeusAccessToken } from "./amadeus.auth.js";

const AMADEUS_BASE = "https://test.api.amadeus.com/v1";

export const getCityIATACode = withCache(
  async (cityName) => {
    if (!cityName || cityName.length < 2) {
      throw new ApiError(400, "Invalid city name");
    }

    const token = await getAmadeusAccessToken();

    const { data } = await axios.get(
      `${AMADEUS_BASE}/reference-data/locations`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          keyword: cityName,
          subType: "CITY",
        },
      }
    );

    const city = data?.data?.[0];

    if (!city?.iataCode) {
      throw new ApiError(404, `No IATA code found for ${cityName}`);
    }

    return city.iataCode;
  },
  (cityName) => cacheKey.city(cityName),
  TTL.CITY
);
