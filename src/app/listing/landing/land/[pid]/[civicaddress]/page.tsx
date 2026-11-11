import { ListingDetailPage } from "@/components/Listing";
import type { Metadata } from "next";
import { buildLandingMetadata } from "@/lib/landingMetadata";

type Props = {
  params: Promise<{ pid: string; civicaddress: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pid, civicaddress } = await params;
  const { metadata } = await buildLandingMetadata({
    kind: "listing",
    type: "land",
    pid,
    civicaddress,
  });
  return metadata;
}

export default async function Page({ params }: Props) {
  const { pid, civicaddress } = await params;
  const { record, jsonLd } = await buildLandingMetadata({
    kind: "listing",
    type: "land",
    pid,
    civicaddress,
  });

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ListingDetailPage type="land" initialListing={record} />
    </>
  );
}
