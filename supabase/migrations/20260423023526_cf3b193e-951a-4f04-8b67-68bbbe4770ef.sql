-- ============================================================
-- PROFILES TABLE (one per auth user)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly viewable"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- PILOTS TABLE (each authed user can own pilots)
-- ============================================================
CREATE TABLE public.pilots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  number INTEGER NOT NULL,
  country TEXT NOT NULL DEFAULT '🏁',
  team TEXT NOT NULL DEFAULT 'INDEPENDENT',
  car_color TEXT NOT NULL DEFAULT 'red',
  car_model TEXT NOT NULL DEFAULT 'gt3',
  sponsor TEXT NOT NULL DEFAULT 'TRUSTBANK',
  photo_url TEXT,
  bio TEXT,
  is_ai BOOLEAN NOT NULL DEFAULT false,
  claimed_from_ai TEXT, -- original ai slug if claimed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pilots_owner ON public.pilots(owner_id);
CREATE INDEX idx_pilots_slug ON public.pilots(slug);

ALTER TABLE public.pilots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pilots are publicly viewable"
  ON public.pilots FOR SELECT USING (true);

CREATE POLICY "Users can create their own pilot"
  ON public.pilots FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their pilot"
  ON public.pilots FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their pilot"
  ON public.pilots FOR DELETE USING (auth.uid() = owner_id);

-- ============================================================
-- PILOT POSTS (feed posts, real or auto-generated)
-- ============================================================
CREATE TABLE public.pilot_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pilot_id UUID NOT NULL REFERENCES public.pilots(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  image_url TEXT,
  kind TEXT NOT NULL DEFAULT 'organic', -- 'organic' | 'auto' | 'paid'
  sponsor TEXT,
  cta TEXT,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pilot_posts_pilot ON public.pilot_posts(pilot_id, created_at DESC);
CREATE INDEX idx_pilot_posts_recent ON public.pilot_posts(created_at DESC);

ALTER TABLE public.pilot_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are publicly viewable"
  ON public.pilot_posts FOR SELECT USING (true);

CREATE POLICY "Pilot owners can post on their pilot"
  ON public.pilot_posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM public.pilots p
      WHERE p.id = pilot_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Authors can delete their posts"
  ON public.pilot_posts FOR DELETE USING (auth.uid() = author_id);

-- ============================================================
-- PILOT STATS (live race stats, owners can update their own)
-- ============================================================
CREATE TABLE public.pilot_stats (
  pilot_id UUID NOT NULL PRIMARY KEY REFERENCES public.pilots(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 50,
  best_lap TEXT NOT NULL DEFAULT '2:45.000',
  earnings BIGINT NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pilot_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stats are publicly viewable"
  ON public.pilot_stats FOR SELECT USING (true);

CREATE POLICY "Owners can upsert their stats"
  ON public.pilot_stats FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pilots p
      WHERE p.id = pilot_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their stats"
  ON public.pilot_stats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pilots p
      WHERE p.id = pilot_id AND p.owner_id = auth.uid()
    )
  );

-- ============================================================
-- TIMESTAMP TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pilots_updated_at
  BEFORE UPDATE ON public.pilots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STORAGE BUCKET FOR PILOT PHOTOS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('pilot-photos', 'pilot-photos', true);

CREATE POLICY "Pilot photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pilot-photos');

CREATE POLICY "Authenticated users can upload pilot photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pilot-photos'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own pilot photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'pilot-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own pilot photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pilot-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );