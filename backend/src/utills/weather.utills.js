import axios from "axios";
import { ApiError } from "./apiError.utills.js";
import { withCache, TTL } from "./cache.utills.js";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const GEO_URL = "http://api.openweathermap.org/geo/1.0/direct";
const WEATHER_URL = "https://api.openweathermap.org/data/3.0/onecall";

const validateWeatherRequest = (location, startDate, endDate) => {
  const loc = location?.trim();
  if (!loc) throw new ApiError(400, "Location is required");

  if (!(startDate instanceof Date) || !(endDate instanceof Date))
    throw new ApiError(400, "Dates must be valid Date objects");

  if (startDate > endDate)
    throw new ApiError(400, "Start date must be before end date");

  const days = Math.ceil((endDate - startDate) / 86400000) + 1;
  if (days > 7) throw new ApiError(400, "Max forecast range is 7 days");

  return days;
};

const axiosWithRetry = async (url, options, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, { ...options, timeout: 5000 });
      return response;
    } catch (err) {
      if (attempt === retries) throw err; // final attempt failed
    }
  }
};

const getLocationCoordinates = withCache(
  async (location) => {
    const safeLocation = encodeURIComponent(location); // sanitize input
    const { data } = await axiosWithRetry(GEO_URL, {
      params: { q: safeLocation, limit: 1, appid: OPENWEATHER_API_KEY },
    });

    if (!data?.length)
      throw new ApiError(404, `Location not found: ${location}`);

    return { lat: data[0].lat, lon: data[0].lon };
  },
  (location) => `geo:${location}`,
  TTL.WEATHER
);

const getWeatherData = withCache(
  async (lat, lon, days) => {
    const { data } = await axiosWithRetry(WEATHER_URL, {
      params: {
        lat,
        lon,
        exclude: "current,minutely,hourly,alerts",
        units: "metric",
        appid: OPENWEATHER_API_KEY,
      },
    });

    return data.daily.slice(0, days).map((day) => ({
      date: new Date(day.dt * 1000).toISOString().slice(0, 10),
      temp: {
        day: Math.round(day.temp.day),
        min: Math.round(day.temp.min),
        max: Math.round(day.temp.max),
      },
      weather: day.weather[0].main,
      description: day.weather[0].description,
      humidity: day.humidity,
      windSpeed: day.wind_speed,
      rainChance: Math.round(day.pop * 100),
      uvi: day.uvi,
    }));
  },
  (lat, lon, days) => `weather:${lat}:${lon}:${days}`,
  TTL.WEATHER
);

export const getWeatherForLocation = async (location, startDate, endDate) => {
  try {
    const days = validateWeatherRequest(location, startDate, endDate);

    const { lat, lon } = await getLocationCoordinates(location);

    return await getWeatherData(lat, lon, days);
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      `Weather fetch failed for ${location}: ${error.message}`
    );
  }
};
