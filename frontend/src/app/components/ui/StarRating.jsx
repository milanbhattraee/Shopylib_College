import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export default function StarRating({ rating = 0, size = "sm", interactive = false, onChange }) {
  const stars = [];
  const sizeClass = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3 h-3";

  for (let i = 1; i <= 5; i++) {
    if (interactive) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          className="focus:outline-none"
        >
          {i <= rating ? (
            <FaStar className={`${sizeClass} text-yellow-400`} />
          ) : (
            <FaRegStar className={`${sizeClass} text-gray-300 hover:text-yellow-400 transition`} />
          )}
        </button>
      );
    } else {
      if (rating >= i) {
        stars.push(<FaStar key={i} className={`${sizeClass} text-yellow-400`} />);
      } else if (rating >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} className={`${sizeClass} text-yellow-400`} />);
      } else {
        stars.push(<FaRegStar key={i} className={`${sizeClass} text-gray-300`} />);
      }
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}
