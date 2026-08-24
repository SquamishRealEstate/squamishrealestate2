import Contact from "@/components/Contact";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Squamish Real Estate",
  description:
    "Contact Squamish Real Estate, the real estate market in Squamish, British Columbia.",
  alternates: {
    canonical: "https://squamish.realestate/contact",
  },
};

export default function Page() {
  return <Contact />;
}
