"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/config/supabaseClient";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";

export interface NeighborhoodType {
  nid: string;
  name: string;
  primary_description: string;
  page_description: string;
  center_latitude: string;
  center_longitude: string;
  cover_photo: string;
  video: string;
  stats: string;
  stats_source_url: string;
  photos: string[];
  all_prop_types: any;
}

export default function Neighborhoods() {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [countsMap, setCountsMap] = useState<Record<string, number>>({});
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Pagination Configuration
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);

        // 1. Fetch neighborhood profiles from database
        const { data: sectors, error: sectorsError } = await supabase
          .from("neighbourhoods")
          .select("*")
          .order("name", { ascending: true });

        // 2. Fetch live listings data for count aggregation
        const { data: listings, error: listingsError } = await supabase
          .from("all_listings")
          .select("neighbourhood");

        if (sectorsError) throw sectorsError;
        if (listingsError) throw listingsError;

        // Process listings into a fast lookup key-value map
        if (listings) {
          const rawCounts: Record<string, number> = {};
          listings.forEach((item: any) => {
            const name = item.neighbourhood || "Unknown";
            rawCounts[name] = (rawCounts[name] || 0) + 1;
          });

          console.log("Neighborhood counts:", rawCounts);
          setCountsMap(rawCounts);
        }

        if (sectors) {
          setNeighborhoods(sectors as NeighborhoodType[]);
        }
      } catch (error) {
        console.error("Critical error synchronizing records:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleNextPage = () => setCurrentPage((prev) => prev + 1);
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const formatString = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Theme-Matched Loading Indicator (Using your core semantic primary color)
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary mb-2" />
        <p className="text-[10px] uppercase tracking-widest font-bold text-secondary">
          Loading Regions...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="pt-16 pb-16 px-6 bg-gray-50 min-h-screen">
        {/* Header Section utilizing 'font-display' (Outfit) & themed divider lines */}
        <div className="max-w-7xl mx-auto pt-12 pb-8 text-center sm:text-left">
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-2 font-display">
            Explore Squamish
          </h2>
          <div className="text-sm uppercase tracking-widest text-primary font-bold mb-3">
            Sectors & Neighborhoods
          </div>
          {/* Decorative divider fading from primary (Forest Green) to accent (Cedar) */}
          <span className="block w-20 h-1 bg-gradient-to-r from-primary to-accent rounded mx-auto sm:mx-0 mb-4"></span>
          <p className="text-muted-foreground max-w-xl text-base">
            Discover your favourite places in Squamish and review live active
            property ecosystem metrics.
          </p>
        </div>

        {/* Grid Layout Container */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {neighborhoods &&
            neighborhoods.slice(startIdx, endIdx).map((neighborhood, index) => {
              const rawName = neighborhood.name;

              // Database naming variation safeguards
              let targetCount = countsMap[rawName] || 0;
              if (rawName === "Downtown Squamish") {
                targetCount = countsMap["Downtown Squamish"] || 0;
              } else if (rawName === "Brennan Centre") {
                targetCount = countsMap["Brennan Center"] || 0;
              }

              return (
                <Link
                  href={`/neighborhoods/${formatString(rawName)}`}
                  key={neighborhood.nid || index}
                  className="group block"
                  target="_blank"
                >
                  {/* Cards built with native semantic border, card background variables, and custom radius tokens */}
                  <div
                    className="relative h-[340px] rounded-xl overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 transform group-hover:-translate-y-1.5 group-hover:border-primary/40 group-hover:shadow-md"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Background Card Image Asset */}
                    <div className="absolute inset-0 z-0 transition-transform duration-500 ease-out group-hover:scale-105">
                      <Image
                        src={
                          neighborhood.cover_photo ||
                          "/images/Brackendale-Drone.jpg"
                        }
                        alt={rawName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        priority={index < 3}
                      />
                      {/* Naturalistic Overlay Vignette: Fades into the base background hue */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                    </div>

                    {/* Operational Metrics Badge utilizing your Cedar accent color and backdrop filtering */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide backdrop-blur-md bg-card/80 text-accent border border-border shadow-sm">
                        <span className="font-bold text-sm font-display">
                          {targetCount}
                        </span>{" "}
                        Active Listings
                      </span>
                    </div>

                    {/* Text Information Blocks aligned over bottom half gradient area */}
                    <div className="absolute inset-x-0 bottom-0 p-6 z-10 flex flex-col justify-end h-3/5">
                      <h3 className="text-2xl font-bold tracking-tight text-foreground mb-1.5 group-hover:text-primary transition-colors duration-300 font-display">
                        {rawName}
                      </h3>

                      <p
                        className={`text-sm text-muted-foreground line-clamp-2 transition-all duration-300 ease-out ${
                          hoveredIndex === index
                            ? "text-foreground opacity-100"
                            : "opacity-90"
                        }`}
                      >
                        {neighborhood.primary_description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>

        {/* Pagination Toolbar built using standard secondary colors & custom borders */}
        <div className="max-w-7xl mx-auto flex items-center justify-center mt-12 gap-4">
          {currentPage > 1 && (
            <button
              onClick={handlePrevPage}
              className="flex items-center px-5 py-2.5 bg-card border border-border text-sm font-semibold rounded-md text-muted-foreground hover:text-primary-foreground hover:bg-primary hover:border-primary transition duration-200 shadow-sm"
            >
              <ChevronLeft className="mr-2 text-xs" />
              Previous
            </button>
          )}

          {neighborhoods && neighborhoods.length > endIdx && (
            <button
              onClick={handleNextPage}
              className="flex items-center px-5 py-2.5 bg-card border border-border text-sm font-semibold rounded-md text-muted-foreground hover:text-primary-foreground hover:bg-primary hover:border-primary transition duration-200 shadow-sm"
            >
              Next
              <ChevronRight className="ml-2 text-xs" />
            </button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
