import { Plane, BedDouble } from "lucide-react";

function fmtPrice(n) {
  return Number(n ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  });
}

export default function PackageSnapshotSection({ booking }) {
  const snap = booking?.packageSnapshot;
  const images = snap?.images ?? [];
  const includes = snap?.includes ?? [];
  const excludes = snap?.excludes ?? [];
  const flights = snap?.selectedFlights ?? [];
  const hotels = snap?.selectedHotels ?? [];
  const itinerary = snap?.itinerary ?? [];
  const isCustom = booking?.bookingType === "custom";

  if (!snap) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-black text-[#0A1A44]">
          Package Snapshot
        </h2>
        <div className="flex gap-2">
          {snap.category && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200">
              {snap.category}
            </span>
          )}
          {snap.tripType && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-200">
              {snap.tripType}
            </span>
          )}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Title
        </p>
        <p className="mt-1 text-base font-semibold text-gray-900">
          {snap.title ?? "—"}
        </p>
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Destination
        </p>
        <p className="mt-1 text-sm font-semibold text-gray-900">
          {snap.destination ?? "—"}
        </p>
      </div>

      {isCustom && snap.adminFinalPrice != null && (
        <div className="mb-5 rounded-xl border border-teal-100 bg-teal-50/50 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Admin Final Price
          </p>
          <p className="mt-1 text-lg font-black text-teal-700">
            {fmtPrice(snap.adminFinalPrice)}
          </p>
        </div>
      )}

      {images.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Images
          </p>
          <div className="flex flex-wrap gap-2">
            {images.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-20 h-20 rounded-xl overflow-hidden border border-gray-100 hover:ring-2 hover:ring-teal-300 transition"
              >
                <img
                  src={url}
                  alt={`Package ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {(includes.length > 0 || excludes.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Includes
            </p>
            {includes.length > 0 ? (
              <ul className="space-y-1 text-sm text-gray-700">
                {includes.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-teal-600 font-black">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">—</p>
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Excludes
            </p>
            {excludes.length > 0 ? (
              <ul className="space-y-1 text-sm text-gray-700">
                {excludes.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-red-500 font-black">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">—</p>
            )}
          </div>
        </div>
      )}

      {/* Custom extras — flights, hotels, itinerary from snapshot */}
      {flights.length > 0 && (
        <div className="mb-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            <Plane size={14} className="text-teal-600" />
            Selected Flights
          </p>
          <div className="space-y-2">
            {flights.map((f, i) => {
              const price =
                typeof f?.price === "object" && f?.price?.total
                  ? `${f.price.currency ?? "PKR"} ${f.price.total}`
                  : f?.price != null
                    ? String(f.price)
                    : "—";
              return (
                <div key={f?.flightId ?? i} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {f?.airline ?? "Flight"} • {price}
                  </p>
                  {(f?.duration || f?.stops != null) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {f?.duration ? String(f.duration).replace(/^PT/, "") : ""}
                      {f?.stops != null ? ` • ${f.stops} stop${f.stops !== 1 ? "s" : ""}` : ""}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hotels.length > 0 && (
        <div className="mb-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            <BedDouble size={14} className="text-teal-600" />
            Selected Hotels
          </p>
          <div className="space-y-2">
            {hotels.map((h, i) => {
              const priceStr =
                typeof h?.price === "object" && h?.price?.total
                  ? `${h.price.currency ?? "EUR"} ${h.price.total}/night`
                  : h?.price
                    ? `${h.price}/night`
                    : "";
              return (
                <div key={h?.hotelId ?? i} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {h?.name ?? h?.hotelName ?? "Hotel"}
                  </p>
                  {priceStr && (
                    <p className="text-xs text-gray-500 mt-0.5">{priceStr}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {itinerary.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            Day-by-Day Itinerary
          </p>
          <div className="space-y-2">
            {itinerary.map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                <p className="text-sm font-semibold text-teal-700 mb-1">
                  Day {item?.day ?? i + 1}: {item?.title ?? "—"}
                </p>
                {Array.isArray(item?.activities) ? (
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                    {item.activities.map((act, j) => (
                      <li key={j}>{act}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-600">
                    {item?.description ?? item?.activity ?? "—"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
