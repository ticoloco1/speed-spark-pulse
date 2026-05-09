-- Extend pilot_posts
ALTER TABLE public.pilot_posts
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS embed_kind text CHECK (embed_kind IN ('youtube','x','mp4','none')) DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS parent_post_id uuid REFERENCES public.pilot_posts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS reposts integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_pilot_posts_parent ON public.pilot_posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_pilot_posts_pilot_created ON public.pilot_posts(pilot_id, created_at DESC);

-- follows
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  pilot_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, pilot_id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are publicly viewable"
  ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow"
  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- post_likes
CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.pilot_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are publicly viewable"
  ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like"
  ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike"
  ON public.post_likes FOR DELETE USING (auth.uid() = user_id);