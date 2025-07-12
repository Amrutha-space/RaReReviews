import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = 'medium',
  className,
}: StarRatingProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-8 h-8',
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          disabled={readonly}
          className={cn(
            "focus:outline-none",
            !readonly && "hover:scale-110 transition-transform",
            readonly && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300",
              !readonly && "hover:text-yellow-400"
            )}
          />
        </button>
      ))}
      {size === 'large' && (
        <span className="ml-3 text-lg font-semibold text-gray-700">
          {rating} out of 5 stars
        </span>
      )}
    </div>
  );
}
