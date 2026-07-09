import { createClient } from "@/lib/supabase/server";
import type { Profile, Wallet, Transaction } from "@/lib/types/database.types";

export async function getProfil(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function getWallet(userId: string): Promise<Wallet | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data as Wallet;
}

export async function getTransactions(userId: string, limite = 20): Promise<Transaction[]> {
  const supabase = await createClient();
  const wallet = await getWallet(userId);
  if (!wallet) return [];

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false })
    .limit(limite);

  if (error) return [];
  return (data ?? []) as Transaction[];
}

export async function getFavoris(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `*, listings(*, categories(name, slug, icon), profiles(full_name, phone, avatar_url), listing_photos(storage_path, position))` as any
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((f: any) => f.listings).filter(Boolean);
}
