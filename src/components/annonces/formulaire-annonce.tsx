"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, X, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { creerAnnonce } from "@/server/actions/annonces";
import type { Category } from "@/lib/types/database.types";

const VILLES = [
  "Dakar", "Thiès", "Saint-Louis", "Ziguinchor", "Kaolack",
  "Mbour", "Touba", "Rufisque", "Diourbel", "Tambacounda",
];

const ETATS = [
  { valeur: "new", label: "Neuf" },
  { valeur: "used", label: "Occasion" },
  { valeur: "refurbished", label: "Reconditionné" },
] as const;

type Props = { categories: Category[] };

export function FormulaireAnnonce({ categories }: Props) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Champs contrôlés pour les selects
  const [categoryId, setCategoryId] = useState("");
  const [condition, setCondition] = useState<"new" | "used" | "refurbished">("used");
  const [location, setLocation] = useState("");

  function handleAjouterPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const fichiers = Array.from(e.target.files ?? []);
    const restant = 5 - photos.length;
    const selectionnes = fichiers.slice(0, restant);

    setPhotos([...photos, ...selectionnes]);
    setPreviews([
      ...previews,
      ...selectionnes.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  }

  function handleSupprimerPhoto(index: number) {
    URL.revokeObjectURL(previews[index]);
    setPhotos(photos.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  }

  function handleSoumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
      price: Number((form.elements.namedItem("price") as HTMLInputElement).value),
      category_id: categoryId,
      condition,
      location,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value || undefined,
    };

    if (!categoryId) { toast.error("Choisissez une catégorie"); return; }
    if (!location) { toast.error("Choisissez une ville"); return; }

    startTransition(async () => {
      try {
        await creerAnnonce(data, photos);
        // La server action redirige vers /annonces/:id
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur lors de la publication");
        router.refresh();
      }
    });
  }

  return (
    <>
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
        <ChevronLeft className="h-4 w-4" /> Retour
      </Link>

      <form onSubmit={handleSoumettre} className="space-y-5">
        {/* Photos */}
        <div className="space-y-2">
          <Label>
            Photos{" "}
            <span className="text-gray-400 font-normal">({photos.length}/5)</span>
          </Label>
          <div className="flex gap-2 flex-wrap">
            {previews.map((url, i) => (
              <div
                key={i}
                className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleSupprimerPhoto(i)}
                  className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5">
                    Principale
                  </span>
                )}
              </div>
            ))}
            {photos.length < 5 && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors cursor-pointer">
                <Camera className="h-5 w-5" />
                <span className="text-xs">Ajouter</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handleAjouterPhoto}
                />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-400">La première photo sera la photo principale.</p>
        </div>

        {/* Titre */}
        <div className="space-y-1.5">
          <Label htmlFor="title">Titre de l&apos;annonce *</Label>
          <Input id="title" name="title" placeholder="Ex : iPhone 14 Pro 256 Go – Noir" required maxLength={100} minLength={5} />
        </div>

        {/* Catégorie */}
        <div className="space-y-1.5">
          <Label>Catégorie *</Label>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")} required>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Prix */}
        <div className="space-y-1.5">
          <Label htmlFor="price">Prix (F CFA) *</Label>
          <div className="relative">
            <Input id="price" name="price" type="number" placeholder="0" min={0} required className="pr-16" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">F CFA</span>
          </div>
        </div>

        {/* État */}
        <div className="space-y-1.5">
          <Label>État *</Label>
          <Select value={condition} onValueChange={(v) => setCondition((v ?? "used") as typeof condition)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ETATS.map((e) => (
                <SelectItem key={e.valeur} value={e.valeur}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ville */}
        <div className="space-y-1.5">
          <Label>Ville *</Label>
          <Select value={location} onValueChange={(v) => setLocation(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une ville" />
            </SelectTrigger>
            <SelectContent>
              {VILLES.map((v) => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Décrivez votre article : état, caractéristiques, raison de la vente..."
            rows={5}
            required
            minLength={20}
          />
          <p className="text-xs text-gray-400">Minimum 20 caractères.</p>
        </div>

        {/* Numéro de contact */}
        <div className="space-y-1.5">
          <Label htmlFor="phone">Numéro de contact</Label>
          <Input id="phone" name="phone" type="tel" placeholder="+221 77 000 00 00" />
          <p className="text-xs text-gray-400">Laissez vide pour utiliser votre numéro de profil.</p>
        </div>

        <Button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
          disabled={isPending}
        >
          {isPending ? "Publication en cours..." : "Publier l'annonce"}
        </Button>
      </form>
    </>
  );
}
