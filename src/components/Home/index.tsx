import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Reels from "@/components/Reels";
import FeaturedProperties from "@/components/FeaturedProperties";
import CollapsibleMap from "@/components/Map/collapsibleMap";
import LazySection from "@/components/LazySection";
import Footer from "@/components/Footer";
import Blogs from "@/components/Blogs";
import HomeListingsGate from "@/components/Home/HomeListingsGate";
import GoogleOneTap from "@/components/Login/googleOneTap";
export default function Home({ latestBlogs = [] }: { latestBlogs?: any[] }) {
  return (
    <>
      <Navbar />
      <GoogleOneTap />
      <Hero />
      <LazySection>
        <HomeListingsGate />
      </LazySection>

      <LazySection defer>
        <Reels />
      </LazySection>

      <LazySection>
        <FeaturedProperties />
      </LazySection>

      <LazySection>
        <Blogs initialBlogs={latestBlogs} />
      </LazySection>

      <Footer />

      <CollapsibleMap />
    </>
  );
}
