import api from "../api/Api.js";


export const createBooking = async (payload) => {
  const res = await api.post("/user/booking", payload);
  // ApiResponse shape: { statusCode, data, message, success }
  return res.data?.data ?? res.data;
};

export const getMyBookings = async () => {
  try {
    const response = await api.get("/user/booking/me");
    const wrapper = response.data || {};

    // backend returns array in wrapper.data
    const bookings = wrapper?.data ?? [];

    return bookings;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return [];
  }
};

export const getUpcomingBookings = async () => {
  try {
    const response = await api.get("/bookings/upcoming");
    const wrapper = response.data || {};
    return wrapper?.data ?? [];
  } catch (error) {
    console.error("Error fetching upcoming bookings:", error);
    return [];
  }
};

export const getMyBookingById = async (bookingId) => {
  const res = await api.get(`/bookings/${bookingId}`);
  return res.data?.data ?? res.data;
};

export const uploadPaymentProof = async (bookingId, formData) => {
  const res = await api.post(`/bookings/${bookingId}/payment-proof`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data ?? res.data;
};
