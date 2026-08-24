import Register from "@/components/Register";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Squamish Real Estate",
  description:
    "Register for Squamish Real Estate, the real estate market in Squamish, British Columbia.",
  alternates: {
    canonical: "https://squamish.realestate/register",
  },
};

export default function RegisterPage() {
  return <Register />;
}
