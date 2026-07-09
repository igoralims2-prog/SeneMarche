import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/connexion?erreur=lien_invalide`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/connexion?erreur=session`);
  }

  // Vérifier si le profil est complet
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    // Nouveau utilisateur sans nom → compléter le profil
    if (!profile || profile.full_name === "Utilisateur" || !profile.full_name) {
      return NextResponse.redirect(`${origin}/inscription?etape=profil`);
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
