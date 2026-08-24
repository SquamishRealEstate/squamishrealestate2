import Properties from "@/components/Properties";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Properties | Squamish Real Estate",
  description:
    "Properties for Squamish Real Estate, the real estate market in Squamish, British Columbia.",
  alternates: {
    canonical: "https://squamish.realestate/properties",
  },
};

export default function Page() {
  return <Properties />;
}
