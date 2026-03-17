/* Design Philosophy: Pacific Northwest Naturalism
   - Clean, minimal filter interface
   - Forest green primary buttons
   - Smooth transitions
*/

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, ArrowRight } from "lucide-react";
import { neighborhoods, listingTypes, mockListings } from "@/lib/mockData";
import { formatPrice } from "@/lib/utils";
import ListingCard from "../ListingCard";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface SearchFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  compact?: boolean;
}

export interface FilterState {
  neighborhood: string;
  listingType: string;
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  minBathrooms: number;
}

export default function SearchFilters({
  onFilterChange,
  compact = false,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    neighborhood: "All Neighborhoods",
    listingType: "All Types",
    minPrice: 0,
    maxPrice: 5000000,
    minBedrooms: 0,
    minBathrooms: 0,
  });

  const [filteredListings, setFilteredListings] = useState<any[]>([]);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const applyFilters = () => {
    const filtered = mockListings.filter((p) => {
      if (
        filters.neighborhood !== "All Neighborhoods" &&
        p.neighborhood !== filters.neighborhood
      )
        return false;
      if (filters.listingType !== "All Types" && p.type !== filters.listingType)
        return false;
      if (p.bedrooms < filters.minBedrooms) return false;
      if (p.bathrooms < filters.minBathrooms) return false;
      if (p.price < filters.minPrice || p.price > filters.maxPrice)
        return false;

      return true;
    });

    setFilteredListings(filtered);
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  if (compact) {
    return (
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Start Your Property Search
          </h2>
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by address, neighborhood..."
                className="pl-10 h-12"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Start Your Property Search
        </h2>
        <div className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by address, neighborhood, or property type..."
              className="pl-12 h-14 text-base"
            />
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Neighborhood */}
            <div className="space-y-2">
              <Label>Neighborhood</Label>
              <Select
                value={filters.neighborhood}
                onValueChange={(value) =>
                  handleFilterChange("neighborhood", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {neighborhoods.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Listing Type */}
            <div className="space-y-2">
              <Label>Listing Type</Label>
              <Select
                value={filters.listingType}
                onValueChange={(value) =>
                  handleFilterChange("listingType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {listingTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <Label>Min Bedrooms</Label>
              <Select
                value={filters.minBedrooms.toString()}
                onValueChange={(value) =>
                  handleFilterChange("minBedrooms", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bathrooms */}
            <div className="space-y-2">
              <Label>Min Bathrooms</Label>
              <Select
                value={filters.minBathrooms.toString()}
                onValueChange={(value) =>
                  handleFilterChange("minBathrooms", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {showAdvanced ? "Hide" : "Show"} Advanced Filters
          </Button>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-6 p-6 border border-border rounded-lg bg-muted/20">
              {/* Price Range */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Price Range</Label>
                  <span className="text-sm text-muted-foreground">
                    {formatPrice(filters.minPrice)} -{" "}
                    {formatPrice(filters.maxPrice)}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={5000000}
                  step={50000}
                  value={[filters.minPrice, filters.maxPrice]}
                  onValueChange={([min, max]) => {
                    handleFilterChange("minPrice", min);
                    handleFilterChange("maxPrice", max);
                  }}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Search Button */}
          <Button
            className="w-full h-12 text-base"
            size="lg"
            onClick={applyFilters}
          >
            <Search className="w-5 h-5 mr-2" />
            Search Properties
          </Button>
        </div>
      </div>
      <div>
        <Swiper
          modules={[Navigation]}
          spaceBetween={24}
          navigation
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="pt-8"
        >
          {filteredListings.slice(0, 6).map((listing) => (
            <SwiperSlide key={listing.id}>
              <ListingCard listing={listing} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* See More Button */}
        {filteredListings.length > 6 && (
          <div className="flex justify-center mt-8">
            <Button variant="outline">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
