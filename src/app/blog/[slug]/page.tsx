"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/config/supabaseClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, User, Loader2, ChevronLeft, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ShareMenu } from "@/components/ShareMenu";

export default function BlogPost() {
  const { slug } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        // 1. Try fetching by slug column first
        const { data: bySlug } = await supabase
          .from("blogs")
          .select("*")
          .eq("slug", slug)
          .single();

        if (bySlug) {
          setBlog(bySlug);
        } else {
          // 2. Fallback: Fetch all and match by Title logic
          // (This works even if your 'slug' column in Supabase is empty)
          const { data: allBlogs } = await supabase.from("blogs").select("*");

          if (allBlogs) {
            const match = allBlogs.find(
              (b: any) => b.title.toLowerCase().replace(/\s+/g, "-") === slug,
            );
            setBlog(match);
          }
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="font-accent text-xs uppercase tracking-widest text-secondary">
          Opening the Journal...
        </p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-display font-bold mb-4 text-primary">
          Story Not Found
        </h1>
        <Link
          href="/blog"
          className="flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-xs"
        >
          <ChevronLeft size={16} /> Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen font-body text-foreground">
      <Navbar />

      <article className="pt-32 pb-20">
        <div className="container max-w-4xl px-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-secondary/60 hover:text-primary transition-colors font-accent text-[10px] uppercase tracking-widest mb-10 group"
          >
            <ChevronLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Archive
          </button>

          <header className="space-y-6 mb-12">
            <span className="px-4 py-1 bg-accent/10 text-accent font-accent text-[10px] uppercase tracking-[0.2em] rounded-full border border-accent/20 inline-block">
              {blog.category}
            </span>

            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary leading-[1.1] tracking-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 text-secondary font-accent text-[11px] uppercase tracking-wider">
                <User size={14} className="text-accent" /> By{" "}
                {blog.author || "Admin"}
              </div>
              <div className="flex items-center gap-2 text-secondary font-accent text-[11px] uppercase tracking-wider">
                <Calendar size={14} className="text-accent" />{" "}
                {new Date(blog.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </header>

          {blog.image && (
            <div className="relative w-full aspect-[16/9] rounded-[2rem] overflow-hidden mb-16 shadow-2xl shadow-primary/5">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="flex flex-col gap-12">
            <div
              className="font-body text-[17px] leading-[1.8] text-muted-foreground prose prose-headings:font-display prose-headings:text-primary prose-strong:text-primary prose-a:text-accent max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          <footer className="mt-20 pt-10 border-t border-border">
            <div className="bg-muted/30 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-display font-bold shrink-0">
                {blog.author?.charAt(0) || "S"}
              </div>
              <div className="text-center md:text-left flex-1">
                <p className="text-[10px] font-accent uppercase tracking-widest text-accent mb-1">
                  Author
                </p>
                <h3 className="text-xl font-display font-bold text-primary mb-2">
                  {blog.author || "Squamish Journal Admin"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md italic">
                  Sharing the best of Squamish lifestyle, real estate trends,
                  and community updates.
                </p>
              </div>

              <ShareMenu title={blog.title} />
            </div>
          </footer>
        </div>
      </article>

      <Footer />
    </div>
  );
}
