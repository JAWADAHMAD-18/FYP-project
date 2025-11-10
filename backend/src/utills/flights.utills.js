import axios from "axios";
import { ApiError } from "./apiError.utills.js";

const KIWI_API_KEY = process.env.KIWI_API_KEY;
const KIWI_BASE_URL = "https://tequila-api.kiwi.com";

export const getFlightsForTrip = async (destinations, startDate, endDate) => {
  try {
    const dateFrom = startDate.toISOString().slice(0, 10);
    const dateTo = endDate.toISOString().slice(0, 10);

    const requests = destinations.map(async (destination) => {
      const { data } = await axios.get(`${KIWI_BASE_URL}/v2/search`, {
        headers: { apikey: KIWI_API_KEY },
        params: {
          fly_from: "PK", // Pakistan se flights
          fly_to: destination,
          date_from: dateFrom,
          date_to: dateTo,
          flight_type: "round",
          adults: 1,
          curr: "PKR", // Currency bhi PKR kar di
          limit: 5,
          sort: "price",
        },
      });

      return (data.data || []).map((flight) => ({
        destination,
        airline: flight.airlines?.[0] || "N/A",
        flightNumber: `${flight.airlines?.[0] || ""}${flight.flight_no || ""}`,
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
          currency: "INR",
        },
        duration: flight.duration?.total,
        stops: (flight.routes?.[0]?.length || 1) - 1,
        bookingLink: flight.deep_link,
      }));
    });

    return (await Promise.all(requests)).flat();
  } catch (err) {
    const status = err.response?.status || 500;
    const msg = err.response?.data?.message || err.message;
    throw new ApiError(status, `Failed to fetch flights: ${msg}`);
  }
};
