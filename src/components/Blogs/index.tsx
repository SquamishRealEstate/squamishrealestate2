"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/config/supabaseClient";
import {
  TrendingUp,
  Users,
  ArrowRight,
  Loader2,
  Tag,
  Key,
  Newspaper,
  MapPin,
  Store,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Blog {
  id: number;
  title: string;
  category: string;
  content: string;
  created_at: string;
  author: string | null;
  image: string | null;
  slug: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Listed: <Tag className="w-8 h-8" />,
  Sold: <Key className="w-8 h-8" />,
  News: <Newspaper className="w-8 h-8" />,
  Trends: <TrendingUp className="w-8 h-8" />,
  People: <Users className="w-8 h-8" />,
  Places: <MapPin className="w-8 h-8" />,
  Businesses: <Store className="w-8 h-8" />,
};

export default function Blogs({ initialBlogs }: { initialBlogs?: Blog[] }) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs || []);
  const [loading, setLoading] = useState(!initialBlogs);

  useEffect(() => {
    // Data already server-rendered; nothing to fetch on mount
    if (initialBlogs) return;

    const fetchLatestBlogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (!error) setBlogs(data || []);
      setLoading(false);
    };
    fetchLatestBlogs();
  }, [initialBlogs]);

  return (
    <section
      id="neighborhoods"
      className="relative py-20 bg-primary text-primary-foreground overflow-hidden"
      style={{
        clipPath: "polygon(0 0, 100% 8%, 100% 92%, 0 100%)",
        marginTop: "-3rem",
        marginBottom: "-3rem",
        paddingTop: "6rem",
        paddingBottom: "6rem",
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(/images/topo-pattern.png)`,
          backgroundSize: "400px 400px",
        }}
      />

      <div className="container relative z-10 mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Squamish Blog
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-white" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="flex flex-col items-center text-center p-8 rounded-3xl transition-all duration-300"
              >
                {/* Wrap only the content in the Link */}
                <Link
                  href={`/blog/${blog.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center"
                >
                  {/* ICON */}
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/20">
                    {CATEGORY_ICONS[blog.category] || (
                      <FileText className="w-8 h-8" />
                    )}
                  </div>

                  {/* TITLE */}
                  <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-primary-foreground/90 transition-colors">
                    {blog.title}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="text-white/60 line-clamp-2 italic text-sm leading-relaxed mb-6 group-hover:text-white/90 transition-colors">
                    {blog.content.replace(/<[^>]*>/g, "")}
                  </p>
                </Link>

                {/* META (Not clickable) */}
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
                  {blog.category} •{" "}
                  {new Date(blog.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/blogs">
            <Button
              variant="outline"
              className="bg-transparent border-white/20 hover:bg-white hover:text-primary rounded-full px-8 py-6 font-bold uppercase tracking-widest text-xs"
            >
              View All Articles
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
