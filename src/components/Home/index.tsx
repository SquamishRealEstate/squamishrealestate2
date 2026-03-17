import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Search from "@/components/Search";
import { mockListings } from "@/lib/mockData";
import Reels from "@/components/Reels";
import FeaturedProperties from "@/components/FeaturedProperties";
import CollapsibleMap from "@/components/Map/collapsibleMap";
import LazySection from "@/components/LazySection";
import Footer from "@/components/Footer";
import Blogs from "@/components/Blogs";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <LazySection>
        <Search />
      </LazySection>

      <LazySection>
        <Reels />
      </LazySection>

      <LazySection>
        <FeaturedProperties />
      </LazySection>

      <LazySection>
        <Blogs />
      </LazySection>

      <Footer />

      <CollapsibleMap listings={mockListings} />
    </>
  );
}
