import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const model =
  process.env.GEMINI_API_KEY && genAI
    ? genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      })
    : null;

const parseIsoDurationToMinutes = (iso) => {
  if (!iso || typeof iso !== "string") return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  return hours * 60 + minutes;
};

const toNumber = (val) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : 0;
};

const transformFlights = (flights) => {
  if (!flights || !Array.isArray(flights.offers)) return [];
  return flights.offers.map((f) => ({
    id: f.flightId,
    airline: f.airline,
    price: toNumber(f.price?.total),
    durationMinutes: parseIsoDurationToMinutes(f.duration),
    stops: typeof f.stops === "number" ? f.stops : 0,
    cabin: f.cabin || "ECONOMY",
  }));
};

const transformHotels = (hotelResult) => {
  if (!hotelResult || !Array.isArray(hotelResult.hotels)) return [];
  return hotelResult.hotels
    .filter(
      (h) =>
        h.available === true &&
        Array.isArray(h.offers) &&
        h.offers.length > 0
    )
    .map((h) => {
      const firstOffer = h.offers[0];
      const total = firstOffer?.price?.total;
      return {
        id: h.hotelId,
        name: h.name,
        rating: h.rating ? toNumber(h.rating) : 3,
        totalStayPrice: toNumber(total),
      };
    });
};

const transformWeather = (weatherData) => {
  if (!Array.isArray(weatherData)) return [];
  return weatherData.map((d, index) => ({
    dayIndex: index + 1,
    summary: d.description || d.weather || "",
    avgTemp: toNumber(d.temp?.day),
    rainProbability: toNumber(d.rainChance),
  }));
};

const mapBudgetPreference = (budgetPreference) => {
  const pref = (budgetPreference || "medium").toLowerCase();
  if (pref === "low") {
    return {
      level: "low",
      rules: {
        priceFocus: "lowest_total_price",
        cabin: "economy_only",
        hotelStars: "3_to_4",
      },
    };
  }
  if (pref === "high") {
    return {
      level: "high",
      rules: {
        priceFocus: "comfort_priority",
        cabin: "business_allowed",
        flights: "prioritize_direct",
        hotelStars: "4_to_5",
      },
    };
  }
  return {
    level: "medium",
    rules: {
      priceFocus: "balanced_price_comfort",
      cabin: "economy_or_premium_economy",
      flights: "max_1_stop",
      hotelStars: "4_preferred",
    },
  };
};

const buildPrompt = (payload) => {
  return `
You are an expert travel decision engine. You MUST respond with a single JSON object only, no markdown, no explanation text outside JSON.

You receive normalized flight, hotel, weather, budget rule, and trip metadata. Your job is to:
- Choose up to 2 flights that best match the budget rules.
- Choose up to 2 hotels that best match the budget rules.
- Generate an itinerary with exactly "tripDays" entries.
- Use weather information only as context (do NOT invent new weather).
- Suggest major well-known public events only if you are highly confident; otherwise omit events.

STRICT OUTPUT FORMAT (JSON ONLY):
{
  "selectedFlightIds": string[] (max 2),
  "selectedHotelIds": string[] (max 2),
  "itinerary": [
    { "day": number, "title": string, "activities": string[] }
  ],
  "reasoningSummary": string
}

Do NOT include any extra fields. Do NOT wrap in markdown. Do NOT add comments.

Here is the input JSON:
${JSON.stringify(payload)}`;
};

const validateSelection = (selection, flights, hotels, tripDays) => {
  const reasons = [];

  if (!selection || typeof selection !== "object") {
    reasons.push("selection_not_object");
    return { ok: false, reasons };
  }

  const { selectedFlightIds, selectedHotelIds, itinerary } = selection;

  if (
    !Array.isArray(selectedFlightIds) ||
    selectedFlightIds.length > 2 ||
    !Array.isArray(selectedHotelIds) ||
    selectedHotelIds.length > 2
  ) {
    reasons.push("invalid_selected_ids_length");
  }

  const flightIds = new Set(flights.map((f) => f.id));
  const hotelIds = new Set(hotels.map((h) => h.id));

  if (
    Array.isArray(selectedFlightIds) &&
    !selectedFlightIds.every((id) => flightIds.has(id))
  ) {
    reasons.push("hallucinated_flight_ids");
  }
  if (
    Array.isArray(selectedHotelIds) &&
    !selectedHotelIds.every((id) => hotelIds.has(id))
  ) {
    reasons.push("hallucinated_hotel_ids");
  }

  if (!Array.isArray(itinerary) || itinerary.length !== tripDays) {
    reasons.push("wrong_itinerary_length");
  }

  if (Array.isArray(itinerary)) {
    for (const item of itinerary) {
      if (
        typeof item !== "object" ||
        typeof item.day !== "number" ||
        typeof item.title !== "string" ||
        !Array.isArray(item.activities) ||
        item.activities.length === 0 ||
        !item.activities.every(
          (a) => typeof a === "string" && a.trim().length
        )
      ) {
        reasons.push("invalid_itinerary_item");
        break;
      }
    }
  }

  return { ok: reasons.length === 0, reasons };
};

