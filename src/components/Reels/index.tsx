"use client";

import React, { useRef, useState, useEffect } from "react";
import { supabase } from "@/config/supabaseClient";
import {
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  VideoOff,
  Loader2,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatString } from "@/lib/utils";
import Link from "next/link";

interface Reel {
  id: number;
  category: string;
  link: string;
  priority: number;
  address?: string;
  description?: string;
  pid: string;
  property_type: string;
}

const TABS = [
  "Featured",
  "Homes",
  "Townhomes",
  "Condos",
  "Mortgages",
  "Statistics",
  "Trends",
  "New Projects",
  "Commercial",
  "Favourites",
];

// Using your exact getEmbedUrl logic from the ReelManager
const getEmbedUrl = (url: string) => {
  if (!url) return "";
  try {
    const cleanUrl = new URL(url);
    if (cleanUrl.hostname.includes("instagram.com")) {
      let path = cleanUrl.pathname;
      if (!path.endsWith("/")) path += "/";
      return `https://www.instagram.com${path}embed/`;
    }
    if (
      cleanUrl.hostname.includes("youtube.com") ||
      cleanUrl.hostname.includes("youtu.be")
    ) {
      const videoId =
        cleanUrl.searchParams.get("v") || cleanUrl.pathname.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  } catch (e) {
    console.error("Error parsing URL:", e);
    return url;
  }
};

const ReelItem: React.FC<{ reel: Reel }> = ({ reel }) => {
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="relative flex-none w-[240px] sm:w-[280px] aspect-[9/18] rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-lg group snap-start flex flex-col">
      {!videoError ? (
        <>
          {/* TOP: The Video Player (Occupies 80% of height) */}
          <div className="relative w-full h-[80%] bg-black overflow-hidden">
            <iframe
              src={getEmbedUrl(reel.link)}
              className="absolute inset-0 w-full h-full scale-[1.02]"
              scrolling="no"
              allowFullScreen
              style={{ border: "none" }}
              onError={() => setVideoError(true)}
            />

            {/* Play Icon - Only visible when not playing/hovering */}
            <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity pointer-events-none z-10">
              <PlayCircle size={44} className="text-white/30" strokeWidth={1} />
            </div>
          </div>

          {/* BOTTOM: Dedicated Info Bar (No more overlap!) */}
          <Link
            href={`/listing/landing/${reel.property_type}/${reel.pid}/${formatString(reel.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white p-4 flex flex-col border-t border-slate-100 z-20 group-hover:bg-slate-50 transition-colors"
          >
            {/* ADDRESS (Clickable + highlighted) */}
            {reel.address && (
              <div className="flex items-start gap-2 mb-2">
                <MapPin size={14} className="text-primary mt-0.5 shrink-0" />

                <span className="text-sm font-semibold leading-snug text-slate-900 group-hover:text-primary transition-colors underline decoration-dotted underline-offset-4">
                  {reel.address}
                </span>
              </div>
            )}

            {/* DESCRIPTION */}
            {reel.description && (
              <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 pl-5">
                {reel.description}
              </p>
            )}

            {/* CTA */}
            <div className="mt-auto pt-3 pl-5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                View Details
              </span>

              <ArrowRight
                size={14}
                className="text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1"
              />
            </div>
          </Link>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300 p-6 text-center">
          <VideoOff size={28} className="mb-2 opacity-30" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Video Unavailable
          </span>
        </div>
      )}
    </div>
  );
};

export default function Reels() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("Featured");
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      setLoading(true);

      // Start with the base query
      let query = supabase
        .from("reels")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      // Only apply the filter if it's NOT the "Featured" tab
      if (activeTab !== "Featured") {
        query = query.filter("category", "cs", `["${activeTab}"]`);
      }

      const { data, error } = await query;

      if (!error) setReels(data || []);
      setLoading(false);
    };

    fetchReels();
  }, [activeTab]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const amount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - amount : scrollLeft + amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="container py-12 font-body">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 border-b border-slate-100 pb-8">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full font-bold px-6 py-5 transition-all",
                activeTab === tab
                  ? "bg-primary text-white shadow-lg"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
            >
              {tab}
            </Button>
          ))}
        </div>

        <div className="hidden sm:flex gap-3">
          <button
            onClick={() => scroll("left")}
            className="p-3 rounded-full border border-slate-200 text-slate-400 hover:text-primary transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-3 rounded-full border border-slate-200 text-slate-400 hover:text-primary transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={cn(
          "flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar",
          loading
            ? "opacity-30"
            : "opacity-100 transition-opacity duration-500",
        )}
        style={{ scrollbarWidth: "none" }}
      >
        {loading ? (
          <div className="w-full py-24 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <p className="text-slate-400 uppercase tracking-widest text-[10px]">
              Loading Reels...
            </p>
          </div>
        ) : reels.length > 0 ? (
          reels.map((reel) => <ReelItem key={reel.id} reel={reel} />)
        ) : (
          <div className="w-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
            <VideoOff size={32} className="text-slate-200 mb-4" />
            <p className="text-slate-500 text-sm">No videos for {activeTab}.</p>
          </div>
        )}
      </div>
    </section>
  );
}
