import BlogPost from "@/components/Blogs/blogPost";
import type { Metadata } from "next";
import { getBlogBySlug, stripHtml } from "@/lib/serverData";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 3600; // re-check blog data hourly

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  const canonical = `https://squamish.realestate/blog/${slug}`;

  if (!blog) {
    return { alternates: { canonical } };
  }

  const plainText = stripHtml(blog.content || "");
  const description = (
    plainText.slice(0, 157).trim() + (plainText.length > 157 ? "…" : "")
  ).replace(/[\r\n]+/g, " ");

  return {
    title: `${blog.title} | Squamish Real Estate`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: `${blog.title} | Squamish Real Estate`,
      description,
      images: blog.image ? [{ url: blog.image }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  return <BlogPost slug={slug} initialBlog={blog} />;
}
