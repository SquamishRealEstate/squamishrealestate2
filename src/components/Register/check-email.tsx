"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/config/supabaseClient";
import { Button } from "../ui/button";

function CheckEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) {
      setMessage("Email not found.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Verification email resent. Please check your inbox.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full text-center p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Check Your Email</h1>

        <p className="text-slate-600 mb-4">
          We’ve sent a confirmation link to:
        </p>

        {email && <p className="font-medium text-slate-900 mb-6">{email}</p>}

        <Button
          size="lg"
          onClick={() => router.push("/")}
          className="w-full mb-6"
        >
          Go to Home <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        {message && <p className="text-sm text-emerald-600 mb-4">{message}</p>}

        <div className="text-sm text-slate-500">
          Didn’t receive the email?{" "}
          <button
            onClick={handleResend}
            disabled={loading}
            className="text-primary underline inline-flex items-center gap-1"
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            {loading ? "Sending..." : "Resend"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <Suspense
        fallback={<Loader2 className="animate-spin w-8 h-8 text-primary" />}
      >
        <CheckEmailContent />
      </Suspense>
    </div>
  );
}
