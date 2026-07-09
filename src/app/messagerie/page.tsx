import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getConversations } from "@/server/queries/messagerie";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

export default async function PageMessagerie() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const conversations = await getConversations(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border-b px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-16 px-4">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun message</p>
            <p className="text-gray-400 text-sm mt-1">
              Contacte un vendeur depuis une annonce pour commencer
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 bg-white">
            {conversations.map((conv) => {
              const initiales = conv.interlocuteur?.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) ?? "?";

              return (
                <li key={conv.id}>
                  <Link
                    href={`/messagerie/${conv.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                        {initiales}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-900 truncate">
                          {conv.interlocuteur?.full_name ?? "Utilisateur"}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatDistanceToNow(conv.updated_at)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.listings?.title ?? "Annonce supprimée"}
                      </p>
                      <p className="text-sm text-gray-600 truncate mt-0.5">
                        {conv.dernier_message ?? "Démarrer la conversation…"}
                      </p>
                    </div>

                    {conv.non_lus > 0 && (
                      <Badge className="bg-green-600 text-white flex-shrink-0 h-5 min-w-5 flex items-center justify-center rounded-full text-xs">
                        {conv.non_lus}
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
