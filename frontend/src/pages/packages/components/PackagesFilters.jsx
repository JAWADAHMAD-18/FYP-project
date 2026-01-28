import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter, MapPin, Search } from "lucide-react";
import {
  formatTripTypeLabel,
  normalizeTripTypeToApi,
  TRIP_TYPE_UI,
} from "../utils.js";

const TRIP_TYPE_OPTIONS = [
  { key: TRIP_TYPE_UI.national, label: "National" },
  { key: TRIP_TYPE_UI.international, label: "International" },
];

export default function PackagesFilters({
  allPackages,
  selectedTripType,
  selectedCategory,
  searchQuery,
  onTripTypeChange,
  onCategoryChange,
  onSearchChange,
  onReset,
}) {
  const apiTripType = normalizeTripTypeToApi(selectedTripType);

  // "Categories" here are destination buckets; today we use location (and will
  // naturally evolve to city once populated).
  const availableCategories = useMemo(() => {
    if (!selectedTripType) return [];

    const categories = new Set();
    for (const p of allPackages) {
      if (p?.trip_type !== apiTripType) continue;
      if (p?.location) categories.add(p.location);
    }
    return Array.from(categories).sort();
  }, [allPackages, apiTripType, selectedTripType]);

  const hasActiveFilters =
    Boolean(selectedTripType) ||
    Boolean(selectedCategory) ||
    Boolean(searchQuery?.trim());

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex flex-col gap-6">
        {/* Trip Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Trip Type
          </label>
          <div className="flex flex-wrap gap-3">
            {TRIP_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => onTripTypeChange(opt.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedTripType === opt.key
                    ? "bg-[#0A1A44] text-white shadow-lg shadow-[#0A1A44]/20 scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Search (City or Location)
          </label>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Try: Murree, Hunza, Dubai..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition"
            />
          </div>
        </div>

        {/* Cascading categories */}
        <AnimatePresence>
          {selectedTripType && availableCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <MapPin size={16} className="text-[#0D9488]" />
                Destinations
              </label>
              <div className="flex flex-wrap gap-3">
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                      selectedCategory === cat
                        ? "bg-[#0D9488] text-white shadow-md shadow-[#0D9488]/20"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filters + reset */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap"
            >
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">Active:</span>

              {selectedTripType && (
                <span className="px-3 py-1 bg-[#0A1A44] text-white text-xs font-semibold rounded-full">
                  {formatTripTypeLabel(selectedTripType)}
                </span>
              )}
              {selectedCategory && (
                <span className="px-3 py-1 bg-[#0D9488] text-white text-xs font-semibold rounded-full flex items-center gap-1">
                  <MapPin size={12} />
                  {selectedCategory}
                </span>
              )}
              {searchQuery?.trim() && (
                <span className="px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full">
                  “{searchQuery.trim()}”
                </span>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                className="ml-auto flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
              >
                <X size={16} />
                Reset
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

