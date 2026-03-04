import api from "../api/Api.js";


export const getCustomPackagePreview = async (data) => {
  const payload = {
    tripType: "international",
    locations: [data.originCity, data.destinationCity],
    start_date: data.departureDate,
    end_date: data.returnDate,
    adults: data.adults ?? 1,
    budgetPreference: data.budgetPreference || "medium",
  };

  const res = await api.post("/preview", payload);
  // The backend ApiResponse shape is:
  //   { statusCode, data: "Custom package created successfully", message: { ...packageData }, success }
  // `data` is the human-readable string; `message` holds the actual object.
  const d = res.data;
  if (d?.message && typeof d.message === "object") return d.message;
  if (d?.data && typeof d.data === "object") return d.data;
  return d;
};


export const confirmCustomPackage = async (previewData) => {
  const res = await api.post("/confirm", { preview: previewData });
  return res.data?.data ?? res.data?.message ?? res.data;
};
