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
} from "lucide-react";
import { AuthGuard } from "../Auth/authGuard";
import Navbar from "@/components/Navbar";
import EditProfileForm from "./editProfileForm";
import Link from "next/link";
import { ReferralBalance } from "./referralBalance";
import { PaginatedList } from "./paginatedList";
import { HomeBuyingChecklist } from "./homeBuyingChecklist";
import { HomeSellerChecklist } from "./homeSellerChecklist";

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
  });

  console.log("Tab State:", user);
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
  console.log("user", user);
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

// const HomeBuyingChecklist = () => {
//   // Initializing the checklist state based on the provided source[cite: 1]
//   const [checklist, setChecklist] = useState([
//     { id: 1, text: "Create Squamish.realestate account", checked: false },
//     { id: 2, text: "View properties, Save homes", checked: false },
//     { id: 3, text: "Speak with Sean to discuss options", checked: false },
//     { id: 4, text: "Mortgage pre-approval", checked: false },
//     { id: 5, text: "Book showings", checked: false },
//     { id: 6, text: "Make offer", checked: false },
//     { id: 7, text: "Due diligence", checked: false },
//     { id: 8, text: "Remove subjects", checked: false },
//     { id: 9, text: "Prepare to move", checked: false },
//     { id: 10, text: "Meet with lawyer / notary", checked: false },
//     { id: 11, text: "Completion", checked: false },
//   ]);

//   // Toggle checkbox state
//   const handleToggle = (id: number) => {
//     setChecklist((prevChecklist) =>
//       prevChecklist.map((item) =>
//         item.id === id ? { ...item, checked: !item.checked } : item,
//       ),
//     );
//   };

//   // Function to dynamically generate and download the checklist as a text file
//   const handleDownloadChecklist = () => {
//     const fileHeader = "Home Buying Checklist\nBuying Journey\n\n";
//     const fileBody = checklist
//       .map((item) => `${item.checked ? "✓" : "□"} ${item.text}`)
//       .join("\n");

//     const content = fileHeader + fileBody;
//     const blob = new Blob([content], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);

//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "Home_Buying_Checklist.txt";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   // Calculate Progress (UI enhancement only, logic remains untouched)
//   const completedItems = checklist.filter((item) => item.checked).length;
//   const progressPercentage = Math.round(
//     (completedItems / checklist.length) * 100,
//   );

//   return (
//     <div className=" p-8 bg-card rounded-[var(--radius-lg)] shadow-lg border border-border">
//       {/* Header Section */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
//         <div>
//           <h2 className="text-2xl font-bold text-foreground tracking-tight">
//             Home Buying Checklist {/*[cite: 1] */}
//           </h2>
//           <div className="flex items-center gap-2 mt-2">
//             <svg
//               className="w-4 h-4 text-accent"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M13 10V3L4 14h7v7l9-11h-7z"
//               />
//             </svg>
//             <p className="text-muted-foreground font-medium uppercase tracking-wider text-xs">
//               Buying Journey {/*[cite: 1] */}
//             </p>
//           </div>
//         </div>

//         <button
//           onClick={handleDownloadChecklist}
//           className="flex text-sm items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-4 rounded-[var(--radius-md)] shadow-sm transition-all duration-200 active:scale-95"
//         >
//           <svg
//             className="w-5 h-5"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//             />
//           </svg>
//           Download List
//         </button>
//       </div>

//       {/* Progress Bar Area */}
//       <div className="mb-8 bg-background p-5 rounded-[var(--radius-md)] border border-border">
//         <div className="flex justify-between items-center mb-2">
//           <span className="text-sm font-semibold text-secondary-foreground">
//             Journey Progress
//           </span>
//           <span className="text-sm font-bold text-primary">
//             {progressPercentage}%
//           </span>
//         </div>
//         <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
//           <div
//             className="bg-primary h-2 rounded-full transition-all duration-700 ease-out"
//             style={{ width: `${progressPercentage}%` }}
//           ></div>
//         </div>
//       </div>

