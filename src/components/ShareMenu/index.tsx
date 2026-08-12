"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Check,
  Copy,
  Facebook,
  Mail,
  MessageCircle,
  Twitter,
  Share2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ShareMenuProps {
  title: string;
  url?: string;
}

export const ShareMenu = ({ title, url }: ShareMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShareUrl(url || window.location.href);

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [url]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `${title}\n\nRead the full story here:`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareLinks = {
    // WhatsApp will show the image preview automatically if OG tags exist
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,

    // Facebook strictly uses the URL to find the image via OG tags
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,

    // Twitter allows a text description + the link
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,

    // Email allows a formatted body
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}%20${encodedUrl}`,
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Vertical Pop-up Container */}
      <div
        className={cn(
          "absolute bottom-full left-1/2 -translate-x-1/2 mb-4 flex flex-col items-center gap-3 transition-all duration-300 ease-out z-30",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        <div className="flex flex-col gap-3 p-2 bg-background border border-border rounded-full shadow-xl backdrop-blur-md">
          {/* WhatsApp */}
          <Link
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center text-secondary hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
          >
            <MessageCircle size={18} />
          </Link>

          {/* Facebook */}
          <Link
            href={shareLinks.facebook}
            target="_blank"
            className="w-10 h-10 rounded-full flex items-center justify-center text-secondary hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <Facebook size={18} />
          </Link>

          {/* Twitter */}
          <Link
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center text-secondary hover:bg-zinc-100 hover:text-black transition-colors"
          >
            <Twitter size={18} />
          </Link>

          {/* Email */}
          <Link
            href={shareLinks.email}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full flex items-center justify-center text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <Mail size={18} />
          </Link>

          {/* Copy Link */}
          <button
            onClick={copyToClipboard}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              copied
                ? "bg-accent text-white"
                : "text-secondary hover:bg-accent/10 hover:text-accent",
            )}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        {/* Little Arrow/Triangle at the bottom of the pop-up */}
        <div className="w-3 h-3 bg-background border-r border-b border-border rotate-45 -mt-1.5 shadow-sm" />
      </div>

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md",
          isOpen
            ? "bg-zinc-800 text-white scale-90"
            : "bg-primary text-white hover:bg-primary/90 hover:scale-105",
        )}
      >
        {isOpen ? (
          <X size={20} className="animate-in fade-in zoom-in duration-200" />
        ) : (
          <Share2 size={20} />
        )}
      </button>
    </div>
  );
};
