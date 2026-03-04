import React, { memo } from "react";
import { motion } from "framer-motion";

const PoiGrid = memo(function PoiGrid({ pois }) {
  if (!Array.isArray(pois) || pois?.length === 0) return null;
  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {pois.map((poi, idx) => (
        <div
          key={poi?.id ?? idx}
          className="rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-4 bg-white"
        >
          <div className="font-semibold text-[#0A1A44]">{poi?.name ?? "POI"}</div>
          {poi?.description && (
            <p className="text-sm text-gray-600 mt-1">{poi.description}</p>
          )}
        </div>
      ))}
    </motion.div>
  );
});

export default PoiGrid;
