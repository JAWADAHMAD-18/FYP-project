import { memo } from "react";
import { motion } from "framer-motion";
import { Plane, Clock, Armchair } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse an ISO 8601 duration string like "PT1H25M" → "1h 25m".
 * Falls back to the raw string if it cannot be parsed.
 */
const parseDuration = (iso) => {
  if (!iso) return "—";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const h = match[1] ? `${match[1]}h` : "";
  const m = match[2] ? `${match[2]}m` : "";
  return [h, m].filter(Boolean).join(" ") || iso;
};

/**
 * Format an ISO datetime string to a short HH:MM display.
 */
const fmtTime = (dt) => {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return dt.slice(11, 16) || "—";
  }
};

/**
 * Normalise a price value that may be a number, a string, or
 * an object { total, currency }.
 */
const fmtPrice = (price, currency) => {
  if (price == null) return "—";
  if (typeof price === "object") {
    return `${price.currency ?? currency ?? "PKR"} ${Number(price.total).toFixed(2)}`;
  }
  return `${currency ?? "PKR"} ${Number(price).toFixed(2)}`;
};

const CABIN_LABEL = {
  ECONOMY: "Economy",
  PREMIUM_ECONOMY: "Prem. Economy",
  BUSINESS: "Business",
  FIRST: "First",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FlightCard = memo(function FlightCard({
  flight,
  isSelected,
  onSelect,
  isAiPick = false,
}) {
  const {
    flightId,
    airline,
    origin,
    destination,
    departure,
    arrival,
    duration,
    stops,
    price,
    cabin,
    seatsAvailable,
  } = flight ?? {};

  const handleClick = () => onSelect?.(flightId);

  const priceDisplay = fmtPrice(price);
  const durationDisplay = parseDuration(duration);
  const cabinLabel = CABIN_LABEL[cabin] ?? cabin ?? "Economy";

  return (
    <motion.div
      className={`relative border rounded-2xl p-4 cursor-pointer transition-all duration-200
        bg-white shadow-md hover:shadow-lg
        ${
          isSelected
            ? "border-teal-500 shadow-md shadow-teal-100 ring-1 ring-teal-400"
            : "border-gray-200"
        }`}
      whileHover={{ scale: 1.015 }}
      onClick={handleClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* AI pick badge */}
      {isAiPick && (
        <span className="absolute top-2 right-2 text-[10px] font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
          AI Pick ✦
        </span>
      )}

      {/* Airline row */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#0A1A44]/10 flex items-center justify-center shrink-0">
          <Plane size={14} className="text-[#0D9488]" />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium">Airline</p>
          <p className="text-sm font-bold text-[#0A1A44]">{airline ?? "—"}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-400">Price</p>
          <p className="text-base font-extrabold text-teal-600">
            {priceDisplay}
          </p>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="text-center">
          <p className="text-lg font-extrabold text-[#0A1A44]">
            {departure?.airport ?? origin ?? "—"}
          </p>
          <p className="text-xs text-gray-500">{fmtTime(departure?.time)}</p>
        </div>

        <div className="flex-1 flex flex-col items-center gap-0.5 px-2">
          <div className="flex items-center gap-1 w-full">
            <div className="h-px flex-1 bg-gray-200" />
            <Plane size={14} className="text-teal-500 shrink-0" />
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <p className="text-[10px] text-gray-400">{durationDisplay}</p>
          <p className="text-[10px] text-gray-400">
            {stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="text-center">
          <p className="text-lg font-extrabold text-[#0A1A44]">
            {arrival?.airport ?? destination ?? "—"}
          </p>
          <p className="text-xs text-gray-500">{fmtTime(arrival?.time)}</p>
        </div>
      </div>

      {/* Footer meta */}
      <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-gray-100">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Armchair size={12} className="text-gray-400" />
          {cabinLabel}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={12} className="text-gray-400" />
          {durationDisplay}
        </span>
        {seatsAvailable != null && (
          <span className="text-xs text-amber-600 font-medium ml-auto">
            {seatsAvailable} seat{seatsAvailable !== 1 ? "s" : ""} left
          </span>
        )}
      </div>
    </motion.div>
  );
});

export default FlightCard;
