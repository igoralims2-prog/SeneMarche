-- ============================================================
-- SenéMarché — Schéma initial
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Profils utilisateurs (étend auth.users)
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  phone       text UNIQUE NOT NULL,
  full_name   text NOT NULL,
  avatar_url  text,
  bio         text,
  role        text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Catégories d'annonces (hiérarchie 2 niveaux)
CREATE TABLE public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  icon        text NOT NULL DEFAULT '📦',
  parent_id   uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Annonces
CREATE TABLE public.listings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id  uuid NOT NULL REFERENCES public.categories(id),
  title        text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 100),
  description  text CHECK (char_length(description) >= 20),
  price        numeric(12, 2) NOT NULL CHECK (price >= 0),
  currency     text NOT NULL DEFAULT 'XOF',
  condition    text NOT NULL DEFAULT 'used' CHECK (condition IN ('new', 'used', 'refurbished')),
  status       text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'paused', 'deleted')),
  location     text,
  latitude     numeric(9, 6),
  longitude    numeric(9, 6),
  phone        text,
  views_count  int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz DEFAULT now() + INTERVAL '60 days'
);

-- Photos des annonces (liens vers Supabase Storage)
CREATE TABLE public.listing_photos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  storage_path  text NOT NULL,
  position      int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Favoris
CREATE TABLE public.favorites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id  uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, listing_id)
);

-- Conversations acheteur/vendeur (une par annonce × acheteur)
CREATE TABLE public.conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, buyer_id),
  CHECK (buyer_id != seller_id)
);

-- Messages
CREATE TABLE public.messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content          text NOT NULL CHECK (char_length(content) >= 1),
  is_read          boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Portefeuilles (créés automatiquement à l'inscription via trigger)
CREATE TABLE public.wallets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance     numeric(12, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  currency    text NOT NULL DEFAULT 'XOF',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Transactions (immuables — audit trail)
CREATE TABLE public.transactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id       uuid NOT NULL REFERENCES public.wallets(id),
  type            text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'commission')),
  amount          numeric(12, 2) NOT NULL CHECK (amount > 0),
  balance_before  numeric(12, 2) NOT NULL,
  balance_after   numeric(12, 2) NOT NULL,
  reference       text UNIQUE,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  label           text,
  listing_id      uuid REFERENCES public.listings(id),
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        text NOT NULL,
  title       text NOT NULL,
  body        text,
  is_read     boolean NOT NULL DEFAULT false,
  data        jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEX
-- ============================================================

CREATE INDEX idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX idx_listings_category_id ON public.listings(category_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX idx_listing_photos_listing_id ON public.listing_photos(listing_id, position);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id ON public.conversations(seller_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id, created_at);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, is_read, created_at DESC);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Créer profil + wallet automatiquement à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur')
  );

  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Mettre à jour updated_at sur les listings
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER refresh_listing_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER refresh_profile_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER refresh_wallet_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Mettre à jour updated_at de la conversation à chaque nouveau message
CREATE OR REPLACE FUNCTION public.touch_conversation_on_message()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER refresh_conversation_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_conversation_on_message();

-- Créer une notification pour le destinataire d'un nouveau message
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_recipient_id uuid;
  v_sender_name  text;
BEGIN
  SELECT
    CASE WHEN c.buyer_id = NEW.sender_id THEN c.seller_id ELSE c.buyer_id END,
    p.full_name
  INTO v_recipient_id, v_sender_name
  FROM public.conversations c
  JOIN public.profiles p ON p.id = NEW.sender_id
  WHERE c.id = NEW.conversation_id;

  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    v_recipient_id,
    'message',
    'Nouveau message de ' || v_sender_name,
    left(NEW.content, 100),
    jsonb_build_object('conversation_id', NEW.conversation_id)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER create_notification_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_public"  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own"     ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"     ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- categories
CREATE POLICY "categories_select_public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_write_admin"   ON public.categories FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- listings
CREATE POLICY "listings_select_active"   ON public.listings FOR SELECT
  USING (status = 'active' OR auth.uid() = seller_id);
CREATE POLICY "listings_insert_auth"     ON public.listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "listings_update_own"      ON public.listings FOR UPDATE
  USING (auth.uid() = seller_id);
CREATE POLICY "listings_delete_own"      ON public.listings FOR DELETE
  USING (auth.uid() = seller_id);

-- listing_photos
CREATE POLICY "listing_photos_select_public" ON public.listing_photos FOR SELECT USING (true);
CREATE POLICY "listing_photos_write_own"     ON public.listing_photos FOR ALL
  USING (auth.uid() = (SELECT seller_id FROM public.listings WHERE id = listing_id));

-- favorites
CREATE POLICY "favorites_select_own"  ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_insert_auth" ON public.favorites FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() != (SELECT seller_id FROM public.listings WHERE id = listing_id)
  );
CREATE POLICY "favorites_delete_own"  ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- conversations
CREATE POLICY "conversations_select_participants" ON public.conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "conversations_insert_buyer" ON public.conversations FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id AND
    auth.uid() != (SELECT seller_id FROM public.listings WHERE id = listing_id)
  );

-- messages
CREATE POLICY "messages_select_participants" ON public.messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT buyer_id FROM public.conversations WHERE id = conversation_id
      UNION
      SELECT seller_id FROM public.conversations WHERE id = conversation_id
    )
  );
CREATE POLICY "messages_insert_participants" ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
      SELECT buyer_id FROM public.conversations WHERE id = conversation_id
      UNION
      SELECT seller_id FROM public.conversations WHERE id = conversation_id
    )
  );

-- wallets (lecture seule côté client — écritures via service_role uniquement)
CREATE POLICY "wallets_select_own"  ON public.wallets FOR SELECT USING (auth.uid() = user_id);

-- transactions (lecture seule côté client)
CREATE POLICY "transactions_select_own" ON public.transactions FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM public.wallets WHERE id = wallet_id));

-- notifications
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- DONNÉES INITIALES — Catégories
-- ============================================================

INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Électronique',   'electronique',   '📱', 1),
  ('Véhicules',      'vehicules',      '🚗', 2),
  ('Immobilier',     'immobilier',     '🏠', 3),
  ('Mode & Beauté',  'mode-beaute',    '👗', 4),
  ('Maison & Jardin','maison-jardin',  '🛋️', 5),
  ('Emploi',         'emploi',         '💼', 6),
  ('Services',       'services',       '🔧', 7),
  ('Animaux',        'animaux',        '🐾', 8);
