import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Eye, Calendar, Phone, ChevronLeft, Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PrixFormat } from "@/components/shared/prix-format";
import { AnnonceCard } from "@/components/annonces/annonce-card";
import { BoutonFavori } from "@/components/annonces/bouton-favori";
import { BoutonContacter } from "@/components/annonces/bouton-contacter";
import { getAnnonceById, getAnnonces } from "@/server/queries/annonces";
import { estFavori } from "@/server/actions/favoris";
import { createClient } from "@/lib/supabase/server";
import { formatDate, getInitiales, getStorageUrl } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

const ETAT_LABELS: Record<string, string> = {
  new: "Neuf",
  used: "Occasion",
  refurbished: "Reconditionné",
};

export default async function PageDetailAnnonce({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [annonce, favori] = await Promise.all([
    getAnnonceById(id),
    estFavori(id),
  ]);

  if (!annonce) notFound();

  const photosTri = [...(annonce.listing_photos ?? [])].sort((a, b) => a.position - b.position);
  const photoPrincipale = photosTri[0]?.storage_path
    ? getStorageUrl(photosTri[0].storage_path)
    : null;

  const annoncesSimlaires = await getAnnonces({ categorie: annonce.categories?.slug }, 4);
  const similaires = annoncesSimlaires.filter((a) => a.id !== id).slice(0, 4);

  const estLeVendeur = user?.id === annonce.seller_id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="space-y-4">
        {/* Photo principale */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
          {photoPrincipale ? (
            <Image
              src={photoPrincipale}
              alt={annonce.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-6xl">
              {annonce.categories?.icon ?? "📦"}
            </div>
          )}
          {photosTri.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              1 / {photosTri.length}
            </div>
          )}
        </div>

        {/* Infos principales */}
        <div className="bg-white rounded-2xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge variant="outline" className="text-xs mb-2">
                {annonce.categories?.icon} {annonce.categories?.name}
              </Badge>
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{annonce.title}</h1>
            </div>
            <BoutonFavori
              listingId={annonce.id}
              initialEstFavori={favori}
              estConnecte={!!user}
            />
          </div>

          <p className="text-2xl font-bold text-orange-600">
            <PrixFormat montant={annonce.price} />
          </p>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            {annonce.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {annonce.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" /> {annonce.views_count} vues
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {formatDate(annonce.created_at)}
            </span>
            <Badge variant="outline" className="text-xs">
              {ETAT_LABELS[annonce.condition]}
            </Badge>
          </div>
        </div>

        {/* Description */}
        {annonce.description && (
          <div className="bg-white rounded-2xl p-4">
            <h2 className="font-semibold text-gray-800 mb-2">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {annonce.description}
            </p>
          </div>
        )}

        {/* Vendeur */}
        <div className="bg-white rounded-2xl p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Vendeur</h2>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                {getInitiales(annonce.profiles?.full_name ?? "?")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{annonce.profiles?.full_name}</p>
            </div>
            <Link href={`/profil/${annonce.seller_id}`}>
              <Button variant="outline" size="sm">
                Voir profil
              </Button>
            </Link>
          </div>
          <Separator className="my-3" />
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg p-2">
            <Shield className="h-4 w-4 shrink-0" />
            <span>Payez via SenéMarché pour être protégé en cas de litige.</span>
          </div>
        </div>

        {/* Actions */}
        {!estLeVendeur && (
          <div className="grid grid-cols-2 gap-3">
            <BoutonContacter listingId={annonce.id} estConnecte={!!user} />
            <Button className="gap-2 bg-orange-500 hover:bg-orange-600 text-white w-full">
              {/* TODO: intégrer agrégateur paiement (PayTech / PayDunya) */}
              Payer maintenant
            </Button>
          </div>
        )}

        {estLeVendeur && (
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/annonces/${annonce.id}/modifier`} className="block">
              <Button variant="outline" className="w-full">Modifier</Button>
            </Link>
            <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
              Marquer comme vendu
            </Button>
          </div>
        )}

        {(annonce.phone ?? annonce.profiles?.phone) && (
          <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
            <Phone className="h-3 w-3" />
            {annonce.phone ?? annonce.profiles?.phone}
          </p>
        )}

        {/* Annonces similaires */}
        {similaires.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-800 mb-3">Annonces similaires</h2>
            <div className="grid grid-cols-2 gap-3">
              {similaires.map((a) => (
                <AnnonceCard key={a.id} annonce={a} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
