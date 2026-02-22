import api from "../api/Api.js";

// Simple in-memory cache to avoid refetching packages across sections
let cachedPackages = null;
let inFlightRequest = null;

// Package-by-id cache for details/favorites/recommendations
const cachedById = new Map();
const inFlightById = new Map();

const extractPackagesList = (responseData) => {
  const wrapper = responseData || {};
  return (
    wrapper?.data?.packages ??
    wrapper?.message?.packages ??
    wrapper?.packages ??
    []
  );
};

const extractSinglePackage = (responseData) => {
  const wrapper = responseData || {};
  
  const candidate =
    wrapper?.data ??
    wrapper?.message ??
    wrapper?.package ??
    wrapper?.data?.package ??
    wrapper?.message?.package ??
    null;

  if (candidate && typeof candidate === "object") return candidate;
  return null;
};

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
      const packages = extractPackagesList(response.data);
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

export const getPackageById = async (id) => {
  if (!id) throw new Error("Package id is required");

  if (cachedById.has(id)) {
    return cachedById.get(id);
  }

  if (inFlightById.has(id)) {
    return inFlightById.get(id);
  }

  const req = (async () => {
    try {
      const res = await api.get(`/packages/${id}`);
      const pkg = extractSinglePackage(res.data);
      if (!pkg) throw new Error("Invalid package response");
      cachedById.set(id, pkg);
      return pkg;
    } finally {
      inFlightById.delete(id);
    }
  })();

  inFlightById.set(id, req);
  return req;
};
