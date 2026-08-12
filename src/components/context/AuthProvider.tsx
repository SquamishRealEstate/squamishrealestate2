"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/config/supabaseClient";
import { User, Session } from "@supabase/supabase-js";

const AuthContext = createContext<{
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isCheckingRole: boolean; // Add this
}>({
  user: null,
  session: null,
  isAdmin: false,
  isCheckingRole: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true); // Add this

  useEffect(() => {
    // 1. Get initial state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // 2. Listen for changes (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function getRole() {
      setIsCheckingRole(true); // Start loading
      try {
        if (!user) {
          setIsAdmin(false);
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (!error && data?.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        setIsAdmin(false);
      } finally {
        setIsCheckingRole(false); // Stop loading
      }
    }

    getRole();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isCheckingRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
