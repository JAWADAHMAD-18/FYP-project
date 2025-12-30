import api from "../api/Api.js"; // adjust path if needed


export const getPackages = async () => {
  try {
    const response = await api.get("/packages"); // endpoint: /api/v1/packages

    if (!Array.isArray(response.data)) {
      throw new Error("Invalid response format from API");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching packages:", error.message || error);
    throw new Error("Failed to fetch packages. Please try again later.");
  }
};
