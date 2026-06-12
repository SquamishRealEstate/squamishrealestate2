"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/config/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, CheckCircle, Loader2, MapPin, PlusCircle } from "lucide-react";
import AddressAutocomplete from "./addressAutocomplete";

type Reel = {
  id: string;
  category: "";
  link: "";
  priority: number;
  address: "";
  description: "";
  lat: null;
  lng: null;
  created_at: string;
};

interface ReelFormProps {
  reelData?: Reel | null; // If provided, the form acts as an "Edit" form
  onSuccess: () => void; // Callback to refresh the list or redirect
  onCancel?: () => void; // Optional cancel button handler
}

export default function ReelForm({
  reelData,
  onSuccess,
  onCancel,
}: ReelFormProps) {
  const [formData, setFormData] = useState({
    category: "",
    link: "",
    priority: 0,
    address: "",
    description: "",
    lat: null,
    lng: null,
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({
    message: "",
    type: null,
  });

  useEffect(() => {
    if (reelData) {
      setFormData({
        category: reelData.category ?? "",
        link: reelData.link ?? "",
        priority: reelData.priority ?? 0,
        address: reelData.address ?? "",
        description: reelData.description ?? "", // If DB is NULL, state becomes ""
        lat: reelData.lat ?? null,
        lng: reelData.lng ?? null,
      });

      console.log(typeof Number(reelData.priority));
      console.log(reelData.priority);
    }
  }, [reelData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { id, created_at, ...updatePayload } = formData as any;

      // const { error } = await supabase.from("reels").insert([formData]);

      const { data, error, status } = reelData?.id
        ? await supabase
            .from("reels")
            .update(updatePayload)
            .eq("id", reelData.id)
            .select()
        : await supabase.from("reels").insert([formData]).select();

      console.log(data);

      if (error) throw error;

      setStatus({
        message: reelData?.id
          ? "Reel updated successfully!"
          : "Reel published successfully!",
        type: "success",
      });

      if (!reelData?.id) {
        setFormData({
          category: "",
          address: "",
          link: "",
          priority: 0,
          description: "",
          lat: null as any,
          lng: null as any,
        });
      }

      setTimeout(() => {
        setStatus({ message: "", type: null });
        onSuccess();
      }, 1500);
    } catch (error: any) {
      setStatus({
        message: `Error: ${error.message}`,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-900 mb-6">
        Manage Reels Gallery
      </h3>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CATEGORY */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Category
            </label>
            <Input
              placeholder="e.g. Luxury Homes"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            />
          </div>

          {/* PRIORITY */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Display Priority
            </label>
            <Select
              key={formData.priority}
              value={String(formData.priority ?? 0)}
              onValueChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  priority: Number(val),
                }))
              }
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Standard (Bottom)</SelectItem>
                <SelectItem value="5">Recommended (Middle)</SelectItem>
                <SelectItem value="10">Featured (Top)</SelectItem>
                <SelectItem value="100">
                  Hero / Main Reel (Always First)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* LISTING LOCATION BLOCK */}
        <div className="space-y-4 rounded-xl">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPin size={14} className="text-slate-500" />
              Listing Address Search
            </label>

            <AddressAutocomplete
              value={formData.address} // Pass this so it can clear on reset
              onSelect={(data: any) =>
                setFormData((prev) => ({
                  ...prev,
                  address: data.address,
                  lat: data.lat,
                  lng: data.lng,
                }))
              }
            />
          </div>
        </div>

        {/* VIDEO LINK */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Video Link (YouTube/Instagram)
          </label>
          <Input
            placeholder="https://..."
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Description
          </label>
          <Input
            placeholder="e.g. Modern living in the heart of downtown Squamish..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="flex gap-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setFormData({
                  category: "",
                  link: "",
                  priority: 0,
                  address: "",
                  description: "",
                  lat: null,
                  lng: null,
                });
                onCancel();
              }}
            >
              Cancel
            </Button>
          )}
          <Button className="flex-[2]" disabled={saving}>
            {saving ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <PlusCircle className="mr-2" size={20} />
            )}
            {reelData?.id ? "Update Reel" : "Publish Reel"}
          </Button>
        </div>
      </form>

      {/* STATUS MESSAGE AREA */}
      {status.type && (
        <div
          className={`flex items-center mt-4 gap-2 p-4 rounded-lg text-sm font-medium transition-all ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <X size={18} />
          )}
          {status.message}
        </div>
      )}
    </div>
  );
}
