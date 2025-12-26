import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";
import asyncHandler from "../utills/asynchandler.utills.js";

import { getWeatherForLocation } from "../utills/weather.utills.js";
import { searchHotelsWithAvailability } from "../utills/hotels.utills.js";
import { searchFlights } from "../utills/flights.utills.js";

const MAX_TRIP_DURATION_DAYS = 12;

const parseAndValidateDates = (start_date, end_date) => {
  const start = new Date(start_date);
  const end = new Date(end_date);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    throw new ApiError(400, "Start date cannot be in the past");
  }

  if (start >= end) {
    throw new ApiError(400, "End date must be after start date");
  }

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  if (days > MAX_TRIP_DURATION_DAYS) {
    throw new ApiError(400, "Trip duration cannot exceed 12 days");
  }

  return { start, end };
};

export const createCustomPackage = asyncHandler(async (req, res) => {
  const { tripType, locations, start_date, end_date, adults = 1 } = req.body;

  if (!["domestic", "international"].includes(tripType)) {
    throw new ApiError(400, "Trip type must be 'domestic' or 'international'");
  }

  if (!Array.isArray(locations) || locations.length < 1) {
    throw new ApiError(400, "At least one location is required");
  }

  const { start, end } = parseAndValidateDates(start_date, end_date);

  // ✅ DESTINATION CITY ONLY
  const destinationCity = locations[locations.length - 1];

  const destination = {
    name: destinationCity,
  };

  // -------- WEATHER (destination only)
  try {
    const maxWeatherEnd = new Date(
      Math.min(end.getTime(), start.getTime() + 5 * 24 * 60 * 60 * 1000)
    );

    destination.weather = await getWeatherForLocation(
      destinationCity,
      start,
      maxWeatherEnd
    );
  } catch (err) {
    destination.weatherError = err.message;
  }

  // -------- HOTELS (destination only)
  try {
    const hotelResult = await searchHotelsWithAvailability({
      cityName: destinationCity,
      checkInDate: start_date,
      checkOutDate: end_date,
      adults,
    });

    destination.totalHotels = hotelResult.totalHotels;
    destination.hotels = hotelResult.hotels;
  } catch (err) {
    destination.hotelsError = err.message;
  }

  // -------- FLIGHTS
  let flights;
  if (tripType === "international" && locations.length >= 2) {
    try {
      const flightOffers = await searchFlights({
        originCity: locations[0],
        destinationCity: destinationCity,
        departureDate: start_date,
        returnDate: end_date,
        adults,
      });

      flights = {
        count: flightOffers.length,
        offers: flightOffers,
      };
    } catch (err) {
      flights = { error: err.message };
    }
  }

  return res.status(200).json(
    new ApiResponse(200, "Custom package created successfully", {
      tripType,
      start_date,
      end_date,
      adults,
      destination,
      flights,
      created_at: new Date().toISOString(),
    })
  );
});
