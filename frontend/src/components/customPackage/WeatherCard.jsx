import { motion } from "framer-motion";
import { CloudSun, Droplets, Thermometer, Wind } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

/** Condition string → simple emoji tag */
const conditionIcon = (cond = "") => {
  const c = cond.toLowerCase();
  if (c.includes("clear") || c.includes("sun")) return "☀️";
  if (c.includes("rain") || c.includes("shower")) return "🌧️";
  if (c.includes("snow")) return "❄️";
  if (c.includes("storm") || c.includes("thunder")) return "⛈️";
  if (c.includes("cloud")) return "☁️";
  if (c.includes("mist") || c.includes("fog")) return "🌫️";
  return "🌤️";
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * WeatherCard
 *
 * Accepts a `weather` prop — the `destination.weather` array from the backend.
 * Each item: { date, temp:{min,max,day}, weather, description, humidity, windSpeed, rainChance }
 *
 * Also handles the leaner `weatherSnapshot` shape (uses `day` instead of `date`,
 * `condition` instead of `weather`).
 */
const WeatherCard = ({ weather }) => {
  if (!Array.isArray(weather) || weather?.length === 0) return null;

  const days = weather.map((d) => ({
    date: d.date ?? d.day ?? null,
    condition: d.weather ?? d.condition ?? "—",
    description: d.description ?? null,
    temp: d.temp ?? {},
    humidity: d.humidity ?? null,
    rainChance: d.rainChance ?? d.rainProbability ?? null,
    windSpeed: d.windSpeed ?? null,
  }));

  // Aggregate stats
  const temps = days.map((d) => d.temp?.day).filter((t) => t != null);
  const avgTemp = temps.length
    ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length)
    : null;
  const rains = days.map((d) => d.rainChance).filter((r) => r != null);
  const avgRain = rains.length
    ? Math.round(rains.reduce((a, b) => a + b, 0) / rains.length)
    : null;
  const summary =
    days[0]?.description ?? days[0]?.condition ?? "Mixed conditions";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-6"
    >
      <h3 className="text-lg font-bold text-[#0A1A44] mb-4 flex items-center gap-2 border-l-4 border-teal-600 pl-3">
        <CloudSun size={18} className="text-teal-600" />
        Weather Forecast
      </h3>

      {/* Aggregate stat bubbles */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="flex flex-col items-center bg-sky-50 rounded-xl p-3">
          <Thermometer size={20} className="text-sky-600 mb-1" />
          <p className="text-xl font-bold text-sky-700">
            {avgTemp != null ? `${avgTemp}°C` : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Avg Temp</p>
        </div>

        <div className="flex flex-col items-center bg-blue-50 rounded-xl p-3">
          <Droplets size={20} className="text-blue-500 mb-1" />
          <p className="text-xl font-bold text-blue-700">
            {avgRain != null ? `${avgRain}%` : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Rain Chance</p>
        </div>

        <div className="flex flex-col items-center bg-teal-50 rounded-xl p-3">
          <CloudSun size={20} className="text-teal-600 mb-1" />
          <p className="text-xs font-bold text-teal-700 text-center leading-tight capitalize">
            {summary}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Conditions</p>
        </div>
      </div>

      {/* Per-day detailed pills */}
      <div className="flex flex-col gap-2">
        {days.map((day, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5 gap-2"
          >
            {/* Date + icon */}
            <div className="flex items-center gap-2 min-w-[80px]">
              <span className="text-lg" aria-hidden="true">
                {conditionIcon(day.condition)}
              </span>
              <div>
                <p className="text-xs font-semibold text-gray-700">
                  {fmtDate(day.date) || `Day ${idx + 1}`}
                </p>
                <p className="text-[10px] text-gray-400 capitalize">
                  {day.description ?? day.condition}
                </p>
              </div>
            </div>

            {/* Temp range */}
            <div className="text-center">
              <p className="text-xs font-bold text-[#0A1A44]">
                {day.temp?.min != null ? `${day.temp.min}°` : "—"}
                {" – "}
                {day.temp?.max != null ? `${day.temp.max}°C` : ""}
              </p>
              <p className="text-[10px] text-gray-400">
                Feels {day.temp?.day != null ? `${day.temp.day}°C` : "—"}
              </p>
            </div>

            {/* Humidity */}
            {day.humidity != null && (
              <div className="flex items-center gap-1">
                <Droplets size={11} className="text-blue-400" />
                <span className="text-xs text-gray-500">{day.humidity}%</span>
              </div>
            )}

            {/* Wind */}
            {day.windSpeed != null && (
              <div className="flex items-center gap-1">
                <Wind size={11} className="text-gray-400" />
                <span className="text-xs text-gray-500">
                  {Math.round(day.windSpeed)} m/s
                </span>
              </div>
            )}

            {/* Rain */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400">🌧</span>
              <span className="text-xs text-gray-500">
                {day.rainChance != null ? `${day.rainChance}%` : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default WeatherCard;
