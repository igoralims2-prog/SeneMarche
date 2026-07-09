import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfil } from "@/server/queries/profil";
import { getAnnoncesParVendeur } from "@/server/queries/annonces";
import { AnnonceCard } from "@/components/annonces/annonce-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Package } from "lucide-react";

type Props = { params: Promise<{ userId: string }> };

export default async function PageProfilPublic({ params }: Props) {
  const { userId } = await params;

  const [profil, annonces] = await Promise.all([
    getProfil(userId),
    getAnnoncesParVendeur(userId),
  ]);

  if (!profil) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const estMoi = user?.id === userId;

  const initiales = profil.full_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const membreDepuis = new Date(profil.created_at).toLocaleDateString("fr-SN", {
    month: "long",
    year: "numeric",
  });

  const annoncesActives = annonces.filter((a) => a.status === "active");

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Bannière profil */}
        <div className="bg-white border-b px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              {profil.avatar_url && (
                <AvatarImage src={profil.avatar_url} alt={profil.full_name} />
              )}
              <AvatarFallback className="bg-green-100 text-green-700 text-xl font-bold">
                {initiales}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 truncate">{profil.full_name}</h1>
                {estMoi && (
                  <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                    Moi
                  </Badge>
                )}
              </div>
              {profil.bio && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{profil.bio}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              Membre depuis {membreDepuis}
            </span>
            <span className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              {annoncesActives.length} annonce{annoncesActives.length !== 1 ? "s" : ""} active
              {annoncesActives.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Annonces du vendeur */}
        <div className="px-4 py-4">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Annonces de {profil.full_name.split(" ")[0]}
          </h2>

          {annoncesActives.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">
              Aucune annonce active pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {annoncesActives.map((annonce) => (
                <AnnonceCard key={annonce.id} annonce={annonce} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
