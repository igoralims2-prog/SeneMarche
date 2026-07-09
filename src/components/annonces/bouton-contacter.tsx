"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ouvrirConversation } from "@/server/actions/messagerie";

type BoutonContacterProps = {
  listingId: string;
  estConnecte: boolean;
};

export function BoutonContacter({ listingId, estConnecte }: BoutonContacterProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!estConnecte) {
      toast.error("Connectez-vous pour envoyer un message");
      router.push("/connexion");
      return;
    }

    startTransition(async () => {
      try {
        const conversationId = await ouvrirConversation(listingId);
        router.push(`/messagerie/${conversationId}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  return (
    <Button
      variant="outline"
      className="w-full gap-2 border-green-600 text-green-700 hover:bg-green-50"
      onClick={handleClick}
      disabled={isPending}
    >
      <MessageCircle className="h-4 w-4" />
      {isPending ? "Ouverture..." : "Envoyer un message"}
    </Button>
  );
}
