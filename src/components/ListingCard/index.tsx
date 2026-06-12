"use client";

import React from "react";
import Link from "next/link";
import { formatString } from "@/lib/utils";

export type Listing = {
  pid: string;
  mls_number: string | null;
  civic_address: string | null;
  asking_price: number | null;
  market_status: string | null;
  listing_date: string | null;
  dwell_type: string | null;
  photos: string[] | null;
  total_floor_area: number | null;
  lot_size: number | null;
  year_built: number | null;
  bedrooms: number | null;
  full_baths: number | null;
  half_baths: number | null;
  neighbourhood: string | null;
  postal_code: string | null;
  listing_office: string | null;
  property_category: string;
  zone_desc: string | null;
  legal_detail: string | null;
  bathrooms?: number | null;
  is_featured: boolean;
};

export function ListingCard({ listing }: { listing: Listing }) {
  const firstPhoto =
    listing.photos && listing.photos.length > 0
      ? listing.photos[0]
      : "/images/Default-Card.jpg";

  const civicAddress = listing.civic_address;
  const propertiesOnly =
    listing.property_category === "parcel" ||
    listing.property_category === "strata_property";

  // 2. Run your specific conditional formatting rule
  // listing = fixCivicAddress(listing, listing.property_category);

  let detailPageUrl = "";
  if (propertiesOnly) {
    if (listing.property_category === "parcel") {
      detailPageUrl = `/property/landing/detached/${listing.pid}/${formatString(civicAddress)}`;
    } else if (listing.property_category === "strata_property") {
      detailPageUrl = `/property/landing/strata/${listing.pid}/${formatString(civicAddress)}`;
    }
  } else {
    detailPageUrl = `/listing/landing/${listing.property_category}/${listing.pid}/${formatString(civicAddress)}`;
  }

  return (
    <Link
      href={detailPageUrl}
      className="block group focus:outline-none"
      rel="noopener noreferrer"
      target="_blank"
    >
      <div className="border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm bg-white h-full flex flex-col justify-between hover:shadow-md transition-all">
        <div>
          <div className="relative overflow-hidden">
            <img
              src={firstPhoto}
              alt="Property"
              className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {listing.market_status && (
              <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {listing.market_status}
              </span>
            )}
            {listing.property_category && (
              <span className="absolute top-3 right-3 bg-gray-950/80 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {listing.property_category === "strata_property"
                  ? "Strata"
                  : listing.property_category}
              </span>
            )}
          </div>

          <div className="p-5">
            {!propertiesOnly && (
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-black text-gray-900">
                  ${listing.asking_price?.toLocaleString() ?? "N/A"}
                </h3>
                <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                  MLS® {listing.mls_number}
                </span>
              </div>
            )}

            <h4 className="font-bold text-gray-800 text-base line-clamp-1">
              {civicAddress ?? "No Address"}
            </h4>
            <p className="text-sm text-gray-400 font-semibold mb-3">
              {listing.neighbourhood ? `${listing.neighbourhood}, ` : ""}
              {listing.postal_code ?? ""}
            </p>

            <hr className="my-3 border-gray-100" />

            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-bold text-gray-500 mb-2">
              {listing.property_category !== "land" && (
                <>
                  <div>
                    🛏️{" "}
                    <span className="font-black text-gray-800">
                      {listing.bedrooms ?? 0}
                    </span>{" "}
                    Beds
                  </div>

                  <div>
                    🛁{" "}
                    {propertiesOnly ? (
                      <span className="font-black text-gray-800">
                        {listing.bathrooms ?? 0}
                      </span>
                    ) : (
                      <span className="font-black text-gray-800">
                        {(listing.full_baths ?? 0) +
                          (listing.half_baths ? 0.5 : 0)}
                      </span>
                    )}{" "}
                    Baths
                  </div>
                </>
              )}
              {
                <div>
                  📐{" "}
                  <span className="font-black text-gray-800">
                    {listing.total_floor_area
                      ? listing.total_floor_area.toLocaleString()
                      : "—"}
                  </span>{" "}
                  sqft
                </div>
              }

              {listing.lot_size && (
                <div>
                  🌳{" "}
                  <span className="font-black text-gray-800">
                    {listing.lot_size.toLocaleString()}
                  </span>{" "}
                  sqft lot
                </div>
              )}
              {listing.year_built && (
                <div className="col-span-2 text-xs font-semibold text-gray-400">
                  🔨 Built in{" "}
                  <span className="text-gray-700">{listing.year_built}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {!propertiesOnly && (
          <div className="bg-gray-50/50 px-5 py-3 border-t border-gray-100 text-[11px] font-medium text-gray-400 italic">
            Office: {listing.listing_office ?? "N/A"}
          </div>
        )}
      </div>
    </Link>
  );
}
