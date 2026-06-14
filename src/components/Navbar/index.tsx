"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/config/supabaseClient";
import { Menu, X } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin, isLoading } = useAdmin();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 frosted-glass border-b border-border/20">
      <div className="container mx-auto flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-lg flex ">
              <img src="/images/icon.ico" alt="Home" />
            </div>
            <div className=" mb-[-6px]">
              <h1 className="text-xl font-bold">Squamish Real Estate</h1>
              <p className="text-xs text-muted-foreground">
                Find Your Mountain Home
              </p>
            </div>
          </div>
        </Link>
        <div className="hidden lg:flex items-center gap-6">
          <a
            href="/properties"
            className="text-sm font-medium hover:text-primary transition-colors"
            target="_blank"
          >
            Properties
          </a>
          <a
            href="/neighborhoods"
            className="text-sm font-medium hover:text-primary transition-colors"
            target="_blank"
          >
            Neighborhoods
          </a>
          <a
            href="/blogs"
            target="_blank"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Local News
          </a>
          <div className="flex items-center gap-3 ml-4">
            {!user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>

                <Button variant="outline" asChild>
                  <Link href="/register">Create Account</Link>
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm font-medium">
                  Hi,{" "}
                  {user.user_metadata?.full_name?.split(" ")[0] || user.email}
                </span>

                <Button asChild variant="outline">
                  {!isLoading && isAdmin ? (
                    <Link href="/admin" target="_blank">
                      Dashboard
                    </Link>
                  ) : (
                    <Link href="/dashboard" target="_blank">
                      Dashboard
                    </Link>
                  )}
                </Button>

                <Button variant="ghost" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}

            <Button asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
        <button
          className="lg:hidden p-2 text-slate-900"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>
      <div
        className={`
        lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-200 shadow-xl transition-all duration-300 ease-in-out overflow-hidden
        ${isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
      `}
      >
        <div className="p-6 flex flex-col gap-1">
          {/* Links with background on hover/active */}
          <a
            href="/properties"
            target="_blank"
            onClick={() => setIsMenuOpen(false)}
            className="px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Properties
          </a>
          <a
            href="/neighborhoods"
            target="_blank"
            onClick={() => setIsMenuOpen(false)}
            className="px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Neighborhoods
          </a>
          <a
            href="/blogs"
            target="_blank"
            onClick={() => setIsMenuOpen(false)}
            className="px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Local News
          </a>

          <div className="h-px bg-slate-100 my-4" />
          <div className="flex flex-col gap-3 px-2">
            {!user ? (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  className="w-full"
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/register">Create Account</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            )}
            <Button
              className="w-full h-12"
              asChild
              onClick={() => setIsMenuOpen(false)}
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
