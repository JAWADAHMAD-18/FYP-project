import { getPackages } from "./package.service.js";

export const getRecommendedPackages = async () => {
  try {
    const allPackages = await getPackages();
    return allPackages.slice(0, 3); // first 3 packages as recommendations
  } catch (err) {
    console.error("Error fetching recommended packages:", err);
    return [];
  }
};
