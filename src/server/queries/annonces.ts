import { createClient } from "@/lib/supabase/server";
import type { Listing } from "@/lib/types/database.types";

export type ListingAvecDetails = Listing & {
  categories: { name: string; slug: string; icon: string } | null;
  profiles: { full_name: string; phone: string; avatar_url: string | null } | null;
  listing_photos: { storage_path: string; position: number }[];
};

export type FiltresAnnonces = {
  categorie?: string;
  localisation?: string;
  prixMin?: number;
  prixMax?: number;
  etat?: "new" | "used" | "refurbished";
  q?: string;
  tri?: string;
};

const SELECT_LISTING =
  "*, categories(name, slug, icon), profiles(full_name, phone, avatar_url), listing_photos(storage_path, position)";

export async function getAnnonces(
  filtres: FiltresAnnonces = {},
  limite = 20,
  offset = 0
): Promise<ListingAvecDetails[]> {
  const supabase = await createClient();

  // Résoudre le slug de catégorie en ID avant de filtrer
  let categoryId: string | undefined;
  if (filtres.categorie) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filtres.categorie)
      .single();
    categoryId = cat?.id;
  }

  // Choisir l'ordre selon le paramètre tri
  type OrderCol = { col: string; asc: boolean };
  const ORDER_MAP: Record<string, OrderCol> = {
    prix_asc:  { col: "price", asc: true },
    prix_desc: { col: "price", asc: false },
    vues:      { col: "views_count", asc: false },
  };
  const ordre = filtres.tri ? (ORDER_MAP[filtres.tri] ?? { col: "created_at", asc: false }) : { col: "created_at", asc: false };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from("listings")
    .select(SELECT_LISTING)
    .eq("status", "active")
    .order(ordre.col, { ascending: ordre.asc })
    .range(offset, offset + limite - 1);

  if (categoryId) query = query.eq("category_id", categoryId);
  if (filtres.localisation) query = query.ilike("location", `%${filtres.localisation}%`);
  if (filtres.prixMin !== undefined) query = query.gte("price", filtres.prixMin);
  if (filtres.prixMax !== undefined) query = query.lte("price", filtres.prixMax);
  if (filtres.etat) query = query.eq("condition", filtres.etat);
  if (filtres.q) query = query.textSearch("title", filtres.q, { type: "websearch" });

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as ListingAvecDetails[];
}

export async function getAnnonceById(id: string): Promise<ListingAvecDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select(SELECT_LISTING as any)
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as ListingAvecDetails;
}

export async function getAnnoncesParVendeur(sellerId: string): Promise<ListingAvecDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select(SELECT_LISTING as any)
    .eq("seller_id", sellerId)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as unknown as ListingAvecDetails[];
}
