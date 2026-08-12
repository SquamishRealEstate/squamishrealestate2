"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/config/supabaseClient";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { fixCivicAddress } from "@/lib/utils";

const SLOTS = [
  { id: 1, label: "Detached Slot 1", type: "detached" },
  { id: 2, label: "Detached Slot 2", type: "detached" },
  { id: 3, label: "Detached Slot 3", type: "detached" },
  { id: 4, label: "Townhouse 1", type: "townhouse" },
  { id: 5, label: "Townhouse 2", type: "townhouse" },
  { id: 6, label: "Apartment 1", type: "apartment" },
];

export default function FeaturedManager() {
  const [results, setResults] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);

  const fetchFeatured = async () => {
    const { data, error } = await supabase
      .from("all_listings")
      .select(
        "pid, civic_address, featured_position, property_category, dwell_type, zone_desc, legal_detail",
      )
      .gt("featured_position", 0) // Only get items 1-6
      .order("featured_position", { ascending: true });

    if (error) console.error("Fetch Error:", error);

    // const processedData = (data || []).map((listing) => {
    //   return fixCivicAddress(listing, listing.property_category);
    // });

    setFeatured(data || []);
  };

  useEffect(() => {
    fetchFeatured();
  }, []);

  const handleSearch = async (query: string) => {
    if (query.length < 2) return;
    const { data } = await supabase
      .from("all_listings")
      .select(
        "pid, civic_address, property_category, dwell_type, zone_desc, legal_detail",
      )
      .ilike("civic_address", `%${query}%`)
      .limit(10);

    setResults(data || []);
  };

  const assignSlot = async (pid: string, slotId: number, category: string) => {
    const tableName =
      category === "detached" ? "detached_listings" : "strata_listings";

    // Use 0 to clear the position, as your schema defines it as smallint
    await Promise.all([
      supabase
        .from("detached_listings")
        .update({ featured_position: 0 })
        .eq("featured_position", slotId),
      supabase
        .from("strata_listings")
        .update({ featured_position: 0 })
        .eq("featured_position", slotId),
    ]);

    const { error } = await supabase
      .from(tableName)
      .update({ featured_position: slotId })
      .eq("pid", pid);

    if (error) console.error("Update failed:", error);
    else fetchFeatured();
  };
  const clearSlot = async (slotId: number) => {
    // We need to know which table to target,
    // or just run an update on all tables involved in featured logic
    await Promise.all([
      supabase
        .from("detached_listings")
        .update({ featured_position: null })
        .eq("featured_position", slotId),
      supabase
        .from("strata_listings")
        .update({ featured_position: null })
        .eq("featured_position", slotId),
    ]);
    fetchFeatured();
  };

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      {/* SLOT OVERVIEW - Improved Layout */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          Featured Slots Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SLOTS.map((slot) => {
            const occupant = featured.find(
              (f) => f.featured_position === slot.id,
            );
            return (
              <div
                key={slot.id}
                className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {slot.label}
                  </p>
                  {occupant && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-400 hover:text-red-500"
                      onClick={() => clearSlot(slot.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
                {occupant ? (
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {occupant.civic_address}
                  </p>
                ) : (
                  <p className="text-sm text-slate-300 italic">Empty Slot</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          Assign Property
        </h3>
        <Input
          placeholder="Search by civic address..."
          className="mb-4 max-w-md"
          onChange={(e) => {
            handleSearch(e.target.value);
          }}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Helper to filter slots */}
          {/* (Place this or inline it inside your component) */}
          {results.length > 0 ? (
            <>
              {/* 📱 MOBILE VIEW: Compact Stacked Cards (Hidden on md+) */}
              <div className="divide-y divide-slate-100 md:hidden">
                {results.map((prop) => {
                  const availableSlots = SLOTS.filter((s) => {
                    if (s.type === "detached")
                      return prop.property_category === "detached";
                    if (s.type === "townhouse")
                      return prop.dwell_type === "Townhouse";
                    if (s.type === "apartment")
                      return prop.dwell_type === "Apartment/Condo";
                    return false;
                  });

                  return (
                    <div
                      key={prop.pid}
                      className="p-4 space-y-3 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          Address
                        </span>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                          {prop.civic_address}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Available Slots
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {availableSlots.length > 0 ? (
                            availableSlots.map((slot) => (
                              <Button
                                key={slot.id}
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 px-2.5"
                                onClick={() =>
                                  assignSlot(
                                    prop.pid,
                                    slot.id,
                                    prop.property_category,
                                  )
                                }
                              >
                                Slot {slot.id}
                              </Button>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              No slots available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 🖥️ DESKTOP VIEW: Full Table (Hidden on mobile) */}
              <table className="w-full text-left hidden md:table">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Address
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 text-right">
                      Available Slots
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((prop) => {
                    const availableSlots = SLOTS.filter((s) => {
                      if (s.type === "detached")
                        return prop.property_category === "detached";
                      if (s.type === "townhouse")
                        return prop.dwell_type === "Townhouse";
                      if (s.type === "apartment")
                        return prop.dwell_type === "Apartment/Condo";
                      return false;
                    });

                    return (
                      <tr
                        key={prop.pid}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {prop.civic_address}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end flex-wrap gap-2">
                            {availableSlots.map((slot) => (
                              <Button
                                key={slot.id}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() =>
                                  assignSlot(
                                    prop.pid,
                                    slot.id,
                                    prop.property_category,
                                  )
                                }
                              >
                                Slot {slot.id}
                              </Button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          ) : (
            /* Empty State (Shared for both Mobile and Desktop) */
            <div className="px-6 py-8 text-center text-slate-400 text-sm">
              Use the search to find properties
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
