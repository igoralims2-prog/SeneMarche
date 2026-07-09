import Link from "next/link";
import { ChevronRight, TrendingUp, Shield, Zap } from "lucide-react";
import { AnnonceCard } from "@/components/annonces/annonce-card";
import { getAnnonces } from "@/server/queries/annonces";
import { getCategories } from "@/server/queries/categories";

export const revalidate = 60;

export default async function Accueil() {
  const [annonces, categories] = await Promise.all([
    getAnnonces({}, 8),
    getCategories(),
  ]);

  return (
    <div className="space-y-6 pb-6">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white">
        {/* Cercles décoratifs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-500/20 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full" />

        <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <TrendingUp className="h-3 w-3" />
              N°1 des annonces au Sénégal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight mb-3">
              Le marché du Sénégal,
              <br />
              <span className="text-orange-300">dans ta poche</span>
            </h1>
            <p className="text-green-100 text-sm leading-relaxed mb-6">
              Achète et vends facilement partout au Sénégal.
              Paiement Wave &amp; Orange Money.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/annonces/nouvelle"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-orange-900/30 active:scale-95"
              >
                Publier une annonce
              </Link>
              <Link
                href="/annonces"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all backdrop-blur-sm"
              >
                Explorer <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Avantages */}
        <div className="relative border-t border-white/10 bg-black/10 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-around gap-2">
            {[
              { icon: Zap, label: "Publication rapide" },
              { icon: Shield, label: "Transactions sécurisées" },
              { icon: TrendingUp, label: "Wave & Orange Money" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-green-100 text-xs font-medium">
                <Icon className="h-3.5 w-3.5 text-orange-300 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 space-y-8">

        {/* Catégories */}
        {categories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">Catégories</h2>
              <Link href="/annonces" className="text-sm text-green-600 font-medium flex items-center gap-0.5 hover:text-green-700">
                Tout voir <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/annonces?categorie=${cat.slug}`}
                  className="group flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-green-300 hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="text-[11px] text-gray-600 leading-tight font-medium">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Annonces récentes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Annonces récentes</h2>
            <Link href="/annonces" className="text-sm text-green-600 font-medium flex items-center gap-0.5 hover:text-green-700">
              Voir tout <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {annonces.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-4xl mb-3">🛍️</p>
              <p className="text-gray-500 font-medium">Aucune annonce pour le moment</p>
              <Link
                href="/annonces/nouvelle"
                className="inline-block text-green-600 font-semibold mt-2 text-sm hover:underline"
              >
                Soyez le premier à publier !
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {annonces.map((annonce) => (
                <AnnonceCard key={annonce.id} annonce={annonce} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
