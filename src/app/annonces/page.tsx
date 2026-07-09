import { Suspense } from "react";
import Link from "next/link";
import { getAnnonces } from "@/server/queries/annonces";
import { getCategories } from "@/server/queries/categories";
import { AnnonceCard } from "@/components/annonces/annonce-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal } from "lucide-react";

type SearchParams = Promise<{ q?: string; categorie?: string; etat?: string; tri?: string }>;

export default async function PageAnnonces({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const { q, categorie, tri } = params;
  const ETATS_VALIDES = ["new", "used", "refurbished"] as const;
  type EtatValide = (typeof ETATS_VALIDES)[number];
  const etat: EtatValide | undefined = ETATS_VALIDES.includes(params.etat as EtatValide)
    ? (params.etat as EtatValide)
    : undefined;

  const [annonces, categories] = await Promise.all([
    getAnnonces({ q, categorie, etat, tri }),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de recherche */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 shadow-sm">
        <form className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Rechercher une annonce..."
              className="pl-9"
            />
          </div>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Chercher
          </Button>
        </form>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Filtres catégories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <Link href="/annonces">
            <Badge
              variant={!categorie ? "default" : "outline"}
              className={`cursor-pointer whitespace-nowrap ${!categorie ? "bg-green-600" : ""}`}
            >
              Tout
            </Badge>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/annonces?categorie=${cat.slug}`}>
              <Badge
                variant={categorie === cat.slug ? "default" : "outline"}
                className={`cursor-pointer whitespace-nowrap ${categorie === cat.slug ? "bg-green-600" : ""}`}
              >
                {cat.icon} {cat.name}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Filtres état + tri */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {[
              { label: "Tous", val: "" },
              { label: "Neuf", val: "new" },
              { label: "Occasion", val: "used" },
            ].map(({ label, val }) => (
              <Link
                key={val}
                href={`/annonces?${new URLSearchParams({ ...(q ? { q } : {}), ...(categorie ? { categorie } : {}), etat: val }).toString()}`}
              >
                <Badge
                  variant={etat === val || (!etat && val === "") ? "default" : "outline"}
                  className={`cursor-pointer text-xs ${etat === val || (!etat && val === "") ? "bg-green-600" : ""}`}
                >
                  {label}
                </Badge>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <SlidersHorizontal className="h-4 w-4" />
            <select
              name="tri"
              className="text-sm bg-transparent border-none outline-none cursor-pointer"
              defaultValue={tri}
            >
              <option value="">Plus récents</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
              <option value="vues">Plus vus</option>
            </select>
          </div>
        </div>

        {/* Résultats */}
        <p className="text-sm text-gray-500 mb-4">
          {annonces.length} annonce{annonces.length !== 1 ? "s" : ""}
          {q ? ` pour « ${q} »` : ""}
        </p>

        <Suspense fallback={<div className="text-center py-10 text-gray-400">Chargement…</div>}>
          {annonces.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">Aucune annonce trouvée</p>
              <Link href="/annonces/nouvelle">
                <Button className="mt-4 bg-green-600 hover:bg-green-700">
                  Publier la première
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {annonces.map((annonce) => (
                <AnnonceCard key={annonce.id} annonce={annonce} />
              ))}
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}
