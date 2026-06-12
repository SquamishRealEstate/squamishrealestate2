"use client";

import React, { useRef, useState, useEffect, use } from "react";
import {
  ChevronLeft,
  Heart,
  Eye,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  MapPin,
  X,
  Lock,
  ArrowRight,
} from "lucide-react";
import {
  cn,
  checkIfEmpty,
  numberWithCommas,
  getBathrooms,
  handleUpload,
  formatPrice,
  formatString,
  formatNumber,
} from "@/lib/utils";
import { Slider } from "@/components/ui/slider"; // Assuming a Radix-based UI slider
import { Star, Upload, Send, Loader2, FileText } from "lucide-react";
import { supabase } from "@/config/supabaseClient"; // Ensure this import
import { Button } from "../ui/button";
import Link from "next/link";
import { Input } from "../ui/input";

/** 1. Back to Map Button **/
export const BackToMapButton = ({ onClick }: { onClick: () => void }) => (
  <div className="absolute top-28 left-0 z-20 w-full px-6 md:px-12 max-w-7xl right-0">
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-white/90 hover:text-white transition-all bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-black/50"
    >
      <ChevronLeft size={14} /> Back to Map
    </button>
  </div>
);

/** 2. Property Stat Item (Bed, Bath, etc.) **/
interface StatProps {
  label: string;
  value: string | number;
  suffix?: string;
}

export const PropertyStat = ({ label, value, suffix }: StatProps) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">
      {label}
    </span>
    <span className="text-xl md:text-2xl font-semibold">
      {checkIfEmpty(value)}
      {suffix && (
        <small className="text-[10px] text-white/30 uppercase ml-1 font-normal">
          {suffix}
        </small>
      )}
    </span>
  </div>
);

import { useRouter } from "next/navigation";
import { ListingGallery } from "../Listing/listingHelpers";

