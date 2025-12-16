import axios from "axios";
import { ApiError } from "./apiError.utills.js";
import { withCache, cacheKey, TTL } from "./cache.utills.js";

const KIWI_API_KEY = process.env.KIWI_API_KEY;
const KIWI_BASE_URL = "https://tequila-api.kiwi.com";

const axiosWithRetry = async (url, options, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios.get(url, { ...options, timeout: 5000 });
    } catch (err) {
      if (attempt === retries) throw err; // final attempt failed
      console.warn(`Retrying request: attempt ${attempt + 1} failed`);
    }
  }
};

export const getFlightsForTrip = withCache(
  async (destinations, startDate, endDate) => {
    try {
      const dateFrom = startDate.toISOString().slice(0, 10);
      const dateTo = endDate.toISOString().slice(0, 10);

      const requests = destinations.map(async (destination) => {
        const { data } = await axiosWithRetry(`${KIWI_BASE_URL}/v2/search`, {
          headers: { apikey: KIWI_API_KEY },
          params: {
            fly_from: "PK", // Pakistan as origin
            fly_to: destination,
            date_from: dateFrom,
            date_to: dateTo,
            flight_type: "round",
            adults: 1,
            curr: "PKR",
            limit: 5,
            sort: "price",
          },
        });

        return (data.data || []).map((flight) => ({
          destination,
          airline: flight.airlines?.[0] || "N/A",
          flightNumber: `${flight.airlines?.[0] || ""}${
            flight.flight_no || ""
          }`,
          departure: {
            time: flight.local_departure,
            airport: flight.flyFrom,
          },
          arrival: {
            time: flight.local_arrival,
            airport: flight.flyTo,
          },
          price: {
            amount: flight.price,
            currency: "PKR",
          },
          duration: flight.duration?.total,
          stops: (flight.routes?.[0]?.length || 1) - 1,
          bookingLink: flight.deep_link,
        }));
      });

      // Wait for all destinations and flatten results
      return (await Promise.all(requests)).flat();
    } catch (err) {
      const status = err.response?.status || 500;
      const msg = err.response?.data?.message || err.message;
      throw new ApiError(status, `Failed to fetch flights: ${msg}`);
    }
  },
  // Cache key: flights for combination of destinations + dates
  (destinations, startDate, endDate) =>
    `flights:${destinations.join(
      ","
    )}:${startDate.toISOString()}:${endDate.toISOString()}`,
  TTL.FLIGHTS
);
