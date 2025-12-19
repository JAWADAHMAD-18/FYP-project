import axios from "axios";
import { ApiError } from "./apiError.utills.js";
import { withCache, cacheKey, TTL } from "./cache.utills.js";
import { getAmadeusAccessToken } from "../Auth/amadeus.auth.js";
import { getCityIATACode } from "./locations.utils.js";

const AMADEUS_BASE = "https://test.api.amadeus.com/v2";


const axiosWithRetry = async (config, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios({ ...config, timeout: 10000 });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 && attempt < retries) {
        // Token might be expired, refresh and retry
        console.warn("401 Unauthorized, retrying with fresh token...");
      } else if (attempt === retries) {
        throw err;
      } else {
        console.warn(`Retrying request, attempt ${attempt + 1} failed`);
      }
    }
  }
};

// Core: Search Flights
export const searchFlights = withCache(
  async ({
    originCity,
    destinationCity,
    departureDate,
    returnDate,
    adults = 1,
    currency = "USD",
  }) => {
    if (!originCity || !destinationCity) {
      throw new ApiError(400, "Origin and destination cities are required");
    }

    try {
      const origin = await getCityIATACode(originCity);
      const destination = await getCityIATACode(destinationCity);

      //  Get token
      const token = await getAmadeusAccessToken();

      //  Fetch flights
      const { data } = await axiosWithRetry({
        method: "GET",
        url: `${AMADEUS_BASE}/shopping/flight-offers`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          originLocationCode: origin,
          destinationLocationCode: destination,
          departureDate,
          returnDate,
          adults,
          currencyCode: currency,
          max: 10,
        },
      });

      if (!data?.data?.length) {
        return []; // No flights found
      }

      //  Normalize
      return data.data.map((offer) => {
        const itinerary = offer.itineraries[0];
        const segment = itinerary.segments[0];

        return {
          flightId: offer.id,
          airline: offer.validatingAirlineCodes?.[0] || "N/A",
          origin,
          destination,
          departure: {
            time: segment.departure.at,
            airport: segment.departure.iataCode,
          },
          arrival: {
            time: segment.arrival.at,
            airport: segment.arrival.iataCode,
          },
          duration: itinerary.duration,
          stops: itinerary.segments.length - 1,
          price: {
            total: offer.price.total,
            currency: offer.price.currency,
          },
          seatsAvailable: offer.numberOfBookableSeats || null,
          cabin: segment.cabin || "ECONOMY",
        };
      });
    } catch (err) {
      const status = err.response?.status || 500;
      const msg = err.response?.data?.errors?.[0]?.detail || err.message;
      throw new ApiError(status, `Failed to fetch flights: ${msg}`);
    }
  },
  (params) =>
    cacheKey.flights(
      params.originCity,
      params.destinationCity,
      params.departureDate,
      params.returnDate,
      params.adults
    ),
  TTL.FLIGHTS
);
