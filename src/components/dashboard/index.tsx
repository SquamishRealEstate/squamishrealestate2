"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/config/supabaseClient";
import {
  MessageSquare,
  Star,
  Heart,
  Eye,
  Settings,
  AlertTriangle,
  User,
  Gift,
  Loader2,
  ChevronRight,
  LocateFixed,
  EyeOff,
  Key,
  Phone,
  ArrowRight,
  X,
  Check,
} from "lucide-react";
import { AuthGuard } from "../Auth/authGuard";
import Navbar from "@/components/Navbar";
import { ListingCard } from "@/components/ListingCard";
import { ReviewCard } from "../Property/PropertyHelpers";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import AddressAutocomplete from "@/components/admin/addressAutocomplete";

const PAGE_SIZE = 10;

type TabDataState = {
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Container Card using your theme tokens */}
      <div className="w-full max-w-sm bg-card border border-border rounded-[var(--radius-xl)] shadow-lg p-8 flex flex-col items-center text-center">
        {/* Decorative Icon */}
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6 border border-border">
          {/* Using your Primary color for the icon */}
          <User size={32} className="text-primary" />
        </div>

        {/* Headline using your Display font */}
        <h2 className="font-display text-3xl font-bold text-foreground mb-3">
          Welcome Back
        </h2>

        {/* Body using your Body font */}
        <p className="font-body text-muted-foreground text-sm mb-8 leading-relaxed">
          Sign in to your account to access your property dashboard.
        </p>

        {/* Primary Action Button */}
        <a
          href="/login"
          className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-[var(--radius-md)] font-semibold transition-all hover:opacity-90 hover:shadow-md active:scale-95"
        >
          Sign In
        </a>

        {/* Secondary Action */}
        <p className="mt-6 text-xs text-muted-foreground">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-accent font-semibold hover:underline"
          >
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
function DashboardContent({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("Messages");

  const [tabState, setTabState] = useState<Record<string, TabDataState>>({
    Messages: {
      items: [],
      page: 0,
      hasMore: true,
      isLoading: false,
      initialized: false,
    },
    Reviews: {
      items: [],
      page: 0,
      hasMore: true,
      isLoading: false,
      initialized: false,
    },
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
    Issues: {
      items: [],
      page: 0,
      hasMore: true,
      isLoading: false,
      initialized: false,
    },
    Settings: {
      items: [],
      page: 0,
      hasMore: false,
      isLoading: false,
      initialized: true,
    }, // Add this
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
          .order("created_at", { ascending: false });
      } else if (tabName === "Reviews") {
        query = supabase
          .from("property_reviews")
          .select("*", { count: "exact" })
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
      } else if (tabName === "Saved") {
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
      } else if (tabName === "Issues") {
        query = supabase
          .from("reported_issues")
          .select("*", { count: "exact" })
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
      }

      if (!query) return;

      const { data, count, error } = await query.range(from, to);
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
    { name: "Messages", icon: MessageSquare },
    { name: "Reviews", icon: Star },
    { name: "Saved", icon: Heart },
    { name: "Viewed", icon: Eye },
    { name: "Issues", icon: AlertTriangle },
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
    <div className="h-screen bg-muted/10 text-foreground font-body overflow-hidden">
      <Navbar />

      {/* Layout Container */}
      <div className=" pt-24 pb-8 px-4 sm:px-6 h-full flex flex-col md:flex-row gap-8">
        {" "}
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          {/* User Profile Card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
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
                <User size={12} /> Dashboard Member
              </p>
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
                    <span className="font-medium text-sm">{tab.name}</span>
                  </div>
                  {/* Subtle arrow indicator on desktop only */}
                  <ChevronRight
                    size={16}
                    className={`hidden md:block transition-transform ${isActive ? "opacity-100" : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"}`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Referral Points Balance (Desktop bottom) */}
          <div className="hidden md:block mt-auto pt-4">
            <div className="w-full flex items-center gap-3 p-4 bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-2xl shadow-sm">
              <div className="w-10 h-10 bg-accent/20 text-accent rounded-full flex items-center justify-center shrink-0">
                <Gift size={18} />
              </div>
              <div>
                <span className="block text-sm font-bold text-foreground">
                  $ 1,000
                </span>
                <span className="block text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">
                  Referral Balance
                </span>
              </div>
            </div>
          </div>
        </aside>
        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pb-10">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden min-h-full flex flex-col">
            <div className="px-6 py-5 border-b border-border bg-muted/5 sticky top-0 bg-card z-10">
              <h1 className="font-display font-bold text-2xl text-foreground">
                {activeTab}
              </h1>
            </div>

            <div className="p-6">
              {activeTab === "Settings" ? (
                <EditProfileForm user={user} />
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

const PaginatedList = ({
  tabState,
  activeTab,
  onLoadMore,
}: {
  tabState: TabDataState;
  activeTab: string;
  onLoadMore: () => void;
}) => {
  const { items, isLoading, hasMore, initialized } = tabState;

  if (!initialized && isLoading) {
    return (
      <div className="flex justify-center items-center py-24 h-full">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={
          activeTab === "Messages"
            ? MessageSquare
            : activeTab === "Reviews"
              ? Star
              : Heart
        }
        title={`No ${activeTab.toLowerCase()} found`}
      />
    );
  }

  return (
    <div className="space-y-6">
      {(activeTab === "Saved" || activeTab === "Viewed") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(
            (item, idx) =>
              item.property && (
                <ListingCard key={item.id || idx} listing={item.property} />
              ),
          )}
        </div>
      )}

      {activeTab === "Reviews" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map(
            (item, idx) =>
              item.property && (
                <ReviewCard key={item.id || idx} review={item} />
              ),
          )}
        </div>
      )}

      {(activeTab === "Messages" || activeTab === "Issues") && (
        <div className="space-y-3">
          {items.map((item, idx) => {
            if (activeTab === "Messages")
              return <MessageItem key={item.id || idx} msg={item} />;
            if (activeTab === "Issues")
              return <IssueItem key={item.id || idx} issue={item} />;
            return null;
          })}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-muted/50 border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-primary rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="animate-spin" size={14} />}
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title }: any) => (
  <div className="text-center py-24 h-full flex flex-col items-center justify-center">
    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 border border-border">
      <Icon className="text-muted-foreground" size={24} />
    </div>
    <p className="font-semibold text-foreground text-base">{title}</p>
    <p className="text-sm text-muted-foreground mt-1">
      Looks like you don't have any activity here yet.
    </p>
  </div>
);

const MessageItem = ({ msg }: { msg: any }) => {
  const initials = msg.name
    ? msg.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "?";
  return (
    <div className="group border border-border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer bg-background flex gap-4 items-start shadow-sm hover:shadow">
      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2 mb-0.5">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {msg.name}
          </h3>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(msg.created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3 truncate">
          {msg.email}
        </p>
        <div className="text-sm text-foreground/90 bg-muted/30 p-3 rounded-lg border border-border/50 group-hover:bg-muted/50 transition-colors">
          <p className="line-clamp-2">{msg.message}</p>
        </div>
      </div>
    </div>
  );
};

const IssueItem = ({ issue }: { issue: any }) => {
  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "investigating":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "dismissed":
        return "bg-muted text-muted-foreground border-border";
      case "pending":
      default:
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    }
  };

  return (
    <div className="border border-border rounded-xl p-4 hover:border-primary/50 transition-colors bg-background flex flex-col gap-3 shadow-sm hover:shadow">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">
            {issue.property_address ||
              issue.property?.civic_address ||
              `Property ID: ${issue.pid}`}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reported on {new Date(issue.created_at).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border whitespace-nowrap ${getStatusStyles(issue.status)}`}
        >
          {issue.status || "Pending"}
        </span>
      </div>
      <div className="text-sm text-foreground/90 bg-muted/30 p-3 rounded-lg border border-border/50">
        <p className="line-clamp-2">{issue.issue_details}</p>
      </div>
    </div>
  );
};

interface EditProfileFormProps {
  user: any;
}

function EditProfileForm({ user }: EditProfileFormProps) {
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || "",
    phone: user?.user_metadata?.phone || "",
    address: user?.user_metadata?.address || "",
    newPassword: "",
  });

  const validations = {
    name: formData.fullName.trim().length >= 2,
    phone:
      formData.phone.trim() === "" ||
      /^\+?[0-9\s\-()]{7,}$/.test(formData.phone),
    newPassword: {
      length: formData.newPassword.length >= 8,
      upper: /[A-Z]/.test(formData.newPassword),
      lower: /[a-z]/.test(formData.newPassword),
      number: /[0-9]/.test(formData.newPassword),
      special: /[!@#$%^&*]/.test(formData.newPassword),
    },
  };
  const passwordRequirements = [
    { label: "8 characters minimum", met: validations.newPassword.length },
    { label: "One uppercase character", met: validations.newPassword.upper },
    { label: "One lowercase character", met: validations.newPassword.lower },
    { label: "One number", met: validations.newPassword.number },
    { label: "One special character", met: validations.newPassword.special },
  ];

  const allPasswordMet = passwordRequirements.every((req) => req.met);

  const isFormValid = validations.name && validations.phone && allPasswordMet;

  const handleGetLocation = async () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`,
        );

        const data = await response.json();

        const fullAddress =
          data.features?.[0]?.properties?.full_address || "Address not found";

        setFormData((prev) => ({
          ...prev,
          address: fullAddress,
        }));
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    });
  };

  const getFieldStatus = (isValid: boolean, value: string) => {
    const hasInteracted = value.length > 0 || triedToSubmit;
    return {
      showError: hasInteracted && !isValid,
      className: `pl-10 h-10  ${
        hasInteracted && !isValid
          ? "border-destructive ring-destructive/20 animate-shake"
          : "border-border focus:ring-ring/30 focus:border-primary"
      }`,
    };
  };

  const handleUpdate = async () => {
    setTriedToSubmit(true);
    if (!isFormValid) {
      setError("Please check your inputs and try again.");
      setTriedToSubmit(false);
      return;
    }
    console.log(formData);

    try {
      await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          address: formData.address,
          phone: formData.phone,
        },
      });

      if (formData.newPassword.trim()) {
        await supabase.auth.updateUser({
          password: formData.newPassword,
        });
      }

      setMessage("Profile updated successfully!");
      setTriedToSubmit(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setError("Failed to update profile.");
      setTriedToSubmit(false);
      return;
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Header */}
      <div className="border-b px-8 py-6">
        <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage your personal information and account security.
        </p>
      </div>

      <div className="p-8 space-y-10">
        {/* Personal Information */}
        <section className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Personal Information</h3>

            <p className="text-sm text-muted-foreground">
              Update your profile details and contact information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={formData.fullName}
                  placeholder="John Doe"
                  className={
                    getFieldStatus(validations.name, formData.fullName)
                      .className
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>

              {(formData.fullName.length > 0 || triedToSubmit) &&
                !validations.name && (
                  <p className="flex items-center gap-1.5 text-[11px] text-destructive px-1">
                    <X size={12} />
                    <span>At least 2 characters</span>
                  </p>
                )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={formData.phone}
                  placeholder="+1 (555) 123-4567"
                  className={
                    getFieldStatus(validations.phone, formData.phone).className
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              {(formData.phone.length > 0 || triedToSubmit) &&
                !validations.phone && (
                  <p className="flex items-center gap-1.5 text-[11px] text-destructive px-1">
                    <X size={12} />
                    <span>Please enter a valid phone number</span>
                  </p>
                )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>

            <div className="flex gap-3">
              <AddressAutocomplete
                value={formData.address} // Pass this so it can clear on reset
                onSelect={(data: any) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: data.address,
                  }))
                }
              />

              <Button
                variant="outline"
                onClick={handleGetLocation}
                className="h-10 w-10 p-0"
              >
                <LocateFixed className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="space-y-6 border-t pt-8">
          <div>
            <h3 className="text-lg font-semibold">Security</h3>

            <p className="text-sm text-muted-foreground">
              Update your password to keep your account secure.
            </p>
          </div>

          <div className="max-w-xl space-y-2">
            <label className="text-sm font-medium">New Password</label>

            <div className="relative">
              <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className={
                  getFieldStatus(allPasswordMet, formData.newPassword).className
                }
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newPassword: e.target.value,
                  })
                }
              />

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {(formData.newPassword.length > 0 || triedToSubmit) && (
              <div
                className={`mt-3 grid grid-cols-1 gap-1.5 p-3 rounded-xl border ${triedToSubmit && !allPasswordMet ? "bg-destructive/5 border-destructive/20" : "bg-slate-50/50 border-border"}`}
              >
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    {req.met ? (
                      <Check size={12} className="text-emerald-600" />
                    ) : (
                      <X
                        size={12}
                        className={
                          triedToSubmit ? "text-destructive" : "text-slate-400"
                        }
                      />
                    )}
                    <span
                      className={
                        req.met
                          ? "text-emerald-700 font-medium"
                          : triedToSubmit
                            ? "text-destructive"
                            : "text-slate-500"
                      }
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-[44px]">
            {message && (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100 animate-in fade-in zoom-in-95">
                <span>{message}</span>
              </div>
            )}
          </div>

          <Button
            size="lg"
            onClick={handleUpdate}
            disabled={triedToSubmit}
            className="min-w-[180px]"
          >
            {!triedToSubmit && <ArrowRight className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
