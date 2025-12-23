import axios from "axios";
import { ApiError } from "./apiError.utills.js";
import { withCache, TTL } from "./cache.utills.js";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

const GEO_URL = "http://api.openweathermap.org/geo/1.0/direct";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/forecast";

/* -------------------- VALIDATION -------------------- */
const validateWeatherRequest = (location, startDate, endDate) => {
  const loc = location?.trim();
  if (!loc) throw new ApiError(400, "Location is required");

  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    throw new ApiError(400, "Dates must be valid Date objects");
  }

  if (startDate > endDate) {
    throw new ApiError(400, "Start date must be before end date");
  }

  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  if (days > 7) {
    throw new ApiError(400, "Max weather forecast range is 7 days");
  }

  return days;
};

const axiosWithRetry = async (url, options, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios.get(url, { ...options, timeout: 5000 });
    } catch (err) {
      if (attempt === retries) throw err;
    }
  }
};

const getLocationCoordinates = withCache(
  async (location) => {
    const { data } = await axiosWithRetry(GEO_URL, {
      params: {
        q: location,
        limit: 1,
        appid: OPENWEATHER_API_KEY,
      },
    });

    if (!data?.length) {
      throw new ApiError(404, `Location not found: ${location}`);
    }

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
        units: "metric",
        appid: OPENWEATHER_API_KEY,
      },
    });

    // Group 3-hour forecasts into days
    const dailyMap = {};

    for (const item of data.list) {
      const date = item.dt_txt.split(" ")[0];

      if (!dailyMap[date]) {
        dailyMap[date] = {
          temps: [],
          weather: item.weather[0],
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
          rainChance: item.pop || 0,
        };
      }

      dailyMap[date].temps.push(item.main.temp);
    }

    return Object.entries(dailyMap)
      .slice(0, days)
      .map(([date, info]) => ({
        date,
        temp: {
          min: Math.round(Math.min(...info.temps)),
          max: Math.round(Math.max(...info.temps)),
          day: Math.round(
            info.temps.reduce((a, b) => a + b, 0) / info.temps.length
          ),
        },
        weather: info.weather.main,
        description: info.weather.description,
        humidity: info.humidity,
        windSpeed: info.windSpeed,
        rainChance: Math.round(info.rainChance * 100),
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
