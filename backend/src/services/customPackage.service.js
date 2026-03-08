import { redisClient, connectRedis } from "../config/redis.config.js";
import CustomizePackage from "../models/customizePackage.model.js";
import { ApiError } from "../utills/apiError.utills.js";
import { getWeatherForLocation } from "../utills/weather.utills.js";
import { searchHotelsWithAvailability } from "../utills/hotels.utills.js";
import { searchFlights } from "../utills/flights.utills.js";
import { fetchDestinationImage } from "../utills/unsplash.utills.js";
import { fetchPOIs } from "../utills/pois.utills.js";
import { generateSmartSelection } from "./customPackageGemini.service.js";

const MAX_TRIP_DURATION_DAYS = 12;
const LOCK_TTL_SECONDS = 30;

const isRedisReady = () => redisClient && redisClient.isOpen;

const acquireUserLock = async (userId) => {
  const lockKey = `lock:customPackage:${userId}`;

  try {
    if (!isRedisReady()) {
      await connectRedis();
    }

    if (!isRedisReady()) {
      return { lockKey: null }; // Redis unavailable → skip locking but do not fail
    }

    const result = await redisClient.set(lockKey, "1", {
      NX: true,
      EX: LOCK_TTL_SECONDS,
    });

    if (result === null) {
      throw new ApiError(
        429,
        "A custom package is already being generated for this user. Please wait a few seconds and try again."
      );
    }

    return { lockKey };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // If Redis itself fails, continue without locking instead of breaking flow
    return { lockKey: null };
  }
};

const releaseUserLock = async (lockKey) => {
  if (!lockKey || !isRedisReady()) return;

  try {
    await redisClient.del(lockKey);
  } catch {
    // Swallow lock release errors – they shouldn't break the request
  }
};

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

  return { start, end, days };
};

const buildSnapshots = ({ flightsOffers, hotelResult, weatherData }) => {
  const flightsSnapshot = Array.isArray(flightsOffers)
    ? flightsOffers.slice(0, 5).map((offer) => ({
        flightId: offer.flightId,
        airline: offer.airline,
        price: offer.price,
        duration: offer.duration,
        stops: offer.stops,
      }))
    : [];

  const hotelsSnapshot =
    hotelResult && Array.isArray(hotelResult.hotels)
      ? hotelResult.hotels.slice(0, 5).map((hotel) => {
          const primaryOffer = Array.isArray(hotel.offers)
            ? hotel.offers[0]
            : null;

          return {
            hotelId: hotel.hotelId,
            name: hotel.name,
            rating: hotel.rating || null,
            price: primaryOffer?.price || null,
          };
        })
      : [];

  const weatherSnapshot = Array.isArray(weatherData)
    ? weatherData.map((day) => ({
        day: day.date,
        condition: day.weather,
        temp: {
          min: day.temp?.min,
          max: day.temp?.max,
          day: day.temp?.day,
        },
      }))
    : [];

  return {
    flightsSnapshot,
    hotelsSnapshot,
    weatherSnapshot,
  };
};

