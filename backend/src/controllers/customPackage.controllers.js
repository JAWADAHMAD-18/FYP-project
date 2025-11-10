import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";
import asyncHandler from "../utills/asynchandler.utills.js";
import { getWeatherForLocation } from "../utills/weather.utills.js";
import { getHotelsForLocation } from "../utills/hotels.utills.js";
import { getFlightsForTrip } from "../utills/flights.utills.js";

const MAX_TRIP_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Validate trip dates and duration
const validateTripDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError(400, "Invalid date format");
  }
  
  if (start >= end) {
    throw new ApiError(400, "End date must be after start date");
  }
  
  if (end - start > MAX_TRIP_DURATION) {
    throw new ApiError(400, "Trip duration cannot exceed 7 days");
  }
  
  if (start < new Date()) {
    throw new ApiError(400, "Start date cannot be in the past");
  }
  
  return { start, end };
};

// Controller for custom package creation
export const createCustomPackage = asyncHandler(async (req, res) => {
  const { tripType, locations, start_date, end_date } = req.body;

  // Validate trip type
  if (!["domestic", "international"].includes(tripType)) {
    throw new ApiError(400, "Trip type must be either 'domestic' or 'international'");
  }

  // Validate locations
  if (!Array.isArray(locations) || locations.length === 0) {
    throw new ApiError(400, "At least one location is required");
  }

  // Validate dates
  const { start, end } = validateTripDates(start_date, end_date);

  // Process each location in parallel
  const locationPromises = locations.map(async (location) => {
    // Run API calls in parallel for each location
    const [weather, hotels] = await Promise.all([
      getWeatherForLocation(location, start, end),
      getHotelsForLocation(location)
    ]);

    return {
      name: location,
      weather,
      hotels
    };
  });

  // Get location data
  const locationData = await Promise.all(locationPromises);

  // Get flights only for international trips
  let flights = [];
  if (tripType === "international") {
    flights = await getFlightsForTrip(locations, start, end);
  }

  // Combine all data
  const customPackage = {
    tripType,
    locations: locationData,
    flights: tripType === "international" ? flights : undefined,
    start_date,
    end_date,
    created_at: new Date().toISOString()
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      "Custom package created successfully",
      customPackage
    )
  );
});