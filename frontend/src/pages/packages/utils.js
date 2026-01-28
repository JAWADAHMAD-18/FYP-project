export const TRIP_TYPE_UI = /** @type {const} */ ({
  national: "national",
  international: "international",
});

// Backend currently uses "domestic" | "international".
export const normalizeTripTypeToApi = (uiTripType) => {
  if (!uiTripType) return null;
  if (uiTripType === "national") return "domestic";
  return uiTripType;
};

export const formatTripTypeLabel = (uiTripType) => {
  if (uiTripType === "national") return "National";
  if (uiTripType === "international") return "International";
  return uiTripType;
};

export const normalizeText = (v) =>
  String(v ?? "")
    .trim()
    .toLowerCase();

export const matchesSearch = (pkg, rawSearch) => {
  const q = normalizeText(rawSearch);
  if (!q) return true;

  const location = normalizeText(pkg?.location);
  const city = normalizeText(pkg?.city);

  return location.includes(q) || city.includes(q);
};

export const getDestinationLabel = (pkg) => {
  // Prefer city once it exists; fallback to location
  return pkg?.city || pkg?.location || "";
};

