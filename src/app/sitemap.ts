import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

// Revalidate the sitemap automatically every 24 hours (86,400 seconds)
export const revalidate = 86400;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://squamish.realestate";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key in environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatPid(pid: string) {
  const digits = pid.replace(/[^0-9]/g, "");

  return digits.replace(/(\d{3})(\d{3})(\d{3})/, "$1-$2-$3");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  // Static pages
  urls.push(
    {
      url: SITE_URL,
      priority: 1,
      changeFrequency: "daily",
    },
    {
      url: `${SITE_URL}/about-us`,
      priority: 0.5,
      changeFrequency: "monthly",
    },
    {
      url: `${SITE_URL}/contact`,
      priority: 0.5,
      changeFrequency: "monthly",
    },
    {
      url: `${SITE_URL}/login`,
      priority: 0.2,
      changeFrequency: "monthly",
    },
    {
      url: `${SITE_URL}/register`,
      priority: 0.2,
      changeFrequency: "monthly",
    },
    {
      url: `${SITE_URL}/blogs`,
      priority: 0.7,
      changeFrequency: "weekly",
    },
    {
      url: `${SITE_URL}/neighborhoods`,
      priority: 0.8,
      changeFrequency: "weekly",
    },
    {
      url: `${SITE_URL}/properties`,
      priority: 0.8,
      changeFrequency: "weekly",
    },
  );

  // ALL LISTINGS
  // LISTINGS
  let allListings: any[] = [];
  let listing_page = 0;
  const listing_pageSize = 1000;
  let listing_hasMore = true;

  // 1. Fetch all listings in batches of 1,000
  while (listing_hasMore) {
    const { data: listings, error: listingsError } = await supabase
      .from("all_listings")
      .select("pid, property_category, civic_address")
      .range(
        listing_page * listing_pageSize,
        (listing_page + 1) * listing_pageSize - 1,
      );

    if (listingsError) {
      console.error("Sitemap listings error:", listingsError);
      break;
    }

    if (listings && listings.length > 0) {
      allListings = allListings.concat(listings);
      if (listings.length < listing_pageSize) {
        listing_hasMore = false;
      } else {
        listing_page++;
      }
    } else {
      listing_hasMore = false;
    }
  }

  // 2. Process all fetched listings
  for (const listing of allListings) {
    if (!listing.property_category || !listing.civic_address) {
      continue;
    }

    // Fallback to id (or mls_number if available) if pid is null or empty
    const rawIdentifier = listing.pid || listing.id;
    if (!rawIdentifier) {
      continue;
    }

    const propertyType = slugify(String(listing.property_category));
    const pid = formatPid(String(rawIdentifier));
    const civicAddress = slugify(String(listing.civic_address));

    urls.push({
      url: `${SITE_URL}/listing/landing/${propertyType}/${pid}/${civicAddress}`,
      changeFrequency: "daily",
      priority: 1,
    });
  }

  // PROPERTIES
  let allProperties: any[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  // 1. Fetch all rows in batches to bypass the Supabase 1000-row limit
  while (hasMore) {
    const { data: properties, error: propertiesError } = await supabase
      .from("off_market_properties")
      .select("pid, property_category, civic_address")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (propertiesError) {
      console.error("Sitemap properties error:", propertiesError);
      break;
    }

    if (properties && properties.length > 0) {
      allProperties = allProperties.concat(properties);
      if (properties.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  for (const property of allProperties) {
    // Check required fields (civic_address & property_category must exist)
    if (!property.property_category || !property.civic_address) {
      continue;
    }

    // Fallback to gis_id or id if pid is missing/null
    const rawIdentifier = property.pid;
    if (!rawIdentifier) {
      continue;
    }

    let propertyType;
    if (property.property_category === "parcel") {
      propertyType = "detached";
    } else {
      propertyType = "strata";
    }

    const pid = formatPid(String(rawIdentifier));
    const civicAddress = slugify(String(property.civic_address));

    urls.push({
      url: `${SITE_URL}/property/landing/${propertyType}/${pid}/${civicAddress}`,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }
  // BLOGS
  const { data: blogs, error: blogsError } = await supabase
    .from("blogs")
    .select("slug, created_at");

  if (blogsError) {
    console.error("Sitemap blogs error:", blogsError);
  }

  for (const blog of blogs ?? []) {
    if (!blog.slug) continue;

    urls.push({
      url: `${SITE_URL}/blog/${slugify(String(blog.slug))}`,
      lastModified: blog.created_at ? new Date(blog.created_at) : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // NEIGHBORHOODS
  const { data: neighbourhoods, error: neighbourhoodsError } = await supabase
    .from("neighbourhoods")
    .select("name");

  if (neighbourhoodsError) {
    console.error("Sitemap neighbourhoods error:", neighbourhoodsError);
  }

  for (const neighbourhood of neighbourhoods ?? []) {
    if (!neighbourhood.name) continue;

    urls.push({
      url: `${SITE_URL}/neighborhoods/${slugify(String(neighbourhood.name))}`,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  return urls;
}
