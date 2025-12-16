import dotenv from "dotenv";
dotenv.config();

import axios from "axios";

const WEATHER_URL = "https://api.openweathermap.org/data/2.5/forecast";
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

if (!OPENWEATHER_API_KEY) {
  console.error("❌ OPENWEATHER_API_KEY missing in .env");
  process.exit(1);
}

const run = async () => {
  try {
    const city = "Lahore";

    const { data } = await axios.get(WEATHER_URL, {
      params: {
        q: city,
        appid: OPENWEATHER_API_KEY,
        units: "metric",
      },
      timeout: 10000,
    });

    // ✅ Only API response
    console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    if (err.response) {
      console.error("❌ Error:", err.response.status, err.response.data);
    } else {
      console.error("❌ Error:", err.message);
    }
    process.exit(1);
  }
};

run();
