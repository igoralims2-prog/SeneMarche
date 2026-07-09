"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type NouvelleAnnonce = {
  title: string;
  description: string;
  price: number;
  category_id: string;
  condition: "new" | "used" | "refurbished";
  location: string;
  phone?: string;
};

export async function creerAnnonce(data: NouvelleAnnonce, photos: File[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // 1. Créer l'annonce
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .insert({
      seller_id: user.id,
      category_id: data.category_id,
      title: data.title,
      description: data.description,
      price: data.price,
      condition: data.condition,
      location: data.location,
      phone: data.phone ?? null,
    })
    .select("id")
    .single();

  if (listingError) throw new Error(listingError.message);

  // 2. Uploader les photos vers Supabase Storage
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const ext = photo.name.split(".").pop();
    const path = `${user.id}/${listing.id}/${i}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-photos")
      .upload(path, photo, { upsert: false });

    if (uploadError) continue; // On ne bloque pas pour une photo ratée

    await supabase.from("listing_photos").insert({
      listing_id: listing.id,
      storage_path: path,
      position: i,
    });
  }

  redirect(`/annonces/${listing.id}`);
}

export async function supprimerAnnonce(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // Suppression douce : on passe le statut à 'deleted'
  const { error } = await supabase
    .from("listings")
    .update({ status: "deleted" })
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) throw new Error(error.message);
  redirect("/profil");
}

export async function marquerVendu(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("listings")
    .update({ status: "sold" })
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) throw new Error(error.message);
}

export async function incrementerVues(id: string) {
  const supabase = await createClient();
  // RPC pour incrémenter atomiquement sans exposer la logique côté client
  await supabase.rpc("increment_views", { listing_id: id });
}