export const generateCustomPackage = async ({
  userId,
  tripType,
  locations,
  start_date,
  end_date,
  adults = 1,
  budgetPreference = "medium",
}) => {
  const previewStart = Date.now();
  const timings = {
    flightsMs: null,
    hotelsMs: null,
    weatherMs: null,
    aiMs: null,
    totalMs: null,
  };
  if (!userId) {
    throw new ApiError(400, "User context is required");
  }

  if (!["domestic", "international"].includes(tripType)) {
    throw new ApiError(400, "Trip type must be 'domestic' or 'international'");
  }

  if (!Array.isArray(locations) || locations.length < 1) {
    throw new ApiError(400, "At least one location is required");
  }

  const { start, end, days } = parseAndValidateDates(start_date, end_date);
  const destinationCity = locations[locations.length - 1];

  const inputSnapshot = {
    tripType,
    locations,
    start_date,
    end_date,
    adults,
    budgetPreference,
  };

  const { lockKey } = await acquireUserLock(userId);

  try {
    const destination = {
      name: destinationCity,
    };

    const maxWeatherEnd = new Date(
      Math.min(end.getTime(), start.getTime() + 5 * 24 * 60 * 60 * 1000)
    );

    const weatherPromise = (async () => {
      const startTs = Date.now();
      try {
        const result = await getWeatherForLocation(
          destinationCity,
          start,
          maxWeatherEnd
        );
        timings.weatherMs = Date.now() - startTs;
        return result;
      } catch (err) {
        timings.weatherMs = Date.now() - startTs;
        return { __error: err };
      }
    })();

    const hotelsPromise = (async () => {
      const startTs = Date.now();
      try {
        const result = await searchHotelsWithAvailability({
          cityName: destinationCity,
          checkInDate: start_date,
          checkOutDate: end_date,
          adults,
        });
        timings.hotelsMs = Date.now() - startTs;
        return result;
      } catch (err) {
        timings.hotelsMs = Date.now() - startTs;
        return { __error: err };
      }
    })();

    let flightsPromise = Promise.resolve(null);
    if (tripType === "international" && locations.length >= 2) {
      flightsPromise = (async () => {
        const startTs = Date.now();
        try {
          const result = await searchFlights({
            originCity: locations[0],
            destinationCity,
            departureDate: start_date,
            returnDate: end_date,
            adults,
          });
          timings.flightsMs = Date.now() - startTs;
          return result;
        } catch (err) {
          timings.flightsMs = Date.now() - startTs;
          return { __error: err };
        }
      })();
    }

    const [weatherResult, hotelResult, flightOffersOrError] =
      await Promise.all([weatherPromise, hotelsPromise, flightsPromise]);

    let weatherData = null;
    if (weatherResult && weatherResult.__error) {
      destination.weatherError = weatherResult.__error.message;
    } else if (weatherResult) {
      destination.weather = weatherResult;
      weatherData = weatherResult;
    }

    let hotelsData = null;
    if (hotelResult && hotelResult.__error) {
      destination.hotelsError = hotelResult.__error.message;
    } else if (hotelResult) {
      destination.totalHotels = hotelResult.totalHotels;
      destination.hotels = hotelResult.hotels;
      hotelsData = hotelResult;
    }

    let flights = undefined;
    let flightsOffers = null;
    if (flightOffersOrError && flightOffersOrError.__error) {
      flights = { error: flightOffersOrError.__error.message };
    } else if (Array.isArray(flightOffersOrError)) {
      const limitedOffers = flightOffersOrError.slice(0, 5);
      flightsOffers = limitedOffers;
      flights = {
        count: limitedOffers.length,
        offers: limitedOffers,
      };
    }

    // Defensive checks for core data
    if (!flightsOffers || flightsOffers.length === 0) {
      throw new ApiError(
        502,
        "No flights found for the given criteria. Please adjust your search."
      );
    }

    const availableHotels =
      hotelsData && Array.isArray(hotelsData.hotels)
        ? hotelsData.hotels.filter(
            (h) =>
              h.available === true &&
              Array.isArray(h.offers) &&
              h.offers.length > 0
          )
        : [];

    if (!availableHotels.length) {
      throw new ApiError(
        502,
        "No available hotels found for the given criteria. Please adjust your search."
      );
    }

    const { flightsSnapshot, hotelsSnapshot, weatherSnapshot } = buildSnapshots(
      {
        flightsOffers,
        hotelResult: hotelsData,
        weatherData,
      }
    );

    let destinationImage = null;
    let poisSnapshot = [];

    // Non-critical extras (image + POIs) fetched after core Promise.all
    try {
      // Run destination image and POIs in parallel, but keep their failures non-fatal
      const [imageResult, poisResult] = await Promise.all([
        fetchDestinationImage(destinationCity).catch((error) => {
          console.warn(
            `CustomPackage: destination image fetch failed for "${destinationCity}", using fallback or null.`,
            error.message
          );
          return null;
        }),
        fetchPOIs(destinationCity).catch((error) => {
          console.warn(
            `CustomPackage: POIs fetch failed for "${destinationCity}", continuing without POIs.`,
            error.message
          );
          return [];
        }),
      ]);

      destinationImage = imageResult;
      poisSnapshot = Array.isArray(poisResult)
        ? poisResult.slice(0, 5)
        : [];
    } catch (error) {
      console.warn(
        `CustomPackage: non-critical extras (image/POIs) failed for "${destinationCity}".`,
        error.message
      );
      destinationImage = destinationImage || null;
      poisSnapshot = poisSnapshot || [];
    }

    const requestId = `${userId}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    let aiSelection = null;
    try {
      const aiStart = Date.now();
      aiSelection = await generateSmartSelection({
        flights,
        hotels: hotelsData,
        weather: weatherData,
        budgetPreference,
        tripDays: days,
        destination: destinationCity,
      });
      timings.aiMs = Date.now() - aiStart;
    } catch (error) {
      timings.aiMs = timings.aiMs ?? null;
      console.error(
        "CustomPackage: generateSmartSelection failed, using defaults:",
        error.message
      );
      aiSelection = null;
    }

    let selectedFlights = [];
    let selectedHotels = [];
    let itinerary = [];
    let reasoningSummary = "";

    if (aiSelection && typeof aiSelection === "object") {
      const { selectedFlightIds, selectedHotelIds, itinerary: aiItinerary } =
        aiSelection;

      const flightMap = new Map(
        Array.isArray(flightsOffers)
          ? flightsOffers.map((f) => [f.flightId, f])
          : []
      );
      const hotelMap = new Map(
        hotelsData && Array.isArray(hotelsData.hotels)
          ? hotelsData.hotels.map((h) => [h.hotelId, h])
          : []
      );

      if (Array.isArray(selectedFlightIds)) {
        selectedFlights = selectedFlightIds
          .map((id) => flightMap.get(id))
          .filter(Boolean);
      }

      if (Array.isArray(selectedHotelIds)) {
        selectedHotels = selectedHotelIds
          .map((id) => hotelMap.get(id))
          .filter(Boolean);
      }

      if (Array.isArray(aiItinerary)) {
        itinerary = aiItinerary;
      }

      if (typeof aiSelection.reasoningSummary === "string") {
        reasoningSummary = aiSelection.reasoningSummary;
      }
    }

    const locationsPayload = [
      {
        name: destinationCity,
        weather: destination.weather || null,
        totalHotels: destination.totalHotels ?? null,
        hotels: Array.isArray(destination.hotels)
          ? destination.hotels.slice(0, 5)
          : [],
        pois: poisSnapshot,
        weatherError: destination.weatherError,
        hotelsError: destination.hotelsError,
      },
    ];

    const responseData = {
      tripType,
      start_date,
      end_date,
      adults,
      destination: {
        ...locationsPayload[0],
      },
      locations: locationsPayload,
      flights,
      created_at: new Date().toISOString(),
      requestId,
      status: "generated",
      expiresAt,
      destinationImage,
      pois: poisSnapshot,
      // Snapshots included for preview/confirmation flow
      inputSnapshot,
      flightsSnapshot,
      hotelsSnapshot,
      weatherSnapshot,
      poisSnapshot,
      selectedFlights,
      selectedHotels,
      itinerary,
      reasoningSummary,
    };

    timings.totalMs = Date.now() - previewStart;
    console.log(
      JSON.stringify({
        context: "CustomPackage",
        event: "preview_timings",
        userId,
        destination: destinationCity,
        timings,
      })
    );

    return responseData;
  } finally {
    await releaseUserLock(lockKey);
  }
};

export const confirmCustomPackage = async ({ userId, preview }) => {
  if (!userId) {
    throw new ApiError(400, "User context is required");
  }

  if (!preview || typeof preview !== "object") {
    throw new ApiError(400, "Preview payload is required for confirmation");
  }

  const {
    requestId,
    expiresAt,
    status,
    inputSnapshot,
    flightsSnapshot,
    hotelsSnapshot,
    weatherSnapshot,
    poisSnapshot,
    destinationImage,
    selectedFlights,
    selectedHotels,
    itinerary,
  } = preview;

  if (!requestId) {
    throw new ApiError(400, "requestId is required to confirm package");
  }

  const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
  if (!expiresAtDate || isNaN(expiresAtDate.getTime())) {
    throw new ApiError(400, "expiresAt must be a valid date in the preview");
  }

  if (expiresAtDate < new Date()) {
    throw new ApiError(400, "This custom package preview has expired");
  }

  if (status && status !== "generated") {
    throw new ApiError(
      400,
      "Only previews with status 'generated' can be confirmed"
    );
  }

  const doc = {
    userId,
    requestId,
    inputSnapshot: inputSnapshot || {},
    flightsSnapshot: Array.isArray(flightsSnapshot) ? flightsSnapshot : [],
    hotelsSnapshot: Array.isArray(hotelsSnapshot) ? hotelsSnapshot : [],
    weatherSnapshot: Array.isArray(weatherSnapshot) ? weatherSnapshot : [],
    poisSnapshot: Array.isArray(poisSnapshot) ? poisSnapshot : [],
    destinationImage: destinationImage || null,
    selectedFlights: Array.isArray(selectedFlights) ? selectedFlights : [],
    selectedHotels: Array.isArray(selectedHotels) ? selectedHotels : [],
    itinerary: Array.isArray(itinerary) ? itinerary : [],
    status: "generated",
    expiresAt: expiresAtDate,
  };

  const saved = await CustomizePackage.create(doc);

  return {
    requestId: saved.requestId,
    packageId: saved._id,
    status: saved.status,
    expiresAt: saved.expiresAt,
    createdAt: saved.createdAt,
  };
};

/**
 * Update custom package status from "generated" to "negotiating" (user-initiated)
 */
export const updateCustomPackageStatusByRequestId = async ({
  userId,
  requestId,
  nextStatus = "negotiating",
}) => {
  if (!requestId) {
    throw new ApiError(400, "requestId is required");
  }
  if (nextStatus !== "negotiating") {
    throw new ApiError(400, "Only transition to 'negotiating' is allowed");
  }

  const doc = await CustomizePackage.findOne({ userId, requestId });
  if (!doc) {
    throw new ApiError(404, "Custom package not found");
  }
  if (doc.status !== "generated") {
    throw new ApiError(
      400,
      `Cannot transition from status '${doc.status}' to 'negotiating'`
    );
  }

  doc.status = nextStatus;
  await doc.save();

  return {
    requestId: doc.requestId,
    status: doc.status,
  };
};

/**
 * Get full custom package by requestId (admin use)
 */
export const getCustomPackageByRequestId = async (requestId) => {
  if (!requestId) {
    throw new ApiError(400, "requestId is required");
  }
  const doc = await CustomizePackage.findOne({ requestId });
  if (!doc) {
    throw new ApiError(404, "Custom package not found");
  }
  return doc;
};

/**
 * Admin update custom package status (finalized | cancelled)
 */
export const adminUpdateCustomPackageStatus = async ({
  requestId,
  nextStatus,
  finalSelections = {},
}) => {
  if (!requestId) {
    throw new ApiError(400, "requestId is required");
  }
  if (!["finalized", "cancelled"].includes(nextStatus)) {
    throw new ApiError(400, "nextStatus must be 'finalized' or 'cancelled'");
  }

  const doc = await CustomizePackage.findOne({ requestId });
  if (!doc) {
    throw new ApiError(404, "Custom package not found");
  }

  if (nextStatus === "cancelled") {
    doc.status = "cancelled";
    await doc.save();
    return { requestId: doc.requestId, status: doc.status };
  }

  // finalized
  const { selectedFlights, selectedHotels } = finalSelections;
  if (Array.isArray(selectedFlights) && selectedFlights.length > 0) {
    doc.selectedFlights = selectedFlights;
    doc.flightsSnapshot = doc.flightsSnapshot.filter((f) =>
      selectedFlights.some(
        (id) => String(id) === String(f?.id ?? f?._id ?? f?.flightId)
      )
    );
  }
  if (Array.isArray(selectedHotels) && selectedHotels.length > 0) {
    doc.selectedHotels = selectedHotels;
    doc.hotelsSnapshot = doc.hotelsSnapshot.filter((h) =>
      selectedHotels.some(
        (id) => String(id) === String(h?.id ?? h?._id ?? h?.hotelId)
      )
    );
  }
  doc.status = "finalized";
  await doc.save();

  return { requestId: doc.requestId, status: doc.status };
};

