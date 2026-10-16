import Home from "@/components/Home";
import { createClient } from "@supabase/supabase-js";

// Revalidate the homepage every 15 minutes so fresh listings/blogs appear
// in the server-rendered HTML without a full rebuild.
export const revalidate = 900;

async function getLatestBlogs() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return [];

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  return data || [];
}

export default async function Page() {
  const latestBlogs = await getLatestBlogs();

  return <Home latestBlogs={latestBlogs} />;
}
