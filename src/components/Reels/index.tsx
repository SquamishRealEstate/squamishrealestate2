import React, { useRef, useState, useEffect } from "react";
import { PlayCircle, ChevronLeft, ChevronRight, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Reel {
  id: string;
  category: string;
  videoUrl: string;
}

const REELS_DATA: Reel[] = [
  { id: "1", category: "Featured", videoUrl: "/images/f1.mp4" },
  { id: "2", category: "Featured", videoUrl: "/images/f2.mp4" },
  { id: "3", category: "Featured", videoUrl: "/images/f1.mp4" },
  { id: "4", category: "Featured", videoUrl: "/images/f1.mp4" },
  { id: "5", category: "Featured", videoUrl: "/images/f1.mp4" },
  { id: "6", category: "Featured", videoUrl: "/images/f1.mp4" },
  { id: "7", category: "Featured", videoUrl: "/images/f1.mp4" },
  { id: "8", category: "Featured", videoUrl: "/images/f1.mp4" },
  { id: "9", category: "Featured", videoUrl: "/images/f1.mp4" },
  { id: "10", category: "Featured", videoUrl: "/images/f1.mp4" },
];

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

const ReelItem: React.FC<{ reel: Reel }> = ({ reel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const [videoError, setVideoError] = useState(false);

  // If the URL is empty or null, immediately set error state
  useEffect(() => {
    if (!reel.videoUrl) setVideoError(true);
  }, [reel.videoUrl]);

  const handleMouseEnter = async () => {
    if (videoError || !videoRef.current) return;
    try {
      videoRef.current.muted = true;
      playPromiseRef.current = videoRef.current.play();
      await playPromiseRef.current;
    } catch (err) {
      // If play fails (e.g. file deleted), we can treat it as an error
      console.log("Playback failed");
    }
  };

  const handleMouseLeave = async () => {
    if (videoError || !videoRef.current) return;
    if (playPromiseRef.current !== null) {
      await playPromiseRef.current;
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      playPromiseRef.current = null;
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex-none w-[200px] sm:w-[240px] aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group snap-start bg-gray-100 border border-gray-100 shadow-sm transition-all"
    >
      {!videoError ? (
        <>
          <video
            ref={videoRef}
            src={reel.videoUrl}
            loop
            muted
            playsInline
            preload="metadata"
            onError={() => setVideoError(true)} // Triggers if URL is 404 or invalid format
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Default Play Icon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:opacity-0 transition-opacity duration-300">
            <PlayCircle
              size={48}
              className="text-white drop-shadow-lg"
              strokeWidth={1.2}
              fill="rgba(255, 255, 255, 0.2)"
            />
          </div>
        </>
      ) : (
        /* Fallback UI when Video is missing */
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
          <div className="bg-white p-3 rounded-full shadow-sm mb-3">
            <VideoOff size={24} className="text-gray-300" />
          </div>
          <p className="text-gray-400 text-xs font-semibold px-2">
            Video Unavailable
          </p>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </div>
  );
};

export default function Reels() {
  console.log("Loading Reels component");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("Featured");
  const [filteredReels, setFilteredReels] = useState<Reel[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      const filtered = REELS_DATA.filter((reel) => reel.category === activeTab);
      setFilteredReels(filtered);
      setIsAnimating(false);

      if (scrollRef.current)
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }, 200);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo =
        direction === "left"
          ? scrollLeft - scrollAmount
          : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="container">
      <div className="flex flex-col gap-6 mb-8 border-b border-gray-100 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-full font-semibold",
                  activeTab === tab
                    ? "bg-[#06422d] hover:bg-[#06422d]/90"
                    : "text-black",
                )}
              >
                {tab}
              </Button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 hover:bg-gray-50 rounded-full border border-gray-100"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 hover:bg-gray-50 rounded-full border border-gray-100"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={cn(
          "flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory transition-opacity duration-300",
          "no-scrollbar pb-6 pt-2", // Added no-scrollbar here
          isAnimating ? "opacity-0" : "opacity-100",
        )}
        style={{
          msOverflowStyle: "none" /* IE and Edge */,
          scrollbarWidth: "none" /* Firefox */,
        }}
      >
        {filteredReels.length > 0 ? (
          filteredReels.map((reel) => <ReelItem key={reel.id} reel={reel} />)
        ) : (
          <div className="w-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <VideoOff size={32} className="text-gray-300" />
            </div>
            <h3 className="text-gray-800 font-bold text-lg">No reels yet</h3>
            <p className="text-gray-500 text-sm max-w-xs text-center mt-1">
              There are currently no videos available for{" "}
              <span className="text-[#06422d] font-semibold">{activeTab}</span>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
