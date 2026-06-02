import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { mockListings } from "@/lib/mockData";
import Reels from "@/components/Reels";
import FeaturedProperties from "@/components/FeaturedProperties";
import CollapsibleMap from "@/components/Map/collapsibleMap";
import LazySection from "@/components/LazySection";
import Footer from "@/components/Footer";
import Blogs from "@/components/Blogs";
import { HomeListingsSection } from "@/components/HomeListingsSection";
import { AuthGuard } from "../Auth/authGuard";
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <LazySection>
        <AuthGuard renderPrivate={false}>
          {(user, loginUI) => <HomeListingsSection user={user} />}
        </AuthGuard>
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
