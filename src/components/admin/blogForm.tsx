"use client";

import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/config/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  X,
  Loader2,
  CheckCircle,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { handleUpload } from "@/lib/utils";

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

interface BlogFormProps {
  blogData?: Blog | null; // If provided, the form acts as an "Edit" form
  onSuccess: () => void; // Callback to refresh the list or redirect
  onCancel?: () => void; // Optional cancel button handler
}

export default function BlogForm({
  blogData,
  onSuccess,
  onCancel,
}: BlogFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    author: "",
    image: "",
    content: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"url" | "upload">("url");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });

  // Handle local file preview
  useEffect(() => {
    if (uploadMethod === "upload" && imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (uploadMethod === "url" && formData.image) {
      setPreviewUrl(formData.image);
    } else {
      setPreviewUrl(null);
    }
  }, [imageFile, formData.image, uploadMethod]);

  useEffect(() => {
    if (blogData) {
      setFormData(blogData);
      setPreviewUrl(blogData.image);
    }
  }, [blogData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Max 5MB.");
        return;
      }
      setImageFile(file);
    }
  };

  // const handleUpload = async (file: File): Promise<string | null> => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("file", file); // Wrap the file in FormData
  //     formData.append("folderType", "blogs");

  //     const response = await fetch("/api/upload-drive", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || "Upload failed");
  //     }

  //     const data = await response.json();
  //     return data.url; // Returns the direct image link for Supabase
  //   } catch (err) {
  //     console.error("Upload error:", err);
  //     throw err;
  //   }
  // };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with dashes
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImageUrl = formData.image;

      if (uploadMethod === "upload" && imageFile) {
        const [uploadedUrl] = await handleUpload(imageFile, "blogs");
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      //   const { error } = await supabase
      //     .from("blogs")
      //     .insert([{ ...formData, image: finalImageUrl }]);

      const submissionData = {
        ...formData,
        image: finalImageUrl,
        slug: generateSlug(formData.title),
      };

      const {
        id: _id,
        created_at: _created_at,
        ...updatePayload
      } = submissionData as any;

      const { error } = blogData?.id
        ? await supabase
            .from("blogs")
            .update(updatePayload)
            .eq("id", blogData.id)
            .select()
        : await supabase.from("blogs").insert([submissionData]).select();

      if (error) throw error;

      setStatus({
        message: blogData?.id
          ? "Blog updated successfully!"
          : "Blog published successfully!",
        type: "success",
      });

      // Only reset if it's a new post
      if (!blogData?.id) {
        setFormData({
          title: "",
          category: "",
          author: "",
          image: "",
          content: "",
        });
        setImageFile(null);
      }
      setImageFile(null);
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
    <div className="max-w-4xl mx-auto pb-12">
      {/* <h3 className="text-2xl font-bold text-slate-900 mb-6">
        Create New Blog Post
      </h3> */}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8"
      >
        {/* IMAGE SECTION - THE "BETTER" PART */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon size={18} className="text-blue-500" />
              Cover Image
            </label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setUploadMethod("url")}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  uploadMethod === "url"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <LinkIcon size={14} /> URL
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod("upload")}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  uploadMethod === "upload"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Upload size={14} /> Upload
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Input Side */}
            <div className="space-y-3">
              {uploadMethod === "url" ? (
                <div className="space-y-1">
                  <Input
                    type="url"
                    placeholder="Paste image link (Unsplash, Google Drive, etc.)"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="h-12"
                  />
                  <p className="text-[11px] text-slate-400">
                    Ensure the URL is public
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
                >
                  <Input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="text-blue-500" size={20} />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PNG, JPG or WebP (Max 5MB)
                  </p>
                </div>
              )}
            </div>

            {/* Preview Side */}
            <div className="relative group aspect-video bg-slate-50 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setFormData({ ...formData, image: "" });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              ) : (
                <div className="text-center text-slate-300">
                  <ImageIcon size={40} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs">Image Preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Blog Title
            </label>
            <Input
              placeholder="The Ultimate Guide to Squamish"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Category
            </label>
            <Input
              placeholder="Lifestyle"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Author */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Author Name
          </label>
          <Input
            placeholder="Sarah Makkar"
            value={formData.author}
            onChange={(e) =>
              setFormData({ ...formData, author: e.target.value })
            }
            required
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Content
          </label>
          <Textarea
            rows={10}
            placeholder="Tell your story..."
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            required
            className="resize-none focus:ring-2 focus:ring-blue-500/20"
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
                  title: "",
                  category: "",
                  author: "",
                  image: "",
                  content: "",
                });
                setImageFile(null);
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
            {blogData?.id ? "Update Blog Post" : "Publish Blog Post"}
          </Button>
        </div>
      </form>

      {status.type && (
        <div
          className={`flex items-center mt-6 gap-3 p-4 rounded-xl text-sm font-medium border transition-all animate-in fade-in slide-in-from-top-2 ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-red-50 text-red-700 border-red-100"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <X size={20} />
          )}
          {status.message}
        </div>
      )}
    </div>
  );
}
