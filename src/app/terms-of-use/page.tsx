import { TermsOfUse } from "@/components/CompanyDocuments/termsOfUse";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Squamish Real Estate",
  description: "Terms of Use for Squamish Real Estate",
  alternates: {
    canonical: "https://squamish.realestate/terms-of-use",
  },
};

export default function TermsOfUsePage() {
  return <TermsOfUse />;
}
