/* Design Philosophy: Pacific Northwest Naturalism
   - Frosted glass panels with subtle shadows
   - Organic rounded corners (0.75rem)
   - Forest green accents for pricing
*/

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatNumber } from "@/lib/utils";
import { Bed, Bath, Maximize } from "lucide-react";
import type { Listing } from "@/lib/mockData";
import Image from "next/image";

interface ListingCardProps {
  listing: Listing;
  onClick?: () => void;
}

export default function ListingCard({ listing, onClick }: ListingCardProps) {
  return (
    <Card
      className="group overflow-hidden cursor-pointer transition-all duration-400 hover:shadow-xl hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
        />

        {/* Status Badge */}
        {listing.status === "pending" && (
          <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
            Pending
          </Badge>
        )}
        {listing.status === "sold" && (
          <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground">
            Sold
          </Badge>
        )}

        {/* Price Overlay - Frosted Glass */}
        <div className="absolute bottom-0 left-0 right-0 frosted-glass border-t border-border/20 p-4">
          <p className="text-2xl font-bold text-primary">
            {formatPrice(listing.price)}
          </p>
        </div>
      </div>

      {/* listing Details */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-1 line-clamp-2 min-h-[3.5rem]">
            {listing.title}
          </h3>
          <p className="text-sm text-muted-foreground">{listing.address}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {listing.neighborhood}
          </p>
        </div>

        {/* listing Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-primary" />
            <span>{listing.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-primary" />
            <span>{listing.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize className="w-4 h-4 text-primary" />
            <span>{formatNumber(listing.sqft)} sqft</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