//       {/* Checklist Area */}
//       <div className="bg-background rounded-[var(--radius-lg)] p-2 sm:p-4 border border-border shadow-sm">
//         <ul className="space-y-1">
//           {checklist.map((item) => (
//             <li key={item.id}>
//               <label
//                 htmlFor={`check-${item.id}`}
//                 className={`flex items-center p-3 rounded-[var(--radius-md)] cursor-pointer transition-all duration-200 group border ${
//                   item.checked
//                     ? "bg-muted/30 border-transparent"
//                     : "bg-transparent border-transparent hover:bg-muted/50 hover:border-border"
//                 }`}
//               >
//                 <div className="relative flex items-center justify-center shrink-0">
//                   <input
//                     type="checkbox"
//                     id={`check-${item.id}`}
//                     checked={item.checked}
//                     onChange={() => handleToggle(item.id)}
//                     className="peer sr-only"
//                   />
//                   {/* Custom Checkbox mapping to your theme */}
//                   <div className="w-4 h-4 border-2 border-border rounded-[var(--radius-sm)] bg-background flex items-center justify-center transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary group-hover:border-primary/50">
//                     {item.checked && (
//                       <svg
//                         className="w-4 h-4 text-primary-foreground"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={3}
//                           d="M5 13l4 4L19 7"
//                         />
//                       </svg>
//                     )}
//                   </div>
//                 </div>

//                 <span
//                   className={`ml-4 font-medium transition-all duration-200 select-none text-sm ${
//                     item.checked
//                       ? "text-muted-foreground line-through"
//                       : "text-foreground group-hover:text-primary"
//                   }`}
//                 >
//                   {item.text}
//                 </span>
//               </label>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// const HomeSellerChecklist = () => {
//   // Initializing the checklist state based on the provided source[cite: 2]
//   const [checklist, setChecklist] = useState([
//     { id: 1, text: "Create Squamish.realestate account", checked: true },
//     {
//       id: 2,
//       text: "View properties, compare values of similar homes",
//       checked: true,
//     },
//     {
//       id: 3,
//       text: "Speak with Sean to discuss Phase 1 – Legal & Financial Groundwork",
//       checked: false,
//     },
//     { id: 4, text: "Mortgage review", checked: false },
//     { id: 5, text: "Title Review", checked: false },
//     { id: 6, text: "Gather Strata Documents / review", checked: false },
//     { id: 7, text: "Access Tenancies", checked: false },
//     { id: 8, text: "Phase 2 – Prep & Declutter", checked: false },
//     { id: 9, text: "The 50% Rule", checked: false },
//     { id: 10, text: "Pack person items / Clear counters", checked: false },
//     { id: 11, text: "Deep clean glass & grout", checked: false },
//     { id: 12, text: "Pre-Listing Home Inspection", checked: false },
//     { id: 13, text: "Phase 3 - Outdoor & First Impressions", checked: false },
//     { id: 14, text: "Maximize Curb Appeal", checked: false },
//     { id: 15, text: "Ensure the key features are presentable", checked: false },
//     {
//       id: 16,
//       text: "Complete the Property Disclosure Statement (PDS)",
//       checked: false,
//     },
//     { id: 17, text: "Identify Inclusions & Remove Exclusions", checked: false },
//     { id: 18, text: "Phase 4 – Launch Listing", checked: false },
//     {
//       id: 19,
//       text: "Prepare For Media (photos, floor plans & feature sheet)",
//       checked: false,
//     },
//     { id: 20, text: "Confirm Showing & Open House Schedule", checked: false },
//     { id: 21, text: "Complete Final Staging", checked: false },
//     { id: 22, text: "Secure Valuables", checked: false },
//     {
//       id: 23,
//       text: "Phase 5 – Prepare For Offer, Closing & Moving",
//       checked: false,
//     },
//     { id: 24, text: "Contact lawyer / notary", checked: false },
//     { id: 25, text: "Contact lender / mortgage broker", checked: false },
//     { id: 26, text: "Fulfill conditions of the contract", checked: false },
//     { id: 27, text: "Contact movers & utility providers", checked: false },
//     { id: 28, text: "Property handover prep", checked: false },
//   ]);

//   // Toggle checkbox state
//   const handleToggle = (id: number) => {
//     setChecklist((prevChecklist) =>
//       prevChecklist.map((item) =>
//         item.id === id ? { ...item, checked: !item.checked } : item,
//       ),
//     );
//   };

//   // Function to dynamically generate and download the checklist as a text file
//   const handleDownloadChecklist = () => {
//     const fileHeader =
//       "Home Seller Checklist\nPreparing to Sell a property\n\n";
//     const fileBody = checklist
//       .map((item) => `${item.checked ? "✓" : "□"} ${item.text}`)
//       .join("\n");

