import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getConversation, getMessages, marquerMessagesLus } from "@/server/queries/messagerie";
import { getProfil } from "@/server/queries/profil";
import { MessageThread } from "@/components/messagerie/message-thread";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function PageConversation({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const [conversation, messages] = await Promise.all([
    getConversation(id),
    getMessages(id),
  ]);

  if (!conversation) notFound();

  // Vérifier que l'utilisateur est participant
  if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
    redirect("/messagerie");
  }

  // Marquer les messages comme lus
  await marquerMessagesLus(id, user.id);

  const interlocuteurId =
    conversation.buyer_id === user.id ? conversation.seller_id : conversation.buyer_id;

  const interlocuteur = await getProfil(interlocuteurId);

  const initiales =
    interlocuteur?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header conversation */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Link href="/messagerie" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-green-100 text-green-700 font-semibold text-sm">
            {initiales}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {interlocuteur?.full_name ?? "Utilisateur"}
          </p>
          {conversation.listings && (
            <Link
              href={`/annonces/${conversation.listing_id}`}
              className="text-xs text-green-600 truncate hover:underline"
            >
              {conversation.listings.title}
            </Link>
          )}
        </div>
      </div>

      {/* Thread (client component avec Realtime) */}
      <div className="flex-1 min-h-0">
        <MessageThread
          conversationId={id}
          currentUserId={user.id}
          messagesInitiaux={messages}
        />
      </div>
    </div>
  );
}
