import React, { memo, useMemo } from "react";

const CostSummary = memo(function CostSummary({
  selectedFlights,
  selectedHotels,
}) {
  const total = useMemo(() => {
    const flightCost = (selectedFlights ?? []).reduce((sum, f) => {
      const p = f.price;
      if (p == null) return sum;
      const val =
        typeof p === "object" ? parseFloat(p.total ?? 0) : parseFloat(p);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const hotelCost = (selectedHotels ?? []).reduce((sum, h) => {
      // price may live in offers[0].price.total or directly on the hotel
      const offer = Array.isArray(h.offers) ? h.offers[0] : null;
      const p = offer?.price ?? h.price ?? h.totalStayPrice;
      if (p == null) return sum;
      const val =
        typeof p === "object" ? parseFloat(p.total ?? 0) : parseFloat(p);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const subtotal = flightCost + hotelCost;
    const margin = subtotal * 0.1; // 10% platform margin
    return subtotal + margin;
  }, [selectedFlights, selectedHotels]);

  return (
    <div className="rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 p-6 bg-white">
      <h3 className="text-lg font-bold text-[#0A1A44] mb-2 border-l-4 border-teal-600 pl-3">
        Estimated Total Cost
      </h3>
      <p className="text-2xl font-bold text-teal-600">${total.toFixed(2)}</p>
      <p className="text-sm text-gray-500 mt-1">
        Includes 10% platform margin (hidden from breakdown)
      </p>
    </div>
  );
});

export default CostSummary;
