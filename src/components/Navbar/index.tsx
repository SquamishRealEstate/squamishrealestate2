"use client";

import React, {useEffect, useState} from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/config/supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 frosted-glass border-b border-border/20">
        <div className="container mx-auto flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src="/images/icon.ico" alt="Home" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Squamish Real Estate</h1>
              <p className="text-xs text-muted-foreground">Your Mountain Home Awaits</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#properties" className="text-sm font-medium hover:text-primary transition-colors">
              Properties
            </a>
            <a href="#neighborhoods" className="text-sm font-medium hover:text-primary transition-colors">
              Neighborhoods
            </a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              About
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
                  Hi, {user.user_metadata?.full_name?.split(" ")[0] || user.email}
                </span>

                <Button variant="outline" asChild>
                  <Link href="/dashboard">Dashboard</Link>
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
        </div>
    </nav>
  );
}
