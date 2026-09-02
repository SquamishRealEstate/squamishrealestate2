"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Film,
  FileText,
  Users,
  Mail,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Layers,
  Loader2,
  Star,
} from "lucide-react";
import UserManagement from "./userManagement";
import BlogManager from "./blogManager";
import ReelManager from "./reelManager";
import InquiryManager from "./inquiryManager";
import FeaturedManager from "./featuredManager";
import ReviewManager from "./reviewManager";
import { useAuth } from "@/components/context/AuthProvider";
import Image from "next/image";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAdmin, isCheckingRole } = useAuth();

  // --- LIFTED STATES TO SURVIVE BROWSER TAB SWITCHES ---
  // 1. User Management State
  const [userSearch, setUserSearch] = useState("");

  // 2. Blog Manager States
  const [blogView, setBlogView] = useState<"list" | "form">("list");
  const [editBlogData, setEditBlogData] = useState<any>(undefined);
  const [blogFormData, setBlogFormData] = useState({
    title: "",
    category: "",
    author: "",
    image: "",
    content: "",
  });

  // 3. Reel Manager States
  const [reelView, setReelView] = useState<"list" | "form">("list");
  const [editReelData, setEditReelData] = useState<any>(undefined);
  const [reelFormData, setReelFormData] = useState({
    category: [] as string[],
    link: "",
    priority: 0,
    address: "",
    description: "",
    lat: null as number | null,
    lng: null as number | null,
  });

  // 2. Prevent the dashboard from rendering at all if not authorized
  if (isCheckingRole) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">
          Verifying credentials... (This may take a few seconds)
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="text-red-500 font-bold">Access Denied</p>
      </div>
    );
  }

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-50 shadow-md h-16">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white">
            <Image src="/images/icon.ico" alt="Home" width={30} height={30} />
          </div>
          <h2 className="font-bold tracking-tight">Admin Portal</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`
        /* Mobile: below header, expands/contracts height */
        bg-slate-900 text-white overflow-hidden transition-all duration-300 ease-in-out
        fixed left-0 right-0 z-40 overflow-y-auto top-16 lg:top-0
        lg:relative lg:translate-x-0 lg:w-72 lg:min-h-screen lg:p-6 lg:block lg:opacity-100
        
        /* Apply these only on mobile */
        ${
          isSidebarOpen
            ? "max-h-[calc(100vh-4rem)] opacity-100 p-6 shadow-2xl"
            : "absolute lg:relative max-h-0 opacity-0 lg:max-h-none"
        }
      `}
      >
        <div className="mb-10 hidden lg:flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white">
            <Image src="/images/icon.ico" alt="Home" width={30} height={30} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Admin Portal</h2>
        </div>

        <nav className="space-y-2">
          <SidebarItem
            icon={<Users size={20} />}
            label="User Management"
            active={activeTab === "users"}
            onClick={() => switchTab("users")}
          />
          <SidebarItem
            icon={<FileText size={20} />}
            label="Blog Posts"
            active={activeTab === "blogs"}
            onClick={() => switchTab("blogs")}
          />
          <SidebarItem
            icon={<Film size={20} />}
            label="Reels & Video"
            active={activeTab === "reels"}
            onClick={() => switchTab("reels")}
          />
          <SidebarItem
            icon={<Mail size={20} />}
            label="Contact Inquiries"
            active={activeTab === "inquiries"}
            onClick={() => switchTab("inquiries")}
          />
          <SidebarItem
            icon={<Layers size={20} />}
            label="Featured Properties"
            active={activeTab === "featured"}
            onClick={() => switchTab("featured")}
          />
          <SidebarItem
            icon={<Star size={20} />}
            label="Reviews"
            active={activeTab === "reviews"}
            onClick={() => switchTab("reviews")}
          />
        </nav>
        <div className="lg:hidden pt-4 mt-4 border-t border-slate-800">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white"
          >
            <ExternalLink size={18} className="text-primary" />
            View Live Site
          </Link>
        </div>
        <div className="mt-auto pt-6 border-t border-slate-800 hidden lg:block">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              {/* Using a Lucide icon for "External Link" */}
              <ExternalLink
                size={18}
                className="text-slate-500 group-hover:text-primary transition-colors"
              />
              <span>View Live Site</span>
            </div>
            <ChevronRight
              size={14}
              className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
            />
          </Link>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <div className={activeTab === "users" ? "block" : "hidden"}>
            <UserManagement
              searchQuery={userSearch}
              setSearchQuery={setUserSearch}
            />
          </div>
          <div className={activeTab === "blogs" ? "block" : "hidden"}>
            <BlogManager
              view={blogView}
              setView={setBlogView}
              editBlogData={editBlogData}
              setEditBlogData={setEditBlogData}
              blogFormData={blogFormData}
              setBlogFormData={setBlogFormData}
            />
          </div>
          <div className={activeTab === "reels" ? "block" : "hidden"}>
            <ReelManager
              view={reelView}
              setView={setReelView}
              editReelData={editReelData}
              setEditReelData={setEditReelData}
              reelFormData={reelFormData}
              setReelFormData={setReelFormData}
            />
          </div>
          <div className={activeTab === "inquiries" ? "block" : "hidden"}>
            <InquiryManager />
          </div>
          <div className={activeTab === "featured" ? "block" : "hidden"}>
            <FeaturedManager />
          </div>
          <div className={activeTab === "reviews" ? "block" : "hidden"}>
            <ReviewManager />
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
        active
          ? "bg-primary text-white shadow-lg shadow-primary/20"
          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`${active ? "text-white" : "text-slate-500 group-hover:text-primary"} transition-colors`}
        >
          {icon}
        </span>
        <span className="font-medium text-sm">{label}</span>
      </div>
      {active && <ChevronRight size={14} className="opacity-50" />}
    </button>
  );
}
