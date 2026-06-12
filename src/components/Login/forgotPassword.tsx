"use client";

import { useState } from "react";
import { supabase } from "@/config/supabaseClient";
import { Loader2, ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const validations = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  };

  const isFormValid = validations.email;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!isFormValid) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "If an account exists for this email, a password reset link has been sent. Check your inbox.",
      );
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <div className="w-full max-w-md">
        {error && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 shadow-sm shadow-rose-100/50 animate-shake">
              {/* Icon adds instant recognition */}
              <div className="p-1 bg-rose-100 rounded-full shrink-0">
                <X size={14} className="text-rose-600 stroke-[3px]" />
              </div>

              <p className="text-sm font-semibold leading-tight">{error}</p>
            </div>
          </div>
        )}

        {message && (
          <div className="mb-4 flex items-center gap-2 p-4 rounded-xl border border-muted/50 bg-muted/30 text-sm text-slate-700">
            {/* Optional icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-emerald-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{message}</span>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-2">Reset your password</h1>
        <p className="text-muted-foreground mb-8">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-1.5">
            <Input
              name="email"
              className="w-full h-12 px-4 py-3 rounded-xl border border-border bg-muted/40 focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all outline-none"
              placeholder="alex@example.com"
              onChange={handleChange}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full py-3 h-14">
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Send Reset Link <ArrowRight size={16} />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-block w-full">
            <Button
              variant="outline"
              size="default"
              className="w-full py-3 h-14"
            >
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
