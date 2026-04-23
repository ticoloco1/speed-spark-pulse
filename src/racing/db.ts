// Typed helpers for talking to the racing tables.
import { supabase } from "@/integrations/supabase/client";
import type { CarColor } from "./types";

export interface DbPilot {
  id: string;
  owner_id: string | null;
  slug: string;
  name: string;
  number: number;
  country: string;
  team: string;
  car_color: CarColor;
  car_model: string;
  sponsor: string;
  photo_url: string | null;
  bio: string | null;
  is_ai: boolean;
  claimed_from_ai: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPost {
  id: string;
  pilot_id: string;
  author_id: string | null;
  text: string;
  image_url: string | null;
  kind: "organic" | "auto" | "paid";
  sponsor: string | null;
  cta: string | null;
  likes: number;
  comments: number;
  created_at: string;
}

export interface DbStats {
  pilot_id: string;
  position: number;
  best_lap: string;
  earnings: number;
  level: number;
}

export const db = {
  // ── pilots ──────────────────────────────────────────────
  async listPilots(): Promise<DbPilot[]> {
    const { data, error } = await supabase
      .from("pilots")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as DbPilot[];
  },
  async getPilotBySlug(slug: string): Promise<DbPilot | null> {
    const { data, error } = await supabase
      .from("pilots")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as DbPilot) ?? null;
  },
  async getMyPilot(userId: string): Promise<DbPilot | null> {
    const { data, error } = await supabase
      .from("pilots")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle();
    if (error) throw error;
    return (data as DbPilot) ?? null;
  },
  async createPilot(input: Omit<DbPilot, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("pilots")
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as DbPilot;
  },
  async updatePilot(id: string, patch: Partial<DbPilot>) {
    const { data, error } = await supabase
      .from("pilots")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as DbPilot;
  },

  // ── posts ──────────────────────────────────────────────
  async listPostsForPilot(pilotId: string, limit = 30): Promise<DbPost[]> {
    const { data, error } = await supabase
      .from("pilot_posts")
      .select("*")
      .eq("pilot_id", pilotId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as DbPost[];
  },
  async createPost(input: Omit<DbPost, "id" | "created_at" | "likes" | "comments"> & {
    likes?: number; comments?: number;
  }) {
    const { data, error } = await supabase
      .from("pilot_posts")
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as DbPost;
  },

  // ── photos ─────────────────────────────────────────────
  async uploadPilotPhoto(userId: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${userId}/pilot-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("pilot-photos")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    const { data } = supabase.storage.from("pilot-photos").getPublicUrl(path);
    return data.publicUrl;
  },
};

// Convert a DB pilot to the engine's Pilot shape so existing components work.
import type { Pilot } from "./types";
export function dbPilotToEngine(p: DbPilot, position = 50): Pilot {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    number: p.number,
    country: p.country,
    team: p.team,
    carColor: p.car_color,
    sponsor: p.sponsor,
    bestLap: "2:42.000",
    position,
    isAI: p.is_ai,
    earnings: 0,
    level: 1,
  };
}
