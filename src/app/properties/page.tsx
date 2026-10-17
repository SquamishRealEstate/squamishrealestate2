import Properties from "@/components/Properties";
import type { Metadata } from "next";
import { getInitialListings } from "@/lib/serverData";

export const revalidate = 900; // refresh the server-rendered listings every 15 min

export const metadata: Metadata = {
  title: "Squamish Homes for Sale | MLS® Listings & Properties",
  description:
    "Browse every active MLS® listing in Squamish, BC: detached homes, townhouses, condos and land. Filter by price, beds, baths and neighbourhood with local agent Sean Brawley PREC*.",
  alternates: {
    canonical: "https://squamish.realestate/properties",
  },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;

  // Only serve server-fetched data for the clean /properties URL (what
  // crawlers and first-time visitors get). Filtered URLs run the normal
  // client-side fetch so results always match the active filters.
  const hasQueryParams = Object.keys(params).length > 0;

  let initialListings: any[] | undefined;
  let initialTotal: number | undefined;

  if (!hasQueryParams) {
    const { listings, total } = await getInitialListings();
    initialListings = listings;
    initialTotal = total;
  }

  // ItemList structured data so crawlers see the actual listings
  const itemListJsonLd = initialListings?.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Squamish Homes for Sale",
        url: "https://squamish.realestate/properties",
        numberOfItems: initialTotal,
        itemListElement: initialListings.slice(0, 16).map((l: any, i: number) => ({
          "@type": "ListItem",
          position: i + 1,
          name: l.civic_address || `Squamish MLS® Listing ${l.pid}`,
          url: `https://squamish.realestate/listing/landing/${String(
            l.property_category || "",
          )
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}/${String(l.pid || "").replace(
            /[^0-9]/g,
            "",
          ).replace(/(\d{3})(\d{3})(\d{3})/, "$1-$2-$3")}/${String(
            l.civic_address || "",
          )
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")}`,
        })),
      }
    : null;

  return (
    <>
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      <Properties
        initialListings={initialListings}
        initialTotal={initialTotal}
      />
    </>
  );
}
