import AboutUs from "@/components/AboutUs";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Squamish Real Estate",
  description:
    "About Squamish Real Estate, the real estate market in Squamish, British Columbia.",
  alternates: {
    canonical: "https://squamish.realestate/about-us",
  },
};

export default function AboutUsPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <AboutUs />
    </div>
  );
}
