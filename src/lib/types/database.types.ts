/**
 * Types manuels du schéma DB — en attendant :
 * npx supabase gen types typescript --project-id <id> > src/lib/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Types par table (Insert / Update sans référence circulaire) ───────────────

type ProfileRow = {
  id: string;
  phone: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
};
type ProfileInsert = {
  id: string;
  phone: string;
  full_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  role?: "user" | "admin";
  created_at?: string;
  updated_at?: string;
};
type ProfileUpdate = Partial<Omit<ProfileInsert, "id">>;

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
};
type CategoryInsert = {
  id?: string;
  name: string;
  slug: string;
  icon: string;
  parent_id?: string | null;
  sort_order?: number;
  created_at?: string;
};
type CategoryUpdate = Partial<Omit<CategoryInsert, "id">>;

type ListingRow = {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  condition: "new" | "used" | "refurbished";
  status: "active" | "sold" | "paused" | "deleted";
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
};
type ListingInsert = {
  id?: string;
  seller_id: string;
  category_id: string;
  title: string;
  description?: string | null;
  price: number;
  currency?: string;
  condition: "new" | "used" | "refurbished";
  status?: "active" | "sold" | "paused" | "deleted";
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  views_count?: number;
  created_at?: string;
  updated_at?: string;
  expires_at?: string | null;
};
type ListingUpdate = Partial<Omit<ListingInsert, "id">>;

type ListingPhotoRow = {
  id: string;
  listing_id: string;
  storage_path: string;
  position: number;
  created_at: string;
};
type ListingPhotoInsert = {
  id?: string;
  listing_id: string;
  storage_path: string;
  position?: number;
  created_at?: string;
};
type ListingPhotoUpdate = Partial<Omit<ListingPhotoInsert, "id">>;

type FavoriteRow = {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
};
type FavoriteInsert = {
  id?: string;
  user_id: string;
  listing_id: string;
  created_at?: string;
};
type FavoriteUpdate = Partial<Omit<FavoriteInsert, "id">>;

type ConversationRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
};
type ConversationInsert = {
  id?: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at?: string;
  updated_at?: string;
};
type ConversationUpdate = Partial<Omit<ConversationInsert, "id">>;

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};
type MessageInsert = {
  id?: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read?: boolean;
  created_at?: string;
};
type MessageUpdate = Partial<Omit<MessageInsert, "id">>;

type WalletRow = {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
};
type WalletInsert = {
  id?: string;
  user_id: string;
  balance?: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
};
type WalletUpdate = Partial<Omit<WalletInsert, "id">>;

type TransactionRow = {
  id: string;
  wallet_id: string;
  type: "deposit" | "withdrawal" | "payment" | "refund" | "commission";
  amount: number;
  balance_before: number;
  balance_after: number;
  reference: string | null;
  status: "pending" | "completed" | "failed";
  label: string | null;
  listing_id: string | null;
  metadata: Json | null;
  created_at: string;
};
type TransactionInsert = {
  id?: string;
  wallet_id: string;
  type: "deposit" | "withdrawal" | "payment" | "refund" | "commission";
  amount: number;
  balance_before: number;
  balance_after: number;
  reference?: string | null;
  status?: "pending" | "completed" | "failed";
  label?: string | null;
  listing_id?: string | null;
  metadata?: Json | null;
  created_at?: string;
};
type TransactionUpdate = Partial<Omit<TransactionInsert, "id">>;

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  data: Json | null;
  created_at: string;
};
type NotificationInsert = {
  id?: string;
  user_id: string;
  type: string;
  title: string;
  body?: string | null;
  is_read?: boolean;
  data?: Json | null;
  created_at?: string;
};
type NotificationUpdate = Partial<Omit<NotificationInsert, "id">>;

// ── Type Database global ──────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      categories: {
        Row: CategoryRow;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
        Relationships: [];
      };
      listings: {
        Row: ListingRow;
        Insert: ListingInsert;
        Update: ListingUpdate;
        Relationships: [];
      };
      listing_photos: {
        Row: ListingPhotoRow;
        Insert: ListingPhotoInsert;
        Update: ListingPhotoUpdate;
        Relationships: [];
      };
      favorites: {
        Row: FavoriteRow;
        Insert: FavoriteInsert;
        Update: FavoriteUpdate;
        Relationships: [];
      };
      conversations: {
        Row: ConversationRow;
        Insert: ConversationInsert;
        Update: ConversationUpdate;
        Relationships: [];
      };
      messages: {
        Row: MessageRow;
        Insert: MessageInsert;
        Update: MessageUpdate;
        Relationships: [];
      };
      wallets: {
        Row: WalletRow;
        Insert: WalletInsert;
        Update: WalletUpdate;
        Relationships: [];
      };
      transactions: {
        Row: TransactionRow;
        Insert: TransactionInsert;
        Update: TransactionUpdate;
        Relationships: [];
      };
      notifications: {
        Row: NotificationRow;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_views: {
        Args: { listing_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
  };
};

// ── Raccourcis ────────────────────────────────────────────────────────────────

export type Profile = ProfileRow;
export type Category = CategoryRow;
export type Listing = ListingRow;
export type ListingPhoto = ListingPhotoRow;
export type Favorite = FavoriteRow;
export type Conversation = ConversationRow;
export type Message = MessageRow;
export type Wallet = WalletRow;
export type Transaction = TransactionRow;
export type Notification = NotificationRow;
