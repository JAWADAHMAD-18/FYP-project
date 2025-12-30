import api from "../api/Api.js";

export const getPackages = async () => {
  try {
    const response = await api.get("/packages");

    const wrapper = response.data || {};

    // backend currently sometimes returns packages under wrapper.data or wrapper.message
    const packages =
      wrapper?.data?.packages ??
      wrapper?.message?.packages ??
      wrapper?.packages ??
      [];

    return packages;
  } catch (error) {
    console.error("Error fetching packages:", error.message || error);
    throw new Error("Failed to fetch packages. Please try again later.");
  }
};
