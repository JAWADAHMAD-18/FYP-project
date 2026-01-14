import api from "../api/Api.js";

export const getMyBookings = async () => {
  try {
    const response = await api.get("/bookings/me");
    const wrapper = response.data || {};

    // backend returns array in wrapper.data
    const bookings = wrapper?.data ?? [];

    return bookings;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return [];
  }
};
