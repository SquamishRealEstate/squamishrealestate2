"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/config/supabaseClient";
import Navbar from "../Navbar";
import { AuthGuard } from "../Auth/authGuard";
import { ListingFilters, FilterState } from "@/components/ListingFilters";
import { ListingCard, Listing } from "@/components/ListingCard";
import { deserializeFilters } from "@/lib/utils";
import { DeferredMount } from "@/components/DeferredMount";

// AI chatbot chunk is fetched separately, after page load, only when needed
const AiPropertyChat = dynamic(() => import("@/components/AiPropertyChat"), {
  ssr: false,
});

function AllListingsPage({
  user,
  initialListings,
  initialTotal,
}: {
  user: any;
  initialListings?: any[];
  initialTotal?: number;
}) {
  const searchParams = useSearchParams();
  const ITEMS_PER_PAGE = 16;

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(
    initialTotal ? Math.ceil(initialTotal / ITEMS_PER_PAGE) : 0,
  );
  const [listings, setListings] = useState<any[]>(initialListings || []);
  const [loading, setLoading] = useState(!initialListings);

  // When the server already rendered the first page (clean /properties URL),
  // skip the first client fetch; any filter/page/auth change still refetches.
  const skippedInitialFetch = useRef(!!initialListings);

  // Read URL fields straight into state variables
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(() =>
    deserializeFilters(searchParams, user),
  );

  useEffect(() => {
    if (skippedInitialFetch.current) {
      skippedInitialFetch.current = false;
      return;
    }

    async function fetchListings() {
      setLoading(true);
      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Swap the target view based on the toggle
      const targetTable = appliedFilters.propertiesOnly
        ? "off_market_properties"
        : "all_listings";
      let query = supabase.from(targetTable).select("*", { count: "exact" });
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

      // These apply to BOTH market and off-market
      if (appliedFilters.searchQuery) {
        // Off-market might not have MLS numbers, so handle safely
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

      // Use a fallback sort if listing_date isn't on off-market properties
      const sortColumn = appliedFilters.propertiesOnly
        ? "civic_address"
        : "listing_date";
      const { data, count } = await query
        .order(sortColumn, {
          ascending: appliedFilters.propertiesOnly ? true : false,
        })
        .range(from, to);

      setListings(data || []);
      setTotalPages(Math.ceil((count ?? 0) / ITEMS_PER_PAGE));
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // if (!user) {
      //   query = query.in("market_status", ["Active"]);
      // } else if (appliedFilters.status.length > 0) {
      //   query = query.in("market_status", appliedFilters.status);
      // }

      // if (appliedFilters.searchQuery) {
      //   query = query.or(
      //     `civic_address.ilike.%${appliedFilters.searchQuery}%,mls_number.ilike.%${appliedFilters.searchQuery}%,neighbourhood.ilike.%${appliedFilters.searchQuery}%`,
      //   );
      // }
      // if (appliedFilters.category.length > 0)
      //   query = query.in("property_category", appliedFilters.category);
      // if (appliedFilters.bedrooms)
      //   query = query.gte("bedrooms", parseInt(appliedFilters.bedrooms));
      // if (appliedFilters.bathrooms)
      //   query = query.gte("full_baths", parseInt(appliedFilters.bathrooms));
      // if (appliedFilters.minPrice)
      //   query = query.gte("asking_price", parseFloat(appliedFilters.minPrice));
      // if (appliedFilters.maxPrice)
      //   query = query.lte("asking_price", parseFloat(appliedFilters.maxPrice));
      // if (appliedFilters.minArea)
      //   query = query.gte("total_floor_area", parseInt(appliedFilters.minArea));
      // if (appliedFilters.maxArea)
      //   query = query.lte("total_floor_area", parseInt(appliedFilters.maxArea));
      // if (appliedFilters.minLot)
      //   query = query.gte("lot_size", parseInt(appliedFilters.minLot));
      // if (appliedFilters.maxLot)
      //   query = query.lte("lot_size", parseInt(appliedFilters.maxLot));
      // if (appliedFilters.minYear)
      //   query = query.gte("year_built", parseInt(appliedFilters.minYear));
      // if (appliedFilters.maxYear)
      //   query = query.lte("year_built", parseInt(appliedFilters.maxYear));

      // const { data, count } = await query
      //   .order("listing_date", { ascending: false })
      //   .range(from, to);
      // setListings(data || []);
      // setTotalPages(Math.ceil((count ?? 0) / ITEMS_PER_PAGE));
      // setLoading(false);
      // window.scrollTo({ top: 0, behavior: "smooth" });
    }

    fetchListings();
  }, [page, appliedFilters, user]);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="pt-32 pb-16 px-6 bg-gray-50 min-h-screen font-sans">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Search Squamish Real Estate
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed max-w-3xl mb-8">
          Every active MLS® listing in Squamish, BC — detached homes,
          townhouses, condos and land — searchable by price, bedrooms, baths
          and neighbourhood. Listings update daily from the MLS® feed;
          off-market property records with BC Assessment history are included
          when you toggle &ldquo;Properties Only&rdquo;. Questions about any
          listing: Sean Brawley PREC*, RE/MAX Masters Realty,{" "}
          <a href="tel:+16048490500" className="text-blue-600 hover:underline">
            604-849-0500
          </a>
          .
        </p>

        {/* Exact same shared component */}
        <ListingFilters
          initialValues={appliedFilters}
          onChange={(newFilters) => {
            setPage(1);
            setAppliedFilters(newFilters);
          }}
          user={user}
        />

        {/* AI chatbot: registered users only, chunk loads after full page load */}
        {user && (
          <DeferredMount>
            <AiPropertyChat />
          </DeferredMount>
        )}

        {loading ? (
          <div className="text-center py-24 text-gray-400">
            Syncing database listings...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.pid + "-" + listing.property_category}
                  listing={listing}
                />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 border-t pt-6 border-gray-200">
              <p className="text-sm text-gray-500 font-medium">
                Page <span className="text-gray-900 font-bold">{page}</span> of{" "}
                <span className="text-gray-900 font-bold">{totalPages}</span>
              </p>
              <div className="flex items-center space-x-1 bg-gray-200/40 p-1 rounded-xl border border-gray-200/60 shadow-sm">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg text-gray-500 hover:bg-white disabled:opacity-20 transition-all"
                >
                  «
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white disabled:opacity-20 transition-all"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => {
                  const num = i + 1;
                  if (
                    num === 1 ||
                    num === totalPages ||
                    Math.abs(num - page) <= 1
                  ) {
                    return (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setPage(num)}
                        className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${page === num ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-white"}`}
                      >
                        {num}
                      </button>
                    );
                  }
                  if (num === page - 2 || num === page + 2)
                    return (
                      <span key={num} className="px-1 text-gray-400 text-xs">
                        ...
                      </span>
                    );
                  return null;
                })}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white disabled:opacity-20 transition-all"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg text-gray-500 hover:bg-white disabled:opacity-20 transition-all"
                >
                  »
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Properties({
  initialListings,
  initialTotal,
}: {
  initialListings?: any[];
  initialTotal?: number;
}) {
  return (
    <AuthGuard renderPrivate={false}>
      {(user) => (
        <AllListingsPage
          user={user}
          initialListings={initialListings}
          initialTotal={initialTotal}
        />
      )}
    </AuthGuard>
  );
}