//     const content = fileHeader + fileBody;
//     const blob = new Blob([content], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);

//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "Home_Seller_Checklist.txt";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   // Calculate Progress (UI enhancement only, logic remains untouched)
//   const completedItems = checklist.filter((item) => item.checked).length;
//   const progressPercentage = Math.round(
//     (completedItems / checklist.length) * 100,
//   );

//   return (
//     <div className="max-w-3xl mx-auto p-8 bg-card rounded-[var(--radius-lg)] shadow-lg border border-border">
//       {/* Header Section */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
//         <div>
//           <h2 className="text-3xl font-bold text-foreground font-display tracking-tight">
//             Home Seller Checklist {/*[cite: 2] */}
//           </h2>
//           <div className="flex items-center gap-2 mt-2">
//             <svg
//               className="w-5 h-5 text-accent"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
//               />
//             </svg>
//             <p className="text-muted-foreground font-accent font-medium uppercase tracking-wider text-sm">
//               Preparing to Sell a property {/*[cite: 2] */}
//             </p>
//           </div>
//         </div>

//         <button
//           onClick={handleDownloadChecklist}
//           className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-accent font-semibold py-2.5 px-6 rounded-[var(--radius-md)] shadow-sm transition-all duration-200 active:scale-95"
//         >
//           <svg
//             className="w-5 h-5"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//             />
//           </svg>
//           Download List
//         </button>
//       </div>

//       {/* Progress Bar Area */}
//       <div className="mb-8 bg-background p-5 rounded-[var(--radius-md)] border border-border">
//         <div className="flex justify-between items-center mb-2 font-accent">
//           <span className="text-sm font-semibold text-secondary-foreground">
//             Preparation Progress
//           </span>
//           <span className="text-sm font-bold text-primary">
//             {progressPercentage}%
//           </span>
//         </div>
//         <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
//           <div
//             className="bg-primary h-2 rounded-full transition-all duration-700 ease-out"
//             style={{ width: `${progressPercentage}%` }}
//           ></div>
//         </div>
//       </div>

//       {/* Checklist Area */}
//       <div className="bg-background rounded-[var(--radius-lg)] p-2 sm:p-4 border border-border shadow-sm max-h-[600px] overflow-y-auto">
//         <ul className="space-y-1">
//           {checklist.map((item) => (
//             <li key={item.id}>
//               <label
//                 htmlFor={`check-${item.id}`}
//                 className={`flex items-center p-4 rounded-[var(--radius-md)] cursor-pointer transition-all duration-200 group border ${
//                   item.checked
//                     ? "bg-muted/30 border-transparent"
//                     : "bg-transparent border-transparent hover:bg-muted/50 hover:border-border"
//                 }`}
//               >
//                 <div className="relative flex items-center justify-center shrink-0">
//                   <input
//                     type="checkbox"
//                     id={`check-${item.id}`}
//                     checked={item.checked}
//                     onChange={() => handleToggle(item.id)}
//                     className="peer sr-only"
//                   />
//                   {/* Custom Checkbox mapping to the theme */}
//                   <div className="w-6 h-6 border-2 border-border rounded-[var(--radius-sm)] bg-background flex items-center justify-center transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary group-hover:border-primary/50">
//                     {item.checked && (
//                       <svg
//                         className="w-4 h-4 text-primary-foreground"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={3}
//                           d="M5 13l4 4L19 7"
//                         />
//                       </svg>
//                     )}
//                   </div>
//                 </div>

//                 <span
//                   className={`ml-4 text-[1.05rem] font-medium transition-all duration-200 select-none ${
//                     item.checked
//                       ? "text-muted-foreground line-through"
//                       : "text-foreground group-hover:text-primary"
//                   } ${item.text.includes("Phase") ? "font-bold text-primary" : ""}`}
//                 >
//                   {item.text}
//                 </span>
//               </label>
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Note Area */}
//       <div className="mt-8 p-5 bg-muted/30 rounded-[var(--radius-md)] border border-border text-sm text-secondary-foreground">
//         <p>
//           <strong>Note:</strong> I am working on complete (Home Selling planning
//           guide) document to accompany the checklist. I would like the checklist
//           and planning guide to be downloadable from the Member Dashboard.{" "}
//           {/*[cite: 2] */}
//         </p>
//       </div>
//     </div>
//   );
// };
