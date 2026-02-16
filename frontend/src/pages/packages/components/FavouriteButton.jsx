import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

/**
 * A reusable Favourite/Like button with a micro-interaction animation.
 *
 * @param {Object} props
 * @param {boolean} [props.initialState=false] - Initial checked state (default: false)
 * @param {number} [props.size=24] - Size of the icon in pixels
 * @param {string} [props.className] - Additional classes to merge
 */
export default function FavouriteButton({
  initialState = false,
  size = 24,
  className = "",
}) {
  const [isLiked, setIsLiked] = useState(initialState);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    // Start animation
    setIsAnimating(true);
    // Toggle state
    setIsLiked((prev) => !prev);

    // Reset animation state after duration
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isLiked ? "Remove from favourites" : "Add to favourites"}
      className={`
        relative flex items-center justify-center 
        transition-transform duration-300 ease-out
        ${isAnimating ? "scale-125" : "scale-100"}
        ${className}
      `}
      type="button"
    >
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
