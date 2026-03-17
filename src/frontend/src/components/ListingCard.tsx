import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { motion } from "motion/react";
import type { ListingData } from "../backend";
import { useAverageRating } from "../hooks/useQueries";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../lib/categories";
import { StarRating } from "./StarRating";

interface ListingCardProps {
  listing: ListingData;
  index?: number;
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const { data: avgRating = 0 } = useAverageRating(listing.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link to="/listing/$id" params={{ id: listing.id.toString() }}>
        <div className="card-hover relative aspect-square rounded-xl overflow-hidden bg-muted shadow-card group cursor-pointer">
          {listing.mainImageId ? (
            <img
              src={listing.mainImageId}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-6xl opacity-40">
                {CATEGORY_ICONS[listing.category]}
              </span>
            </div>
          )}

          <div className="listing-card-overlay absolute inset-0" />

          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <div className="mb-1">
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-accent/90 text-accent-foreground px-2 py-0.5 rounded-full">
                {CATEGORY_ICONS[listing.category]}{" "}
                {CATEGORY_LABELS[listing.category]}
              </span>
            </div>
            <h3 className="font-display text-white text-lg leading-tight line-clamp-2">
              {listing.professionalName}
            </h3>
            <p className="text-white/80 text-sm font-medium truncate">
              {listing.title}
            </p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-white/70 text-xs">
                <MapPin size={11} />
                <span className="truncate">
                  {listing.city}, {listing.country}
                </span>
              </div>
              {avgRating > 0 && (
                <div className="flex items-center gap-1">
                  <StarRating value={avgRating} size="sm" />
                  <span className="text-white/80 text-xs">
                    {avgRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
