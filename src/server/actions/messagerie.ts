"use server";

import { createClient } from "@/lib/supabase/server";

export async function ouvrirConversation(listingId: string): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: listing } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", listingId)
    .single();

  if (!listing) throw new Error("Annonce introuvable");
  if (listing.seller_id === user.id) throw new Error("Vous ne pouvez pas vous contacter vous-même");

  // Récupérer ou créer la conversation
  const { data: existante } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", user.id)
    .single();

  if (existante) return existante.id;

  const { data: nouvelle, error } = await supabase
    .from("conversations")
    .insert({ listing_id: listingId, buyer_id: user.id, seller_id: listing.seller_id })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return nouvelle.id;
}

export async function envoyerMessage(conversationId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content,
  });

  if (error) throw new Error(error.message);
}
