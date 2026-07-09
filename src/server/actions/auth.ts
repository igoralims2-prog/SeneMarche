"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function parseAuthError(message: string): string {
  if (message.includes("rate limit") || message.includes("429"))
    return "Trop de tentatives. Attends quelques minutes avant de réessayer.";
  if (message.includes("not found") || message.includes("User not found"))
    return "Aucun compte trouvé avec cet email. Crée un compte d'abord.";
  if (message.includes("expired"))
    return "Code expiré. Demande un nouveau code.";
  if (message.includes("invalid") || message.includes("Token has expired or is invalid"))
    return "Code incorrect. Vérifie et réessaie.";
  return message;
}

export async function envoyerOtpConnexion(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  if (error) throw new Error(parseAuthError(error.message));
}

export async function envoyerOtpInscription(email: string, fullName: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: { full_name: fullName.trim() },
    },
  });
  if (error) throw new Error(parseAuthError(error.message));
}

export async function verifierOtp(email: string, token: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
  if (error) throw new Error(parseAuthError(error.message));
}

export async function mettreAJourProfil(data: { full_name: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: data.full_name.trim() })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  redirect("/");
}

export async function seDeconnecter() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
