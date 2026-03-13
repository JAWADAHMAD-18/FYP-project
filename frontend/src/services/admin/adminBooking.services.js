import api from "../../api/Api.js";

const extractData = (res) => res.data?.data ?? res.data;

export const getAllBookings = async () => {
  const res = await api.get("/admin/booking");
  return extractData(res) ?? [];
};

export const searchBookings = async (query) => {
  const params = new URLSearchParams();
  if (query?.q) params.set("q", query.q);
  if (query?.packageId) params.set("packageId", query.packageId);
  if (query?.userId) params.set("userId", query.userId);
  if (query?.bookingStatus) params.set("bookingStatus", query.bookingStatus);
  if (query?.paymentStatus) params.set("paymentStatus", query.paymentStatus);
  const res = await api.get(`/admin/booking/search?${params.toString()}`);
  return extractData(res) ?? [];
};

export const getBookingById = async (id) => {
  const res = await api.get(`/admin/booking/${id}`);
  return extractData(res);
};

export const verifyPayment = async (id) => {
  const res = await api.patch(`/admin/booking/${id}/verify-payment`);
  return extractData(res);
};

export const rejectPayment = async (id, reason) => {
  const res = await api.patch(`/admin/booking/${id}/reject-payment`, {
    reason: reason || null,
  });
  return extractData(res);
};

export const cancelBooking = async (id, cancelReason) => {
  const res = await api.patch(`/admin/booking/${id}/cancel`, {
    cancelReason: cancelReason || null,
  });
  return extractData(res);
};
