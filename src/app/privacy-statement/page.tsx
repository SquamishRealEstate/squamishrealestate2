import { PrivacyStatement } from "@/components/CompanyDocuments/privacyStatement";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Statement | Squamish Real Estate",
  description: "Privacy Statement for Squamish Real Estate",
  alternates: {
    canonical: "https://squamish.realestate/privacy-statement",
  },
};

export default function PrivacyStatementPage() {
  return <PrivacyStatement />;
}
