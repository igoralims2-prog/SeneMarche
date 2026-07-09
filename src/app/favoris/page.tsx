import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFavoris } from "@/server/queries/profil";
import { AnnonceCard } from "@/components/annonces/annonce-card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export default async function PageFavoris() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const favoris = await getFavoris(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Mes favoris</h1>

        {favoris.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun favori pour l&apos;instant</p>
            <p className="text-gray-400 text-sm mt-1">
              Appuie sur le ❤️ d&apos;une annonce pour la sauvegarder
            </p>
            <Link href="/annonces">
              <Button className="mt-6 bg-green-600 hover:bg-green-700">
                Parcourir les annonces
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {favoris.length} annonce{favoris.length !== 1 ? "s" : ""} sauvegardée
              {favoris.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* TODO: Supabase — les favoris sont chargés via getFavoris(user.id) */}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {favoris.map((annonce: any) => (
                <AnnonceCard key={annonce.id} annonce={annonce} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
