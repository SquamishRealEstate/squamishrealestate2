"use client";

import React, { useState, useRef } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ExternalLink,
  ScrollText,
} from "lucide-react";
import { Button } from "../ui/button";

interface VowModalProps {
  isOpen: boolean;
  onAgree: () => void;
  onDisagree: () => void;
}

export default function VowModal({
  isOpen,
  onAgree,
  onDisagree,
}: VowModalProps) {
  const [hasReadToBottom, setHasReadToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setHasReadToBottom(true);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Container with constrained max-height */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* HEADER: Always at the top */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldCheck className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-none">
                MLS® VOW Terms of Use
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                Compliance Agreement
              </p>
            </div>
          </div>
          <button
            onClick={onDisagree}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT AREA */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-8 bg-white"
        >
          <div className="max-w-none text-slate-600 space-y-6">
            <section className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-xs leading-relaxed m-0 text-slate-500">
                The term Virtual Office Website (&quot;VOW&quot;) refers to a
                Participant&apos;s (REALTORS®) Internet website, or a feature of
                a Participant&apos;s Internet website, through which the
                Participant provides real estate brokerage services to
                Registrants (clients and prospects) with whom the Participant
                has first established a relationship where the Registrant has
                the opportunity to search for MLS® data, subject to the
                Participant&apos;s oversight, supervision and accountability. By
                agreeing to these &quot;Terms of Use&quot;, I (the Registrant):
              </p>
            </section>

            <div className="space-y-4">
              {[
                {
                  title: "Regulatory Disclosures",
                  text: "the Registrant has received, read and understood the documents published by the British Columbia Real Estate Association entitled",
                  links: [
                    {
                      label:
                        "“Disclosure of Representation in Trading Services”",
                      url: "https://sr-webimages-002.s3.us-west-2.amazonaws.com/agreement/bcfsa.pdf",
                    },
                    {
                      label: "“Privacy Notice and Consent”",
                      url: "https://sr-webimages-002.s3.us-west-2.amazonaws.com/agreement/privacy-statement.pdf",
                    },
                  ],
                },
                {
                  title: "No Agency Relationship",
                  text: "the Registrant acknowledges and understand that the Terms of Use do not create and agency relationship and do not impose a financial obligation on the Registrant or create any representation agreement between the Registrant and the Participant;",
                },
                {
                  title: "Professional Relationship",
                  text: "the Registrant acknowledges entering into a lawful REALTOR®/ consumer or REALTOR®/client relationship with the Member;",
                },
                {
                  title: "Personal Use Only",
                  text: "all data obtained from the MLS® VOW is intended for and may only be used for the Registrant's personal, non-commercial use;",
                },
                {
                  title: "Bona Fide Interest",
                  text: "the Registrant has a bona fide interest in the purchase, sale or lease of real estate of the type being offered through the MLS® VOW;",
                },
                {
                  title: "Strict Restrictions",
                  text: "the Registrant will not themself, and will not permit or assist others to, directly or indirectly: copy, redistribute or retransmit any of the MLS® VOW Data; display, post, disseminate, distribute, publish, broadcast, transfer, sell or sublicense; or engage in Scraping (including “screen scraping” and “database scraping”), data mining or any other activity intended to collect, store, re-organize, summarize or manipulate any MLS® VOW Data or any related data.",
                },
                {
                  title: "Proprietary Rights",
                  text: "the Registrant acknowledges the Board's ownership of, and the validity of the Board's proprietary rights and copyright in the MLS® VOW Data, and listing information;",
                },
                {
                  title: "Access Audit",
                  text: "the Registrant expressly authorizes the Board or their duly authorized representatives, to access the MLS® VOW and Registrant's information provided to the MLS® VOW Participant, for the purposes of verifying compliance with and pursuing enforcement of the Terms of Use and all applicable rules, regulations, bylaws, policies, and laws.",
                },
                {
                  title: "30-Day Access",
                  text: "the Registrant acknowledges that their password and access to the MLS® VOW Data is limited to a 30-day period from the date of registration. The password will not be automatically renewed upon expiration.",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start group">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {String.fromCharCode(97 + idx)}
                  </div>
                  <div className="flex-1 pb-4 border-b border-slate-50">
                    <h4 className="text-xs font-bold text-slate-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs leading-relaxed text-slate-500 m-0">
                      {item.text}
                    </p>
                    {item.links && (
                      <div className="flex flex-col gap-2 mt-2">
                        {item.links.map((link, lIdx) => (
                          <a
                            key={lIdx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-semibold flex items-center gap-1 hover:underline text-[10px]"
                          >
                            <FileText size={12} /> {link.label}{" "}
                            <ExternalLink size={10} />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="pt-2 text-xs font-bold text-slate-900">
              Having agreed to the terms and conditions of use, I would like to
              have access to this MLS® VOW data.
            </p>

            {/* SCROLL TARGET INDICATOR */}
            <div className="py-10 flex flex-col items-center justify-center border-t border-dashed border-slate-200 mt-6">
              <div
                className={`p-3 rounded-full mb-3 transition-all duration-500 ${hasReadToBottom ? "bg-emerald-100 text-emerald-600 scale-110" : "bg-slate-100 text-slate-400"}`}
              >
                {hasReadToBottom ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <ScrollText size={24} className="animate-bounce" />
                )}
              </div>
              <p
                className={`text-xs font-bold transition-colors ${hasReadToBottom ? "text-emerald-600" : "text-slate-400"}`}
              >
                {hasReadToBottom
                  ? "Verification Complete"
                  : "Scroll to reach the end of the agreement"}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={onDisagree}
            className="flex-1 h-12"
          >
            Not Agree
          </Button>
          <Button
            onClick={onAgree}
            disabled={!hasReadToBottom}
            className={`flex-1 h-12 font-bold transition-all ${
              hasReadToBottom ? "bg-primary" : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            {hasReadToBottom
              ? "Agree & Create Account"
              : "Please Read Entire Terms"}
          </Button>
        </div>
      </div>
    </div>
  );
}
