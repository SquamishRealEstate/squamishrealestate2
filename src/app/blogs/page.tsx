import { AllBlogs } from "@/components/Blogs/allBlogs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real Estate Blog | Squamish Real Estate",
  description:
    "Read the latest news and insights about the Squamish real estate market.",
  alternates: {
    canonical: "https://squamish.realestate/blogs",
  },
};

export default function Page() {
  return <AllBlogs />;
}
