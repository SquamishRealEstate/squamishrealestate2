"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/config/supabaseClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Send,
  Film,
  FileText,
  Users,
  Mail,
  Menu,
  X,
  ChevronRight,
  Loader2,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import UserManagement from "./userManagement";
import BlogManager from "./blogManager";
import ReelManager from "./reelManager";
import InquiryManager from "./inquiryManager";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    // If we finished checking and they ARE NOT an admin, kick them out
    if (!isLoading && !isAdmin) {
      router.replace("/"); // .replace is better than .push so they can't click "back" into the admin page
    }
  }, [isAdmin, isLoading, router]);

  // 1. Show a clean loading state so they don't see the dashboard for a split second
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">
          Verifying credentials...
        </p>
      </div>
    );
  }

  // 2. Prevent the dashboard from rendering at all if not authorized
  if (!isAdmin) {
    return null;
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
            <img src="/images/icon.ico" alt="Home" className="w-8 h-8" />
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
        lg:relative lg:translate-x-0 lg:w-72 lg:min-h-screen lg:p-6 lg:block lg:opacity-100
        
        /* Apply these only on mobile */
        ${
          isSidebarOpen
            ? "relative z-40 max-h-[1000px] opacity-100 p-6"
            : "absolute lg:relative max-h-0 opacity-0 lg:max-h-none"
        }
      `}
      >
        <div className="mb-10 hidden lg:flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white">
            <img src="/images/icon.ico" alt="Home" className="w-8 h-8" />
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
          {activeTab === "users" && <UserManagement />}
          {activeTab === "blogs" && <BlogManager />}
          {activeTab === "reels" && <ReelManager />}
          {activeTab === "inquiries" && <InquiryManager />}
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
