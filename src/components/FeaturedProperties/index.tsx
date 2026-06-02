import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { supabase } from "@/config/supabaseClient";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function FeaturedProperties() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getFeaturedProperties() {
      const finalResults = new Array(6).fill(null);
      const usedIds: string[] = [];

      // 1. Fetch ALL existing manual overrides (positions 1-6)
      const { data: manualOverrides } = await supabase
        .from("all_listings")
        .select("*")
        .gte("featured_position", 1)
        .lte("featured_position", 6);

      // 2. Map manual overrides to their positions and reserve their IDs
      manualOverrides?.forEach((item) => {
        const posIndex = item.featured_position - 1; // 0-based index
        if (posIndex >= 0 && posIndex < 6) {
          finalResults[posIndex] = item;
          usedIds.push(item.pid); // Reserve this ID so it can't be picked for fillers
        }
      });

      // 3. Helper to fetch filler
      const fetchFiller = async (filterFn: (q: any) => any) => {
        let query = supabase.from("all_listings").select("*");
        query = filterFn(query);

        // IMPORTANT: Exclude everything already manually placed
        if (usedIds.length > 0) {
          query = query.not("pid", "in", `(${usedIds.join(",")})`);
        }

        const { data } = await query
          .order("listing_date", { ascending: false })
          .limit(1)
          .single();

        return data;
      };

      // 4. Fill the gaps
      for (let i = 0; i < 6; i++) {
        if (finalResults[i]) continue; // Already filled by manual override

        let newProperty;
        if (i < 3) {
          // Slots 1-3: Detached
          newProperty = await fetchFiller((q: any) =>
            q.eq("property_category", "detached"),
          );
        } else if (i < 5) {
          // Slots 4-5: Townhouse
          newProperty = await fetchFiller((q: any) =>
            q.eq("dwell_type", "Townhouse"),
          );
        } else {
          // Slot 6: Apartment/Condo
          newProperty = await fetchFiller((q: any) =>
            q.eq("dwell_type", "Apartment/Condo"),
          );
        }

        if (newProperty) {
          finalResults[i] = newProperty;
          usedIds.push(newProperty.pid); // Reserve this new filler ID too
        }
      }

      setListings(finalResults);
      setLoading(false);
    }

    getFeaturedProperties();

    // async function fetchFeatured() {
    //   const { data, error } = await supabase
    //     .from("all_listings")
    //     .select("*")
    //     .gte("featured_position", 1)
    //     .lte("featured_position", 6)
    //     .order("featured_position", { ascending: true });

    //   if (data) setListings(data);
    //   setLoading(false);
    // }

    // fetchFeatured();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary mb-2" />
        <p className="text-[10px] uppercase tracking-widest font-bold text-secondary">
          Loading...
        </p>
      </div>
    );

  return (
    <section id="properties" className="py-20 bg-muted/20">
      <div className="container">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Featured Properties
            </h2>
            <p className="text-muted-foreground">
              Discover our handpicked selection of exceptional homes
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/properties" target="_blank" rel="noopener noreferrer">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* 2-row, 3-column grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-8">
          {listings.map((property) => (
            <ListingCard key={property.pid} listing={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
