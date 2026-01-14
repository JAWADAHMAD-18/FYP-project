import api from "../api/Api.js";

export const getUserFavorites = async (favoriteIds = []) => {
  if (!favoriteIds.length) return [];
  
  const favorites = await Promise.all(
    favoriteIds.map(id => api.get(`/packages/${id}`).then(res => res.data.package))
  );
  return favorites;
};
