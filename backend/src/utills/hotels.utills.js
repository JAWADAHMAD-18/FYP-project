import axios from "axios";
import { ApiError } from "./apiError.utills.js";
import { withCache, cacheKey, TTL } from "./cache.utills.js";
import { getAmadeusAccessToken } from "./amadeus.auth.js";
import { getCityIATACode } from "./locations.utils.js";

const AMADEUS_V1 = "https://test.api.amadeus.com/v1";
const AMADEUS_V3 = "https://test.api.amadeus.com/v3";

export const searchHotelsWithAvailability = withCache(
  async ({ cityName, checkInDate, checkOutDate, adults = 1 }) => {
    // 1️⃣ City → IATA
    const cityCode = await getCityIATACode(cityName);
    const token = await getAmadeusAccessToken();

    // 2️⃣ Get hotel reference list
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

    // Limit to avoid Amadeus hard limits
    const hotelIds = hotels.slice(0, 20).map((h) => h.hotelId);

    // 3️⃣ Get availability + pricing
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

    // 4️⃣ Merge reference + availability
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
      checkInDate,
      checkOutDate,
      adults,
      totalHotels: merged.length,
      hotels: merged,
    };
  },
  (params) =>
    cacheKey.hotelSearch(
      params.cityName,
      params.checkInDate,
      params.checkOutDate,
      params.adults
    ),
  TTL.HOTELS
);
