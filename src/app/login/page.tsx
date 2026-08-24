import Login from "@/components/Login";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Squamish Real Estate",
  description:
    "Login for Squamish Real Estate, the real estate market in Squamish, British Columbia.",
  alternates: {
    canonical: "https://squamish.realestate/login",
  },
};

export default function LoginPage() {
  return <Login />;
}
