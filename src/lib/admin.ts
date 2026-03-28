import { supabase } from "@/config/supabaseClient";

export async function checkIsAdmin() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return data?.role === "admin";
}
