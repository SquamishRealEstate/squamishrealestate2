"use client";

import React, { useState } from "react";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { faqItems } from "@/lib/faqData";

/**
 * Home page FAQ accordion.
 * Content lives in @/lib/faqData — edit the questions there; this
 * component and the FAQPage structured data update automatically.
 */
export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-grayLight py-16 md:py-20 antialiased">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section header — matches the site's label style */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-brand mb-3">
            <MessageCircleQuestion size={18} />
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold">
              Common Questions
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900">
            Squamish Real Estate FAQ
          </h2>
          <p className="text-sm md:text-base text-slate-500 mt-3 max-w-xl mx-auto">
            Quick answers about buying, selling, and understanding the
            Squamish market.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white border border-gray-100 shadow-sm rounded-none overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className={`w-full flex justify-between items-center gap-4 px-6 py-4 text-left transition-all duration-300 ${
                    isOpen
                      ? "bg-primary text-primary-foreground"
                      : "bg-white text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="font-bold uppercase tracking-[0.12em] text-[11px] md:text-xs">
                    {item.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : "text-slate-400"
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 py-5 border-t border-border animate-in slide-in-from-top-2 duration-300">
                    <p className="text-sm md:text-[15px] leading-relaxed text-slate-600">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
