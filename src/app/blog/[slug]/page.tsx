import BlogPost from "@/components/Blogs/blogPost";
import type { Metadata } from "next";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  return {
    alternates: {
      canonical: `https://squamish.realestate/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  return <BlogPost slug={slug} />;
}
