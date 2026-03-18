import axios from "axios";

// Axios instance with base config
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true, // send cookies with every request
});

// Store access token in memory
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

// Flag to prevent refresh during initial auth restore
let isRestoringAuth = false;

export const setIsRestoringAuth = (value) => {
  isRestoringAuth = Boolean(value);
};

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Ensures only one refresh request runs at a time
let refreshPromise = null;

// Call backend to get new access token
const doRefresh = async () => {
  const { data } = await api.post(
    "/user/refresh-token",
    {},
    {
      withCredentials: true,
      _skipRefresh: true, // avoid interceptor loop
    },
  );

  const newToken = data?.data?.accessToken;
  if (!newToken) throw new Error("No access token returned");

  setAccessToken(newToken);
  return newToken;
};

// Handle 401 errors and retry request after refreshing token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Skip refresh in these cases
    if (
      originalRequest?._skipRefresh ||
      isRestoringAuth ||
      status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Start refresh if not already running
    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      const newToken = await refreshPromise;

      // Retry original request with new token
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // If refresh fails, clear token
      setAccessToken(null);
      return Promise.reject(refreshError);
    }
  },
);

export default api;