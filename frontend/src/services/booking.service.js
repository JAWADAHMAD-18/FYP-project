import api from "../api/Api.js";

/**
 * Submit a new booking.
 * Only sends package ID and numPeople — backend recalculates totalPrice (never trust client).
 *
 * @param {{ package: string, numPeople: number, notes?: string }} payload
 * @returns {Promise<Object>} Clean booking response object from server
 */
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
