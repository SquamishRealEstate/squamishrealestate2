import { Metadata } from "next";
import { supabase } from "@/config/supabaseClient";

type Props = {
  params: Promise<{ slug: string }>; // Updated for Next.js 15 async params
};

/** * 1. Metadata Function (Server Side)
 * This handles the Social Media Image & Title
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data: blog } = await supabase
    .from("blogs")
    .select("title, image, content")
    .eq("slug", slug)
    .single();

  if (!blog) return { title: "Blog Not Found" };

  // This is what Facebook/WhatsApp "sees"
  return {
    title: blog.title,
    description: blog.content.replace(/<[^>]*>/g, "").substring(0, 150),
    openGraph: {
      title: blog.title,
      description: "Explore this story on the Squamish Journal",
      url: `http://localhost:3000//blog/${slug}`,
      images: [
        {
          url: blog.image, // Full URL from Supabase
          width: 1200,
          height: 630,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image", // This forces the big clickable image
      title: blog.title,
      description: "Latest from Squamish Journal",
      images: [blog.image], // Twitter often fails if this isn't an absolute URL
    },
  };
}

/** * 2. THE DEFAULT EXPORT (The actual React Component)
 * This was likely missing or named incorrectly!
 */
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="bg-background">
      {/* This renders the page.tsx content */}
      {children}
    </section>
  );
}
