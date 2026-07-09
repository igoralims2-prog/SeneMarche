"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErreurGlobale({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const estHorsligne =
    error.message?.toLowerCase().includes("fetch") ||
    error.message?.toLowerCase().includes("network") ||
    error.message?.toLowerCase().includes("econnrefused");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-orange-50 px-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
          <ShoppingBag className="h-8 w-8 text-white" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">
          {estHorsligne ? "Connexion interrompue" : "Une erreur est survenue"}
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {estHorsligne
            ? "Impossible de joindre le serveur. Vérifie ta connexion internet et réessaie."
            : "Quelque chose s'est mal passé. Notre équipe a été notifiée."}
        </p>

        <div className="flex flex-col gap-3">
          <Button
            onClick={reset}
            className="w-full h-11 rounded-xl font-bold gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-green-600 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
