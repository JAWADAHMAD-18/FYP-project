import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Building2,
  CloudSun,
  Compass,
  Sparkles,
  Check,
} from "lucide-react";

const STAGES = [
  { id: "flights", label: "Searching flights", icon: Plane, duration: 3000 },
  { id: "hotels", label: "Finding hotels", icon: Building2, duration: 3500 },
  { id: "weather", label: "Checking weather", icon: CloudSun, duration: 2500 },
  {
    id: "experiences",
    label: "Curating experiences",
    icon: Compass,
    duration: 3000,
  },
  {
    id: "itinerary",
    label: "Generating AI itinerary",
    icon: Sparkles,
    duration: 4000,
  },
];

const ProgressTracker = ({ isActive, isComplete }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isActive || isComplete) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (activeIndex < STAGES.length - 1) {
      timerRef.current = setTimeout(() => {
        setActiveIndex((prev) => prev + 1);
      }, STAGES[activeIndex].duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, isComplete, activeIndex]);

  // Reset when re-activated
  useEffect(() => {
    if (isActive && !isComplete) setActiveIndex(0);
  }, [isActive, isComplete]);

  if (!isActive && !isComplete) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 p-6 md:p-8 mt-8"
    >
      <h3 className="text-lg font-bold text-[#0A1A44] mb-6">
        {isComplete ? "Package ready!" : "Building your package…"}
      </h3>

      <div className="space-y-4">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = isComplete || idx < activeIndex;
          const isCurrent = !isComplete && idx === activeIndex;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center gap-4"
            >
              {/* Icon circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${
                  isDone
                    ? "bg-teal-100 text-teal-600"
                    : isCurrent
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {isDone ? <Check size={18} /> : <Icon size={18} />}
              </div>

              {/* Label + bar */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    isDone
                      ? "text-teal-700"
                      : isCurrent
                        ? "text-[#0A1A44]"
                        : "text-gray-400"
                  }`}
                >
                  {stage.label}
                </p>

                {isCurrent && (
                  <div className="mt-1.5 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{
                        duration: stage.duration / 1000,
                        ease: "linear",
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ProgressTracker;
