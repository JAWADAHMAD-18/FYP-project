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
  
  const d = res.data;
  if (d?.message && typeof d.message === "object") return d.message;
  if (d?.data && typeof d.data === "object") return d.data;
  return d;
};


export const confirmCustomPackage = async (previewData) => {
  const res = await api.post("/confirm", { preview: previewData });
  return res.data?.data ?? res.data?.message ?? res.data;
};

export const setCustomPackageNegotiating = async (requestId) => {
  const res = await api.patch("/status/negotiating", { requestId });
  return res.data?.data ?? res.data;
};

export const getCustomPackageByRequestId = async (requestId) => {
  const res = await api.get(`/admin/custom-package/${requestId}`);
  return res.data?.data ?? res.data;
};

export const adminUpdateCustomPackageStatus = async (
  requestId,
  status,
  finalSelection = {}
) => {
  const res = await api.patch(`/admin/custom-package/${requestId}/status`, {
    status,
    finalSelection,
  });
  return res.data?.data ?? res.data;
};

// Partial admin update: only adminFinalPrice, selectedFlights, selectedHotels
export const adminPartialUpdatePackage = async (requestId, payload) => {
  const res = await api.patch(
    `/admin/custom-package/${requestId}/admin-update`,
    payload
  );
  return res.data?.data ?? res.data;
};