export const SocialInteractions = ({
  pid,
  user,
}: {
  pid: string;
  user: any;
}) => {
  const [stats, setStats] = useState({ likes: 0, saves: 0, views: 0 });
  const [userStatus, setUserStatus] = useState({ liked: false, saved: false });
  const [showInlinePrompt, setShowInlinePrompt] = useState(false);

  const hasIncrementedView = useRef(false);
  const router = useRouter();

  useEffect(() => {
    loadData(user);
  }, [pid]);

  const loadData = async (currentUser: any) => {
    // 1. Run view interaction FIRST so the database decides whether to increment or skip
    if (!hasIncrementedView.current) {
      console.log("Incrementing view count for PID:", pid);
      hasIncrementedView.current = true;
      await supabase.rpc("handle_property_interaction", {
        target_pid: pid,
        target_user_id: currentUser?.id || null, // Pass user UUID if signed in
        action_type: "view",
      });
    }

    // 2. Fetch the up-to-date counts (this now naturally reflects the accurate DB changes)
    const { data: counts } = await supabase
      .from("property_stats")
      .select("*")
      .eq("pid", pid)
      .maybeSingle();

    if (counts) {
      setStats({
        likes: counts.likes_count || 0,
        saves: counts.saves_count || 0,
        views: counts.views_count || 0,
      });
    }

    // 3. Check if the current user has already liked or saved the property
    if (currentUser) {
      const { data: actions } = await supabase
        .from("user_interactions")
        .select("interaction_type")
        .eq("pid", pid)
        .eq("user_id", currentUser.id);
      setUserStatus({
        liked: actions?.some((a) => a.interaction_type === "like") ?? false,
        saved: actions?.some((a) => a.interaction_type === "save") ?? false,
      });
    }
  };

  // const loadData = async (currentUser: any) => {
  //   const { data: counts } = await supabase
  //     .from("property_stats")
  //     .select("*")
  //     .eq("pid", pid)
  //     .single();
  //   if (counts) {
  //     setStats({
  //       likes: counts.likes_count || 0,
  //       saves: counts.saves_count || 0,
  //       views: counts.views_count || 0,
  //     });
  //   }

  //   if (!hasIncrementedView.current) {
  //     hasIncrementedView.current = true;
  //     await supabase.rpc("handle_property_interaction", {
  //       target_pid: pid,
  //       action_type: "view",
  //     });
  //     setStats((prev) => ({ ...prev, views: prev.views + 1 }));
  //   }

  //   if (currentUser) {
  //     const { data: actions } = await supabase
  //       .from("user_interactions")
  //       .select("interaction_type")
  //       .eq("pid", pid)
  //       .eq("user_id", currentUser.id);
  //     setUserStatus({
  //       liked: actions?.some((a) => a.interaction_type === "like") ?? false,
  //       saved: actions?.some((a) => a.interaction_type === "save") ?? false,
  //     });
  //   }
  // };

  const toggleAction = async (type: "like" | "save") => {
    if (!user) {
      setShowInlinePrompt(true);
      return;
    }

    const isActive = type === "like" ? userStatus.liked : userStatus.saved;

    setUserStatus((prev) => ({
      ...prev,
      [type === "like" ? "liked" : "saved"]: !isActive,
    }));
    setStats((prev) => ({
      ...prev,
      [type === "like" ? "likes" : "saves"]: isActive
        ? Math.max(0, prev[type === "like" ? "likes" : "saves"] - 1)
        : prev[type === "like" ? "likes" : "saves"] + 1,
    }));

    await supabase.rpc("handle_property_interaction", {
      target_pid: pid,
      target_user_id: user.id,
      action_type: type,
    });
  };

  // --- COMPACT INLINE PROMPT ---
  if (showInlinePrompt && !user) {
    return (
      <div className="flex items-center justify-between gap-4 px-3 py-2 min-w-[280px] animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-2">
          <div className="bg-white/10 p-1.5 rounded-full">
            <Lock size={14} className="text-white" />
          </div>
          <p className="text-[11px] text-white/90 font-medium leading-tight">
            Sign in to <br /> save / like
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/login")}
            className="bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-white/90 flex items-center gap-1 transition-colors"
          >
            Login <ArrowRight size={12} />
          </button>

          <button
            onClick={() => setShowInlinePrompt(false)}
            className="p-1.5 text-white/40 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  // --- STANDARD INTERACTION BAR ---
  return (
    <div className="flex items-center gap-4 px-4 py-2 animate-in fade-in duration-300">
      <button
        onClick={() => toggleAction("save")}
        className="flex items-center gap-2 text-white group"
      >
        <Heart
          size={16}
          className={`${userStatus.saved ? "text-red-500 fill-red-500" : "text-white/60 group-hover:text-white"} transition-colors`}
        />
        <span className="text-xs font-bold">{stats.saves}</span>
      </button>

      <div className="h-4 w-px bg-white/10" />

      <button
        onClick={() => toggleAction("like")}
        className="flex items-center gap-2 text-white group"
      >
        <ThumbsUp
          size={16}
          className={`${userStatus.liked ? "text-blue-500 fill-blue-500" : "text-white/60 group-hover:text-white"} transition-colors`}
        />
        <span className="text-xs font-bold">{stats.likes}</span>
      </button>

      <div className="h-4 w-px bg-white/10" />

      <div className="flex items-center gap-2 text-white/80">
        <Eye size={16} className="text-white/30" />
        <span className="text-xs font-bold">{stats.views}</span>
      </div>
    </div>
  );
};

export const ReviewCard = ({ review }: { review: any }) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const hasMultiplePhotos = review.photo_urls?.length > 1;

  return (
    <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm flex flex-row gap-6 h-full items-start hover:border-indigo-100 transition-colors">
      {/* Image Section with Internal Dot Navigation */}
      {review.photo_urls?.length > 0 && (
        <div className="w-28 h-36 md:w-32 md:h-44 flex-shrink-0 relative group">
          <div className="w-full h-full overflow-hidden rounded-[18px] bg-gray-50 border border-gray-100">
            <img
              src={review.photo_urls[photoIndex].replace("http://", "https://")}
              referrerPolicy="no-referrer"
              alt="Property"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          </div>

          {/* Photo Navigation Dots (Overlayed on image) */}
          {hasMultiplePhotos && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 px-2">
              {review.photo_urls.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents triggering card clicks
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
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-black text-gray-900 truncate">
            {review.estimated_value
              ? `Est. ${review.estimated_value}`
              : "Property Review"}
          </h3>
          <div className="bg-indigo-50 px-3 py-1 rounded-md text-xs font-mono font-bold text-indigo-600">
            AVG: {review.property_score?.toFixed(1) || "0.0"}
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-tight mb-4 italic line-clamp-3">
          &quot;{review.comments || "No comments provided."}&quot;
        </p>

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

        <div className="mt-auto flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={`${i < Math.round(review.property_score || 5) ? "fill-orange-400 text-orange-400" : "text-gray-200"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const PropertyReviews = ({ reviews }: { reviews: any[] }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);

  const scrollToCard = (index: number) => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      // Calculate width of a single item based on current view
      const itemWidth = container.querySelector("div")?.offsetWidth || 0;

      container.scrollTo({
        left: index * itemWidth,
        behavior: "smooth",
      });
      setActiveCard(index);
    }
  };

  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="w-full py-6">
      <div className="relative overflow-hidden">
        <div
          ref={carouselRef}
          className="flex overflow-hidden snap-x snap-mandatory no-scrollbar"
        >
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="w-full md:w-1/2 flex-shrink-0 snap-start px-2"
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Navigation Dots */}
      {reviews.length > 1 && (
        <div className="flex justify-center items-center gap-2.5 mt-8">
          {reviews.map((_, i) => {
            const isDesktopSkip = i % 2 !== 0;

            return (
              <button
                key={i}
                onClick={() => scrollToCard(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeCard === i
                    ? "w-8 bg-indigo-600 shadow-md"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                } ${isDesktopSkip ? "md:hidden" : ""}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ReviewsSummary = ({ averageRating, reviewCount }: any) => (
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < Math.floor(Number(averageRating))
              ? "fill-yellow-400 text-yellow-400" // Bright yellow for filled stars
              : "text-white/40" // Brighter white for empty stars
          }
        />
      ))}
    </div>
    <span className="text-[11px] font-bold text-white">
      {Number(averageRating).toFixed(1)}
    </span>
    <span className="text-[10px] text-white/60 uppercase tracking-widest">
      ({reviewCount})
    </span>
  </div>
);

export const PropertyActions = ({ onWriteReview, onReport }: any) => (
  <div className="flex items-center">
    {/* Save */}
    {/* <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-l-md hover:bg-muted/50 transition-all group">
      <Heart className="w-3.5 h-3.5 text-accent group-hover:fill-accent transition-colors" />
      <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-primary">
        Save
      </span>
    </button> */}

    {/* Like */}
    {/* <button className="flex items-center gap-2 px-4 py-2 border-y border-r border-border hover:bg-muted/50 transition-all group">
      <ThumbsUp className="w-3.5 h-3.5 text-accent group-hover:fill-accent transition-colors" />
      <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-primary">
        Like
      </span>
    </button> */}

    {/* Write a Review */}
    <button
      onClick={onWriteReview}
      className="flex items-center gap-2 px-4 py-2 border border-border rounded-l-md hover:bg-muted/50 transition-all group"
    >
      <MessageSquare className="w-3.5 h-3.5 text-accent group-hover:fill-accent transition-colors" />
      <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-primary">
        Review
      </span>
    </button>

    {/* Report */}
    <button
      onClick={onReport}
      className="flex items-center gap-2 px-4 py-2 border-y border-r border-border rounded-r-md hover:bg-muted/50 transition-all group"
    >
      <AlertTriangle className="w-3.5 h-3.5 text-destructive group-hover:fill-destructive transition-colors" />
      <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-primary">
        Report
      </span>
    </button>
  </div>
);

export const NewListings = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLatestListings() {
      setIsLoading(true);
      try {
        // Direct call to the unified 'all_listings' source ordered by listing_date
        const { data, error } = await supabase
          .from("all_listings")
          .select("*")
          .order("listing_date", { ascending: false })
          .limit(10);

        if (error) throw error;

        setListings((data as any[]) || []);
      } catch (error) {
        console.error(
          "Error fetching latest listings from all_listings union:",
          error,
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchLatestListings();
  }, []);

  return (
    <div className="w-full py-2">
      <div className="overflow-x-auto border border-gray-200/60 rounded-xl bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium uppercase tracking-wider">
              <th scope="col" className="px-6 py-3">
                Address
              </th>
              <th scope="col" className="hidden md:table-cell px-6 py-3">
                Bed
              </th>
              <th scope="col" className="hidden md:table-cell px-6 py-3">
                Bath
              </th>
              <th scope="col" className="hidden md:table-cell px-6 py-3">
                Living Area
              </th>
              <th scope="col" className="hidden md:table-cell px-6 py-3">
                Lot Size
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Asking Price
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-3.5 bg-gray-100 rounded-sm w-3/4" />
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="h-3.5 bg-gray-100 rounded-sm w-8" />
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="h-3.5 bg-gray-100 rounded-sm w-8" />
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="h-3.5 bg-gray-100 rounded-sm w-16" />
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="h-3.5 bg-gray-100 rounded-sm w-16" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-3.5 bg-gray-100 rounded-sm w-20 ml-auto" />
                  </td>
                </tr>
              ))
            ) : listings.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-400 font-medium"
                >
                  No recent listing records found.
                </td>
              </tr>
            ) : (
              listings.map((item) => {
                const isLand = item.property_type === "land";
                const totalBaths = getBathrooms(
                  item.full_baths,
                  item.half_baths,
                );

                return (
                  <tr
                    key={`${item.property_type}-${item.pid}`}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-medium text-gray-900">
                      <div className="flex flex-col">
                        <Link
                          className="truncate max-w-[180px] sm:max-w-xs hover:text-blue-500 transition-colors"
                          href={`/listing/landing/${item.property_category}/${item.pid}/${formatString(item.civic_address)}`}
                        >
                          {item.civic_address}
                        </Link>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-3.5 text-gray-600">
                      {isLand ? "—" : (item.bedrooms ?? 0)}
                    </td>
                    <td className="hidden md:table-cell px-6 py-3.5 text-gray-600">
                      {isLand ? "—" : totalBaths}
                    </td>
                    <td className="hidden md:table-cell px-6 py-3.5 text-gray-600">
                      {isLand || !item.total_floor_area
                        ? "—"
                        : `${formatNumber(item.total_floor_area)} sf`}
                    </td>
                    <td className="hidden md:table-cell px-6 py-3.5 text-gray-600">
                      {formatNumber(item.lot_size)
                        ? `${formatNumber(item.lot_size)} sf`
                        : "—"}
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-primary">
                      {formatPrice(item.asking_price)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const RecentSolds = ({ type }: { type: string }) => {
  const [solds, setSolds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchRecentSolds() {
      setIsLoading(true);
      try {
        if (type === "strata") {
          const { data, error } = await supabase
            .from("strata_duplicate")
            .select("*")
            .eq("market_status", "Closed")
            .order("last_mls_date", { ascending: false })
            .limit(10);

          setSolds((data as any[]) || []);
        } else {
          const { data, error } = await supabase
            .from("parcels_duplicate")
            .select("*")
            .eq("market_status", "Closed")
            .order("last_mls_date", { ascending: false })
            .limit(10);

          setSolds((data as any[]) || []);
        }
      } catch (error) {
        console.error(
          "Error fetching latest listings from all_listings union:",
          error,
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentSolds();
  }, []);

  return (
    <div className="w-full py-2">
      <div className="overflow-x-auto border border-gray-200/60 rounded-xl bg-white shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium uppercase tracking-wider">
              <th scope="col" className="px-6 py-3">
                Address
              </th>
              <th scope="col" className="hidden md:table-cell px-6 py-3">
                Bed
              </th>
              <th scope="col" className="hidden md:table-cell px-6 py-3">
                Bath
              </th>
              <th scope="col" className="hidden md:table-cell px-6 py-3">
                Living Area
              </th>
              <th scope="col" className="hidden md:table-cell px-6 py-3">
                Lot Size
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Sold Price
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-3.5 bg-gray-100 rounded-sm w-3/4" />
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="h-3.5 bg-gray-100 rounded-sm w-8" />
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="h-3.5 bg-gray-100 rounded-sm w-8" />
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="h-3.5 bg-gray-100 rounded-sm w-16" />
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="h-3.5 bg-gray-100 rounded-sm w-16" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-3.5 bg-gray-100 rounded-sm w-20 ml-auto" />
                  </td>
                </tr>
              ))
            ) : solds.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-400 font-medium"
                >
                  No recent sold records found.
                </td>
              </tr>
            ) : (
              solds.map((item) => {
                return (
                  <tr
                    key={`${item.property_type}-${item.pid}`}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-medium text-gray-900">
                      <div className="flex flex-col">
                        <Link
                          className="truncate max-w-[180px] sm:max-w-xs hover:text-blue-500 transition-colors"
                          href={`/property/landing/${type}/${item.pid}/${formatString(item.civic_address)}`}
                        >
                          {item.civic_address}
                        </Link>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-3.5 text-gray-600">
                      {item.bedrooms ?? 0}
                    </td>
                    <td className="hidden md:table-cell px-6 py-3.5 text-gray-600">
                      {item.bathrooms ?? 0}
                    </td>
                    <td className="hidden md:table-cell px-6 py-3.5 text-gray-600">
                      {item.floor_area
                        ? `${formatNumber(item.floor_area)} sf`
                        : "—"}
                    </td>
                    <td className="hidden md:table-cell px-6 py-3.5 text-gray-600">
                      {formatNumber(item.lot_size)
                        ? `${formatNumber(item.lot_size)} sf`
                        : "—"}
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-primary">
                      {item.mls_data[0].price
                        ? formatPrice(item.mls_data[0]?.price)
                        : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const PropertyReport = ({
  property,
  user,
}: {
  property: any;
  user: any;
}) => {
  const [emailMessage, setEmailMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReport = async () => {
    setIsLoading(true);
    const formData = {
      email: user?.email,
      name: user?.user_metadata.full_name,
      propertyAddress: property?.civic_address,
      templateType: "PROPERTY_REPORT",
    };
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEmailMessage(
          "We have received your request and will send the report to your inbox shortly.",
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full py-2">
      {/* Reduced padding (p-4) and radius to keep it slim */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/20 transition-all duration-200">
        <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-4">
          {/* Smaller, more compact icon badge */}
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="text-primary" size={24} />
          </div>

          {/* Text Section: Tighter spacing and smaller text */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-base font-display font-bold text-foreground leading-tight">
              Property Insights Report
            </h3>
            <p className="text-muted-foreground font-body text-xs md:text-sm mt-0.5">
              Ready to unlock valuable insights about{" "}
              <span className="text-accent font-accent font-medium">
                {property?.civic_address}
              </span>
              . Sent directly to your inbox.
            </p>
          </div>

          {/* Action Section: Compact Button */}
          <div className="flex flex-col items-center sm:items-end gap-1.5 shrink-0">
            <Button
              size="sm"
              disabled={isLoading || !!emailMessage}
              onClick={handleRequestReport}
              className={cn(
                "font-bold transition-all px-6 h-10 rounded-lg",
                emailMessage
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary text-primary-foreground hover:opacity-90",
              )}
            >
              {isLoading ? (
                <Loader2 className="animate-spin size-4" />
              ) : emailMessage ? (
                <CheckCircle2 size={16} />
              ) : null}

              <span className="ml-2">
                {emailMessage ? "Requested" : "Get Report"}
              </span>
            </Button>

            {emailMessage && (
              <span className="text-[10px] font-accent font-bold text-accent">
                Check your inbox
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const LastSold = ({
  property,
  type,
}: {
  property: any;
  type: string;
}) => {
  console.log("Property MLS Data:", property);
  const propertyInfoArray: any[] = property.mls_data || [];
  const isListing = type.includes("Listing");
  const isLandListing = type.includes("land");

  function getGarageSituation(availableParking: string): string {
    const answer: string = "Other";
    try {
      const rank: string[] = [
        "Triple",
        "Double",
        "Single",
        "Carpot",
        "Open",
        "Parking Available",
        "Underground",
      ];
      const parkingArray: string[] = availableParking.split(",");
      for (const parkingType of rank) {
        for (const word of parkingArray) {
          if (word.includes(parkingType)) return parkingType;
        }
      }
    } catch (error) {}
    return answer;
  }

  const data = [
    {
      name: "Year Built",
      value: isListing ? property.year_built || "-" : property.year_constructed,
    },
    { name: "Lot Size", value: `${numberWithCommas(property.lot_size)} sf` },
    {
      name: "Floor Area",
      value: isListing
        ? `${numberWithCommas(property.total_floor_area)} sf`
        : `${numberWithCommas(property.floor_area)} sf`,
    },
    { name: "Beds", value: property.bedrooms || "-" },
    {
      name: "Baths",
      value:
        isListing && !isLandListing
          ? getBathrooms(property.full_baths, property.half_baths)
          : property.bathrooms || "-",
    },
    {
      name: "Garage",
      value:
        isListing && !isLandListing
          ? getGarageSituation(property.parking)
          : property.garage || "-",
    },
    {
      name: "First Floor",
      value: property.first_floor
        ? `${numberWithCommas(property.first_floor)} sf`
        : "-",
    },
    {
      name: "Second Floor",
      value: property.second_floor
        ? `${numberWithCommas(property.second_floor)} sf`
        : "-",
    },
    {
      name: "Third Floor",
      value: property.third_floor
        ? `${numberWithCommas(property.third_floor)} sf`
        : "-",
    },
  ];

  return (
    <div className="space-y-10 antialiased font-body">
      {/* Sales History Table - Financial Style */}
      {property.mls_data && property.mls_data.length > 0 && (
        <div className="border border-border shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted border-b border-border">
              <tr className="uppercase tracking-[0.15em] text-[10px] text-muted-foreground">
                <th className="px-6 py-4 font-bold">Sold Date</th>
                <th className="px-6 py-4 font-bold">Type</th>
                <th className="px-6 py-4 font-bold text-right">Sold Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {propertyInfoArray.map((info, index) => (
                <tr
                  key={index}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 text-foreground font-medium">
                    {info.date}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground uppercase text-[11px] tracking-wider">
                    {info.type}
                  </td>
                  <td className="px-6 py-4 text-foreground font-bold text-right">
                    {info.price ? `$${numberWithCommas(info.price)}` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Property Facts Grid - Architectural Style */}
      <div>
        <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] text-primary mb-4 ml-1">
          Property Specifications
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 border-t border-l border-border">
          {data.map((item, index) => (
            <div
              className="p-5 border-r border-b border-border bg-white hover:bg-slate-50/50 transition-colors group"
              key={index}
            >
              <p className="font-bold uppercase tracking-[0.12em] text-[10px] text-muted-foreground mb-1.5 group-hover:text-primary transition-colors">
                {item.name}
              </p>
              <p className="text-sm font-bold text-foreground truncate">
                {checkIfEmpty(item.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground italic px-1 flex items-center gap-2">
        <span className="w-1 h-1 bg-accent rounded-full" />
        Note: Data provided by BCA / LTSA public record.
      </p>
    </div>
  );
};

export const Photos = ({ photos }: { photos: any[] }) => {
  console.log("Property Photos:", photos);
  if (!photos || photos.length === 0) return null;

  return (
    <ListingGallery
      photos={photos}
      singlePhotoOnly={true} // Reuses carousel layout with single preview layout
    />
  );
};

export const FloorPlans = () => <div>Floor Plans Component</div>;
export const NearbyPhotos = () => <div>Nearby Photos Component</div>;
export const BCAssessment = ({
  property,
  type,
}: {
  property: any;
  type: string;
}) => {
  const isListing = type.includes("Listing");
  const bcAssessmentDataArray: any[] = property.bc_assessment_data || [];

  const data = [
    {
      name: "Lot Size",
      value: property.lot_size
        ? `${numberWithCommas(property.lot_size)} sf`
        : "-",
    },
    {
      name: "Floor Area",
      value: isListing
        ? `${numberWithCommas(property.total_floor_area)} sf`
        : `${numberWithCommas(property.floor_area)} sf`,
    },
    {
      name: "Classification",
      value: property.bc_assessment_desc || "Residential",
    },
  ];

  return (
    <div className="space-y-10 antialiased font-body">
      {/* Top Specs Grid - Architectural Style */}
      <div>
        <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] text-primary mb-4 ml-1">
          Assessment Overview
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 border-t border-l border-border bg-white">
          {data.map((item, index) => (
            <div
              className="p-5 border-r border-b border-border group hover:bg-slate-50/50 transition-colors"
              key={index}
            >
              <p className="font-bold uppercase tracking-[0.12em] text-[10px] text-muted-foreground mb-1.5 group-hover:text-primary transition-colors">
                {item.name}
              </p>
              <p className="text-sm font-bold text-foreground truncate">
                {checkIfEmpty(item.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Assessment Table - Financial Style */}
      {bcAssessmentDataArray.length > 0 && (
        <div className="border border-border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted border-b border-border">
              <tr className="uppercase tracking-[0.15em] text-[10px] text-muted-foreground">
                <th className="px-6 py-4 font-bold">July 1</th>
                <th className="px-6 py-4 font-bold text-right">Land Value</th>
                <th className="px-6 py-4 font-bold text-right">
                  Building Value
                </th>
                <th className="px-6 py-4 font-bold text-right">
                  Total Assessed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...bcAssessmentDataArray]
                .sort((a, b) => b.year - a.year)
                .map((info, index) => (
                  <tr
                    key={index}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-foreground font-medium">
                      {info.year}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-right text-[13px]">
                      ${numberWithCommas(info.land_val)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-right text-[13px]">
                      ${numberWithCommas(info.improv_val)}
                    </td>
                    <td className="px-6 py-4 text-foreground font-bold text-right">
                      ${numberWithCommas(info.total_val)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Data Source Footer */}
      <p className="text-[10px] text-muted-foreground italic px-1 flex items-center gap-2">
        <span className="w-1 h-1 bg-accent rounded-full" />
        Note: Data provided by BCA / LTSA public record.
      </p>
    </div>
  );
};

export const Taxes = ({ property, type }: { property: any; type: string }) => {
  const data = [
    {
      name: "Zoning",
      value: type.includes("strata") ? property.zoning : property.zone_code,
    },
    { name: "PID", value: property.pid },
    {
      name: "Zone Description",
      value: type.includes("strata") ? "-" : property.zone_desc,
    },
    { name: "Legal Description", value: property.legal_detail },
  ];

  const taxDataArray: any[] = property.gross_tax_data;

  return (
    <div className="space-y-8 antialiased font-body">
      {/* Historical Tax Table - Financial Style */}
      {property.gross_tax_data && (
        <div className="border border-border shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted border-b border-border">
              <tr className="uppercase tracking-[0.12em] text-[10px] text-muted-foreground font-bold">
                <th className="px-6 py-4">Tax Year</th>
                <th className="px-6 py-4 text-right">Gross Tax</th>
                <th className="px-6 py-4 text-right">Annual Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...taxDataArray]
                .sort((a, b) => b.year - a.year)
                .map((taxInfo, index) => (
                  <tr
                    key={index}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-foreground font-medium">
                      {checkIfEmpty(taxInfo.year)}
                    </td>
                    <td className="px-6 py-4 text-foreground font-bold text-right tabular-nums">
                      ${checkIfEmpty(numberWithCommas(taxInfo.tax))}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-medium ${taxInfo.change?.includes("-") ? "text-red-600" : "text-emerald-600"}`}
                    >
                      {checkIfEmpty(taxInfo.change)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Zoning & Legal Grid - Architectural Style */}
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 border-t border-l border-border bg-white">
          {data.map((item, index) => (
            <div
              className={`p-5 border-r border-b border-border group hover:bg-slate-50/50 transition-colors ${
                index === data.length - 1 ? "col-span-2 md:col-span-3" : ""
              }`}
              key={index}
            >
              <p className="uppercase tracking-[0.12em] text-[10px] text-muted-foreground font-bold mb-1.5 group-hover:text-primary transition-colors">
                {item.name}
              </p>
              <p className="text-sm font-bold text-foreground leading-relaxed break-words">
                {checkIfEmpty(item.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-[10px] text-muted-foreground italic px-1 flex items-center gap-2">
        <span className="w-1 h-1 bg-accent rounded-full" />
        Note: Data provided by BCA / LTSA public record.
      </p>
    </div>
  );
};

export const SchoolPrograms = ({
  property,
  type,
}: {
  property: any;
  type: string;
}) => {
  const data = [
    { name: "Elementary School", value: property.elementary_school },
    { name: "Middle School", value: "Don Ross Middle School" },
    { name: "Secondary School", value: "Howe Sound Secondary" },
    { name: "Private Institution", value: "Coast Mountain Academy" },
    { name: "Post-Secondary", value: "Capilano University Canada" },
  ];

  return (
    <div className="antialiased font-body">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-border bg-white">
        {data.map((item, index) => (
          <div
            className="p-5 border-r border-b border-border group hover:bg-slate-50/50 transition-colors"
            key={index}
          >
            {/* School Level Label */}
            <p className="uppercase tracking-[0.12em] text-[10px] text-muted-foreground font-bold mb-1.5 group-hover:text-primary transition-colors">
              {item.name}
            </p>

            {/* School Name */}
            <p className="text-sm font-bold text-foreground leading-relaxed">
              {checkIfEmpty(item.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ReviewForm = ({
  property,
  user,
}: {
  property: any;
  user: any;
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [validateMessage, setValidateMessage] = useState("");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const [formData, setFormData] = useState({
    estimateValue: "",
    reviewText: "",
    files: [] as File[],
    templateType: "REVIEW_FORM",
  });

  const [sliderValues, setSliderValues] = useState({
    "curb Appeal": 4.5,
    view: 3.9,
    location: 4.75,
    landscaping: 4.25,
  });

  // 1. Validation Logic
  const validations = {
    estimateValue: formData.estimateValue.trim().length > 0 && !validateMessage,
    reviewText: formData.reviewText.trim().length >= 10,
  };

  const isFormValid = validations.estimateValue && validations.reviewText;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "estimateValue") {
      const isValid = /^[0-9$,.]*$/.test(value);
      setValidateMessage(isValid ? "" : "Invalid characters (use 0-9, $, . ,)");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name: string, val: number[]) => {
    setSliderValues((prev) => ({ ...prev, [name]: val[0] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, files: Array.from(e.target.files!) }));
    }
  };

  // 2. Field Status Helper
  const getFieldStatus = (isValid: boolean, value: string) => {
    const hasInteracted = value.length > 0 || triedToSubmit;
    return {
      showError: hasInteracted && !isValid,
      className: `w-full bg-white border p-4 transition-all outline-none text-sm leading-relaxed ${
        hasInteracted && !isValid
          ? "border-destructive ring-2 ring-destructive/20 animate-shake"
          : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
      }`,
    };
  };

  const averageScore = (
    Object.values(sliderValues).reduce((a, b) => a + b, 0) / 4
  ).toFixed(1);

  useEffect(() => {
    // Use the specific property ID to ensure we don't load a review for the wrong house
    const storageKey = `pending_review_${property.pid}`;
    const saved = localStorage.getItem(storageKey);

    if (saved && user) {
      try {
        const { formData: savedForm, sliderValues: savedSliders } =
          JSON.parse(saved);

        // Restore text and sliders
        setFormData((prev) => ({
          ...prev,
          estimateValue: savedForm.estimateValue,
          reviewText: savedForm.reviewText,
        }));
        setSliderValues(savedSliders);

        // 1. Success Message
        setMessage(
          "Welcome back! Your review has been restored. Please re-attach any photos.",
        );

        // 2. Clean up
        localStorage.removeItem(storageKey);

        // 3. Optional: Automatically trigger the submit function if you want it to be seamless
        // handleSubmit();
      } catch (e) {
        console.error("Failed to parse saved review", e);
      }
    }
  }, [user, property.pid]); // Dependency on 'user' is key!

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriedToSubmit(true);

    if (!isFormValid || validateMessage) return;

    setIsSubmitting(true);
    console.log(user);

    if (!user) {
      const cache = { formData, sliderValues };
      localStorage.setItem(
        `pending_review_${property.pid}`,
        JSON.stringify(cache),
      );
      setShowAuthPrompt(true);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      // Note: handleUpload logic remains as per your implementation
      let photoLinks: string[] = [];
      // /*
      if (formData.files.length > 0) {
        photoLinks = await handleUpload(formData.files, "reviews");
      }

      const reviewPayload = {
        pid: property.pid,
        user_id: user?.id,
        curb_appeal: sliderValues["curb Appeal"],
        view_score: sliderValues.view,
        location_score: sliderValues.location,
        landscaping_score: sliderValues.landscaping,
        property_score: parseFloat(averageScore),
        estimated_value: formData.estimateValue,
        comments: formData.reviewText,
        photo_urls: photoLinks,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("property_reviews")
        .insert([reviewPayload]);
      if (error) throw error;

      // Trigger Email Notification
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType: "REVIEW_FORM",
          email: user?.email,
          name: user?.user_metadata.full_name,
          propertyAddress: property?.civic_address,
          scores: sliderValues,
          estimateValue: formData.estimateValue,
          reviewText: formData.reviewText,
          photo_urls: photoLinks,
        }),
      });

      setMessage("Review submitted successfully! Thank you for your feedback.");
      setFormData({
        estimateValue: "",
        reviewText: "",
        files: [],
        templateType: "REVIEW_FORM",
      });
      setTriedToSubmit(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Error submitting review:", err);
      setMessage("Failed to submit review. Please try again.");
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="antialiased font-body">
        {/* RATING GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-border bg-white">
          {Object.entries(sliderValues).map(([name, value]) => (
            <div
              key={name}
              className="p-6 border-r border-b border-border space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground">
                  {name}
                </span>
                <span className="text-sm font-bold text-primary">{value}</span>
              </div>
              <Slider
                value={[value]}
                max={5}
                step={0.1}
                onValueChange={(val) => handleSliderChange(name, val)}
                className="py-4"
              />
            </div>
          ))}
          <div className="md:col-span-2 p-8 border-r border-b border-border bg-muted/20 flex flex-col items-center justify-center text-center">
            <span className="uppercase tracking-[0.2em] text-[10px] font-bold text-muted-foreground mb-1">
              Property Score
            </span>
            <span className="text-5xl font-bold text-foreground tabular-nums tracking-tighter">
              {averageScore}
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Estimated Value */}
          <div className="space-y-2">
            <label className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground ml-1 block">
              Estimated Value
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                $
              </span>
              <Input
                name="estimateValue"
                value={formData.estimateValue}
                onChange={handleInputChange}
                placeholder="0,000,000"
                className={`${getFieldStatus(validations.estimateValue, formData.estimateValue).className} h-12 pl-8 font-bold font-mono`}
              />
            </div>
            {(getFieldStatus(validations.estimateValue, formData.estimateValue)
              .showError ||
              validateMessage) && (
              <p className="text-[10px] text-destructive mt-1 ml-1 font-bold flex items-center gap-1">
                <X size={12} />{" "}
                {validateMessage || "Please provide an estimate"}
              </p>
            )}
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <label className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground ml-1 block">
              Comments
            </label>
            <textarea
              name="reviewText"
              value={formData.reviewText}
              onChange={handleInputChange}
              rows={4}
              placeholder="Layout, neighborhood, condition..."
              className={
                getFieldStatus(validations.reviewText, formData.reviewText)
                  .className
              }
            />
            {getFieldStatus(validations.reviewText, formData.reviewText)
              .showError && (
              <p className="text-[10px] text-destructive mt-1 ml-1 font-bold flex items-center gap-1">
                <X size={12} /> Minimum 10 characters required
              </p>
            )}
          </div>

          {/* File Upload */}
          <label className="group relative border-2 border-dashed border-border p-8 text-center hover:border-primary transition-colors cursor-pointer bg-muted/5 block">
            <Input
              type="file"
              multiple
              onChange={handleFileChange}
              className="sr-only"
            />
            <Upload
              className="mx-auto mb-3 text-muted-foreground group-hover:text-primary"
              size={20}
            />
            <p className="text-[10px] uppercase tracking-widest font-bold text-foreground">
              {formData.files.length > 0
                ? `${formData.files.length} Files Selected`
                : "Upload Photos"}
            </p>
          </label>

          {message && (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100 animate-in fade-in zoom-in-95 flex items-center gap-2">
              <AlertCircle size={16} /> {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-[#204933] hover:bg-[#1a3d2b] transition-all group"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <div className="flex items-center gap-3">
                <span className="uppercase tracking-[0.3em] text-[10px] font-bold">
                  Submit Review
                </span>
                <Send
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            )}
          </Button>
        </div>
      </form>
      {showAuthPrompt && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowAuthPrompt(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-none border border-border shadow-2xl p-8 animate-in zoom-in-95 duration-300 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-muted border border-border flex items-center justify-center">
                <Lock size={28} className="text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 uppercase tracking-tighter">
              Great Review!
            </h3>
            <p className="text-muted-foreground text-[11px] mb-8 leading-relaxed uppercase tracking-wider">
              To publish your feedback for{" "}
              <span className="text-foreground font-bold">
                {property.civic_address}
              </span>
              , please sign in.
            </p>
            <div className="space-y-3">
              <Button
                className="w-full bg-primary"
                onClick={() =>
                  router.push(
                    `/login?callback=${encodeURIComponent(window.location.pathname)}`,
                  )
                }
              >
                Sign In
              </Button>

              {/* Add a Register option if they don't have an account */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  router.push(
                    `/register?callback=${encodeURIComponent(window.location.pathname)}`,
                  )
                }
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ReportAnIssueForm = ({
  property,
  user,
  reportRef,
}: {
  property: any;
  user: any;
  reportRef: React.RefObject<HTMLDivElement>;
}) => {
  const router = useRouter();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    info: "",
    templateType: "REPORT_ISSUE",
  });

  // 1. Validation Logic
  const validations = {
    info: formData.info.trim().length >= 10,
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, info: e.target.value }));
  };

  // 2. Field Status Helper
  const getFieldStatus = (isValid: boolean, value: string) => {
    const hasInteracted = value.length > 0 || triedToSubmit;
    return {
      showError: hasInteracted && !isValid,
      className: `w-full min-h-[140px] rounded-lg border bg-muted/5 p-4 text-foreground transition-all outline-none text-sm leading-relaxed ${
        hasInteracted && !isValid
          ? "border-destructive ring-2 ring-destructive/20 animate-shake"
          : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
      }`,
    };
  };

  useEffect(() => {
    // Use the specific property ID to ensure we don't load a review for the wrong house
    const storageKey = `pending_issue_${property.pid}`;
    const saved = localStorage.getItem(storageKey);

    if (saved && user) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, info: parsed.info }));

        // Cleanup storage
        localStorage.removeItem(storageKey);

        setMessage("Welcome back! Your report details have been restored.");
        setTimeout(() => setMessage(null), 5000);
      } catch (e) {
        console.error("Failed to restore report", e);
      }
    }
  }, [user, property.pid]); // Dependency on 'user' is key!

  const onReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriedToSubmit(true);

    if (!validations.info) return; // Guard

    if (!user) {
      // Save the state before leaving
      localStorage.setItem(
        `pending_issue_${property.pid}`,
        JSON.stringify({ info: formData.info }),
      );
      setShowAuthPrompt(true);
      return;
    }
    setIsSubmitting(true);
    const propertyAddress = property?.civic_address || "Unknown Address";

    try {
      // 1. Supabase Insert
      const { error: dbError } = await supabase.from("reported_issues").insert([
        {
          user_id: user?.id,
          pid: property?.pid,
          property_address: propertyAddress,
          issue_details: formData.info,
          status: "pending",
        },
      ]);

      if (dbError) throw dbError;

      // 2. Email API
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType: formData.templateType,
          name: user?.user_metadata?.full_name || "Valued Client",
          email: user?.email,
          propertyAddress: propertyAddress,
          issueDetails: formData.info,
        }),
      });

      if (response.ok) {
        setMessage("Issue reported successfully. Thank you for your feedback.");
        setFormData({ info: "", templateType: "REPORT_ISSUE" });
        setTriedToSubmit(false);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Report Error:", error);
      setMessage("Failed to submit report. Please try again.");
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      ref={reportRef}
      className="mb-4 mx-auto space-y-4 antialiased font-body"
    >
      <div className="p-8 rounded-xl bg-white border border-border">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className="text-accent" />
          <h5 className="font-bold text-primary font-display tracking-tight">
            Report an Issue
          </h5>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
          Spotted a discrepancy in the data? Let us know and we&apos;ll
          investigate.
        </p>

        <form onSubmit={onReport} className="pt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 block">
              Describe the Issue
            </label>
            <textarea
              name="info"
              value={formData.info}
              onChange={handleInputChange}
              placeholder="Ex: The zoning information is outdated or the lot size is incorrect..."
              className={
                getFieldStatus(validations.info, formData.info).className
              }
              maxLength={250}
            />

            <div className="flex justify-between items-center px-1">
              {getFieldStatus(validations.info, formData.info).showError ? (
                <p className="flex items-center gap-1.5 text-[10px] text-destructive font-bold">
                  <X size={12} /> Minimum 10 characters required
                </p>
              ) : (
                <div />
              )}
              <div className="text-[10px] text-muted-foreground font-mono">
                {formData.info.length} / 250
              </div>
            </div>
          </div>

          {message && (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100 animate-in fade-in zoom-in-95">
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-5 bg-[#204933] hover:bg-[#1a3d2b]"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <div className="flex items-center gap-3">
                <span className="uppercase tracking-[0.3em] text-[10px] font-bold">
                  Submit Report
                </span>
                <Send className="size-4 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-transform" />
              </div>
            )}
          </Button>
        </form>
      </div>
      {showAuthPrompt && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowAuthPrompt(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-none border border-border shadow-2xl p-8 animate-in zoom-in-95 duration-300 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-muted border border-border flex items-center justify-center">
                <Lock size={28} className="text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 uppercase tracking-tighter">
              Authentication Required
            </h3>
            <p className="text-muted-foreground text-[11px] mb-8 leading-relaxed uppercase tracking-wider">
              To report your issue for{" "}
              <span className="text-foreground font-bold">
                {property.civic_address}
              </span>
              , please sign in.
            </p>
            <div className="space-y-3">
              <Button
                className="w-full bg-primary"
                onClick={() =>
                  router.push(
                    `/login?callback=${encodeURIComponent(window.location.pathname)}`,
                  )
                }
              >
                Sign In
              </Button>

              {/* Add a Register option if they don't have an account */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  router.push(
                    `/register?callback=${encodeURIComponent(window.location.pathname)}`,
                  )
                }
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ThinkingOfSelling = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    propertyOwner: "",
    email: "",
    propertyAddress: "",
    templateType: "THINKING_OF_SELLING",
  });

  // 1. Logic ported from Contact page
  const validations = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    propertyOwner: formData.propertyOwner.trim().length >= 2,
    propertyAddress: formData.propertyAddress.trim().length >= 5,
  };

  const isFormValid =
    validations.email &&
    validations.propertyOwner &&
    validations.propertyAddress;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getFieldStatus = (isValid: boolean, value: string) => {
    const hasInteracted = value.length > 0 || triedToSubmit;
    return {
      showError: hasInteracted && !isValid,
      className: `w-full bg-muted/5 border rounded-lg p-3.5 pl-11 text-sm transition-all outline-none ${
        hasInteracted && !isValid
          ? "border-destructive ring-2 ring-destructive/20 animate-shake"
          : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
      }`,
    };
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriedToSubmit(true);

    if (!isFormValid) return; // Prevent submission if invalid

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed");

      setMessage("Thank you for reaching out! We'll be in touch soon.");
      setFormData({
        propertyOwner: "",
        email: "",
        propertyAddress: "",
        templateType: "THINKING_OF_SELLING",
      });
      setTriedToSubmit(false); // Reset validation state

      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      setMessage("Something went wrong. Please try again later.");
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mb-4 mx-auto space-y-4 antialiased font-body px-2">
      <div className="p-8 rounded-xl bg-white border border-border shadow-sm">
        <div className="mb-8">
          <h5 className="text-xl font-bold text-primary font-display tracking-tight flex items-center gap-2">
            <AlertCircle size={20} className="text-accent" />
            Thinking of Selling?
          </h5>
          <p className="mt-2 text-[15px] text-muted-foreground leading-relaxed">
            Contact us to learn how you can save thousands on real estate fees.
            Full Service Sales & Marketing,{" "}
            <span className="text-primary font-bold">More Profit.</span>
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Property Owner */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Property Owner
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 size-4" />
              <Input
                name="propertyOwner"
                value={formData.propertyOwner}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={`h-12 ${
                  getFieldStatus(
                    validations.propertyOwner,
                    formData.propertyOwner,
                  ).className
                }`}
              />
            </div>
            {getFieldStatus(validations.propertyOwner, formData.propertyOwner)
              .showError && (
              <p className="flex items-center gap-1.5 text-[10px] text-destructive px-1 font-bold">
                <X size={12} /> Please enter your full name
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 size-4" />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className={`h-12 ${
                  getFieldStatus(validations.email, formData.email).className
                }`}
              />
            </div>
            {getFieldStatus(validations.email, formData.email).showError && (
              <p className="flex items-center gap-1.5 text-[10px] text-destructive px-1 font-bold">
                <X size={12} /> Please enter a valid email address
              </p>
            )}
          </div>

          {/* Property Address */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Property Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 size-4" />
              <Input
                name="propertyAddress"
                value={formData.propertyAddress}
                onChange={handleInputChange}
                placeholder="123 Squamish Way"
                className={`h-12 ${
                  getFieldStatus(
                    validations.propertyAddress,
                    formData.propertyAddress,
                  ).className
                }`}
              />
            </div>
            {getFieldStatus(
              validations.propertyAddress,
              formData.propertyAddress,
            ).showError && (
              <p className="flex items-center gap-1.5 text-[10px] text-destructive px-1 font-bold">
                <X size={12} /> Please enter the property address
              </p>
            )}
          </div>

          {message && (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100 animate-in fade-in zoom-in-95">
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-5 bg-[#204933] hover:bg-[#1a3d2b]"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <div className="flex items-center gap-3">
                <span className="uppercase tracking-[0.3em] text-[11px] font-extrabold">
                  Learn More
                </span>
                <Send className="size-4 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-transform" />
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
