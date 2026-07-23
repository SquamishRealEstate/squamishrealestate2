"use client";

import React, { useMemo, useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { User, Mail, Phone, AlertCircle, MapPin } from "lucide-react";
import {
  formatDate,
  formatDatePST,
  formatPrice,
  formatTimePST,
} from "@/lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";
import { ContactItem } from "../Contact";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export function ListingGallery({
  listing,
  photos,
  singlePhotoOnly = false,
}: {
  listing?: any;
  photos?: any[];
  singlePhotoOnly?: boolean;
}) {
  // Extract photos from whichever prop was provided
  const rawPhotos = photos || listing?.photos || [];

  const displayPhotos = [...rawPhotos];
  // if (!singlePhotoOnly && displayPhotos.length < 3) {
  //   const fallbacks = [
  //     "/images/dashboard/Squamish-1.jpg",
  //     "/images/dashboard/Squamish-2.jpg",
  //     "/images/dashboard/Squamish-3.jpg",
  //     "/images/dashboard/Squamish-4.jpg",
  //     "/images/dashboard/Squamish-5.jpg",
  //     "/images/dashboard/Squamish-6.jpg",
  //     "/images/dashboard/Squamish-7.jpg",
  //   ];

  //   fallbacks.forEach((fallback) => {
  //     if (displayPhotos.length < 3 && !displayPhotos.includes(fallback)) {
  //       displayPhotos.push(fallback);
  //     }
  //   });
  // }

  if (!singlePhotoOnly && displayPhotos.length < 3) {
    const fallbacks = [
      "/images/dashboard/Squamish-1.jpg",
      "/images/dashboard/Squamish-2.jpg",
      "/images/dashboard/Squamish-3.jpg",
      "/images/dashboard/Squamish-4.jpg",
      "/images/dashboard/Squamish-5.jpg",
      "/images/dashboard/Squamish-6.jpg",
      "/images/dashboard/Squamish-7.jpg",
    ];

    // 1. Shuffle the fallbacks array randomly
    const shuffledFallbacks = fallbacks.sort(() => 0.5 - Math.random());

    // 2. Loop through the randomized array
    for (const fallback of shuffledFallbacks) {
      // Stop checking once we have exactly 3 photos
      if (displayPhotos.length >= 3) break;

      // Only push if the photo isn't already in the array (prevents duplicates)
      if (!displayPhotos.includes(fallback)) {
        displayPhotos.push(fallback);
      }
    }
  }

  const remainingCount = displayPhotos.length - 3;
  const mainImageUrl = displayPhotos[0] || "/images/dashboard/Squamish-1.jpg";
  const imageUrl1 = displayPhotos[1] || "/images/dashboard/Squamish-2.jpg";
  const imageUrl2 = displayPhotos[2] || "/images/dashboard/Squamish-3.jpg";

  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Ref to target the inline scrolling strip container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Lightbox navigation logic
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex === null || displayPhotos.length === 0) return;
    setActivePhotoIndex((prev) =>
      prev === 0 ? displayPhotos.length - 1 : prev! - 1,
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIndex === null || displayPhotos.length === 0) return;
    setActivePhotoIndex((prev) =>
      prev === displayPhotos.length - 1 ? 0 : prev! + 1,
    );
  };

  // Preview Carousel navigation logic
  const scrollPreview = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth; // Scroll exactly one full card width

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* CONDITIONAL LAYOUT SWAP */}
      {singlePhotoOnly ? (
        /* 🌟 Horizontal Preview Carousel with Target Navigation Arrows */
        <div className="relative w-full max-w-2xl mx-auto px-2 group/carousel">
          {/* Left Arrow Button */}
          <button
            onClick={() => scrollPreview("left")}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/90 hover:bg-white text-neutral-800 rounded-full shadow-md border border-neutral-200 transition-all opacity-0 group-hover/carousel:opacity-100 hidden sm:flex items-center justify-center"
            aria-label="Scroll preview left"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          {/* Scrolling Image Strip Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-3 pt-1 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {displayPhotos.map((url, index) => (
              <div
                key={index}
                className="relative group flex-shrink-0 w-full h-[260px] sm:h-[360px] bg-neutral-100 rounded-3xl overflow-hidden cursor-pointer border border-slate-200 shadow-sm snap-center"
                onClick={() => setActivePhotoIndex(index)}
              >
                <Image
                  src={url}
                  fill
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                  alt={listing.civic_address}
                />

                {/* Counter Badge on every slide */}
                <div className="absolute bottom-4 right-4 z-20">
                  <div className="flex items-center justify-center bg-white/95 text-neutral-900 text-xs font-bold uppercase tracking-wider h-9 px-4 rounded-md shadow-md border border-neutral-200 select-none whitespace-nowrap">
                    {index + 1} / {displayPhotos.length}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={() => scrollPreview("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/90 hover:bg-white text-neutral-800 rounded-full shadow-md border border-neutral-200 transition-all opacity-0 group-hover/carousel:opacity-100 hidden sm:flex items-center justify-center"
            aria-label="Scroll preview right"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        /* Original 3-image panel grid layout */
        /* Original 3-image panel grid layout */
        <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-2 gap-4 h-[300px] sm:h-[400px] md:h-[450px] lg:h-[600px] w-full p-4">
          {/* Note the added 'relative' class to the parent div */}
          <div
            className="relative col-span-2 row-span-2 h-full w-full cursor-pointer overflow-hidden rounded-lg"
            onClick={() => displayPhotos.length > 0 && setActivePhotoIndex(0)}
          >
            <Image
              className="object-cover transition-transform duration-300 hover:scale-[1.02]"
              src={mainImageUrl}
              fill
              alt={listing.civic_address}
            />
          </div>

          {/* Note the added 'relative' class to the parent div */}
          <div
            className="relative hidden md:block col-span-1 row-span-1 h-full w-full cursor-pointer overflow-hidden rounded-lg"
            onClick={() => displayPhotos.length > 1 && setActivePhotoIndex(1)}
          >
            <Image
              className="object-cover transition-transform duration-300 hover:scale-[1.02]"
              src={imageUrl1}
              fill
              alt={listing.civic_address}
            />
          </div>

          {/* This one already had 'relative' for your button, which is perfect! */}
          <div
            className="relative hidden md:block col-span-1 row-span-1 h-full w-full cursor-pointer overflow-hidden rounded-lg group"
            onClick={() => displayPhotos.length > 2 && setActivePhotoIndex(2)}
          >
            <Image
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              src={imageUrl2}
              fill
              alt={listing.civic_address}
            />

            {remainingCount > 0 && (
              <div className="absolute bottom-4 right-4 z-20">
                <div className="flex items-center justify-center bg-white/95 text-neutral-900 text-xs font-bold uppercase tracking-wider h-9 px-4 rounded-md shadow-md border border-neutral-200 transition-all transform group-hover:scale-105 group-hover:bg-white select-none whitespace-nowrap">
                  See all {displayPhotos.length} photos
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- REUSED LIGHTBOX OVERLAY --- */}
      {activePhotoIndex !== null && displayPhotos.length > 0 && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActivePhotoIndex(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[210] p-2 bg-neutral-900/50 rounded-full backdrop-blur"
            onClick={() => setActivePhotoIndex(null)}
          >
            <X size={24} />
          </button>

          <button
            className="absolute left-4 md:left-8 text-white/70 hover:text-white transition-colors z-[210] p-3 bg-neutral-900/50 rounded-full backdrop-blur"
            onClick={handlePrev}
          >
            <ChevronLeft size={32} strokeWidth={2} />
          </button>

          <div className="relative max-w-5xl max-h-[85vh] w-full h-full px-4 flex flex-col items-center justify-center select-none">
            <Image
              src={displayPhotos[activePhotoIndex]}
              alt={listing.civic_address}
              width={1920}
              height={1080}
              onClick={(e) => e.stopPropagation()}
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-md shadow-2xl animate-in zoom-in-95 duration-200"
            />
            <p className="text-white/60 text-xs font-medium tracking-wider mt-4 bg-neutral-950/40 px-3 py-1 rounded-full backdrop-blur">
              {activePhotoIndex + 1} / {displayPhotos.length}
            </p>
          </div>

          <button
            className="absolute right-4 md:right-8 text-white/70 hover:text-white transition-colors z-[210] p-3 bg-neutral-900/50 rounded-full backdrop-blur"
            onClick={handleNext}
          >
            <ChevronRight size={32} strokeWidth={2} />
          </button>
        </div>
      )}
    </>
  );
}

export const OpenHousesSection = ({
  openhouses,
  listing,
}: {
  openhouses: any[];
  listing: any;
}) => {
  function createGoogleCalendarLink(event: any) {
    const start = new Date(event.start_timestamp)
      .toISOString()
      .replace(/-|:|\.\d+/g, "");

    const end = new Date(event.end_timestamp)
      .toISOString()
      .replace(/-|:|\.\d+/g, "");

    const text = encodeURIComponent("Open House");
    const details = encodeURIComponent(event.comments || "");
    const location = encodeURIComponent(
      `Open House at ${listing.civic_address}`,
    );

    const timeZone = "America/Los_Angeles";

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}&ctz=${timeZone}`;
  }

  const now = new Date();

  const { upcoming, past } = useMemo(() => {
    const sorted = [...(openhouses || [])].sort(
      (a, b) =>
        new Date(a.start_timestamp).getTime() -
        new Date(b.start_timestamp).getTime(),
    );

    return {
      upcoming: sorted.filter((h) => new Date(h.start_timestamp) >= now),
      past: sorted.filter((h) => new Date(h.start_timestamp) < now),
    };
  }, [openhouses]);

  if (!openhouses || openhouses.length === 0) {
    return (
      <div className="p-4 border-b border-grayborder">
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-4">
          Open Houses
        </h2>

        <div className="text-sm text-gray-500 bg-gray-50 border border-grayborder rounded-xl p-6 text-center">
          No open houses scheduled
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 pb-8 border-b border-grayborder">
      <h2 className="text-base md:text-lg font-semibold text-foreground mb-4 tracking-tight">
        Open Houses
      </h2>

      {/* UPCOMING */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {upcoming.map((openHouse, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-grayborder shadow-sm hover:shadow-md transition p-5 flex flex-col gap-3"
          >
            <div className="text-sm font-semibold text-primary">
              {formatDatePST(openHouse.start_timestamp)}
            </div>

            <div className="text-sm text-gray">
              {formatTimePST(openHouse.start_timestamp)} –{" "}
              {formatTimePST(openHouse.end_timestamp)}
            </div>

            {openHouse.Comments && (
              <p className="text-sm text-gray leading-relaxed line-clamp-3">
                {openHouse.Comments}
              </p>
            )}

            <div className="mt-auto pt-2">
              <a
                href={createGoogleCalendarLink(openHouse)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Add to calendar →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* PAST SECTION */}
      {past.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray mb-3">
            Past Open Houses
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.map((openHouse, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-grayborder rounded-xl p-5 opacity-70"
              >
                <div className="text-sm font-semibold text-gray-600">
                  {formatDatePST(openHouse.start_timestamp)}
                </div>

                <div className="text-sm text-gray-500">
                  {formatTimePST(openHouse.start_timestamp)} –{" "}
                  {formatTimePST(openHouse.end_timestamp)}
                </div>

                {openHouse.Comments && (
                  <p className="text-sm text-gray-500 line-clamp-3 mt-2">
                    {openHouse.Comments}
                  </p>
                )}

                <div className="mt-3 text-xs text-gray-400">Past event</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ScheduleTour = ({ listing }: { listing: any }) => {
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(
    new Date(),
  );
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("09:30 AM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    agreeToTerms: false,
    templateType: "SCHEDULE_TOUR",
  });

  const validations = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    name: formData.name.trim().length >= 2,
    phone:
      formData.phone.trim() === "" ||
      /^\+?[0-9\s\-()]{7,}$/.test(formData.phone),
    agreeToTerms: formData.agreeToTerms === true,
  };

  const isFormValid =
    validations.email &&
    validations.name &&
    validations.phone &&
    validations.agreeToTerms;
  const getFieldStatus = (isValid: boolean, value: string) => {
    const hasInteracted = value.length > 0 || triedToSubmit;
    return {
      showError: hasInteracted && !isValid,
      className: `h-12 w-full bg-muted/5 border rounded-lg p-3.5 pl-11 text-sm transition-all outline-none ${
        hasInteracted && !isValid
          ? "border-destructive ring-2 ring-destructive/20 animate-shake"
          : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
      }`,
    };
  };

  const timeSlots = [
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
  ];

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

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
    setCurrentCalendarDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(year, month + 1, 1));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onScheduleTourSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setTriedToSubmit(true);

    if (!isFormValid) return; // Prevent submission if invalid
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          propertyAddress: listing.civic_address,
          date: formatDate(selectedDate),
          time: selectedTime,
          templateType: formData.templateType,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      setMessage("Schedule Tour Request Submitted! We will be in touch soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        agreeToTerms: false,
        templateType: "SCHEDULE_TOUR",
      });
      setTriedToSubmit(false); // Reset validation state
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("Something went wrong. Please try again later.");
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mb-4 mx-auto space-y-4 antialiased font-body px-2">
      <div className="p-4 border-b border-grayborder">
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-4">
          Schedule a Tour
        </h2>
      </div>
      <form onSubmit={onScheduleTourSubmit} className="space-y-5">
        {/* INLINE CALENDAR PICKER */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Select a Date
          </label>
          <div className="bg-white border border-grayborder rounded-md p-4 shadow-sm">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm">
                {monthNames[month]} {year}
              </h3>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-secondary-foreground rounded-md transition-colors font-bold"
                >
                  &larr;
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-secondary-foreground rounded-md transition-colors font-bold"
                >
                  &rarr;
                </button>
              </div>
            </div>

            {/* Days of the Week Header */}
            <div className="grid grid-cols-7 text-center text-xs font-semiboldmb-2">
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
                  new Date(year, month, dayNum, 23, 59, 59) < new Date();

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
                            ? "text-muted-foreground cursor-not-allowed"
                            : "text-primary hover:bg-secondary-foreground"
                      }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* TIME PICKER */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Select a Time
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 border border-grayborder rounded-md bg-grayLight/50">
            {timeSlots.map((time) => {
              const isTimeActive = time === selectedTime;
              return (
                <button
                  type="button"
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2.5 text-xs font-semibold rounded-md border text-center transition-all
                    ${
                      isTimeActive
                        ? "bg-primary text-white shadow-sm"
                        : "bg-white text-primary hover:bg-secondary-foreground"
                    }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* FORM INPUT FIELDS */}

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 size-4" />
            <Input
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
              className={`${getFieldStatus(validations.name, formData.name).className}`}
            />
          </div>

          {getFieldStatus(validations.name, formData.name).showError && (
            <p className="flex items-center gap-1.5 text-[10px] text-destructive px-1 font-bold">
              <X size={12} /> Please enter your full name
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 size-4" />
            <Input
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="email@example.com"
              className={
                getFieldStatus(validations.email, formData.email).className
              }
            />
          </div>
          {getFieldStatus(validations.email, formData.email).showError && (
            <p className="flex items-center gap-1.5 text-[10px] text-destructive px-1 font-bold">
              <X size={12} /> Please enter a valid email address
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 size-4" />
            <Input
              name="phone"
              placeholder="123-456-7890"
              value={formData.phone}
              onChange={handleInputChange}
              className={
                getFieldStatus(validations.phone, formData.phone).className
              }
            />
          </div>
          {getFieldStatus(validations.phone, formData.phone).showError && (
            <p className="flex items-center gap-1.5 text-[10px] text-destructive px-1 font-bold">
              <X size={12} /> Please enter a valid phone number
            </p>
          )}
        </div>

        {/* TERMS CHECKBOX */}
        <div className="relative flex gap-x-3 items-center pt-2 pl-1">
          <Input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className={`h-4 w-4 mt-0.5 rounded border-border text-primary focus:ring-primary/30 transition-all ${
              triedToSubmit && !validations.agreeToTerms
                ? "ring-2 ring-destructive animate-shake"
                : ""
            }`}
          />
          <label
            htmlFor="agreeToTerms"
            className={`ml-3 text-xs leading-normal ${
              triedToSubmit && !validations.agreeToTerms
                ? "text-destructive font-medium"
                : "text-muted-foreground"
            }`}
          >
            I agree to{" "}
            <Link
              href="/terms-of-use"
              target="_blank"
              className="hover:text-primary hover:font-bold underline transition-colors"
            >
              Terms Of Use
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-statement"
              target="_blank"
              className="hover:text-primary hover:font-bold underline transition-colors"
            >
              Privacy Statement
            </Link>
          </label>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100 animate-in fade-in zoom-in-95 flex items-center gap-2">
            <AlertCircle size={16} /> {message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 bg-[#204933] hover:bg-[#1a3d2b] transition-all group"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <div className="flex items-center gap-3">
              <span className="uppercase tracking-[0.3em] text-[10px] font-bold">
                Schedule Tour
              </span>
              <Send
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};

export const RequestInfo = ({ listing }: { listing: any }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    query: "",
    agreeToTerms: false,
    templateType: "REQUEST_INFO", // Default template type
  });

  const validations = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    name: formData.name.trim().length >= 2,
    query: formData.query.trim().length >= 2,
    agreeToTerms: formData.agreeToTerms === true,
  };

  const isFormValid =
    validations.email &&
    validations.name &&
    validations.query &&
    validations.agreeToTerms;
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;

    // Safely check for checkbox since HTMLTextAreaElement doesn't have a 'checked' property
    const checked = (event.target as HTMLInputElement).checked;

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

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          query: formData.query,
          propertyAddress: listing.civic_address,
          templateType: formData.templateType,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Message successfully sent! We'll be in touch soon.");
        setFormData({
          name: "",
          email: "",
          query: "",
          agreeToTerms: false,
          templateType: "REQUEST_INFO_FORM",
        });
        setTriedToSubmit(false);

        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setMessage("Something went wrong. Please try again later.");
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };
  const getFieldStatus = (
    isValid: boolean,
    value: string,
    hasIcon: boolean = true,
  ) => {
    const hasInteracted = value.length > 0 || triedToSubmit;
    return {
      showError: hasInteracted && !isValid,
      // Dynamically toggle between pl-11 (for icons) and px-4 (for normal inputs/textareas)
      className: `h-12 w-full bg-muted/5 border rounded-lg p-3.5 text-sm transition-all outline-none ${
        hasIcon ? "pl-11" : "px-4"
      } ${
        hasInteracted && !isValid
          ? "border-destructive ring-2 ring-destructive/20 animate-shake"
          : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
      }`,
    };
  };

  return (
    <div className="max-w-2xl mb-4 mx-auto space-y-4 antialiased font-body px-2">
      <div className="p-4 border-b border-grayborder">
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-4">
          Request More Information
        </h2>
      </div>
      <div className="space-y-6">
        {/* Realtor Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">
            Your Expert
          </h3>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/d/1OgL1mWWWQijCzPwQWjpIjoamLsUECTQH"
                alt="Sean Brawley"
                width={60}
                height={60}
                referrerPolicy="no-referrer"
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">Sean Brawley</h4>
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
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 size-4" />
            <Input
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
              className={`${getFieldStatus(validations.name, formData.name).className}`}
            />
          </div>

          {getFieldStatus(validations.name, formData.name).showError && (
            <p className="flex items-center gap-1.5 text-[10px] text-destructive px-1 font-bold">
              <X size={12} /> Please enter your full name
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 size-4" />
            <Input
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="email@example.com"
              className={
                getFieldStatus(validations.email, formData.email).className
              }
            />
          </div>
          {getFieldStatus(validations.email, formData.email).showError && (
            <p className="flex items-center gap-1.5 text-[10px] text-destructive px-1 font-bold">
              <X size={12} /> Please enter a valid email address
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            How can we help?
          </label>
          <textarea
            className={
              // Pass false here so it strips out the icon indent padding
              getFieldStatus(validations.query, formData.query, false).className
            }
            value={formData.query}
            name="query"
            onChange={handleInputChange}
            rows={5}
            placeholder="I have a question about the property. Please provide more details."
          />
          {(formData.query.length > 0 || triedToSubmit) &&
            !validations.query && (
              <div className="flex items-center gap-1.5 text-[11px] text-destructive px-1">
                <X size={12} /> <span>At least 2 characters</span>
              </div>
            )}
        </div>

        {/* TERMS CHECKBOX */}
        <div className="relative flex gap-x-3 items-center pt-2 pl-1">
          <Input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className={`h-4 w-4 mt-0.5 rounded border-border text-primary focus:ring-primary/30 transition-all ${
              triedToSubmit && !validations.agreeToTerms
                ? "ring-2 ring-destructive animate-shake"
                : ""
            }`}
          />
          <label
            htmlFor="agreeToTerms"
            className={`ml-3 text-xs leading-normal ${
              triedToSubmit && !validations.agreeToTerms
                ? "text-destructive font-medium"
                : "text-muted-foreground"
            }`}
          >
            I agree to{" "}
            <Link
              href="/terms-of-use"
              target="_blank"
              className="hover:text-primary hover:font-bold underline transition-colors"
            >
              Terms Of Use
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-statement"
              target="_blank"
              className="hover:text-primary hover:font-bold underline transition-colors"
            >
              Privacy Statement
            </Link>
          </label>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100 animate-in fade-in zoom-in-95 flex items-center gap-2">
            <AlertCircle size={16} /> {message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 bg-[#204933] hover:bg-[#1a3d2b] transition-all group"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <div className="flex items-center gap-3">
              <span className="uppercase tracking-[0.3em] text-[10px] font-bold">
                Request Info
              </span>
              <Send
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};

export const StartOffer = ({ listing }: { listing: any }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triedToSubmit, setTriedToSubmit] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    phone: "",
    purchasePrice: "",
    deposit: "",
    agreeToTerms: false,
    templateType: "START_OFFER",
  });

  const validations = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    name: formData.name.trim().length >= 2,
    message: formData.message.trim().length >= 0,
    purchasePrice: /^\d+(\.\d{1,2})?$/.test(formData.purchasePrice),
    deposit: /^\d+(\.\d{1,2})?$/.test(formData.deposit),
    phone:
      formData.phone.trim() === "" ||
      /^\+?[0-9\s\-()]{7,}$/.test(formData.phone),
    agreeToTerms: formData.agreeToTerms === true,
  };

  const isFormValid =
    validations.email &&
    validations.name &&
    validations.message &&
    validations.purchasePrice &&
    validations.deposit &&
    validations.phone &&
    validations.agreeToTerms;
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target;

    // Safely check for checkbox since HTMLTextAreaElement doesn't have a 'checked' property
    const checked = (event.target as HTMLInputElement).checked;

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

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          message: formData.message,
          phone: formData.phone,
          purchasePrice: formatPrice(formData.purchasePrice),
          deposit: formatPrice(formData.deposit),
          propertyAddress: listing.civic_address,
          templateType: formData.templateType,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Offer request submitted! We will be in touch soon.");
        setFormData({
          name: "",
          email: "",
          message: "",
          phone: "",
          purchasePrice: "",
          deposit: "",
          agreeToTerms: false,
          templateType: "REQUEST_INFO_FORM",
        });
        setTriedToSubmit(false);

        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setMessage("Something went wrong. Please try again later.");
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };
  const getFieldStatus = (
    isValid: boolean,
    value: string,
    hasIcon: boolean = true,
  ) => {
    const hasInteracted = value.length > 0 || triedToSubmit;
    return {
      showError: hasInteracted && !isValid,
      // Dynamically toggle between pl-11 (for icons) and px-4 (for normal inputs/textareas)
      className: `h-12 w-full bg-muted/5 border rounded-lg p-3.5 text-sm transition-all outline-none ${
        hasIcon ? "pl-11" : "px-4"
      } ${
        hasInteracted && !isValid
          ? "border-destructive ring-2 ring-destructive/20 animate-shake"
          : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
      }`,
    };
  };

  return (
    <div className="max-w-2xl mb-4 mx-auto space-y-4 antialiased font-body px-2">
      <div className="p-4 border-b border-grayborder">
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-4">
          Start an Offer
        </h2>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 size-4" />
            <Input
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleInputChange}
              className={`${getFieldStatus(validations.name, formData.name).className}`}
            />
          </div>

          {getFieldStatus(validations.name, formData.name).showError && (
            <p className="flex items-center gap-1.5 text-[10px] text-destructive px-1 font-bold">
              <X size={12} /> Please enter your full name
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 size-4" />
            <Input
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="email@example.com"
              className={
                getFieldStatus(validations.email, formData.email).className
              }
            />
          </div>
          {getFieldStatus(validations.email, formData.email).showError && (
            <p className="flex items-center gap-1.5 text-[10px] text-destructive px-1 font-bold">
              <X size={12} /> Please enter a valid email address
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Purchase Price
          </label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 size-4" />
            <Input
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleInputChange}
              placeholder="Enter purchase price"
              className={
                getFieldStatus(
                  validations.purchasePrice,
                  formData.purchasePrice,
                ).className
              }
            />
          </div>
          {getFieldStatus(validations.purchasePrice, formData.purchasePrice)
            .showError && (
            <p className="flex items-center gap-1.5 text-[10px] text-destructive px-1 font-bold">
              <X size={12} /> Please enter a valid purchase price
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Deposit Amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 size-4" />
            <Input
              name="deposit"
              value={formData.deposit}
              onChange={handleInputChange}
              placeholder="Enter deposit amount"
              className={
                getFieldStatus(validations.deposit, formData.deposit).className
              }
            />
          </div>
          {getFieldStatus(validations.deposit, formData.deposit).showError && (
            <p className="flex items-center gap-1.5 text-[10px] text-destructive px-1 font-bold">
              <X size={12} /> Please enter a valid deposit amount
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Additional Message
          </label>
          <textarea
            className={
              // Pass false here so it strips out the icon indent padding
              getFieldStatus(validations.message, formData.message, false)
                .className
            }
            value={formData.message}
            name="message"
            onChange={handleInputChange}
            rows={5}
            placeholder="Include any additional details or conditions for your offer."
          />
          {(formData.message.length > 0 || triedToSubmit) &&
            !validations.message && (
              <div className="flex items-center gap-1.5 text-[11px] text-destructive px-1">
                <X size={12} /> <span>At least 2 characters</span>
              </div>
            )}
        </div>

        {/* TERMS CHECKBOX */}
        <div className="relative flex gap-x-3 items-center pt-2 pl-1">
          <Input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className={`h-4 w-4 mt-0.5 rounded border-border text-primary focus:ring-primary/30 transition-all ${
              triedToSubmit && !validations.agreeToTerms
                ? "ring-2 ring-destructive animate-shake"
                : ""
            }`}
          />
          <label
            htmlFor="agreeToTerms"
            className={`ml-3 text-xs leading-normal ${
              triedToSubmit && !validations.agreeToTerms
                ? "text-destructive font-medium"
                : "text-muted-foreground"
            }`}
          >
            I agree to{" "}
            <Link
              href="/terms-of-use"
              target="_blank"
              className="hover:text-primary hover:font-bold underline transition-colors"
            >
              Terms Of Use
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-statement"
              target="_blank"
              className="hover:text-primary hover:font-bold underline transition-colors"
            >
              Privacy Statement
            </Link>
          </label>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100 animate-in fade-in zoom-in-95 flex items-center gap-2">
            <AlertCircle size={16} /> {message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 bg-[#204933] hover:bg-[#1a3d2b] transition-all group"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <div className="flex items-center gap-3">
              <span className="uppercase tracking-[0.3em] text-[10px] font-bold">
                Make Offer
              </span>
              <Send
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};

export const ListingExplorerTabs = ({ listing }: { listing: any }) => {
  const listingExplorer = [
    { name: "Schedule Tour", component: ScheduleTour },
    { name: "Request Info", component: RequestInfo },
    { name: "Start Offer", component: StartOffer },
  ];

  // Track the active index (default to 0 / the first tab)
  const [activeIndex, setActiveIndex] = useState(0);

  // Grab the component for the currently active tab
  const ActiveComponent = listingExplorer[activeIndex].component;

  return (
    <div className="max-w-2xl mb-4 mx-auto space-y-4 antialiased font-body px-2 flex flex-col">
      <div className="rounded-xl bg-white border border-border shadow-sm ">
        {/* 1. Top Row: Tab Buttons */}
        <div className="flex border-b border-gray-200">
          {listingExplorer.map((info, index) => {
            const isActive = activeIndex === index;
            return (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`flex-1 py-3 text-center text-sm font-semibold transition-colors duration-200 
                                    ${
                                      isActive
                                        ? "border-b-2 border-primary text-primary"
                                        : "text-gray-500 hover:text-accent hover:bg-gray-50"
                                    }`}
              >
                {info.name}
              </button>
            );
          })}
        </div>

        {/* 2. Bottom Portion: Reflects the active component */}
        <div className="p-4 min-h-[200px]">
          <ActiveComponent listing={listing} />
        </div>
      </div>
    </div>
  );
};
