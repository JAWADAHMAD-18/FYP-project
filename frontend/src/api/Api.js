// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:3000/api/v1',
  withCredentials: true, // sends cookies
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = window.__ACCESS_TOKEN__; // or get from a singleton/store
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          })
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(function (resolve, reject) {
        axios
          .post('/api/v1/users/refresh-token', {}, { withCredentials: true })
          .then(({ data }) => {
            const newToken = data.accessToken;
            // save globally / in context
            window.__ACCESS_TOKEN__ = newToken;
            originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
            processQueue(null, newToken);
            resolve(axios(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            // redirect to login or clear auth state
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }
    return Promise.reject(err);
  }
);

export default api;