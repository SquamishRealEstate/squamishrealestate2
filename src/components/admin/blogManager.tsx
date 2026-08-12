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
  ChevronDown,
} from "lucide-react";
import BlogForm from "./blogForm";

type Blog = {
  id: string;
  title: string;
  category: string;
  author: string;
  image: string;
  content: string;
  created_at: string;
  slug: string;
};

const PAGE_SIZE = 6; // How many blogs to show per "page"

interface BlogManagerProps {
  view: "list" | "form";
  setView: (view: "list" | "form") => void;
  editBlogData: Blog | undefined;
  setEditBlogData: (blog: Blog | undefined) => void;
  blogFormData: any;
  setBlogFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function BlogManager({
  view,
  setView,
  editBlogData,
  setEditBlogData,
  blogFormData,
  setBlogFormData,
}: BlogManagerProps) {
  // const [view, setView] = useState<"list" | "form">("list");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // const [editBlogData, setEditBlogData] = useState<Blog>();
  const [blogIDToDelete, setBlogIDToDelete] = useState<string>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const fetchBlogs = async (offset = 0) => {
    const isInitial = offset === 0;

    if (isInitial) {
      setLoadingBlogs(true);
    } else {
      setLoadingMore(true);
    }

    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error(error);
    } else if (data) {
      if (isInitial) {
        setBlogs(data);
      } else {
        setBlogs((prev) => {
          const existingIds = new Set(prev.map((blog) => blog.id));

          const newBlogs = data.filter((blog) => !existingIds.has(blog.id));

          return [...prev, ...newBlogs];
        });
      }

      // Only show "Load More" if another page may exist
      setHasMore(data.length === PAGE_SIZE);
    }

    setLoadingBlogs(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchBlogs(0);
  }, []);
  const startEdit = (blog: Blog) => {
    setEditBlogData(blog);
    setBlogFormData({
      title: blog.title || "",
      category: blog.category || "",
      author: blog.author || "",
      image: blog.image || "",
      content: blog.content || "",
    });
    setView("form");
  };

  const startNew = () => {
    setEditBlogData(undefined);
    setBlogFormData({
      title: "",
      category: "",
      author: "",
      image: "",
      content: "",
    });
    setView("form");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase
      .from("blogs")
      .delete()
      .eq("id", blogIDToDelete);
    if (!error) {
      setBlogs(blogs.filter((b) => b.id !== blogIDToDelete));
      setShowToast(true);
      setBlogIDToDelete("");
      setTimeout(() => setShowToast(false), 3000);
    }
    setIsDeleting(false);
  };

  console.log(blogs);

  return (
    <div className="max-w-5xl pb-12 px-4">
      {/* HEADER NAV */}
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900">
          {view === "form"
            ? editBlogData
              ? "Editing Post"
              : "Create New Post"
            : "Blog Manager"}
        </h3>

        {view === "list" && (
          <Button
            onClick={() => {
              startNew();
            }}
            size="sm"
          >
            <PlusCircle size={16} className="md:mr-2" />
            <span className="hidden md:block">New Post</span>
          </Button>
        )}
      </div>

      {view === "list" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingBlogs ? (
              <div className="col-span-full py-20 text-center text-slate-400">
                <Loader2 className="animate-spin mx-auto mb-2" /> Loading
                blogs...
              </div>
            ) : blogs.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed rounded-2xl">
                No blogs found. Start by creating one!
              </div>
            ) : (
              blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="aspect-video relative bg-slate-100">
                    {blog.image ? (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-slate-100 text-slate-400 text-sm font-medium">
                        no image
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => startEdit(blog)}
                      >
                        <FileEdit size={16} />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => setBlogIDToDelete(blog.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {blog.category}
                    </span>
                    <h4 className="font-bold text-slate-800 mt-2 line-clamp-1">
                      {blog.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      By {blog.author}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PAGINATION BUTTON */}
          {!loadingBlogs && hasMore && (
            <div className="mt-12 flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchBlogs(blogs.length)}
                disabled={loadingMore}
                className="px-8 h-12 rounded-xl border-slate-200 text-slate-600"
              >
                {loadingMore ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <ChevronDown className="mr-2" size={18} />
                )}
                {loadingMore ? "Fetching..." : "Load More Posts"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <BlogForm
          blogData={editBlogData}
          formData={blogFormData}
          setFormData={setBlogFormData}
          onSuccess={() => {
            fetchBlogs(0); // Reset list to first page on success
            setView("list");
            setEditBlogData(undefined);
          }}
          onCancel={() => {
            setView("list");
            setEditBlogData(undefined);
          }}
        />
      )}

      {/* DELETE MODAL & TOAST (Kept as is) */}
      {blogIDToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              Delete Blog?
            </h4>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete this blog?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setBlogIDToDelete("")}
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

      {showToast && (
        <div className="fixed bottom-8 right-8 z-[70] animate-in slide-in-from-right-full">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl flex items-center gap-3">
            <CheckCircle size={18} className="text-emerald-500" />
            <span className="text-sm font-bold">Blog Deleted</span>
          </div>
        </div>
      )}
    </div>
  );
}
