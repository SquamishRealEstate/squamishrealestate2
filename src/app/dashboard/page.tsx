import Dashboard from "@/components/dashboard";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Squamish Real Estate",
  description:
    "Dashboard for Squamish Real Estate, the real estate market in Squamish, British Columbia.",
  alternates: {
    canonical: "https://squamish.realestate/dashboard",
  },
};

export default function Page() {
  return <Dashboard />;
}
