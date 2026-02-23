import api from "../api/Api.js";

// Fetch admin dashboard summary from the backend
export const fetchDashboardSummary = async () => {
  const res = await api.get("/admin/dashboard/summary");
  return res.data?.data ?? res.data;
};
