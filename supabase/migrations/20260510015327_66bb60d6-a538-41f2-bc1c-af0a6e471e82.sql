
-- Sponsor slots: places where sponsors can advertise
CREATE TABLE public.sponsor_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind TEXT NOT NULL, -- hood, door, wing, car_number, video_overlay, banner_top, banner_bottom, boost_priority
  scope TEXT NOT NULL DEFAULT 'global', -- pilot, scuderia, global, video
  scope_ref UUID, -- pilot_id or scuderia_id when applicable
  label TEXT NOT NULL,
  description TEXT,
  min_rate_per_second NUMERIC(12,4) NOT NULL DEFAULT 0.01,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsor_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Slots are publicly viewable" ON public.sponsor_slots
  FOR SELECT USING (true);

-- Sponsor bids: auction bids for slots
CREATE TABLE public.sponsor_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID NOT NULL REFERENCES public.sponsor_slots(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL,
  sponsor_name TEXT NOT NULL,
  sponsor_logo_url TEXT,
  sponsor_color TEXT DEFAULT '#ff2d2d',
  rate_per_second NUMERIC(12,4) NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 60,
  total_amount NUMERIC(14,4) GENERATED ALWAYS AS (rate_per_second * duration_seconds) STORED,
  status TEXT NOT NULL DEFAULT 'queued', -- queued, active, expired, cancelled
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sponsor_bids_slot_priority ON public.sponsor_bids(slot_id, rate_per_second DESC, created_at);

ALTER TABLE public.sponsor_bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bids are publicly viewable" ON public.sponsor_bids
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can bid" ON public.sponsor_bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id);

CREATE POLICY "Bidders can cancel their bids" ON public.sponsor_bids
  FOR DELETE USING (auth.uid() = bidder_id);

CREATE POLICY "Bidders can update their bids" ON public.sponsor_bids
  FOR UPDATE USING (auth.uid() = bidder_id);

-- Active sponsorships: currently winning + running
CREATE TABLE public.active_sponsorships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID NOT NULL REFERENCES public.sponsor_slots(id) ON DELETE CASCADE,
  bid_id UUID REFERENCES public.sponsor_bids(id) ON DELETE SET NULL,
  sponsor_name TEXT NOT NULL,
  sponsor_logo_url TEXT,
  sponsor_color TEXT,
  rate_per_second NUMERIC(12,4) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_active_sponsorships_slot ON public.active_sponsorships(slot_id, ends_at);

ALTER TABLE public.active_sponsorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active sponsorships publicly viewable" ON public.active_sponsorships
  FOR SELECT USING (true);

-- Update timestamp trigger
CREATE TRIGGER trg_sponsor_slots_updated
  BEFORE UPDATE ON public.sponsor_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sponsor_bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_sponsorships;

-- Seed initial global slots
INSERT INTO public.sponsor_slots (kind, scope, label, description, min_rate_per_second) VALUES
  ('banner_top',    'global', 'TOP BANNER · Global',           'Faixa superior em todas as páginas',                 0.05),
  ('banner_bottom', 'global', 'BOTTOM BANNER · Global',        'Faixa inferior em todas as páginas',                 0.04),
  ('boost_priority','global', 'BOOST PRIORITY · Live Race',    'Logo nos boosts ao vivo (cobertura)',                0.10),
  ('video_overlay', 'global', 'VIDEO OVERLAY · Pit Stop',      'Lower-third nos vídeos durante pit stop',            0.08),
  ('hood',          'global', 'CAPÔ · Porsche Hero',           'Capô do carro hero da home',                          0.20),
  ('door',          'global', 'PORTA · Porsche Hero',          'Porta do carro hero (lado motorista)',                0.15),
  ('wing',          'global', 'ASA TRASEIRA · Porsche Hero',   'Asa traseira do carro hero',                          0.12),
  ('car_number',    'global', 'NÚMERO · Side Track',           'Acima dos carros na pista lateral',                   0.06);
