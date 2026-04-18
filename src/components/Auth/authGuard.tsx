"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/config/supabaseClient";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "../ui/button";

interface AuthGuardProps {
  // Updated to accept a function that receives the user object
  children: React.ReactNode | ((user: any) => React.ReactNode);
  message?: string;
}

export const AuthGuard = ({ children, message }: AuthGuardProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex justify-center items-center text-muted-foreground font-bold uppercase tracking-widest text-[10px] animate-pulse">
        Verifying Access...
      </div>
    );
  }

  if (user) {
    // If children is a function, we execute it and pass the user
    if (typeof children === "function") {
      return <>{children(user)}</>;
    }
    return <>{children}</>;
  }

  return (
    <div className="py-16 px-4 flex flex-col items-center text-center bg-card">
      <div className="bg-background p-5 border border-border shadow-sm mb-6 rounded-none">
        <Lock size={24} className="text-primary" strokeWidth={1.5} />
      </div>
      <h3 className="text-foreground font-bold uppercase tracking-[0.12em] text-xs mb-3">
        Member Access Required
      </h3>
      <p className="text-muted-foreground font-body text-sm max-w-sm leading-relaxed mb-8">
        {message ||
          "Real Estate Board rules require registration to access historical listing data."}
      </p>
      <Button variant="default" onClick={() => router.push("/login")}>
        Login / Register
      </Button>
    </div>
  );
};
