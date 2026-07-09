import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types/database.types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .is("parent_id", null)
    .order("sort_order");

  if (error) return [];
  return data ?? [];
}
