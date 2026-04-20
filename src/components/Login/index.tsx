"use client";

import React, { useState, Suspense } from "react"; // Added Suspense for useSearchParams
import { Eye, EyeOff, ArrowRight, Loader2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import { supabase } from "@/config/supabaseClient";
import Link from "next/link";
import { Button } from "../ui/button";
import HomeButton from "../ui/homeButton";

// Separate the content to avoid SSR issues with useSearchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Get the return destination (defaults to home if not found)
  const callbackUrl = searchParams.get("callback") || "/";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const validations = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    password: { length: formData.password.length > 0 },
  };

  const isFormValid = validations.email && validations.password.length;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isFormValid) {
      setError("Enter a valid email and password.");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("email not confirmed")) {
        await supabase.auth.resend({ type: "signup", email: formData.email });
        router.push(`/check-email?email=${encodeURIComponent(formData.email)}`);
        return;
      }
      setError(authError.message);
      setLoading(false);
    } else {
      // 2. Redirect to the original page or dashboard
      router.push(callbackUrl);
      router.refresh(); // Crucial to update the AuthGuard state
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-foreground">
      <HomeButton />
      {/* LEFT SIDE: Visual Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070"
          alt="Squamish Mountains"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        <div className="relative z-10 p-12 max-w-xl text-white">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-white p-2 rounded-lg border border-white/20">
              <img src="/images/icon.ico" alt="Home" className="w-8 h-8" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Squamish Real Estate
            </span>
          </div>
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            {/* 3. Contextual Title */}
            {callbackUrl.includes("/property/")
              ? "Sign in to post"
              : "Welcome back"}{" "}
            <br />
            <span className="text-accent italic font-medium text-4xl">
              {callbackUrl.includes("/property/")
                ? "your review."
                : "to the mountains."}
            </span>
          </h1>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Sign In
          </h2>
          <p className="mt-2 text-muted-foreground">
            Don&apos;t have an account?
            <Link
              href={`/register?callback=${encodeURIComponent(callbackUrl)}`}
              className="ml-1 font-semibold text-primary underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>

          {error && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 shadow-sm animate-shake">
                <div className="p-1 bg-rose-100 rounded-full shrink-0">
                  <X size={14} className="text-rose-600 stroke-[3px]" />
                </div>
                <p className="text-sm font-semibold leading-tight">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/40 focus:ring-2 focus:ring-ring/30 outline-none transition-all"
                placeholder="alex@example.com"
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/40 focus:ring-2 focus:ring-ring/30 outline-none transition-all"
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// 4. Wrapping in Suspense is required for useSearchParams in Next.js App Router
export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center font-bold tracking-widest uppercase text-xs animate-pulse">
          Loading secure login...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
