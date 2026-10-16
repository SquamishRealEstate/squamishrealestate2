import { Neighborhood } from "@/components/Neighborhood";
import type { Metadata } from "next";
import { getNeighborhoodBySlug } from "@/lib/serverData";

type Props = {
  params: Promise<{ neighborhoodname: string }>;
};

export const revalidate = 3600; // re-check neighborhood data hourly

function formatName(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { neighborhoodname } = await params;
  const neighborhood = await getNeighborhoodBySlug(
    neighborhoodname.toLowerCase(),
  );

  const name = neighborhood?.name || formatName(neighborhoodname);
  const title = `${name} Homes for Sale & Neighborhood Guide | Squamish Real Estate`;
  const description = `Explore ${name}, Squamish BC: homes for sale, price trends, property types, and local insights with Squamish real estate agent Sean Brawley.`;
  const canonical = `https://squamish.realestate/neighborhoods/${neighborhoodname}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
    },
  };
}

export default async function NeighborhoodPage({ params }: Props) {
  const { neighborhoodname } = await params;
  const neighborhood = await getNeighborhoodBySlug(
    neighborhoodname.toLowerCase(),
  );

  return <Neighborhood initialNeighborhood={neighborhood} />;
}
