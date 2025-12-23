import axios from "axios";
import { ApiError } from "./apiError.utills.js";
import { withCache, cacheKey, TTL } from "./cache.utills.js";
import { getAmadeusAccessToken } from "../Auth/amadeus.auth.js";
import { getCityIATACode } from "./locations.utills.js";

const AMADEUS_V1 = "https://test.api.amadeus.com/v1";
const AMADEUS_V3 = "https://test.api.amadeus.com/v3";

export const searchHotelsWithAvailability = withCache(
  async ({ cityName, checkInDate, checkOutDate, adults = 1 }) => {
    //  Convert city name to IATA code
    const cityCode = await getCityIATACode(cityName);

    //  Get Amadeus access token
    const token = await getAmadeusAccessToken();

    //  Fetch hotel reference list for the city
    const hotelRes = await axios.get(
      `${AMADEUS_V1}/reference-data/locations/hotels/by-city`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { cityCode },
      }
    );

    const hotels = hotelRes?.data?.data;
    if (!hotels?.length) {
      throw new ApiError(404, "No hotels found");
    }

    // Limit hotel IDs to avoid hitting Amadeus API hard limits
    const hotelIds = hotels.slice(0, 10).map((h) => h.hotelId);

    // Get hotel availability & pricing
    // Note: checkInDate/checkOutDate are passed as-is to Amadeus for availability
    const offersRes = await axios.get(`${AMADEUS_V3}/shopping/hotel-offers`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        hotelIds: hotelIds.join(","),
        checkInDate,
        checkOutDate,
        adults,
      },
    });

    const offers = offersRes?.data?.data || [];

    const merged = hotels.map((hotel) => {
      const hotelOffer = offers.find((o) => o.hotel?.hotelId === hotel.hotelId);

      return {
        hotelId: hotel.hotelId,
        name: hotel.name,
        rating: hotel.rating || null,
        chainCode: hotel.chainCode || null,
        geo: hotel.geoCode,
        address: hotel.address,
        available: Boolean(hotelOffer),
        offers: hotelOffer
          ? hotelOffer.offers.map((o) => ({
              roomType: o.room?.type,
              bedType: o.room?.typeEstimated?.bedType,
              price: {
                currency: o.price?.currency,
                total: o.price?.total,
              },
              cancellation: o.policies?.cancellations || [],
            }))
          : [],
      };
    });

    return {
      city: cityName,
      cityCode,
      checkInDate, // start date passed by user for hotel search
      checkOutDate, // end date passed by user for hotel search
      adults,
      totalHotels: merged.length,
      hotels: merged,
    };
  },
  // Cache key based on city + dates + adults
  (params) =>
    cacheKey.hotelSearch(
      params.cityName,
      params.checkInDate,
      params.checkOutDate,
      params.adults
    ),
  TTL.HOTELS
);
