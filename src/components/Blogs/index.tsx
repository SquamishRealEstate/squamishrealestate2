"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/config/supabaseClient";
import {
  Home as HomeIcon,
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

export default function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

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
          backgroundImage: `url(https://private-us-east-1.manuscdn.com/sessionFile/s28JNvt7FNbqBDcvkeiXw5/sandbox/5xyNfUtj2D8ALW69YKw8jb_1770580502521_na1fn_dG9wb2dyYXBoaWMtcGF0dGVybg.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvczI4Sk52dDdGTmJxQkRjdmtlaVh3NS9zYW5kYm94LzV4eU5mVXRqMkQ4QUxXNjlZS3c4amJfMTc3MDU4MDUwMjUyMV9uYTFmbl9kRzl3YjJkeVlYQm9hV010Y0dGMGRHVnliZy5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=OAWhwFKD-PZvp~QO9bJWPashZwaOywxorh9DweLfTsSJCGJgjELPYseqKaxc3hfZc5sSP88WgzrhcO~ROw28ndG~mtBjiODm7TptnheLimwi67DPobgC8tO2YgofxvZ56P6rxg60tFgbZ5~2Aqsw9w~DzH9QtKb4JecwztczyRWrlyYz8ONi1L3d8NJ45e2MtRgmbThWS4fOUk9TAmMPCTxeRAyc38xEnBIRGkAk8iAJzgT0CmoPxCWrvASiWVb5EYIK0E~GTrUpG5tyymBa0zmrpxxzwLgqE5hU78QzM5hKI4VkSFnju-0bgGTf3n65SD~MftIaGKhoGIig0hLrcg__)`,
          backgroundSize: "400px 400px",
        }}
      />

      <div className="container relative z-10 mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Explore Our Squamish Blog
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-white" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div key={blog.id} className="text-center group">
                <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110">
                  {/* Render mapped icon, or fallback to FileText if category doesn't match */}
                  {CATEGORY_ICONS[blog.category] || (
                    <FileText className="w-8 h-8" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-3">{blog.title}</h3>
                <p className="text-primary-foreground/80 line-clamp-2 italic text-sm">
                  {blog.content.replace(/<[^>]*>/g, "")}
                </p>
                <div className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
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
              View All Blogs
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
