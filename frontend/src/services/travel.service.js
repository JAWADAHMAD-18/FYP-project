// services/travel.service.js
import api from "../api/Api.js";

export const getTravelSummary = async () => {
  try {
    const res = await api.get("/user/booking/summary");
    console.log(res.data.data);
    return res.data.data; // contains totalSpent, fusionSavings, categoryBreakdown
  } catch (err) {
    console.error("Error fetching travel summary:", err);
    throw err;
  }
};
