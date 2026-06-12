"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/config/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Loader2,
  CheckCircle,
  Trash2,
  FileEdit,
  MapPin,
  ChevronDown,
} from "lucide-react";
import ReelForm from "./reelForm";

type Reel = {
  id: string;
  category: string;
  link: string;
  priority: number;
  address: string;
  description: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

const PAGE_SIZE = 6; // Adjust based on your preference

export default function ReelManager() {
  const [view, setView] = useState<"list" | "form">("list");
  const [reels, setReels] = useState<Reel[]>([]);
  const [loadingReels, setLoadingReels] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [editReelData, setEditReelData] = useState<Reel | undefined>(undefined);
  const [reelIDToDelete, setReelIDToDelete] = useState<string>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Modified fetch to support pagination
  const fetchReels = useCallback(
    async (isInitial = true) => {
      if (isInitial) setLoadingReels(true);
      else setLoadingMore(true);

      const start = isInitial ? 0 : reels.length;
      const end = start + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("reels")
        .select("*")
        .order("created_at", { ascending: false })
        .range(start, end);

      console.log(data);

      if (!error && data) {
        if (isInitial) {
          setReels(data as any);
        } else {
          setReels((prev) => [...prev, ...(data as any)]);
        }

        // If we fetched fewer items than the page size, there are no more records
        setHasMore(data.length === PAGE_SIZE);
      }

      setLoadingReels(false);
      setLoadingMore(false);
    },
    [reels.length],
  );

  useEffect(() => {
    fetchReels(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    try {
      const cleanUrl = new URL(url);
      if (cleanUrl.hostname.includes("instagram.com")) {
        let path = cleanUrl.pathname;
        if (!path.endsWith("/")) path += "/";
        return `https://www.instagram.com${path}embed/`;
      }
      if (
        cleanUrl.hostname.includes("youtube.com") ||
        cleanUrl.hostname.includes("youtu.be")
      ) {
        const videoId =
          cleanUrl.searchParams.get("v") || cleanUrl.pathname.split("/").pop();
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    } catch (e) {
      console.error("Error parsing URL:", e);
      return url;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase
      .from("reels")
      .delete()
      .eq("id", reelIDToDelete);
    if (!error) {
      setReels(reels.filter((b) => b.id !== reelIDToDelete));
      setToastMessage("Successfully deleted reel");
      setShowToast(true);
      setReelIDToDelete("");
      setTimeout(() => setShowToast(false), 3000);
    }
    setIsDeleting(false);
  };

  return (
    <div className="max-w-6xl pb-12 px-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900">
          {view === "form"
            ? editReelData
              ? "Editing Reel"
              : "New Reel"
            : "Reel Gallery"}
        </h3>
        {view === "list" && (
          <Button
            onClick={() => {
              setEditReelData(undefined);
              setView("form");
            }}
            size="sm"
          >
            <PlusCircle size={16} className="mr-2" /> New Reel
          </Button>
        )}
      </div>

      {view === "list" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingReels ? (
              <div className="col-span-full py-20 text-center text-slate-400">
                <Loader2 className="animate-spin mx-auto mb-2" /> Loading...
              </div>
            ) : reels.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed rounded-2xl">
                No reels found.
              </div>
            ) : (
              reels.map((reel) => (
                <div
                  key={reel.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col"
                >
                  <div className="relative aspect-[9/16] w-full bg-slate-100 overflow-hidden group border-b border-slate-200">
                    <iframe
                      src={getEmbedUrl(reel.link)}
                      className="absolute inset-0 w-full h-full"
                      scrolling="no"
                      allowFullScreen
                      style={{ border: "none" }}
                    />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => {
                          setEditReelData(reel);
                          setView("form");
                        }}
                      >
                        <FileEdit size={16} />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => setReelIDToDelete(reel.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {reel.category || "Uncategorized"}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400" />
                        {reel.address || "No Address"}
                      </h4>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">
                        {reel.description || "No description provided."}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PAGINATION CONTROL */}
          {!loadingReels && hasMore && (
            <div className="mt-12 flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchReels(false)}
                disabled={loadingMore}
                className="px-8 py-6 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                {loadingMore ? (
                  <Loader2 className="animate-spin mr-2" size={20} />
                ) : (
                  <ChevronDown className="mr-2" size={20} />
                )}
                {loadingMore ? "Loading more..." : "Load More Reels"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <ReelForm
          reelData={editReelData as any}
          onSuccess={() => {
            fetchReels(true); // Refresh from start on success
            setView("list");
            setEditReelData(undefined);
          }}
          onCancel={() => {
            setView("list");
            setEditReelData(undefined);
          }}
        />
      )}

      {/* DELETE MODAL (Same as before) */}
      {reelIDToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4">
              <Trash2 size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              Delete Reel?
            </h4>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete this reel? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setReelIDToDelete("")}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-600"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST (Same as before) */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-[70] animate-in slide-in-from-right-full">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl flex items-center gap-3">
            <CheckCircle size={18} className="text-emerald-500" />
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
