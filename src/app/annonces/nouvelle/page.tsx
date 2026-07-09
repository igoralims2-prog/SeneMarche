import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormulaireAnnonce } from "@/components/annonces/formulaire-annonce";
import { getCategories } from "@/server/queries/categories";

export default async function PageNouvelleAnnonce() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const categories = await getCategories();

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Publier une annonce</h1>
      <FormulaireAnnonce categories={categories} />
    </div>
  );
}
