import Neighborhoods from "@/components/Neighborhoods";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neighborhoods | Squamish Real Estate",
  description:
    "Neighborhoods for Squamish Real Estate, the real estate market in Squamish, British Columbia.",
  alternates: {
    canonical: "https://squamish.realestate/neighborhoods",
  },
};

export default function LoginPage() {
  return <Neighborhoods />;
}
