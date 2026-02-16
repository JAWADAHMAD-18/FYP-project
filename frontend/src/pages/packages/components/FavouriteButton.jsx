import { useState, useEffect, useRef } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import {
  getUserFavorites,
  addFavorite,
  removeFavorite,
} from "../../../services/favorite.service.js";
import { showToast } from "../../../utils/toast.js";


export default function FavouriteButton({
  initialState = false,
  size = 24,
  className = "",
  packageId,
}) {
  const [isLiked, setIsLiked] = useState(initialState);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Use refs to track mounted state and prevent state updates on unmount
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    const fetchFavorites = async () => {
      if (!packageId) return;

      try {
        const { success, data, error } = await getUserFavorites(
          controller.signal,
        );
        if (success && isMounted.current) {
          // Check if current package is in the favorites list
          // valid favorite structure: { _id, user, package: "id" } OR { _id, user, package: { _id: "id" } }
          const isFavorited = data.some((fav) => {
            const favPackageId =
              typeof fav.package === "object" ? fav.package._id : fav.package;
            return favPackageId === packageId;
          });
          setIsLiked(isFavorited);
        } else if (error && error !== "canceled" && isMounted.current) {
          // Silent failure for initial fetch is usually better than a toast on load
          console.error("Failed to fetch favorites:", error);
        }
      } catch (err) {
        // Ignore abort errors
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          console.error(err);
        }
      } finally {
        if (isMounted.current) setIsLoadingInitial(false);
      }
    };

    fetchFavorites();

    // Polling every 60s
    const pollInterval = setInterval(() => {
      // Only poll if tab is visible (optional optimization, but good practice)
      if (!document.hidden) {
        fetchFavorites();
      }
    }, 60000);

    return () => {
      isMounted.current = false;
      controller.abort();
      clearInterval(pollInterval);
    };
  }, [packageId]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUpdating || isLoadingInitial || !packageId) return;

    // 1. Optimistic Update
    const previousState = isLiked;
    setIsLiked(!previousState);
    setIsAnimating(true);
    setIsUpdating(true);

    // Reset animation state
    setTimeout(() => {
      if (isMounted.current) setIsAnimating(false);
    }, 300);

    // 2. Network Request
    const action = !previousState ? addFavorite : removeFavorite;
    const { success, error } = await action(packageId);

    // 3. Rollback on failure
    if (!success && isMounted.current) {
      setIsLiked(previousState); // Revert
      showToast(error, "error");
    } else if (success && isMounted.current) {
      // Optional: show small success toast? Typically not needed for likes as visual feedback is enough.
      // showToast(!previousState ? "Added to favorites" : "Removed from favorites", "success");
    }

    if (isMounted.current) setIsUpdating(false);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isLiked ? "Remove from favourites" : "Add to favourites"}
      aria-pressed={isLiked}
      aria-busy={isUpdating}
      disabled={isLoadingInitial}
      className={`
        relative flex items-center justify-center 
        transition-transform duration-300 ease-out
        ${isAnimating ? "scale-125" : "scale-100"}
        ${isLoadingInitial ? "opacity-50 cursor-wait" : "opacity-100 cursor-pointer"}
        ${className}
      `}
      type="button"
    >
      {/* Screen reader announcement for state change */}
      <span className="sr-only">
        {isUpdating ? "Updating..." : isLiked ? "Favorited" : "Not favorited"}
      </span>

      {isLiked ? (
        <FaHeart size={size} className="text-red-500 drop-shadow-sm" />
      ) : (
        <FaRegHeart
          size={size}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        />
      )}
    </button>
  );
}
