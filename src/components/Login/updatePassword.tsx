"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/config/supabaseClient";
import { Eye, EyeOff, Check, X, ArrowRight, Clock, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [linkExpired, setLinkExpired] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const validations = {
    password: {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }
  };

  const passwordRequirements = [
    { label: "8 characters minimum", met: validations.password.length },
    { label: "One uppercase character", met: validations.password.upper },
    { label: "One lowercase character", met: validations.password.lower },
    { label: "One number", met: validations.password.number },
    { label: "One special character", met: validations.password.special },
  ];

  const allPasswordMet = passwordRequirements.every(req => req.met);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriedToSubmit(true);

    if (!allPasswordMet) {
      // Re-trigger shake by briefly toggling state
      setTimeout(() => setTriedToSubmit(false), 500);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      if (error.message.includes("session") || error.message.includes("expired")) {
        setLinkExpired(true);
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) setLinkExpired(true);
    };
    checkSession();
  }, []);

  // --- RENDER EXPIRED STATE ---
  if (linkExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 px-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
            <Clock size={32} className="text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Link Expired</h2>
          <p className="text-slate-500 leading-relaxed mb-8">
            For your security, reset links are only valid for a short time. Request a new one to continue.
          </p>
          <Link href="/forgot-password" className="w-full">
            <Button size="default" className="w-full h-14 text-lg">
              Request New Link <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // --- RENDER SUCCESS STATE ---
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 px-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Password Updated</h2>
          <p className="text-slate-500 leading-relaxed mb-8">
            Your security is our priority. Your password has been changed successfully.
          </p>
          <Link href="/login" className="w-full">
            <Button className="w-full h-14 text-lg">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // --- RENDER FORM STATE ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full">
        <header className="mb-4 text-center lg:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Create new password</h1>
            <p className="text-slate-500 mt-2">Enter a strong password to secure your account.</p>
        </header>

        {error && (
            <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 shadow-sm shadow-rose-100/50 animate-shake">
                {/* Icon adds instant recognition */}
                <div className="p-1 bg-rose-100 rounded-full shrink-0">
                    <X size={14} className="text-rose-600 stroke-[3px]" />
                </div>
                
                <p className="text-sm font-semibold leading-tight">
                    {
                     error.includes("different") ? "New password must be different from the old one"
                      : error
                    }
                </p>
                </div>
            </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">New Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className={`w-full px-4 py-3.5 rounded-xl border transition-all outline-none bg-slate-50/50 focus:ring-2 ${
                  triedToSubmit && !allPasswordMet 
                  ? 'border-rose-500 ring-rose-500/10 animate-shake' 
                  : 'border-slate-200 focus:ring-primary/20 focus:border-primary'
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* REAL-TIME CHECKLIST */}
            {(password.length > 0 || triedToSubmit) && (
              <div className={`mt-4 grid grid-cols-1 gap-2 p-4 rounded-xl border transition-colors ${
                triedToSubmit && !allPasswordMet ? 'bg-rose-50/30 border-rose-100' : 'bg-slate-50/50 border-slate-100'
              }`}>
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[12px]">
                    {req.met ? (
                      <Check size={14} className="text-emerald-600 stroke-[3px]" />
                    ) : (
                      <X size={14} className={triedToSubmit ? "text-rose-500" : "text-slate-300"} />
                    )}
                    <span className={req.met ? "text-emerald-700 font-medium" : triedToSubmit ? "text-rose-600" : "text-slate-500"}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button 
            disabled={loading}
            className="w-full h-14 text-lg"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
          </Button>
          
          <div className="text-center">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-primary transition-colors">
                Cancel and return to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}