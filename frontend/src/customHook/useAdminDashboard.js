import { useState, useEffect, useCallback, useRef } from "react";
import { fetchDashboardSummary } from "../services/adminDashboard.service";

const REFETCH_INTERVAL = 65_000; // slightly above 60s cache TTL

const useAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      setError(null);
      const result = await fetchDashboardSummary();
      setData(result);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to load dashboard";
      setError(msg);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  // Initial fetch + auto-refetch
  useEffect(() => {
    fetchData(true);

    intervalRef.current = setInterval(() => fetchData(false), REFETCH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { data, loading, error, refetch };
};

export default useAdminDashboard;
