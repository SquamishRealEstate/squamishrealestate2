import UpdatePassword from "@/components/Login/updatePassword";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Update Password | Squamish Real Estate",
  description:
    "Update Password for Squamish Real Estate, the real estate market in Squamish, British Columbia.",
  alternates: {
    canonical: "https://squamish.realestate/update-password",
  },
};

export default function UpdatePasswordPage() {
  return <UpdatePassword />;
}
