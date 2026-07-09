"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleFavori } from "@/server/actions/favoris";
import { cn } from "@/lib/utils";

type BoutonFavoriProps = {
  listingId: string;
  initialEstFavori: boolean;
  estConnecte: boolean;
};

export function BoutonFavori({ listingId, initialEstFavori, estConnecte }: BoutonFavoriProps) {
  const [estFavori, setEstFavori] = useState(initialEstFavori);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!estConnecte) {
      toast.error("Connectez-vous pour ajouter aux favoris");
      return;
    }

    startTransition(async () => {
      try {
        const ajoute = await toggleFavori(listingId);
        setEstFavori(ajoute);
        toast.success(ajoute ? "Ajouté aux favoris" : "Retiré des favoris");
      } catch {
        toast.error("Une erreur est survenue");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "shrink-0 p-2 rounded-full transition-colors",
        estFavori
          ? "text-red-500 bg-red-50 hover:bg-red-100"
          : "text-gray-400 hover:bg-red-50 hover:text-red-500"
      )}
      aria-label={estFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart className={cn("h-5 w-5", estFavori && "fill-red-500")} />
    </button>
  );
}
