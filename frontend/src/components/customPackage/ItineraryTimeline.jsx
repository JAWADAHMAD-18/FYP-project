import { memo } from "react";
import { motion } from "framer-motion";
import { MapPin, Check } from "lucide-react";

const TIME_KEYWORDS = ["Morning", "Afternoon", "Evening"];

function formatActivityText(text) {
  if (typeof text !== "string") return text;
  let result = text;
  for (const kw of TIME_KEYWORDS) {
    const re = new RegExp(`\\b(${kw})\\b`, "gi");
    result = result.replace(re, "<strong>$1</strong>");
  }
  return result;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { y: 8, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

const ItineraryTimeline = memo(function ItineraryTimeline({ itinerary }) {
  if (!Array.isArray(itinerary) || itinerary.length === 0) return null;

  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-lg font-bold text-[#0A1A44] mb-5 flex items-center gap-2 border-l-4 border-teal-600 pl-3">
        <MapPin size={18} className="text-teal-600" />
        Day-by-Day Itinerary
      </h3>

      <motion.div
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {itinerary.map((day) => (
          <motion.div
            key={day?.day ?? Math.random()}
            variants={item}
            className="rounded-2xl border  shadow-sm p-5 border-l-4 border-teal-500 bg-gray-50/30"
          >
            <p className="text-lg font-bold text-teal-600 mb-2">
              Day {day?.day ?? "—"}
            </p>
            <p className="font-semibold text-lg text-[#0A1A44] mb-3">
              {day?.title ?? `Day ${day?.day ?? ""}`}
            </p>
            <ul className="space-y-2">
              {(day?.activities ?? []).map((act, idx) => {
                const str = typeof act === "string" ? act : String(act ?? "");
                const formatted = formatActivityText(str);
                return (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-gray-700 text-sm"
                  >
                    <Check
                      size={14}
                      className="shrink-0 mt-0.5 text-teal-600"
                      strokeWidth={2.5}
                    />
                    <span
                      className="[&_strong]:font-bold [&_strong]:text-[#0A1A44]"
                      dangerouslySetInnerHTML={{
                        __html: formatted || "—",
                      }}
                    />
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
});

export default ItineraryTimeline;
