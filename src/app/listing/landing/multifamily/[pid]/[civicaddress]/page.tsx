import { ListingDetailPage } from "@/components/Listing";

import type { Metadata } from "next";

type Props = {
  params: { pid: string; civicaddress: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pid, civicaddress } = await params;
  return {
    alternates: {
      canonical: `https://squamish.realestate/listing/landing/multifamily/${pid}/${civicaddress}`,
    },
  };
}

export default function Page() {
  return <ListingDetailPage type="multifamily" />;
}
