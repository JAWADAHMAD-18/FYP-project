import { memo } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Tag } from "lucide-react";

const FALLBACK_IMAGE_URL =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolve a price from a hotel's `offers` array.
 * Each offer's price may be a number or { total, currency }.
 */
const resolvePrice = (offers) => {
  if (!Array.isArray(offers) || offers.length === 0) return null;
  const first = offers[0]?.price;
  if (first == null) return null;
  if (typeof first === "object") {
    const amt = parseFloat(first.total);
    return isNaN(amt)
      ? null
      : { amount: amt, currency: first.currency ?? "PKR" };
  }
  const amt = parseFloat(first);
  return isNaN(amt) ? null : { amount: amt, currency: "PKR" };
};

/**
 * Build a single-line address string from the `address` object returned by the backend.
 * Shape: { lines: string[], cityName: string, postalCode: string, countryCode: string }
 */
const resolveAddress = (address) => {
  if (!address) return null;
  const parts = [
    ...(Array.isArray(address.lines) ? address.lines : []),
    address.cityName,
    address.postalCode,
  ].filter(Boolean);
  return parts.join(", ") || null;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const HotelCard = memo(function HotelCard({ hotel, isSelected, onSelect, isAiPick }) {
  const hotelId = hotel?.hotelId;
  const name = hotel?.name;
  const rating = hotel?.rating;
  const address = hotel?.address;
  const offers = hotel?.offers;
  const imageUrl = hotel?.imageUrl;
  const available = hotel?.available;

  const imgSrc = imageUrl ?? FALLBACK_IMAGE_URL;
  const priceInfo = resolvePrice(offers);
  const addressLine = resolveAddress(address);

  const handleClick = () => onSelect?.(hotelId);

  return (
    <motion.div
      className={`relative border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200
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
      {/* Hero image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        <img
          src={imgSrc}
          alt={name ?? "Hotel"}
          loading="lazy"
          className="w-full h-full object-cover rounded-t-2xl"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE_URL;
          }}
        />
        {available === false && (
          <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-full">
            Contact for pricing
          </span>
        )}
        {isAiPick && (
          <span className="absolute top-2 right-2 text-[10px] font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
            AI Pick ✦
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <p className="text-base font-bold text-[#0A1A44] truncate leading-tight">
          {name ?? "Hotel"}
        </p>

        {addressLine && (
          <div className="flex items-start gap-1.5 text-xs text-gray-500">
            <MapPin size={12} className="shrink-0 mt-0.5 text-gray-400" />
            <span className="line-clamp-2">{addressLine}</span>
          </div>
        )}

        {rating != null ? (
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-gray-700">
              {typeof rating === "number" ? rating.toFixed(1) : rating}
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No rating</p>
        )}

        <div className="flex items-center gap-1.5 pt-1">
          <Tag size={12} className="text-teal-600 shrink-0" />
          {priceInfo ? (
            <p className="text-sm font-extrabold text-teal-600">
              {priceInfo.currency} {priceInfo.amount.toFixed(2)}
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">Price on request</p>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default HotelCard;
