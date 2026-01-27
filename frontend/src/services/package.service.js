import api from "../api/Api.js";

// Simple in-memory cache to avoid refetching packages across sections
let cachedPackages = null;
let inFlightRequest = null;

export const getPackages = async () => {
  if (cachedPackages) {
    return cachedPackages;
  }

  if (inFlightRequest) {
    return inFlightRequest;
  }

  inFlightRequest = (async () => {
    try {
      const response = await api.get("/packages");
      const wrapper = response.data || {};

      // backend currently sometimes returns packages under wrapper.data or wrapper.message
      const packages =
        wrapper?.data?.packages ??
        wrapper?.message?.packages ??
        wrapper?.packages ??
        [];

      cachedPackages = packages;
      return packages;
    } catch (error) {
      console.error("Error fetching packages:", error.message || error);
      throw new Error("Failed to fetch packages. Please try again later.");
    } finally {
      inFlightRequest = null;
    }
  })();

  return inFlightRequest;
};
