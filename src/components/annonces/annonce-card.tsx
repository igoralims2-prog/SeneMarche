import Link from "next/link";
import Image from "next/image";
import { MapPin, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStorageUrl, cn, formatPrix } from "@/lib/utils";
import type { ListingAvecDetails } from "@/server/queries/annonces";

type AnnonceCardProps = {
  annonce: ListingAvecDetails;
};

const ETAT_CONFIG: Record<string, { label: string; class: string }> = {
  new:          { label: "Neuf",         class: "bg-green-100 text-green-700 border-green-200" },
  used:         { label: "Occasion",     class: "bg-amber-50 text-amber-700 border-amber-200" },
  refurbished:  { label: "Reconditionné",class: "bg-blue-50 text-blue-700 border-blue-200" },
};

export function AnnonceCard({ annonce }: AnnonceCardProps) {
  const photosTri = [...(annonce.listing_photos ?? [])].sort((a, b) => a.position - b.position);
  const photoUrl = photosTri[0]?.storage_path ? getStorageUrl(photosTri[0].storage_path) : null;
  const etat = ETAT_CONFIG[annonce.condition] ?? ETAT_CONFIG.used;

  return (
    <Link href={`/annonces/${annonce.id}`} className="group block">
      <article className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">

        {/* Photo */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={annonce.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
              <span className="text-4xl opacity-60">{annonce.categories?.icon ?? "📦"}</span>
            </div>
          )}

          {/* Badge état */}
          <Badge
            variant="outline"
            className={cn("absolute top-2 left-2 text-[10px] font-semibold px-1.5 py-0.5 border", etat.class)}
          >
            {etat.label}
          </Badge>

          {/* Vues */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-full">
            <Eye className="h-2.5 w-2.5" />
            {annonce.views_count}
          </div>
        </div>

        {/* Infos */}
        <div className="p-3">
          <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-green-700 transition-colors">
            {annonce.title}
          </p>

          {/* Prix */}
          <p className="text-base font-black text-orange-500">
            {formatPrix(annonce.price)}
          </p>

          {/* Localisation */}
          {annonce.location && (
            <div className="flex items-center gap-1 mt-1.5 text-gray-400">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="text-[11px] truncate">{annonce.location}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
