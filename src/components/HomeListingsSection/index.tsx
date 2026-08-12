// import React from "react";
// import SearchFilters from "./SearchFilters";
// import ListingCard from "../ListingCard";

// export default function Search() {
//   return (
//     <section
//       className="relative bg-background py-10"
//       style={{
//         clipPath: "polygon(0 8%, 100% 0, 100% 100%, 0 100%)",
//         marginTop: "-5rem",
//         paddingTop: "8rem",
//       }}
//     >
//       <SearchFilters />
//     </section>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/config/supabaseClient";
import { Button } from "@/components/ui/button";
import { ListingFilters, FilterState } from "@/components/ListingFilters";
import { ListingCard, Listing } from "@/components/ListingCard";
import { serializeFilters } from "@/lib/utils";

export function HomeListingsSection({ user }: { user: any }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Default/Initial empty filter state
  const initialFilters: FilterState = {
    searchQuery: "",
    category: [],
    status: user ? [] : ["Active"],
    bedrooms: "",
    bathrooms: "",
    minPrice: "",
    maxPrice: "",
    minLot: "",
    maxLot: "",
    minArea: "",
    maxArea: "",
    minYear: "",
    maxYear: "",
    propertiesOnly: false,
  };

  // This state controls the actual query running on the homepage preview
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(initialFilters);

  // Fetch the 4 preview listings whenever the user submits/applies filters on the home page
  useEffect(() => {
    async function fetchPreviewListings() {
      setLoading(true);

      const targetTable = appliedFilters.propertiesOnly
        ? "off_market_properties"
        : "all_listings";
      let query = supabase.from(targetTable).select("*").limit(4);

      // 2. Conditional Logic: Only apply market filters if NOT off-market
      if (!appliedFilters.propertiesOnly) {
        if (!user) {
          query = query.in("market_status", ["Active"]);
        } else if (appliedFilters.status.length > 0) {
          query = query.in("market_status", appliedFilters.status);
        }

        if (appliedFilters.category.length > 0) {
          query = query.in("property_category", appliedFilters.category);
        }
        if (appliedFilters.minPrice) {
          query = query.gte(
            "asking_price",
            parseFloat(appliedFilters.minPrice),
          );
        }
        if (appliedFilters.maxPrice) {
          query = query.lte(
            "asking_price",
            parseFloat(appliedFilters.maxPrice),
          );
        }
      }

      // 3. Global Filters (Apply to both)
      if (appliedFilters.searchQuery) {
        query = query.or(
          `civic_address.ilike.%${appliedFilters.searchQuery}%,neighbourhood.ilike.%${appliedFilters.searchQuery}%${
            !appliedFilters.propertiesOnly
              ? `,mls_number.ilike.%${appliedFilters.searchQuery}%`
              : ""
          }`,
        );
      }
      if (appliedFilters.bedrooms)
        query = query.gte("bedrooms", parseInt(appliedFilters.bedrooms));
      if (appliedFilters.bathrooms)
        query = query.gte("full_baths", parseInt(appliedFilters.bathrooms));
      if (appliedFilters.minArea)
        query = query.gte("total_floor_area", parseInt(appliedFilters.minArea));
      if (appliedFilters.maxArea)
        query = query.lte("total_floor_area", parseInt(appliedFilters.maxArea));
      if (appliedFilters.minLot)
        query = query.gte("lot_size", parseInt(appliedFilters.minLot));
      if (appliedFilters.maxLot)
        query = query.lte("lot_size", parseInt(appliedFilters.maxLot));
      if (appliedFilters.minYear)
        query = query.gte("year_built", parseInt(appliedFilters.minYear));
      if (appliedFilters.maxYear)
        query = query.lte("year_built", parseInt(appliedFilters.maxYear));

      // 4. Sort logic
      const sortColumn = appliedFilters.propertiesOnly
        ? "civic_address"
        : "listing_date";
      const { data, error } = await query.order(sortColumn, {
        ascending: appliedFilters.propertiesOnly,
      });

      if (!error) {
        setListings(data || []);
      }
      setLoading(false);
    }

    fetchPreviewListings();

    // Strict limit of 4 items for the homepage preview
    //   let query = supabase.from("all_listings").select("*").limit(4);

    //   // Apply public/private status filters
    //   if (!user) {
    //     query = query.in("market_status", ["Active"]);
    //   } else if (appliedFilters.status.length > 0) {
    //     query = query.in("market_status", appliedFilters.status);
    //   }

    //   // Apply identical database filter logic as the main page
    //   if (appliedFilters.searchQuery) {
    //     query = query.or(
    //       `civic_address.ilike.%${appliedFilters.searchQuery}%,mls_number.ilike.%${appliedFilters.searchQuery}%,neighbourhood.ilike.%${appliedFilters.searchQuery}%`,
    //     );
    //   }
    //   if (appliedFilters.category.length > 0) {
    //     query = query.in("property_category", appliedFilters.category);
    //   }
    //   if (appliedFilters.bedrooms) {
    //     query = query.gte("bedrooms", parseInt(appliedFilters.bedrooms));
    //   }
    //   if (appliedFilters.bathrooms) {
    //     query = query.gte("full_baths", parseInt(appliedFilters.bathrooms));
    //   }
    //   if (appliedFilters.minPrice) {
    //     query = query.gte("asking_price", parseFloat(appliedFilters.minPrice));
    //   }
    //   if (appliedFilters.maxPrice) {
    //     query = query.lte("asking_price", parseFloat(appliedFilters.maxPrice));
    //   }
    //   if (appliedFilters.minArea) {
    //     query = query.gte("total_floor_area", parseInt(appliedFilters.minArea));
    //   }
    //   if (appliedFilters.maxArea) {
    //     query = query.lte("total_floor_area", parseInt(appliedFilters.maxArea));
    //   }
    //   if (appliedFilters.minLot) {
    //     query = query.gte("lot_size", parseInt(appliedFilters.minLot));
    //   }
    //   if (appliedFilters.maxLot) {
    //     query = query.lte("lot_size", parseInt(appliedFilters.maxLot));
    //   }
    //   if (appliedFilters.minYear) {
    //     query = query.gte("year_built", parseInt(appliedFilters.minYear));
    //   }
    //   if (appliedFilters.maxYear) {
    //     query = query.lte("year_built", parseInt(appliedFilters.maxYear));
    //   }

    //   const { data, error } = await query.order("listing_date", {
    //     ascending: false,
    //   });

    //   if (!error) {
    //     setListings(data || []);
    //   }
    //   setLoading(false);
    // }

    // fetchPreviewListings();
  }, [appliedFilters, user]);

  // When "View All Matching Properties" is clicked:
  const handleViewAllRedirect = () => {
    // Stringify whatever filters are currently active and push to all listings page
    const queryString = serializeFilters(appliedFilters);
    window.open(`/properties?${queryString}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="container py-12">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Search Squamish Real Estate
        </h2>
      </div>

      {/* Shared Filter component: Updates local home state on submission */}
      <ListingFilters
        initialValues={appliedFilters}
        onChange={(newFilters) => setAppliedFilters(newFilters)}
        user={user}
      />

      {/* Preview Grid Rendering */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-80 bg-gray-200/60 rounded-2xl" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 font-medium">
          No matches found on your homepage preview criteria. Try tweaking your
          choices.
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.pid} listing={listing} />
            ))}
          </div>

          {/* View All Button passes the currently running homepage filter configuration to the query params */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleViewAllRedirect}
              className="font-bold rounded-xl px-8 py-6 border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm transition-all"
            >
              View All Matching Properties →
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
