"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from "@/config/supabaseClient";
import Link from 'next/link';
import { Button } from '../ui/button';
import HomeButton from '../ui/homeButton'

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const validations = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    password: {
      length: formData.password.length > 0,
    }
  };

  const isFormValid = validations.email && validations.password.length;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
          // 1. Trigger a resend programmatically (optional but helpful)
          await supabase.auth.resend({
            type: 'signup',
            email: formData.email,
          });

          // 2. Redirect to the guide page
          router.push(`/check-email?email=${encodeURIComponent(formData.email)}`);
          return;
      }
      setError(authError.message);
      setLoading(false);
    } else {
      // Programmatic navigation after successful login
      router.push('/'); 
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-foreground">
      <HomeButton />
      {/* LEFT SIDE: Visual Branding (Matches Register) */}
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
                <span className="text-2xl font-bold tracking-tight">Squamish Real Estate</span>
            </div>
            <h1 className="text-5xl font-extrabold mb-4 leading-tight">
                Welcome back <br /> 
                <span className="text-accent font-accent italic font-medium text-4xl">to the mountains.</span>
            </h1>
            <p className="text-white/70 text-lg">Sign in to access your saved properties and personalized market alerts.</p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img src="/images/icon.ico" alt="Home" className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tighter text-foreground">Squamish Real Estate</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-foreground">Sign In</h2>
          <p className="mt-2 text-muted-foreground">
            Don&apos;t have an account? 
            {/* Declarative navigation using Link */}
            <Link href="/register" className="ml-1 font-semibold text-primary hover:text-accent underline-offset-4 hover:underline">
                Create one
            </Link>
          </p>

          {error && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 shadow-sm shadow-rose-100/50 animate-shake">
                {/* Icon adds instant recognition */}
                <div className="p-1 bg-rose-100 rounded-full shrink-0">
                  <X size={14} className="text-rose-600 stroke-[3px]" />
                </div>
                
                <p className="text-sm font-semibold leading-tight">
                  {error === "Email not confirmed" 
                    ? "Redirecting to verification..." 
                    : error}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input 
                type="text" name="email"
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/40 focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all outline-none" 
                placeholder="alex@example.com"
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
                >
                Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/40 focus:ring-2 focus:ring-ring/30 focus:border-primary transition-all outline-none" 
                  placeholder="••••••••"
                  onChange={handleChange}
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

            <Button type="submit" disabled={loading} className="w-full h-14 px-8 text-lg">
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Sign In 
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400">
              By signing in, you agree to our <Link href="/terms-of-use" target='_blank' className="text-foreground underline">Terms Of Use</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}