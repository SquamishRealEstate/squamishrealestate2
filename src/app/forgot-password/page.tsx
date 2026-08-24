import ForgotPassword from "@/components/Login/forgotPassword";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Squamish Real Estate",
  description:
    "Forgot Password for Squamish Real Estate, the real estate market in Squamish, British Columbia.",
  alternates: {
    canonical: "https://squamish.realestate/forgot-password",
  },
};

export default function ForgetPasswordPage() {
  return <ForgotPassword />;
}
