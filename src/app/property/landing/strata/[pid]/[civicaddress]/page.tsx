import { PropertyDetailPage } from "@/components/Property";
import type { Metadata } from "next";
import { buildLandingMetadata } from "@/lib/landingMetadata";

type Props = {
  params: Promise<{ pid: string; civicaddress: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pid, civicaddress } = await params;
  const { metadata } = await buildLandingMetadata({
    kind: "property",
    type: "strata",
    pid,
    civicaddress,
  });
  return metadata;
}

export default async function Page({ params }: Props) {
  const { pid, civicaddress } = await params;
  const { record } = await buildLandingMetadata({
    kind: "property",
    type: "strata",
    pid,
    civicaddress,
  });

  return <PropertyDetailPage type="strata" initialProperty={record} />;
}
