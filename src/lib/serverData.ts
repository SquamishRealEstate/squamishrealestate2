// Server-side data fetchers (safe to call from Server Components,
// generateMetadata, and sitemap.ts). Uses the anon key — only expose
// data that is already public on the site.
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey);
}

// cache() dedupes these calls within a single request, so generateMetadata
// and the page component share one database round-trip.
export const getBlogBySlug = cache(async function getBlogBySlug(
  slug: string,
) {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  // 1. Try the slug column first
  const { data: bySlug } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (bySlug) return bySlug;

  // 2. Fallback: match a title-derived slug (mirrors the client logic)
  const { data: allBlogs } = await supabase.from("blogs").select("*");

  if (!allBlogs) return null;

  return (
    allBlogs.find(
      (b: any) => b.title?.toLowerCase().replace(/\s+/g, "-") === slug,
    ) || null
  );
});

export const getNeighborhoodBySlug = cache(async function getNeighborhoodBySlug(
  slug: string,
) {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const { data } = await supabase.from("neighbourhoods").select("*");

  if (!data) return null;

  const formatString = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return data.find((item: any) => formatString(item.name) === slug) || null;
});

export const getListingByPid = cache(async function getListingByPid(
  type: string,
  pid: string,
) {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const table = `${type}_listings`;

  const { data } = await supabase
    .from(table)
    .select("*")
    .eq("pid", pid)
    .maybeSingle();

  return data || null;
});

export const getPropertyByPid = cache(async function getPropertyByPid(
  type: string,
  pid: string,
) {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const table = type === "strata" ? "strata" : "parcels";

  const { data } = await supabase
    .from(table)
    .select("*")
    .eq("pid", pid)
    .maybeSingle();

  return data || null;
});

/**
 * First page of active listings for the /properties view, matching the
 * anonymous-visitor query the client would run (Active only, newest
 * listing_date first, 16 per page).
 */
export const getInitialListings = cache(async function getInitialListings(
  limit = 16,
) {
  const supabase = getServerSupabase();
  if (!supabase) return { listings: [] as any[], total: 0 };

  const { data, count } = await supabase
    .from("all_listings")
    .select("*", { count: "exact" })
    .in("market_status", ["Active"])
    .order("listing_date", { ascending: false })
    .range(0, limit - 1);

  return { listings: data || [], total: count ?? 0 };
});

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
