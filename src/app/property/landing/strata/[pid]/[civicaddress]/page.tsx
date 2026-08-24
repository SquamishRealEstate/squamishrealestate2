import { PropertyDetailPage } from "@/components/Property";

import type { Metadata } from "next";

type Props = {
  params: Promise<{ pid: string; civicaddress: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pid, civicaddress } = await params;
  return {
    alternates: {
      canonical: `https://squamish.realestate/property/landing/strata/${pid}/${civicaddress}`,
    },
  };
}

export default function Page() {
  return <PropertyDetailPage type="strata" />;
}
