import { getPackageById } from "./package.service.js";

export const getUserFavorites = async (favoriteIds = []) => {
  if (!favoriteIds.length) return [];

  // Use shared caching + robust response parsing
  const favorites = await Promise.all(favoriteIds.map((id) => getPackageById(id)));
  return favorites.filter(Boolean);
};
