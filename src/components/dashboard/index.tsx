"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/config/supabaseClient";
import {
  MessageSquare,
  Heart,
  Eye,
  Settings,
  User,
  ChevronRight,
  ArrowRight,
  Home,
  CheckSquare,
  CircleStar,
} from "lucide-react";
import { AuthGuard } from "../Auth/authGuard";
import Navbar from "@/components/Navbar";
import EditProfileForm from "./editProfileForm";
import Link from "next/link";
import { ReferralBalance } from "./referralBalance";
import { PaginatedList } from "./paginatedList";
import { HomeBuyingChecklist } from "./homeBuyingChecklist";
import { HomeSellerChecklist } from "./homeSellerChecklist";
import { MemberBenefits } from "./memberBenefits";

const PAGE_SIZE = 10;

export type TabDataState = {
  items: any[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  initialized: boolean;
};

export default function DashboardWrapper() {
  return (
    <AuthGuard renderPrivate={true}>
      {(user) => (user ? <DashboardContent user={user} /> : <LoginPrompt />)}
    </AuthGuard>
  );
}

function LoginPrompt() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-xl p-10 flex flex-col items-center text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/10">
          <User size={30} className="text-primary" />
        </div>

        {/* Title */}
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          Welcome Back
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Sign in to access your dashboard, manage your profile, and explore
          your account.
        </p>

        {/* Primary Button */}
        <Link
          href="/login"
          className="w-full group inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:shadow-md hover:opacity-95 transition-all active:scale-[0.98]"
        >
          Sign In
          <ArrowRight
            size={16}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </Link>

        {/* Secondary Button */}
        <Link
          href="/"
          className="w-full mt-3 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-all active:scale-[0.98]"
        >
          <Home size={16} />
          Go to Home
        </Link>

        {/* Footer */}
        <p className="mt-6 text-xs text-muted-foreground">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="text-accent font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

function DashboardContent({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("Viewed");

  const [tabState, setTabState] = useState<Record<string, TabDataState>>({
    Messages: {
      items: [],
      page: 0,
      hasMore: true,
      isLoading: false,
      initialized: false,
    },
    // Reviews: {
    //   items: [],
    //   page: 0,
    //   hasMore: true,
    //   isLoading: false,
    //   initialized: false,
    // },
    Saved: {
      items: [],
      page: 0,
      hasMore: true,
      isLoading: false,
      initialized: false,
    },
    Viewed: {
      items: [],
      page: 0,
      hasMore: true,
      isLoading: false,
      initialized: false,
    },
    // Issues: {
    //   items: [],
    //   page: 0,
    //   hasMore: true,
    //   isLoading: false,
    //   initialized: false,
    // },
    Settings: {
      items: [],
      page: 0,
      hasMore: false,
      isLoading: false,
      initialized: true,
    },
    "Home Buying Checklist": {
      items: [],
      page: 0,
      hasMore: false,
      isLoading: false,
      initialized: true,
    },
    "Sell Your Home Checklist": {
      items: [],
      page: 0,
      hasMore: false,
      isLoading: false,
      initialized: true,
    },
    "Member Benefits": {
      items: [],
      page: 0,
      hasMore: false,
      isLoading: false,
      initialized: true,
    },
  });

  const loadData = useCallback(
    async (tabName: string, pageToLoad: number) => {
      if (!user?.id) return;

      setTabState((prev) => ({
        ...prev,
        [tabName]: { ...prev[tabName], isLoading: true },
      }));

      const from = pageToLoad * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let query;

      if (tabName === "Messages") {
        query = supabase
          .from("inquiries")
          .select("*", { count: "exact" })
          .eq("email", user?.email)
          .order("created_at", { ascending: false });
      }
      // else if (tabName === "Reviews") {
      //   query = supabase
      //     .from("property_reviews")
      //     .select("*", { count: "exact" })
      //     .eq("user_id", user.id)
      //     .order("created_at", { ascending: false });
      // }
      else if (tabName === "Saved") {
        query = supabase
          .from("user_interactions")
          .select("*", { count: "exact" })
          .eq("user_id", user.id)
          .eq("interaction_type", "save")
          .order("updated_at", { ascending: false });
      } else if (tabName === "Viewed") {
        query = supabase
          .from("user_interactions")
          .select("*", { count: "exact" })
          .eq("user_id", user.id)
          .eq("interaction_type", "view")
          .order("updated_at", { ascending: false });
      }
      // else if (tabName === "Issues") {
      //   query = supabase
      //     .from("reported_issues")
      //     .select("*", { count: "exact" })
      //     .eq("user_id", user.id)
      //     .order("created_at", { ascending: false });
      // }

      if (!query) return;

      const { data, count } = await query.range(from, to);
      let items = data || [];

      if (tabName !== "Messages" && items.length > 0) {
        const pids = [...new Set(items.map((i) => i.pid).filter(Boolean))];

        if (pids.length > 0) {
          const [{ data: listings }, { data: offMarket }] = await Promise.all([
            supabase.from("all_listings").select("*").in("pid", pids),
            supabase.from("off_market_properties").select("*").in("pid", pids),
          ]);

          const properties = [...(listings || []), ...(offMarket || [])];
          const propertyMap = Object.fromEntries(
            properties.map((p) => [p.pid, p]),
          );

          items = items.map((item) => ({
            ...item,
            property: propertyMap[item.pid] || null,
          }));
        }
      }

      setTabState((prev) => {
        const existingItems = pageToLoad === 0 ? [] : prev[tabName].items;
        const newItems = [...existingItems, ...items];
        const hasMoreData =
          count !== null ? newItems.length < count : items.length === PAGE_SIZE;

        return {
          ...prev,
          [tabName]: {
            items: newItems,
            page: pageToLoad,
            hasMore: hasMoreData,
            isLoading: false,
            initialized: true,
          },
        };
      });
    },
    [user?.id],
  );

  useEffect(() => {
    const currentTab = tabState[activeTab];
    if (!currentTab.initialized && !currentTab.isLoading) {
      loadData(activeTab, 0);
    }
  }, [activeTab, loadData, tabState]);

  const handleLoadMore = () => {
    const currentTab = tabState[activeTab];
    if (!currentTab.isLoading && currentTab.hasMore) {
      loadData(activeTab, currentTab.page + 1);
    }
  };

  const tabs = [
    { name: "Viewed", icon: Eye },
    { name: "Saved", icon: Heart },
    { name: "Home Buying Checklist", icon: CheckSquare },
    { name: "Sell Your Home Checklist", icon: CheckSquare },
    { name: "Member Benefits", icon: CircleStar },
    { name: "Messages", icon: MessageSquare },
    // { name: "Reviews", icon: Star },

    // { name: "Issues", icon: AlertTriangle },
    { name: "Settings", icon: Settings }, // Add this
  ];
  const getUserInitials = (user: any) => {
    const fullName = user?.user_metadata?.full_name;
    const email = user?.email;

    if (fullName) {
      const parts = fullName.trim().split(" ").filter(Boolean);

      return parts.length === 1
        ? parts[0][0].toUpperCase()
        : (parts[0][0] + parts[1][0]).toUpperCase();
    }

    if (email) {
      return email[0].toUpperCase();
    }

    return "U";
  };

  const userInitials = getUserInitials(user);
  return (
    <div className="h-screen bg-muted/10 text-foreground font-body">
      <Navbar />
      {/* Layout Container */}
      <div className=" pt-24 pb-8 px-4 sm:px-6 h-full flex flex-col md:flex-row gap-8">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          {/* User Profile Card (Flex container adjusted for mobile responsive layout) */}
          <div className="bg-card border border-border rounded-2xl p-3 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                {userInitials}
              </div>

              {/* Text */}
              <div className="flex flex-col min-w-0">
                <h2 className="font-display font-semibold text-base text-foreground truncate">
                  {user?.user_metadata?.full_name ||
                    user?.email ||
                    "Authenticated User"}
                </h2>

                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <User size={12} /> Member since{" "}
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString(undefined, {
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Mobile Only: Credit box rendered on the extreme right */}
            <div className="block md:hidden shrink-0">
              <ReferralBalance user={user} />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all whitespace-nowrap shrink-0 group ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-card border border-transparent hover:border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon
                      size={18}
                      className={
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-primary transition-colors"
                      }
                    />
                    <span className="font-medium text-xs">{tab.name}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`hidden md:block transition-transform ${isActive ? "opacity-100" : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"}`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Desktop Only: Original Credit Balance position at the bottom */}
          <div className="hidden md:block mt-auto pt-4">
            <ReferralBalance user={user} />
          </div>
        </aside>
        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pb-10">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden min-h-full flex flex-col">
            <div className="px-6 py-5 border-b border-border bg-muted/5 sticky top-0 bg-card z-10">
              <h1 className="font-display font-bold text-lg text-foreground">
                {activeTab}
              </h1>
            </div>

            <div className="p-6">
              {activeTab === "Settings" ? (
                <EditProfileForm user={user} />
              ) : activeTab === "Home Buying Checklist" ? (
                <HomeBuyingChecklist />
              ) : activeTab === "Sell Your Home Checklist" ? (
                <HomeSellerChecklist />
              ) : activeTab === "Member Benefits" ? (
                <MemberBenefits />
              ) : (
                <PaginatedList
                  tabState={tabState[activeTab]}
                  activeTab={activeTab}
                  onLoadMore={handleLoadMore}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// const IssueItem = ({ issue }: { issue: any }) => {
//   const getStatusStyles = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case "resolved":
//         return "bg-green-500/10 text-green-600 border-green-500/20";
//       case "investigating":
//         return "bg-blue-500/10 text-blue-600 border-blue-500/20";
//       case "dismissed":
//         return "bg-muted text-muted-foreground border-border";
//       case "pending":
//       default:
//         return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
//     }
//   };

//   return (
//     <div className="border border-border rounded-xl p-4 hover:border-primary/50 transition-colors bg-background flex flex-col gap-3 shadow-sm hover:shadow">
//       <div className="flex justify-between items-start gap-4">
//         <div>
//           <h3 className="text-sm font-semibold text-foreground line-clamp-1">
//             {issue.property_address ||
//               issue.property?.civic_address ||
//               `Property ID: ${issue.pid}`}
//           </h3>
//           <p className="text-xs text-muted-foreground mt-0.5">
//             Reported on {new Date(issue.created_at).toLocaleDateString()}
//           </p>
//         </div>
//         <span
//           className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border whitespace-nowrap ${getStatusStyles(issue.status)}`}
//         >
//           {issue.status || "Pending"}
//         </span>
//       </div>
//       <div className="text-sm text-foreground/90 bg-muted/30 p-3 rounded-lg border border-border/50">
//         <p className="line-clamp-2">{issue.issue_details}</p>
//       </div>
//     </div>
//   );
// };
