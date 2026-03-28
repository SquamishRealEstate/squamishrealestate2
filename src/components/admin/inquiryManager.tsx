"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/config/supabaseClient";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle } from "lucide-react";

export default function InquiryManager() {
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setInquiries(data || []));
  }, []);

  const handleReplied = async (id: number) => {
    await supabase.from("inquiries").update({ is_replied: true }).eq("id", id);
    // Refresh list locally
    setInquiries(
      inquiries.map((i) => (i.id === id ? { ...i, is_replied: true } : i)),
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-slate-900">Inbox</h3>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {inquiries.length > 0 ? (
          inquiries.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-900">{item.name}</h4>
                  <p className="text-xs text-slate-400">{item.email}</p>
                </div>
                {item.is_replied ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-full uppercase">
                    <CheckCircle size={10} /> Replied
                  </span>
                ) : (
                  <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-1 rounded-full uppercase tracking-tighter">
                    New Message
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                &quot;{item.message}&quot;
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-10 px-4"
                  onClick={() => {
                    window.location.href = `mailto:${item.email}?subject=RE: Squamish Real Estate Inquiry`;
                    handleReplied(item.id);
                  }}
                >
                  <Send size={14} className="mr-2" /> Reply via Email
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400">
            No inquiries yet.
          </div>
        )}
      </div>
    </div>
  );
}
