"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function mettreAJourProfil(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const full_name = formData.get("full_name") as string;
  const bio = formData.get("bio") as string | null;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: full_name.trim(), bio: bio?.trim() ?? null })
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/profil");
}

export async function uploaderAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const fichier = formData.get("avatar") as File;
  if (!fichier || fichier.size === 0) throw new Error("Fichier manquant");

  const ext = fichier.name.split(".").pop();
  const chemin = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(chemin, fichier, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(chemin);

  await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);

  revalidatePath("/profil");
  return publicUrl;
}