const buildFallback = ({
  flights,
  hotels,
  weather,
  tripDays,
  destination,
}) => {
  const sortedFlights = [...flights].sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price;
    return a.durationMinutes - b.durationMinutes;
  });

  const selectedFlightIds = sortedFlights.slice(0, 2).map((f) => f.id);

  const sortedHotels = [...hotels].sort((a, b) => {
    if (a.rating !== b.rating) return b.rating - a.rating;
    return a.totalStayPrice - b.totalStayPrice;
  });

  const selectedHotelIds = sortedHotels.slice(0, 2).map((h) => h.id);

  const itinerary = [];
  for (let day = 1; day <= tripDays; day++) {
    const weatherInfo = weather[day - 1];
    const weatherSummary = weatherInfo
      ? `Weather: ${weatherInfo.summary || "N/A"}, avg ${weatherInfo.avgTemp || "N/A"}°C, rain chance ${weatherInfo.rainProbability || 0}%`
      : "Weather data unavailable.";

    itinerary.push({
      day,
      title: `Day ${day} in ${destination}`,
      activities: [
        `Explore key attractions in ${destination}.`,
        "Enjoy local food and culture.",
        weatherSummary,
      ],
    });
  }

  return {
    selectedFlightIds,
    selectedHotelIds,
    itinerary,
    reasoningSummary:
      "Applied deterministic rule-based selection using lowest price and duration for flights, highest rating and lowest price for hotels, and generated a simple day-wise itinerary based on destination and weather.",
  };
};

export const generateSmartSelection = async ({
  flights,
  hotels,
  weather,
  budgetPreference,
  tripDays,
  destination,
}) => {
  try {
    const normalizedFlights = transformFlights(flights);
    const normalizedHotels = transformHotels(hotels);
    const normalizedWeather = transformWeather(weather);
    const budgetRules = mapBudgetPreference(budgetPreference);

    const basePayload = {
      destination,
      tripDays,
      budget: budgetRules,
      flights: normalizedFlights,
      hotels: normalizedHotels,
      weather: normalizedWeather,
    };

    // If Gemini is not configured, go straight to fallback
    if (!process.env.GEMINI_API_KEY || !model) {
      return buildFallback({
        flights: normalizedFlights,
        hotels: normalizedHotels,
        weather: normalizedWeather,
        tripDays,
        destination,
      });
    }

    const prompt = buildPrompt(basePayload);

    const callWithTimeout = async () => {
      const controller = new AbortController();
      const timeoutMs = 15000;

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          controller.abort();
          reject(new Error("gemini_timeout"));
        }, timeoutMs);
      });

      const apiCall = model.generateContent(
        { contents: [{ role: "user", parts: [{ text: prompt }] }] },
        { signal: controller.signal }
      );

      return Promise.race([apiCall, timeoutPromise]);
    };

    let result = null;
    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const startTs = Date.now();
      try {
        result = await callWithTimeout();
        const usage = result?.response?.usageMetadata || null;
        console.log(
          JSON.stringify({
            context: "CustomPackageGemini",
            event: "ai_usage",
            attempt,
            destination,
            tripDays,
            budgetLevel: budgetRules.level,
            timingMs: Date.now() - startTs,
            usage,
          })
        );
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        console.warn(
          JSON.stringify({
            context: "CustomPackageGemini",
            event: "ai_call_error",
            attempt,
            destination,
            tripDays,
            budgetLevel: budgetRules.level,
            error: err.message,
          })
        );
        if (err.message !== "gemini_timeout") {
          break;
        }
      }
    }

    if (!result) {
      console.warn(
        JSON.stringify({
          context: "CustomPackageGemini",
          event: "ai_fallback",
          reason: lastError ? lastError.message : "unknown_error",
          destination,
          tripDays,
          budgetLevel: budgetRules.level,
        })
      );
      return buildFallback({
        flights: normalizedFlights,
        hotels: normalizedHotels,
        weather: normalizedWeather,
        tripDays,
        destination,
      });
    }

    const raw = (result.response.text() || "").trim();

    let parsed;
    let parseError = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        const candidate = raw.slice(start, end + 1);
        try {
          parsed = JSON.parse(candidate);
        } catch (err) {
          parsed = null;
          parseError = err;
        }
      } else {
        parsed = null;
        parseError = new Error("no_json_block_found");
      }
    }

    const validation =
      parsed &&
      validateSelection(parsed, normalizedFlights, normalizedHotels, tripDays);

    if (!parsed || !validation.ok) {
      console.warn(
        JSON.stringify({
          context: "CustomPackageGemini",
          event: "ai_validation_failed",
          destination,
          tripDays,
          budgetLevel: budgetRules.level,
          parseError: parseError ? parseError.message : null,
          reasons: validation ? validation.reasons : ["invalid_json"],
        })
      );
      console.log(
        JSON.stringify({
          context: "CustomPackageGemini",
          event: "ai_fallback",
          reason: "validation_failed",
          destination,
          tripDays,
          budgetLevel: budgetRules.level,
        })
      );
      return buildFallback({
        flights: normalizedFlights,
        hotels: normalizedHotels,
        weather: normalizedWeather,
        tripDays,
        destination,
      });
    }

    return parsed;
  } catch (error) {
    console.error(
      JSON.stringify({
        context: "CustomPackageGemini",
        event: "ai_exception",
        destination,
        tripDays,
        budgetLevel: (budgetPreference || "medium").toLowerCase(),
        error: error.message,
      })
    );
    const normalizedFlights = transformFlights(flights);
    const normalizedHotels = transformHotels(hotels);
    const normalizedWeather = transformWeather(weather);
    return buildFallback({
      flights: normalizedFlights,
      hotels: normalizedHotels,
      weather: normalizedWeather,
      tripDays,
      destination,
    });
  }
};

