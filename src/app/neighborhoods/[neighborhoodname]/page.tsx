import { Neighborhood } from "@/components/Neighborhood";

import type { Metadata } from "next";

type Props = {
  params: Promise<{ neighborhoodname: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { neighborhoodname } = await params;
  return {
    alternates: {
      canonical: `https://squamish.realestate/neighborhoods/${neighborhoodname}`,
    },
  };
}

export default function Page() {
  return <Neighborhood />;
}
