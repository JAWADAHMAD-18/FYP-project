import api from "../../api/Api";

function stripApiV1(baseUrl) {
  if (!baseUrl || typeof baseUrl !== "string") return null;
  return baseUrl.replace(/\/api\/v1\/?$/i, "");
}

export function getApiBaseUrl() {
  return (
    import.meta.env.VITE_API_BASE_URL ||
    api?.defaults?.baseURL ||
    "http://127.0.0.1:3000/api/v1"
  );
}

export function getSocketUrl() {
  const envSocketUrl = import.meta.env.VITE_SOCKET_URL;
  if (envSocketUrl) return envSocketUrl;

  const apiBase = getApiBaseUrl();
  return stripApiV1(apiBase) || "http://127.0.0.1:3000";
}

