"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/config/supabaseClient";
import { NeighborhoodType } from "@/components/Neighborhoods";
import {
  Loader2,
  ChevronRight,
  Home,
  Map,
  Video,
  Info,
  Building2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { MapView } from "../Map/Map";
import Link from "next/link";
import { Price } from "./price";
import { SliderDiv } from "./sliderDiv";
import Footer from "../Footer";

export const Neighborhood = () => {
  const { neighborhoodname } = useParams();
  const [loading, setLoading] = useState(true);
  const [neighborhood, setNeighborhood] = useState<NeighborhoodType | null>(
    null,
  );

  const parsePhotos = (photos: any): string[] => {
    if (!photos) return [];

    return photos
      .map((p: any) => {
        try {
          const parsed = JSON.parse(p);
          return parsed?.S || null;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  };

  const photos = useMemo(() => {
    if (!neighborhood?.photos) return [];
    return parsePhotos(neighborhood.photos);
  }, [neighborhood]);

  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (!neighborhoodname) return;

    const fetchData = async () => {
      setLoading(true);

      const { data, error } = await supabase.from("neighbourhoods").select("*");

      if (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const formatString = (str: string) => {
          return str
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        };

        const match = data.find(
          (item) =>
            formatString(item.name) ===
            (neighborhoodname as string).toLowerCase(),
        );

        if (match) {
          setNeighborhood(match as NeighborhoodType);
        } else {
          console.log("No data found matching slug:", neighborhoodname);
          setNeighborhood(null);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [neighborhoodname]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary mb-2" />
        <p className="text-[10px] uppercase tracking-widest font-bold text-secondary">
          Loading Neighborhood...
        </p>
      </div>
    );
  }

  if (!neighborhood) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="pt-32 pb-16 px-6 text-center max-w-md mx-auto">
          <h2 className="text-xl font-bold font-display text-foreground mb-2">
            Missing
          </h2>
          <p className="text-sm text-muted-foreground">
            No active data records could be synchronized matching "
            {neighborhoodname}".
          </p>
        </div>
      </div>
    );
  }

  const lng = parseFloat(neighborhood.center_longitude) || -123.152797;
  const lat = parseFloat(neighborhood.center_latitude) || 49.699331;

  // Replicating your original count-based color assignment logic using theme variables
  const getBadgeColor = (count: number) => {
    if (count < 50)
      return "bg-[#ff6d60]/10 text-[#ff6d60] border border-[#ff6d60]/20";
    if (count >= 50 && count < 100)
      return "bg-[#f7d060]/10 text-[#e0b63a] border border-[#f7d060]/20";
    if (count >= 100 && count < 150)
      return "bg-[#f3e99f]/20 text-[#c2b23a] border border-[#f3e99f]/30";
    return "bg-[#98d8aa]/10 text-[#61b87a] border border-[#98d8aa]/20";
  };

  const getYouTubeEmbedId = (url: string) => {
    if (!url) return "";
    if (url.includes("youtu.be/"))
      return url.split("youtu.be/")[1]?.split(/[?#]/)[0];
    if (url.includes("v=")) return url.split("v=")[1]?.split(/[&#]/)[0];
    if (url.includes("embed/")) return url.split("embed/")[1]?.split(/[?#]/)[0];
    return url;
  };

  const videoId = getYouTubeEmbedId(neighborhood.video || "");

  // Transform the all_prop_types object into an array of entries for easy iteration
  const propertyTypesEntries = neighborhood.all_prop_types
    ? (Object.entries(neighborhood.all_prop_types) as [
        string,
        string | number,
      ][])
    : [];

  return (
    <div className="bg-background min-h-screen text-foreground transition-colors duration-300">
      <Navbar />

      <div className="pt-24 pb-16 px-4 md:px-8 mx-auto space-y-6">
        {/* BREADCRUMB TRAIL */}
        <nav className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-muted-foreground select-none">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-primary transition-colors duration-200"
          >
            <Home size={12} /> Home
          </Link>
          <ChevronRight size={11} className="text-muted-foreground/40" />
          <Link
            href="/neighborhoods"
            className="flex items-center gap-1 hover:text-primary transition-colors duration-200"
          >
            <Map size={12} /> Neighborhoods
          </Link>
          <ChevronRight size={11} className="text-muted-foreground/40" />
          <span className="text-foreground/80 truncate max-w-[180px]">
            {neighborhood.name}
          </span>
        </nav>

        {/* SECTION HEADER BLOCK */}
        <div className="relative text-center py-4 overflow-hidden select-none">
          <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-foreground relative z-10">
            {neighborhood.name}
          </h2>
          <div className="h-1 w-12 bg-primary mx-auto mt-4 rounded-full relative z-10" />
        </div>

        {/* MAP CONTAINER CONTROL */}
        <div className="w-full h-[460px] rounded-xl overflow-hidden border border-border shadow-md relative bg-card">
          <MapView center={[lng, lat]} />
        </div>

        {/* DESCRIPTION CONTAINER (Moved here to stay on top, below the map) */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm w-full">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
              <Info size={16} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                About the Community
              </h4>
              <p className="text-sm text-foreground/90 leading-relaxed font-body">
                {neighborhood.primary_description ||
                  "Detailed overview files are currently processing configuration nodes for this coordinate."}
              </p>
            </div>
          </div>
        </div>

        {/* MULTIMEDIA VIDEO & PROPERTY GRID (Enforced items-stretch for uniform height matching) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          {/* VIDEO PANEL MODULE (Scaled back to max-h-[380px] to optimize vertical balance) */}
          <div className="lg:col-span-3 flex">
            {videoId ? (
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3 flex flex-col w-full">
                <div className="relative flex-1 w-full rounded-lg overflow-hidden border border-border bg-black shadow-lg min-h-[280px] lg:min-h-[340px] max-h-[380px]">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0`}
                    title={`${neighborhood.name} Video Walkthrough`}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border border-dashed rounded-xl p-12 text-center text-sm text-muted-foreground italic flex items-center justify-center w-full">
                Video presentation context unavailable for this region node.
              </div>
            )}
          </div>

          {/* PROPERTY COUNTS SIDEBAR CONTAINER (Fills exactly to match video container height boundary) */}
          <div className="lg:col-span-1 flex">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4 w-full flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-3 flex items-center justify-center gap-2">
                  <Building2 size={15} className="text-primary" /> Property
                  Types
                </h3>

                <div className="w-full mt-4">
                  {propertyTypesEntries.length > 0 ? (
                    <dl className="grid grid-cols-3 gap-3 text-center lg:grid-cols-1">
                      {propertyTypesEntries.map(([type, countValue]) => {
                        const parsedCount =
                          typeof countValue === "string"
                            ? parseInt(countValue.replace(/,/g, ""), 10) || 0
                            : countValue;

                        return (
                          <div
                            key={type}
                            className="mx-auto flex flex-col lg:flex-row items-center justify-between w-full p-2 rounded-lg border border-border/40 bg-background/40 hover:bg-muted/40 transition-colors duration-200 gap-1.5"
                          >
                            <dt className="leading-tight text-muted-foreground text-xs font-semibold md:text-xs tracking-tight truncate max-w-[105px]">
                              {type}
                            </dt>
                            <dd
                              className={`w-9 h-9 lg:w-10 lg:h-10 font-mono text-xs font-black flex items-center justify-center rounded-full shrink-0 shadow-sm transition-transform duration-300 hover:scale-105 ${getBadgeColor(parsedCount)}`}
                            >
                              {parsedCount.toLocaleString()}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                  ) : (
                    <div className="text-center text-xs text-muted-foreground italic py-6">
                      No distribution metrics available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch w-full">
          {/* LEFT COLUMN: Photo Carousel */}
          <div className="w-full h-full">
            {photos.length > 0 ? (
              <div className="rounded-2xl border bg-card overflow-hidden shadow-sm h-full flex flex-col">
                {/* Main Image - flex-1 allows it to stretch to match the right column's height */}
                <div className="relative w-full flex-1 min-h-[350px] bg-black">
                  <img
                    src={photos[photoIndex]}
                    alt="Neighborhood photo"
                    className="absolute inset-0 w-full h-full object-contain transition-all duration-500"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                  {/* Controls */}
                  <button
                    onClick={() =>
                      setPhotoIndex((prev) =>
                        prev === 0 ? photos.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 transition-colors text-white px-3 py-1 rounded-full z-10"
                  >
                    ‹
                  </button>

                  <button
                    onClick={() =>
                      setPhotoIndex((prev) =>
                        prev === photos.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 transition-colors text-white px-3 py-1 rounded-full z-10"
                  >
                    ›
                  </button>

                  {/* Counter */}
                  <div className="absolute bottom-3 right-3 text-xs bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full z-10">
                    {photoIndex + 1} / {photos.length}
                  </div>
                </div>

                {/* Thumbnails - automatically pushed to the bottom */}
                <div className="flex gap-2 p-3 overflow-x-auto bg-card scrollbar-none shrink-0 border-t border-border">
                  {photos.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      onClick={() => setPhotoIndex(idx)}
                      className={`shrink-0 w-16 h-16 object-cover rounded-md cursor-pointer border transition-all ${
                        idx === photoIndex
                          ? "border-primary scale-105"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Fallback state */
              <div className="rounded-2xl border border-dashed border-border bg-card/30 h-full min-h-[400px] flex items-center justify-center text-muted-foreground text-sm">
                No photos available for this neighborhood.
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Price Component */}
          <div className="w-full h-full flex flex-col">
            {/* Assuming Price takes up height naturally; you may need to ensure 
        the root div inside your Price component also has 'h-full' */}
            <Price selectedNeighborhood={neighborhood} />
          </div>
        </div>
        <SliderDiv />
      </div>
      <Footer />
    </div>
  );
};
