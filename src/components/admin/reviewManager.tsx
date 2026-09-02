"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Check, X, Loader2, MapPin, User, RotateCcw } from "lucide-react";
import { supabase } from "@/config/supabaseClient";

type ReviewStatus = "pending" | "approved" | "rejected";

// --- Review Manager Page ---
export default function ReviewManager() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReviewStatus>("pending");

  useEffect(() => {
    fetchReviews(activeTab);
  }, [activeTab]);

  const fetchReviews = async (status: ReviewStatus) => {
    try {
      setIsLoading(true);

      // 1. Fetch reviews based on the active tab status
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("property_reviews")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        return;
      }

      // Extract unique PIDs and User IDs to fetch related data
      const pids = [...new Set(reviewsData.map((r) => r.pid).filter(Boolean))];
      const userIds = [
        ...new Set(reviewsData.map((r) => r.user_id).filter(Boolean)),
      ];

      const addressMap: Record<string, string> = {};
      const usersMap: Record<string, string> = {};

      // 2. Fetch Display Names from users table
      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds);

        if (!usersError && usersData) {
          usersData.forEach((u) => {
            usersMap[u.id] = u.email;
          });
        }
      }

      // 3. Fetch Addresses (Check all_listings first)
      if (pids.length > 0) {
        const { data: listingsData } = await supabase
          .from("all_listings")
          .select("pid, civic_address")
          .in("pid", pids);

        const foundPids = new Set();
        if (listingsData) {
          listingsData.forEach((l) => {
            if (l.civic_address) {
              addressMap[l.pid] = l.civic_address;
              foundPids.add(l.pid);
            }
          });
        }

        // 4. Fallback to off_market_properties for PIDs not found in all_listings
        const remainingPids = pids.filter((pid) => !foundPids.has(pid));
        if (remainingPids.length > 0) {
          const { data: offMarketData } = await supabase
            .from("off_market_properties")
            .select("pid, civic_address")
            .in("pid", remainingPids);

          if (offMarketData) {
            offMarketData.forEach((l) => {
              if (l.civic_address) {
                addressMap[l.pid] = l.civic_address;
              }
            });
          }
        }
      }

      // 5. Merge the fetched data back into the reviews array
      const enrichedReviews = reviewsData.map((review) => ({
        ...review,
        display_name: usersMap[review.user_id] || "Unknown User",
        civic_address: addressMap[review.pid] || "Unknown Address",
      }));

      setReviews(enrichedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, newStatus: ReviewStatus) => {
    // Optimistic UI update: remove card immediately from current tab view
    setReviews((prev) => prev.filter((review) => review.id !== id));

    try {
      const { error } = await supabase
        .from("property_reviews")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        console.error(`Error updating review to ${newStatus}:`, error);
        fetchReviews(activeTab); // Revert UI if it fails
      }
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  return (
    <div className="flex flex-col max-w-6xl mx-auto p-6">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Review Manager</h1>
        <p className="text-gray-500 mt-2">Manage community property reviews.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-6 mb-6 border-b border-gray-100">
        {(["pending", "approved", "rejected"] as ReviewStatus[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-4 text-sm text-gray-500 font-medium">
        Showing {reviews.length} {activeTab} review{reviews.length !== 1 && "s"}
        .
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500 font-medium capitalize">
            No {activeTab} reviews found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Updated Review Card Component ---
export const ReviewCard = ({
  review,
  onAction,
}: {
  review: any;
  onAction: (id: string, status: ReviewStatus) => void;
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const hasMultiplePhotos = review.photo_urls?.length > 1;

  return (
    <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm flex flex-row gap-6 h-full items-start hover:border-indigo-100 transition-colors">
      {/* Image Section */}
      {review.photo_urls?.length > 0 && (
        <div className="w-28 h-36 md:w-32 md:h-44 flex-shrink-0 relative group rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
          <Image
            src={review.photo_urls[photoIndex].replace("http://", "https://")}
            referrerPolicy="no-referrer"
            alt="Property"
            fill
            className="object-cover transition-opacity duration-300"
          />

          {hasMultiplePhotos && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-2">
              {review.photo_urls.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    photoIndex === i ? "w-4 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header containing Address and User Display Name */}
        <div className="flex justify-between items-start mb-1 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-gray-900 truncate flex items-center gap-1.5">
              <MapPin size={16} className="text-indigo-600 flex-shrink-0" />
              <span className="truncate">{review.civic_address}</span>
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 font-medium">
              <User size={12} />
              <span className="truncate">{review.display_name}</span>
            </div>
          </div>

          <div className="bg-indigo-50 px-3 py-1 rounded-md text-xs font-mono font-bold text-indigo-600 flex-shrink-0">
            AVG: {review.property_score?.toFixed(1) || "0.0"}
          </div>
        </div>

        {/* Estimated Value */}
        {review.estimated_value && (
          <div className="text-sm font-semibold text-green-700 mb-2">
            Est. Value: {review.estimated_value}
          </div>
        )}

        <p className="text-gray-600 text-sm leading-tight mb-4 italic line-clamp-2">
          &quot;{review.comments || "No comments provided."}&quot;
        </p>

        {/* Scores Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
          {[
            { l: "Curb", v: review.curb_appeal },
            { l: "View", v: review.view_score },
            { l: "Loc", v: review.location_score },
            { l: "Land", v: review.landscaping_score },
          ].map((stat) => (
            <div
              key={stat.l}
              className="flex items-center justify-between border-b border-gray-50 pb-1"
            >
              <span className="text-[9px] uppercase font-bold text-gray-400">
                {stat.l}
              </span>
              <span className="text-sm font-mono font-bold text-gray-800">
                {stat.v?.toFixed(1) || "0.0"}
              </span>
            </div>
          ))}
        </div>

        {/* Action Bar (Stars + Dynamic Buttons) */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={`${
                  i < Math.round(review.property_score || 5)
                    ? "fill-orange-400 text-orange-400"
                    : "text-gray-200"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {/* Show "Move to Pending" if it's currently Approved or Rejected */}
            {review.status !== "pending" && (
              <button
                onClick={() => onAction(review.id, "pending")}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                title="Revert to pending"
              >
                <RotateCcw size={14} /> Pending
              </button>
            )}

            {/* Show Reject if it's currently Pending or Approved */}
            {review.status !== "rejected" && (
              <button
                onClick={() => onAction(review.id, "rejected")}
                className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
              >
                <X size={14} /> Reject
              </button>
            )}

            {/* Show Approve if it's currently Pending or Rejected */}
            {review.status !== "approved" && (
              <button
                onClick={() => onAction(review.id, "approved")}
                className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
              >
                <Check size={14} /> Approve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
