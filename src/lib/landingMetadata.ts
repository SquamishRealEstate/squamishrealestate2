import type { Metadata } from "next";
import { getListingByPid, getPropertyByPid } from "@/lib/serverData";
import { isProtectedListingStatus } from "@/lib/listingAccess";

function formatAddressFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatPrice(value: any) {
  const num = Number(value);
  if (!value || isNaN(num) || num <= 0) return null;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatNumber(value: any): string | null {
  const num = Number(value);
  if (!value || isNaN(num) || num <= 0) return null;
  return num.toLocaleString("en-US");
}

/** Positive number or undefined (for structured data fields) */
function num(value: any): number | undefined {
  const n = Number(value);
  return value != null && !isNaN(n) && n > 0 ? n : undefined;
}

function firstPhoto(photos: any): string | undefined {
  if (!photos) return undefined;
  try {
    const parsed = typeof photos === "string" ? JSON.parse(photos) : photos;
    const first = Array.isArray(parsed) ? parsed[0] : null;
    if (!first) return undefined;
    if (typeof first === "string") return first;
    return first.S || first.L || first.url || first.link || undefined;
  } catch {
    return undefined;
  }
}

/** "built 13 years ago" / "built 1 year ago" / "built this year" — null when unknown */
function agePhrase(yearValue: any): string | null {
  const year = Number(yearValue);
  if (!yearValue || isNaN(year) || year < 1800) return null;
  const age = new Date().getFullYear() - year;
  if (age < 0) return null;
  if (age === 0) return "built this year";
  if (age === 1) return "built 1 year ago";
  return `built ${age} years ago`;
}

/** "a" or "an" depending on the following word */
function article(phrase: string): string {
  return /^[aeiou8]/i.test(phrase) || /^(11|18|8)\d*/.test(phrase)
    ? "an"
    : "a";
}

/** Normalizes dwell_type into reader-friendly wording */
function friendlyPropertyKind(dwellType: any, fallback: string): string {
  const raw = String(dwellType || "").toLowerCase();
  if (!raw) return fallback;
  if (raw.includes("town")) return "townhome";
  if (raw.includes("apartment") || raw.includes("condo")) return "condo";
  if (raw.includes("duplex")) return "duplex";
  if (raw.includes("manufactured") || raw.includes("mobile"))
    return "manufactured home";
  if (raw.includes("single") || raw.includes("house") || raw.includes("detach"))
    return "detached home";
  if (raw.includes("land") || raw.includes("lot")) return "property";
  return fallback;
}

/** "3 bedrooms" / "1 bedroom" — null when missing or zero */
function bedsPhrase(value: any): string | null {
  const n = Number(value);
  if (!value || isNaN(n) || n <= 0) return null;
  return n === 1 ? "1 bedroom" : `${n} bedrooms`;
}

/** "2.5 bathrooms" / "1 bathroom" — handles full+half splits or a single total */
function bathsPhrase(record: any, kind: "listing" | "property"): string | null {
  let total: number;
  if (kind === "listing") {
    const full = Number(record.full_baths) || 0;
    const half = Number(record.half_baths) || 0;
    total =
      full + half * 0.5 > 0 ? full + half * 0.5 : Number(record.bathrooms) || 0;
  } else {
    total = Number(record.bathrooms) || 0;
  }
  if (total <= 0) return null;
  return total === 1 ? "1 bathroom" : `${total} bathrooms`;
}

/** Total bathrooms as a number for structured data */
function bathsTotal(record: any, kind: "listing" | "property"): number | undefined {
  if (kind === "listing") {
    const full = Number(record.full_baths) || 0;
    const half = Number(record.half_baths) || 0;
    const total = full + half * 0.5;
    return total > 0 ? total : num(record.bathrooms);
  }
  return num(record.bathrooms);
}

/**
 * Builds schema.org JSON-LD structured data for a landing page.
 * Listings become RealEstateListing (with Offer + MLS identifier);
 * property pages become SingleFamilyResidence / Apartment.
 */
function buildJsonLd({
  kind,
  type,
  record,
  address,
  canonical,
  title,
  description,
  ogImage,
}: {
  kind: "listing" | "property";
  type: string;
  record: any;
  address: string;
  canonical: string;
  title: string;
  description: string;
  ogImage?: string;
}) {
  const residenceType =
    type === "strata"
      ? "Apartment"
      : type === "land"
        ? "Residence"
        : "SingleFamilyResidence";

  const bedrooms = num(record.bedrooms);
  const bathrooms = bathsTotal(record, kind);
  const floorArea = num(
    kind === "listing" ? record.total_floor_area : record.floor_area,
  );
  const lat = num(record.latitude);
  const lng = num(record.longitude);

  const residence: any = {
    "@type": residenceType,
    name: address,
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: "Squamish",
      addressRegion: "BC",
      addressCountry: "CA",
      ...(record.postal_code ? { postalCode: record.postal_code } : {}),
    },
    ...(bedrooms ? { numberOfBedrooms: bedrooms } : {}),
    ...(bathrooms ? { numberOfBathroomsTotal: bathrooms } : {}),
    ...(floorArea
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: floorArea,
            unitCode: "FTK", // square feet
          },
        }
      : {}),
    ...(lat && lng
      ? { geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng } }
      : {}),
  };

  if (kind === "property") {
    return {
      "@context": "https://schema.org",
      ...residence,
      description,
      url: canonical,
      ...(ogImage ? { image: ogImage } : {}),
    };
  }

  const price = num(record.asking_price);

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: title,
    description,
    url: canonical,
    ...(ogImage ? { image: ogImage } : {}),
    ...(record.listing_date ? { datePosted: record.listing_date } : {}),
    ...(record.mls_number
      ? {
          identifier: {
            "@type": "PropertyValue",
            name: "MLS",
            value: record.mls_number,
          },
        }
      : {}),
    about: residence,
    ...(price
      ? {
          offers: {
            "@type": "Offer",
            price,
            priceCurrency: "CAD",
            availability: "https://schema.org/InStock",
            url: canonical,
          },
        }
      : {}),
  };
}

