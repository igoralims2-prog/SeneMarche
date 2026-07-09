import { createClient } from "@/lib/supabase/server";

export type ConversationAvecDetails = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  listings: { title: string; id: string } | null;
  interlocuteur: { id: string; full_name: string; avatar_url: string | null } | null;
  dernier_message: string | null;
  non_lus: number;
};

export async function getConversations(userId: string): Promise<ConversationAvecDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select(`*, listings(id, title)` as any)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (error) return [];
  if (!data) return [];

  // Enrichir avec l'interlocuteur et le dernier message
  const enriched = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data as any[]).map(async (conv) => {
      const interlocuteurId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;

      const [profileResult, lastMessageResult, unreadResult] = await Promise.all([
        supabase.from("profiles").select("id, full_name, avatar_url").eq("id", interlocuteurId).single(),
        supabase
          .from("messages")
          .select("content")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("is_read", false)
          .neq("sender_id", userId),
      ]);

      return {
        ...conv,
        interlocuteur: profileResult.data ?? null,
        dernier_message: lastMessageResult.data?.content ?? null,
        non_lus: unreadResult.count ?? 0,
      } as ConversationAvecDetails;
    })
  );

  return enriched;
}

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export async function getMessages(conversationId: string): Promise<MessageRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? []) as MessageRow[];
}

export async function getConversation(conversationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select(`*, listings(id, title)` as any)
    .eq("id", conversationId)
    .single();

  if (error) return null;
  return data as unknown as {
    id: string;
    listing_id: string;
    buyer_id: string;
    seller_id: string;
    listings: { id: string; title: string } | null;
  };
}

export async function marquerMessagesLus(conversationId: string, userId: string) {
  const supabase = await createClient();
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId);
}
