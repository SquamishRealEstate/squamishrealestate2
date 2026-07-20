"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  X,
} from "lucide-react";
import HomeButton from "../ui/homeButton";
import { Button } from "../ui/button";
import { supabase } from "@/config/supabaseClient";
import { Input } from "../ui/input";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

export default function Contact() {
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [reason, setReason] = useState<string>("General Inquiry");
  const searchParams = useSearchParams();
  const paramReason = searchParams.get("reason") || "General Inquiry";

  useEffect(() => {
    setReason(paramReason);
    setFormData((prev) => ({ ...prev, reason: paramReason }));
  }, [paramReason]);

  const month = currentMonthDate.getMonth();
  const year = currentMonthDate.getFullYear();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    reason: reason,
    templateType: "CONTACT_FORM", // Default template type
  });

  const validations = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    name: formData.name.trim().length >= 2,
    message: formData.message.trim().length >= 2,
  };

  const isFormValid =
    validations.email && validations.name && validations.message;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Attempting to submit form..."); // Debugging log
    setTriedToSubmit(true);

    if (!isFormValid) {
      return;
    }

    const isScheduling =
      formData.reason === "Schedule a Meeting" ||
      formData.reason === "Schedule a Tour";

    const scheduledDate = isScheduling ? selectedDate : null;

    const payload = {
      ...formData,
      date: formatDate(scheduledDate),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Server responded with:", result);

      const { error: supabaseError } = await supabase.from("inquiries").insert([
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
          reason: formData.reason,
          date: scheduledDate, // Make sure you have a 'date' column in Supabase
        },
      ]);

      if (supabaseError) {
        return;
      }

      if (response.ok) {
        setMessage("Message successfully sent! We'll be in touch soon.");
        setFormData({
          name: "",
          email: "",
          message: "",
          reason: "General Inquiry",
          templateType: "CONTACT_FORM",
        });
        setTriedToSubmit(false);

        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setMessage("Failed to submit inquiry. Please try again later.");
    }
  };

  const getFieldStatus = (isValid: boolean, value: string) => {
    const hasInteracted = value.length > 0 || triedToSubmit;
    return {
      showError: hasInteracted && !isValid,
      className: `w-full px-4 py-3 rounded-xl border transition-all outline-none bg-muted/40 focus:ring-2 ${
        hasInteracted && !isValid
          ? "border-destructive ring-destructive/20 animate-shake"
          : "border-border focus:ring-ring/30 focus:border-primary"
      }`,
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      <HomeButton />

      {/* HEADER SECTION */}
      <div className="relative h-[45vh] w-full bg-slate-900 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070"
          alt="Squamish"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            Contact Us
          </h1>
          <p className="text-lg text-white/80 font-medium italic">
            Find your mountian home.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:-mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: CONTACT INFO */}
          <div className="lg:col-span-1 space-y-6">
            {/* Realtor Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">
                Squamish Expert
              </h3>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-2xl overflow-hidden">
                  <img
                    src="https://lh3.googleusercontent.com/d/1N02fnHn6r8AWbQJMz0D6Rv1hO-8F6Kcl"
                    alt="Sean Brawley"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">
                    Sean Brawley
                  </h4>
                  <p className="text-xs font-semibold text-slate-400">
                    PERSONAL REAL ESTATE CORP
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <ContactItem
                  icon={<MapPin size={20} />}
                  label="Address"
                  info="PO Box 101, Garibaldi BC"
                />
                <ContactItem
                  icon={<Phone size={20} />}
                  label="Phone"
                  info="604.849.0500"
                />
                <ContactItem
                  icon={<Mail size={20} />}
                  label="Mail"
                  info="sean@squamish.realestate"
                />
              </div>

              {/* Socials */}
              <div className="mt-8 pt-8 border-t border-slate-100 flex gap-3">
                <SocialLink
                  href="https://www.facebook.com/sean.squamish.realestate"
                  target="_blank"
                  icon={<Facebook size={18} />}
                />
                <SocialLink
                  href="https://www.instagram.com/sean.squamish.realestate/"
                  target="_blank"
                  icon={<Instagram size={18} />}
                />
                <SocialLink
                  href="https://twitter.com/SquamishRE"
                  target="_blank"
                  icon={<Twitter size={18} />}
                />
                <SocialLink
                  href="https://www.linkedin.com/company/squamish-realestate"
                  target="_blank"
                  icon={<Linkedin size={18} />}
                />
                <SocialLink
                  href="https://wa.me/16048490500"
                  target="_blank"
                  icon={<MessageCircle size={18} />}
                />
              </div>
            </div>
            <Image
              src="/images/REMAX-Masters.jpg"
              alt="Squamish Real Estate Logo"
              style={{ display: "block", margin: "0 auto" }}
              height={80}
              width={80}
              priority
            ></Image>
          </div>

          {/* RIGHT COLUMN: MESSAGE FORM */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-12">
              <h3 className="text-3xl font-bold mb-2">Get in Touch</h3>
              <p className="text-slate-500 mb-10">
                Have a question about a listing or Squamish real estate? Send us
                a message.
              </p>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">
                      Full Name
                    </label>
                    <Input
                      className={`h-12 ${
                        getFieldStatus(validations.name, formData.name)
                          .className
                      }`}
                      value={formData.name}
                      name="name"
                      placeholder="Your Name"
                      onChange={handleChange}
                    />
                    {(formData.name.length > 0 || triedToSubmit) &&
                      !validations.name && (
                        <div className="flex items-center gap-1.5 text-[11px] text-destructive px-1">
                          <X size={12} /> <span>At least 2 characters</span>
                        </div>
                      )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">
                      Email Address
                    </label>
                    <Input
                      className={`h-12 ${
                        getFieldStatus(validations.email, formData.email)
                          .className
                      }`}
                      value={formData.email}
                      name="email"
                      placeholder="email@example.com"
                      onChange={handleChange}
                    />
                    {(formData.email.length > 0 || triedToSubmit) &&
                      !validations.email && (
                        <div className="flex items-center gap-1.5 text-[11px] px-1">
                          <X size={12} className="text-destructive" />{" "}
                          <span className="text-destructive">
                            Enter a valid email address
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                {/* NEW: Reason Dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">
                    Reason for Contact
                  </label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-slate-700"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Schedule a Tour">Schedule a Tour</option>
                    <option value="Schedule a Meeting">
                      Schedule a Meeting
                    </option>
                  </select>
                </div>

                {/* NEW: Conditional Calendar Rendering */}
                {(formData.reason === "Schedule a Meeting" ||
                  formData.reason === "Schedule a Tour") && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-semibold text-slate-700 ml-1 mb-2 block">
                      Select a Date
                    </label>
                    {/* Changed border-grayborder to border-slate-200 to match your UI */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                      {/* Calendar Header */}
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm">
                          {monthNames[month]} {year}
                        </h3>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1.5 hover:bg-slate-100 rounded-md transition-colors font-bold"
                          >
                            &larr;
                          </button>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1.5 hover:bg-slate-100 rounded-md transition-colors font-bold"
                          >
                            &rarr;
                          </button>
                        </div>
                      </div>

                      {/* Days of the Week Header */}
                      <div className="grid grid-cols-7 text-center text-xs font-semibold mb-2 text-slate-500">
                        <div>Su</div>
                        <div>Mo</div>
                        <div>Tu</div>
                        <div>We</div>
                        <div>Th</div>
                        <div>Fr</div>
                        <div>Sa</div>
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {Array.from({ length: firstDayIndex }).map((_, idx) => (
                          <div key={`empty-${idx}`} />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                          const dayNum = idx + 1;
                          const thisDate = new Date(year, month, dayNum);

                          const isSelected =
                            selectedDate.getDate() === dayNum &&
                            selectedDate.getMonth() === month &&
                            selectedDate.getFullYear() === year;

                          const isPast =
                            new Date(year, month, dayNum, 23, 59, 59) <
                            new Date();

                          return (
                            <button
                              type="button"
                              key={dayNum}
                              disabled={isPast}
                              onClick={() => setSelectedDate(thisDate)}
                              className={`py-1.5 text-xs font-semibold rounded-md transition-all
                  ${
                    isSelected
                      ? "bg-primary text-white font-bold shadow-sm scale-105"
                      : isPast
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-700 hover:bg-slate-100"
                  }`}
                            >
                              {dayNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">
                    Message details
                  </label>
                  <textarea
                    className={
                      getFieldStatus(validations.message, formData.message)
                        .className
                    }
                    value={formData.message}
                    name="message"
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us about the property or area you're interested in..."
                  />
                  {(formData.message.length > 0 || triedToSubmit) &&
                    !validations.message && (
                      <div className="flex items-center gap-1.5 text-[11px] text-destructive px-1">
                        <X size={12} /> <span>At least 2 characters</span>
                      </div>
                    )}
                </div>

                {message && (
                  <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100 animate-in fade-in zoom-in-95">
                    {message}
                  </div>
                )}

                <Button className="w-full h-14 py-3">
                  Send Message
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components for cleaner code
export function ContactItem({
  icon,
  label,
  info,
}: {
  icon: React.ReactNode;
  label: string;
  info: string;
}) {
  return (
    <div className="flex gap-4 group">
      <div className="text-primary mt-1">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">
          {info}
        </p>
      </div>
    </div>
  );
}

function SocialLink({
  href,
  icon,
  color = "bg-slate-50 text-slate-400 border-slate-200",
}: any) {
  return (
    <Link
      href={href}
      target="_blank"
      className={`h-11 w-11 flex items-center justify-center rounded-xl border transition-all hover:scale-110 hover:shadow-md ${color}`}
    >
      {icon}
    </Link>
  );
}
