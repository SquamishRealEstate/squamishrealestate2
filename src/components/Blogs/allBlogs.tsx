"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/config/supabaseClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Calendar,
  ChevronRight,
  ChevronLeft,
  Search,
  User,
  Loader2,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import HomeButton from "../ui/homeButton";

export const AllBlogs = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) {
        setBlogs(data || []);
        setFilteredBlogs(data || []);
      }
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    const filtered = blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredBlogs(filtered);
    setCurrentPage(1);
  }, [searchQuery, blogs]);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedBlogs = filteredBlogs.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="bg-background min-h-screen selection:bg-primary/20 selection:text-primary">
      <Navbar />

      {/* PNW Naturalism Hero Header */}
      <header className="relative pt-32 pb-16 px-6 bg-primary overflow-hidden">
        {/* Topographic Overlay - Adjusted Opacity for better text contrast */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[url('https://private-us-east-1.manuscdn.com/sessionFile/s28JNvt7FNbqBDcvkeiXw5/sandbox/5xyNfUtj2D8ALW69YKw8jb_1770580502521_na1fn_dG9wb2dyYXBoaWMtcGF0dGVybg.png')] bg-repeat"
          style={{ backgroundSize: "400px" }}
        />
        <div className="container relative z-10 text-center">
          {/* Accent Label */}
          <div className="inline-flex items-center gap-3 text-accent font-accent uppercase tracking-[0.3em] text-[10px] mb-3">
            <span className="w-10 h-px bg-accent/30" />
            The Squamish Journal
            <span className="w-10 h-px bg-accent/30" />
          </div>

          {/* Balanced Heading */}
          <h1 className="text-5xl md:text-7xl font-display font-bold text-primary-foreground tracking-tight mb-8">
            Squamish{" "}
            <span className="text-accent italic font-medium">Blogs</span>
          </h1>

          {/* Search Bar - Sophisticated width and height */}
          <div className="max-w-lg mx-auto relative group">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-foreground/30 group-focus-within:text-accent transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search the archive..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-primary-foreground/[0.08] border border-primary-foreground/10 backdrop-blur-lg rounded-full py-4 pl-12 pr-6 text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-all font-body text-sm"
            />
          </div>
        </div>
      </header>

      <main className="container py-20 px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-primary mb-4" size={40} />
            <p className="text-secondary font-accent uppercase tracking-widest text-xs">
              Loading the landscape
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {paginatedBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className="group flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl transition-all duration-500"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    {blog.image ? (
                      <Image
                        src={blog.image}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-1000"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <BookOpen size={48} strokeWidth={1} />
                      </div>
                    )}
                    {/* Cedar Accent Tag */}
                    <div className="absolute top-5 left-5">
                      <span className="px-4 py-1.5 bg-accent text-accent-foreground font-accent text-[10px] uppercase tracking-widest rounded-full shadow-lg">
                        {blog.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-4 mb-5 text-secondary/60 font-accent text-[10px] uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-accent" />{" "}
                        {new Date(blog.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-accent" />{" "}
                        {blog.author || "Admin"}
                      </div>
                    </div>

                    <h2 className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors mb-4 line-clamp-2 leading-tight">
                      {blog.title}
                    </h2>

                    <p className="text-muted-foreground font-body text-[15px] line-clamp-3 mb-8 leading-relaxed">
                      {blog.content.replace(/<[^>]*>/g, "").substring(0, 160)}
                      ...
                    </p>

                    <div className="mt-auto pt-6 border-t border-border/50">
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="flex items-center justify-between group/btn"
                      >
                        <span className="font-accent text-[11px] uppercase tracking-[0.2em] text-primary font-bold">
                          Read Full Story
                        </span>
                        <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-primary-foreground transition-all">
                          <ArrowRight size={16} />
                        </div>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination with Pacific Gray/Green Styling */}
            {filteredBlogs.length > itemsPerPage && (
              <nav className="flex items-center justify-center gap-8 mt-20">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                  className="p-4 rounded-full border border-border text-secondary hover:bg-primary hover:text-primary-foreground disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-accent text-xs font-bold uppercase tracking-[0.3em] text-secondary">
                  {currentPage} /{" "}
                  {Math.ceil(filteredBlogs.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={startIdx + itemsPerPage >= filteredBlogs.length}
                  className="p-4 rounded-full border border-border text-secondary hover:bg-primary hover:text-primary-foreground disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </nav>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};
