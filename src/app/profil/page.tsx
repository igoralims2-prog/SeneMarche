import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getProfil, getWallet } from "@/server/queries/profil";
import { getAnnoncesParVendeur, type ListingAvecDetails } from "@/server/queries/annonces";
import { mettreAJourProfil } from "@/server/actions/profil";
import { seDeconnecter } from "@/server/actions/auth";
import { AnnonceCard } from "@/components/annonces/annonce-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Wallet, LogOut, Plus } from "lucide-react";
import { formatPrix } from "@/lib/utils";

export default async function PageProfil() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const [profil, wallet, mesAnnonces] = await Promise.all([
    getProfil(user.id),
    getWallet(user.id),
    getAnnoncesParVendeur(user.id),
  ]);

  if (!profil) redirect("/inscription");

  const initiales = profil.full_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Carte profil */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              {profil.avatar_url && (
                <AvatarImage src={profil.avatar_url} alt={profil.full_name} />
              )}
              <AvatarFallback className="bg-green-100 text-green-700 text-xl font-bold">
                {initiales}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{profil.full_name}</h1>
              <p className="text-gray-500 text-sm">{profil.phone}</p>
            </div>
          </div>

          {/* Solde wallet */}
          {wallet && (
            <Link href="/portefeuille">
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 hover:bg-green-100 transition-colors">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Mon portefeuille</span>
                </div>
                <span className="font-bold text-green-700">{formatPrix(wallet.balance)}</span>
              </div>
            </Link>
          )}

          {/* Formulaire édition profil */}
          <form action={mettreAJourProfil} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={profil.full_name}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio (optionnel)</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={profil.bio ?? ""}
                placeholder="Parle un peu de toi…"
                rows={3}
                className="mt-1 resize-none"
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              Enregistrer les modifications
            </Button>
          </form>
        </div>

        <Separator />

        {/* Mes annonces */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Mes annonces ({mesAnnonces.length})
            </h2>
            <Link href="/annonces/nouvelle">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1">
                <Plus className="h-4 w-4" />
                Publier
              </Button>
            </Link>
          </div>

          {mesAnnonces.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              Tu n&apos;as pas encore publié d&apos;annonce.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {mesAnnonces.map((annonce: ListingAvecDetails) => (
                <AnnonceCard key={annonce.id} annonce={annonce} />
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Déconnexion */}
        <form action={seDeconnecter}>
          <Button
            type="submit"
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50 gap-2"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </Button>
        </form>
      </div>
    </div>
  );
}
