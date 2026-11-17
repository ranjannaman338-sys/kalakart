import React from 'react';
import { Star } from 'lucide-react';

export function RatingStars({ rating = 0, reviewCount = null, size = 'sm', interactive = false, onRatingChange }) {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const starSize = sizeMap[size] || sizeMap.sm;

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = rating >= star;
          const isHalf = !isFilled && rating >= star - 0.5;

          return (
            <button
              type={interactive ? 'button' : undefined}
              key={star}
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(star)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0.5`}
            >
              <Star
                className={`${starSize} ${
                  isFilled
                    ? 'text-amber-500 fill-amber-500'
                    : isHalf
                    ? 'text-amber-500 fill-amber-500/50'
                    : 'text-stone-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {rating > 0 && (
        <span className="text-xs font-semibold text-charcoal-700 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {reviewCount !== null && (
        <span className="text-xs text-charcoal-500">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
