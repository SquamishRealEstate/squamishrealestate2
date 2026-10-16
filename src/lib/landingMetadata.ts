import type { Metadata } from "next";
import { getListingByPid, getPropertyByPid } from "@/lib/serverData";

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
}): Promise<{ metadata: Metadata; record: any | null }> {
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
      metadata: {
        title: `${address} | Squamish Real Estate`,
        alternates: { canonical },
      },
    };
  }

  const beds = record.bedrooms ? `${record.bedrooms} bd` : null;
  const baths = record.bathrooms ? `${record.bathrooms} ba` : null;
  const specs = [beds, baths].filter(Boolean).join(" ");
  const propertyKind =
    kind === "listing"
      ? record.dwell_type || type
      : type === "strata"
        ? "strata property"
        : "detached home";
  const status = record.market_status ? `${record.market_status}.` : "";
  const price = formatPrice(record.asking_price);
  const mls = pid ? `MLS® ${pid}.` : "";

  const title = `${address} | Squamish Real Estate`;

  const description =
    [
      specs && `${specs} ${propertyKind}`,
      `at ${address} in Squamish, BC.`,
      status,
      price && `Listed at ${price}.`,
      mls,
      "Photos, price history and showings with Sean Brawley PREC*.",
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 300) || `${address} — Squamish, BC real estate.`;

  const ogImage = firstPhoto(record.photos);

  return {
    record,
    metadata: {
      title,
      description,
      alternates: { canonical },
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
