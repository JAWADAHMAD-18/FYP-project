import { motion } from "framer-motion";
import { Calendar, Clock, Users } from "lucide-react";

// Helpers

/**
 * Format an ISO / YYYY-MM-DD date string to a readable label.
 * Returns "—" for any falsy or invalid input.
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Calculate the inclusive number of days between two date strings.
 * Returns null if either value is missing or produces an invalid Date.
 */
const calcTripDays = (startStr, endStr) => {
  if (!startStr || !endStr) return null;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : null;
};


const resolveDestinationName = (dest) => {
  if (!dest) return null;
  if (typeof dest === "string") return dest;
  if (typeof dest?.name === "string") return dest.name;
  return null;
};

// Constants

const BUDGET_OPTIONS = [
  { value: "economy", label: "Economy" },
  { value: "medium", label: "Medium" },
  { value: "luxury", label: "Luxury" },
];

const BACKEND_TO_DISPLAY = {
  low: "economy",
  medium: "medium",
  high: "luxury",
};

// Sub-components

const MetricCard = ({ icon: Icon, label, value, accent }) => (
  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: "#e6f7f6", color: "#0D9488" }}
    >
      <Icon size={18} />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${accent || "text-[#0A1A44]"}`}>
        {value}
      </p>
    </div>
  </div>
);

// Main component


const TripOverview = ({ preview, confirmMessage }) => {
  if (!preview && !confirmMessage) return null;

  const departureDate =
    preview?.start_date ?? confirmMessage?.start_date ?? null;
  const returnDate = preview?.end_date ?? confirmMessage?.end_date ?? null;
  const numAdults = preview?.adults ?? confirmMessage?.adults ?? 1;
  const inputSnapshot =
    preview?.inputSnapshot ?? confirmMessage?.inputSnapshot ?? {};
  const rawBudget =
    (inputSnapshot?.budgetPreference ?? "medium").toLowerCase();
  const displayBudget =
    BACKEND_TO_DISPLAY[rawBudget] ?? BACKEND_TO_DISPLAY.medium ?? "medium";
  const tripDays = calcTripDays(departureDate, returnDate);
  const destinationName =
    resolveDestinationName(preview?.destination) ??
    resolveDestinationName(confirmMessage?.destination) ??
    null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-6"
    >
      <h3 className="text-lg font-bold text-[#0A1A44] mb-4 border-l-4 border-teal-600 pl-3">
        Trip Overview
        {destinationName && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            — {destinationName}
          </span>
        )}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={Calendar}
          label="Departure"
          value={formatDate(departureDate)}
        />
        <MetricCard
          icon={Calendar}
          label="Return"
          value={formatDate(returnDate)}
        />
        <MetricCard
          icon={Clock}
          label="Duration"
          value={
            tripDays ? `${tripDays} ${tripDays === 1 ? "day" : "days"}` : "—"
          }
        />
        <MetricCard
          icon={Users}
          label="Travellers"
          value={`${numAdults} ${numAdults === 1 ? "adult" : "adults"}`}
        />

        {/* Budget Preference — bold heading + read-only dropdown */}
        <div className="col-span-2 md:col-span-4">
          <p className="text-sm font-bold text-[#0A1A44] mb-2">
            Budget Preference
          </p>
          <div
            className="w-full rounded-xl border-2 border-teal-600 bg-white px-4 py-3 text-sm font-medium text-[#0A1A44] focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-0"
            aria-readonly="true"
          >
            <select
              value={displayBudget}
              readOnly
              disabled
              className="w-full bg-transparent border-none p-0 text-[#0A1A44] font-semibold cursor-default outline-none appearance-none focus:ring-0"
              aria-label="Budget preference (display only)"
            >
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TripOverview;
