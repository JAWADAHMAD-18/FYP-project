import api from "../api/Api.js";

export const getUserFavorites = async (signal) => {
  try {
    const response = await api.get("/favorites", { signal });
    // API returns standard ApiResponse: { statusCode, data, message, success }
    return {
      success: true,
      data: response.data.data, // Accessing the 'data' field of the ApiResponse
      message: response.data.message, // Accessing the 'message' field of the ApiResponse
    };
  } catch (error) {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      // Improve DX by explicitly identifying cancellations
      throw error;
    }
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch favorites",
    };
  }
};


export const addFavorite = async (packageId) => {
  if (!packageId) return { success: false, error: "Package ID is required" };

  try {
    const response = await api.post("/favorites/add-favorite", { packageId });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to add favorite",
    };
  }
};


export const removeFavorite = async (packageId) => {
  if (!packageId) return { success: false, error: "Package ID is required" };

  try {
    const response = await api.delete(`/favorites/${packageId}`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to remove favorite",
    };
  }
};

export const getFavoriteCount = async () => {
  const response = await api.get("/favorites/count");
  return response.data;
};

