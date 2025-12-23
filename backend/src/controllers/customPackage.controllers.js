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

  if (isNaN(start.getTime()) || isNaN(end.getTime()))
    throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD");

  if (start >= end)
    throw new ApiError(400, "End date must be after start date");

  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  if (days > MAX_TRIP_DURATION_DAYS)
    throw new ApiError(400, "Trip duration cannot exceed 12 days");

  if (start < new Date().setHours(0, 0, 0, 0))
    throw new ApiError(400, "Start date cannot be in the past");

  return { start, end };
};

// ---- Controller ----
export const createCustomPackage = asyncHandler(async (req, res) => {
  const { tripType, locations, start_date, end_date } = req.body;

  // ---- Basic validation ----
  if (!["domestic", "international"].includes(tripType)) {
    throw new ApiError(400, "Trip type must be 'domestic' or 'international'");
  }

  if (!Array.isArray(locations) || locations.length < 1) {
    throw new ApiError(400, "At least one location is required");
  }

  //  Dates
  const { start, end } = parseAndValidateDates(start_date, end_date);

  // ---- Per-location data ----
  const locationResults = await Promise.all(
    locations.map(async (city) => {
      const result = { name: city };

      // Weather (Date objects)
      try {
        const maxWeatherEnd = new Date(
          Math.min(end.getTime(), start.getTime() + 5 * 24 * 60 * 60 * 1000)
        );

        result.weather = await getWeatherForLocation(
          city,
          start,
          maxWeatherEnd
        );
      } catch (err) {
        result.weatherError = err.message;
      }

      try {
        result.hotels = await searchHotelsWithAvailability({
          cityName: city,
          checkInDate: start_date,
          checkOutDate: end_date,
          adults: 1,
        });
      } catch (err) {
        result.hotelsError = err.message;
      }

      return result;
    })
  );

  let flights;
  if (tripType === "international" && locations.length >= 2) {
    try {
      flights = await searchFlights({
        originCity: locations[0],
        destinationCity: locations[locations.length - 1],
        departureDate: start_date,
        returnDate: end_date,
        adults: 1,
      });
    } catch (err) {
      flights = { error: err.message };
    }
  }

  // ---- Final response ----
  return res.status(200).json(
    new ApiResponse(200, "Custom package created successfully", {
      tripType,
      start_date,
      end_date,
      locations: locationResults,
      flights: tripType === "international" ? flights : undefined,
      created_at: new Date().toISOString(),
    })
  );
});
