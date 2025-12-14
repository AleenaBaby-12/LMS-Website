import { Star } from 'lucide-react';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 20 }) => {
    const stars = [1, 2, 3, 4, 5];

    return (
        <div className="flex gap-1">
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => !readonly && onRatingChange && onRatingChange(star)}
                    disabled={readonly}
                    className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
                >
                    <Star
                        size={size}
                        className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                </button>
            ))}
        </div>
    );
};

export default StarRating;
