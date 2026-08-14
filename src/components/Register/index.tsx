"use client";

import React, { useState, Suspense, useEffect } from "react";
import {
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/config/supabaseClient";
import { Button } from "../ui/button";
import Link from "next/link";
import VowModal from "@/components/Register/vowModal";
import HomeButton from "../ui/homeButton";
import { Input } from "../ui/input";
import Image from "next/image";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  // 1. Capture the callback URL (e.g., /property/123)
  // const callbackUrl = searchParams.get("callback") || "/";
  // const redirectTo = `${window.location.origin}${callbackUrl}`;

  const [redirectTo, setRedirectTo] = useState("");

  useEffect(() => {
    const callbackUrl = searchParams.get("callback") || "/";
    // Now window is safe to access because we are in useEffect
    setRedirectTo(`${process.env.NEXT_PUBLIC_SITE_URL}${callbackUrl}`);
  }, [searchParams]);

  const [loading, setLoading] = useState(false);
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showVowModal, setShowVowModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });

  // --- Centralized Validation Logic ---
  const validations = {
    firstName: formData.firstName.trim().length >= 2,
    lastName: formData.lastName.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    password: {
      length: formData.password.length >= 8,
      upper: /[A-Z]/.test(formData.password),
      lower: /[a-z]/.test(formData.password),
      number: /[0-9]/.test(formData.password),
      special: /[!@#$%^&*]/.test(formData.password),
    },
    agreeToTerms: formData.agreeToTerms === true,
  };

  const passwordRequirements = [
    { label: "8 characters minimum", met: validations.password.length },
    { label: "One uppercase character", met: validations.password.upper },
    { label: "One lowercase character", met: validations.password.lower },
    { label: "One number", met: validations.password.number },
    { label: "One special character", met: validations.password.special },
  ];

  const allPasswordMet = passwordRequirements.every((req) => req.met);
  const isFormValid =
    validations.firstName &&
    validations.lastName &&
    validations.email &&
    allPasswordMet &&
    validations.agreeToTerms;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriedToSubmit(true);

    if (!isFormValid) {
      return;
    }

    setShowVowModal(true);
  };

  const finalizeRegistration = async () => {
    setLoading(true);
    setShowVowModal(false);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            vow_agreed: true,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      } else if (data) {
        router.push(`/check-email?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setLoading(false);
    }
  };

  // The logic is now encapsulated cleanly
  const handleAgree = async () => {
    setShowVowModal(false);
    await finalizeRegistration();
  };

  const handleDisagree = () => {
    setShowVowModal(false);
    setError("You must accept the VOW terms to create an account.");
  };

  // Helper for consistent field styling
  const getFieldStatus = (isValid: boolean, value: string) => {
    const hasInteracted = value.length > 0 || triedToSubmit;
    return {
      showError: hasInteracted && !isValid,
      className: `w-full h-12 px-4 py-3 rounded-xl border transition-all outline-none bg-muted/40 focus:ring-2 ${
        hasInteracted && !isValid
          ? "border-destructive ring-destructive/20 animate-shake"
          : "border-border focus:ring-ring/30 focus:border-primary"
      }`,
    };
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-foreground">
      <HomeButton />
      {/* LEFT SIDE: Visual Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070"
          alt="Squamish Mountains"
          fill
          className="absolute inset-0 object-cover opacity-60 scale-105 hover:scale-100 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        <div className="relative z-10 p-12 max-w-xl text-white">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-white p-2 rounded-lg border border-white/20">
              <Image src="/images/icon.ico" alt="Home" width={30} height={30} />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Squamish Real Estate
            </span>
          </div>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Elevate your living <br />{" "}
            <span className="text-accent italic font-medium text-4xl leading-tight">
              in the Sea to Sky.
            </span>
          </h1>
          <ul className="space-y-4 text-white/80">
            {[
              "Exclusive early access to Squamish new developments.",
              "Personalized market reports and price alerts.",
              "Connect with local adventure-driven real estate experts.",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="text-accent mt-1 shrink-0" size={20} />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-32">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
          <p className="mt-2 text-muted-foreground">
            Already have an account?
            {/* Declarative navigation using Link */}
            <Link
              href="/login"
              className="ml-1 font-semibold text-primary hover:text-accent underline-offset-4 hover:underline"
            >
              Sign in
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
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            {/* NAME FIELDS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  First Name
                </label>
                <Input
                  name="firstName"
                  className={
                    getFieldStatus(validations.firstName, formData.firstName)
                      .className
                  }
                  placeholder="Alex"
                  onChange={handleChange}
                />
                {(formData.firstName.length > 0 || triedToSubmit) &&
                  !validations.firstName && (
                    <div className="flex items-center gap-1.5 text-[11px] text-destructive px-1">
                      <X size={12} /> <span>At least 2 characters</span>
                    </div>
                  )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Last Name
                </label>
                <Input
                  name="lastName"
                  className={
                    getFieldStatus(validations.lastName, formData.lastName)
                      .className
                  }
                  placeholder="Rivera"
                  onChange={handleChange}
                />
                {(formData.lastName.length > 0 || triedToSubmit) &&
                  !validations.lastName && (
                    <div className="flex items-center gap-1.5 text-[11px] text-destructive px-1">
                      <X size={12} /> <span>At least 2 characters</span>
                    </div>
                  )}
              </div>
            </div>

            {/* EMAIL FIELD */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <Input
                name="email"
                className={
                  getFieldStatus(validations.email, formData.email).className
                }
                placeholder="alex@example.com"
                onChange={handleChange}
              />
              {(formData.email.length > 0 || triedToSubmit) && (
                <div className="flex items-center gap-1.5 text-[11px] px-1">
                  {validations.email ? (
                    <>
                      <Check size={12} className="text-emerald-600" />{" "}
                      <span className="text-emerald-700">
                        Valid email format
                      </span>
                    </>
                  ) : (
                    <>
                      <X size={12} className="text-destructive" />{" "}
                      <span className="text-destructive">
                        Enter a valid email address
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* PASSWORD FIELD */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={
                    getFieldStatus(allPasswordMet, formData.password).className
                  }
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {(formData.password.length > 0 || triedToSubmit) && (
                <div
                  className={`mt-3 grid grid-cols-1 gap-1.5 p-3 rounded-xl border ${triedToSubmit && !allPasswordMet ? "bg-destructive/5 border-destructive/20" : "bg-slate-50/50 border-border"}`}
                >
                  {passwordRequirements.map((req, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-[11px]"
                    >
                      {req.met ? (
                        <Check size={12} className="text-emerald-600" />
                      ) : (
                        <X
                          size={12}
                          className={
                            triedToSubmit
                              ? "text-destructive"
                              : "text-slate-400"
                          }
                        />
                      )}
                      <span
                        className={
                          req.met
                            ? "text-emerald-700 font-medium"
                            : triedToSubmit
                              ? "text-destructive"
                              : "text-slate-500"
                        }
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 pt-2">
              {/* Terms & Privacy Checkbox */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-start">
                  <Input
                    id="terms"
                    name="agreeToTerms"
                    type="checkbox"
                    className={`h-4 w-4 mt-0.5 rounded border-border text-primary focus:ring-primary/30 transition-all ${
                      triedToSubmit && !validations.agreeToTerms
                        ? "ring-2 ring-destructive animate-shake"
                        : ""
                    }`}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="terms"
                    className={`ml-3 text-xs leading-normal ${
                      triedToSubmit && !validations.agreeToTerms
                        ? "text-destructive font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    I have read
                    <span className="mx-1"></span>
                    <a
                      href="https://drive.google.com/file/d/1rYDvlhDfFgP_LivrjcdYDTKszc1a0e6P/preview"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium text-foreground hover:text-primary transition-colors"
                    >
                      Disclosure of Representation in Trading Services
                    </a>
                    <span className="mx-1">and</span>
                    <a
                      href="https://drive.google.com/file/d/15zXRdqIUbv48Tojx5iw9p4OHeBnFgIwT/preview"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium text-foreground hover:text-primary transition-colors"
                    >
                      Privacy Notice and Consent
                    </a>
                    .
                  </label>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full h-14 px-8 text-lg"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />{" "}
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
      <VowModal
        isOpen={showVowModal}
        onAgree={handleAgree}
        onDisagree={handleDisagree}
      />
    </div>
  );
}

export default function Register() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center font-bold text-xs uppercase tracking-widest animate-pulse">
          Initializing Security...
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
