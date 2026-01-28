import { motion, AnimatePresence } from "framer-motion";
import PackageCard from "../../../components/Cards/PackagesCard.jsx";

export default function PackagesGrid({
  packages,
  visibleCount,
  onCardVisibleKey,
}) {
  const visible = packages.slice(0, visibleCount);

  return (
    <AnimatePresence mode="wait">
      {visible.length > 0 ? (
        <motion.div
          key={onCardVisibleKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((pkg) => (
            <motion.div
              key={pkg._id || pkg.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              whileHover={{ y: -4 }}
            >
              <PackageCard packageData={pkg} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center py-24"
        >
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-2xl font-bold text-[#0A1A44] mb-2">
              No packages found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search to see more options.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

