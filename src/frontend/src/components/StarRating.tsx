import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (value: number) => void;
}

export function StarRating({
  value,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizes = { sm: 12, md: 16, lg: 20 };
  const px = sizes[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(value);
        return (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: stars are positionally stable
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : "cursor-default"
            }
          >
            <Star
              width={px}
              height={px}
              className={
                filled
                  ? "fill-accent text-accent"
                  : "fill-muted text-muted-foreground"
              }
            />
          </button>
        );
      })}
    </div>
  );
}