/**
 * Builds unique, crawlable metadata for listing/property landing pages.
 * Fetches the record server-side so title/description reflect real data
 * instead of inheriting the homepage defaults.
 */
export async function buildLandingMetadata({
  kind,
  type,
  pid,
  civicaddress,
}: {
  kind: "listing" | "property";
  type: string;
  pid: string;
  civicaddress: string;
}): Promise<{
  metadata: Metadata;
  record: any | null;
  jsonLd: any | null;
  description: string | null;
}> {
  const record =
    kind === "listing"
      ? await getListingByPid(type, pid)
      : await getPropertyByPid(type, pid);

  const basePath =
    kind === "listing"
      ? `listing/landing/${type}`
      : `property/landing/${type === "strata" ? "strata" : "detached"}`;

  const canonical = `https://squamish.realestate/${basePath}/${pid}/${civicaddress}`;

  const address =
    record?.civic_address || formatAddressFromSlug(civicaddress);

  if (!record) {
    return {
      record: null,
      jsonLd: null,
      description: null,
      metadata: {
        title: `${address} | Squamish Real Estate`,
        alternates: { canonical },
      },
    };
  }

  const propertyKind =
    kind === "listing"
      ? friendlyPropertyKind(record.dwell_type, type === "land" ? "property" : "home")
      : type === "strata"
        ? "strata property"
        : "detached home";

  // --- Sentence 1: what + where + age + neighbourhood + school ---
  const s1Parts: string[] = [];
  const age = agePhrase(
    kind === "listing" ? record.year_built : record.year_constructed,
  );
  if (age) s1Parts.push(age);
  if (record.neighbourhood) s1Parts.push(`in ${record.neighbourhood}`);
  if (record.elementary_school)
    s1Parts.push(`near ${record.elementary_school}`);

  const sentence1 =
    `This ${propertyKind} at ${address}` +
    (s1Parts.length > 0 ? ` was ${s1Parts.join(" ")}` : "") +
    ".";

  // --- Sentence 2: beds / baths / floor area / lot size ---
  const beds = bedsPhrase(record.bedrooms);
  const baths = bathsPhrase(record, kind);
  const floorArea = formatNumber(
    kind === "listing" ? record.total_floor_area : record.floor_area,
  );
  const lotSize = formatNumber(record.lot_size);

  const specs = [beds, baths].filter(Boolean).join(" and ");
  let sentence2 = "";
  if (specs && floorArea && lotSize) {
    sentence2 = `It has ${specs} within ${floorArea} sf of living space on ${article(`${lotSize} sf`)} ${lotSize} sf property.`;
  } else if (specs && floorArea) {
    sentence2 = `It has ${specs} within ${floorArea} sf of living space.`;
  } else if (specs && lotSize) {
    sentence2 = `It has ${specs} on ${article(`${lotSize} sf`)} ${lotSize} sf property.`;
  } else if (lotSize) {
    sentence2 = `The property is ${lotSize} sf.`;
  } else if (specs) {
    sentence2 = `It has ${specs}.`;
  }

  // --- Sentence 3 (listings only): status / price / MLS ---
  const status = record.market_status ? `${record.market_status}.` : "";
  const price = formatPrice(record.asking_price);
  // Use the real MLS® number (e.g. R3182561) — pid is an assessment ID, not MLS
  const mls = record.mls_number ? `MLS® ${record.mls_number}.` : "";
  const sentence3 =
    kind === "listing"
      ? [status, price && `Listed at ${price}.`, mls].filter(Boolean).join(" ")
      : "";

  const cta = "Photos, price history and showings with Sean Brawley PREC*.";

  const description =
    [sentence1, sentence2, sentence3, cta].filter(Boolean).join(" ").slice(0, 300) ||
    `${address} — Squamish, BC real estate.`;

  const title = `${address} | Squamish Real Estate`;
  const ogImage = firstPhoto(record.photos);
  const isProtectedListing =
    kind === "listing" && isProtectedListingStatus(record.market_status);

  const jsonLd = buildJsonLd({
    kind,
    type,
    record,
    address,
    canonical,
    title,
    description,
    ogImage,
  });

  return {
    record,
    jsonLd,
    description,
    metadata: {
      title,
      description,
      alternates: { canonical },
      robots: isProtectedListing
        ? { index: false, follow: false }
        : undefined,
      openGraph: {
        type: "website",
        url: canonical,
        title,
        description,
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
    },
  };
}
