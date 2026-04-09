"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/config/supabaseClient";
import {
  Search,
  Star,
  Home,
  Building2,
  Loader2,
  MapPin,
  Hash,
  Sparkles,
  Mountain,
  ArrowUpRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FeaturedManager() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchInitialFeatured = async () => {
    setLoading(true);
    const [parcelsRes, strataRes] = await Promise.all([
      supabase
        .from("parcels")
        .select("pid, civic_address, neighbourhood, is_featured")
        .eq("is_featured", true),
      supabase
        .from("strata")
        .select("pid, civic_address, neighbourhood, is_featured")
        .eq("is_featured", true),
    ]);

    const combined = [
      ...(parcelsRes.data || []).map((p) => ({ ...p, table: "parcels" })),
      ...(strataRes.data || []).map((s) => ({ ...s, table: "strata" })),
    ];

    setResults(combined);
    setLoading(false);
    setIsInitialLoad(false);
  };

  useEffect(() => {
    fetchInitialFeatured();
  }, []);

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      fetchInitialFeatured();
      return;
    }
    setLoading(true);

    const [parcelsRes, strataRes] = await Promise.all([
      supabase
        .from("parcels")
        .select("pid, civic_address, neighbourhood, is_featured")
        .ilike("civic_address", `%${query}%`)
        .limit(15),
      supabase
        .from("strata")
        .select("pid, civic_address, neighbourhood, is_featured")
        .ilike("civic_address", `%${query}%`)
        .limit(15),
    ]);

    const combined = [
      ...(parcelsRes.data || []).map((p) => ({ ...p, table: "parcels" })),
      ...(strataRes.data || []).map((s) => ({ ...s, table: "strata" })),
    ];

    setResults(
      combined.sort((a, b) =>
        (a.civic_address || "").localeCompare(
          b.civic_address || "",
          undefined,
          { numeric: true },
        ),
      ),
    );
    setLoading(false);
  };

  useEffect(() => {
    if (isInitialLoad) return;
    const timer = setTimeout(() => handleSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleFeatured = async (
    pid: string,
    table: string,
    currentState: boolean,
  ) => {
    const isRemoving = currentState === true;
    if (search.length < 2 && isRemoving) {
      setResults((prev) => prev.filter((item) => item.pid !== pid));
    } else {
      setResults((prev) =>
        prev.map((item) =>
          item.pid === pid ? { ...item, is_featured: !currentState } : item,
        ),
      );
    }

    await supabase
      .from(table)
      .update({ is_featured: !currentState })
      .eq("pid", pid);
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header - Matching User Management Layout */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-display font-bold text-slate-900">
            {search.length < 2 ? "Currently Featured" : "Property Search"}
          </h3>
          <p className="text-slate-500 text-sm">
            {search.length < 2
              ? `Showcasing ${results.length} properties on the landing page.`
              : "Search the database to feature new properties."}
          </p>
        </div>
        <div className="relative w-full md:max-w-sm">
          <Input
            className="w-full bg-white shadow-sm pl-10"
            placeholder="Search civic address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          {loading && (
            <Loader2
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary"
              size={16}
            />
          )}
        </div>
      </header>

      {/* Table Card - Matching User Management Styling */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Property Details
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Neighbourhood
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && results.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center">
                    <Loader2 className="animate-spin mx-auto text-primary/30" />
                  </td>
                </tr>
              ) : results.length > 0 ? (
                results.map((prop) => (
                  <tr
                    key={prop.pid}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${prop.table === "strata" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"}`}
                        >
                          {prop.table === "strata" ? (
                            <Building2 size={18} />
                          ) : (
                            <Home size={18} />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                            {prop.civic_address}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono uppercase">
                              PID: {prop.pid}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${prop.table === "strata" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}
                            >
                              {prop.table}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-accent" />
                        {prop.neighbourhood || "Squamish"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleFeatured(prop.pid, prop.table, prop.is_featured)
                        }
                        className={`transition-all ${prop.is_featured ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50" : "text-slate-300 hover:text-primary hover:bg-slate-50"}`}
                      >
                        <Star
                          size={18}
                          fill={prop.is_featured ? "currentColor" : "none"}
                        />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-slate-400 text-sm italic font-display"
                  >
                    No properties
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
