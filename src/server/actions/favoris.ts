"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleFavori(listingId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // Vérifier si le favori existe déjà
  const { data: existant } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .single();

  if (existant) {
    await supabase.from("favorites").delete().eq("id", existant.id);
    return false; // supprimé
  } else {
    await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId });
    return true; // ajouté
  }
}

export async function estFavori(listingId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("listing_id", listingId)
    .single();

  return !!data;
}
