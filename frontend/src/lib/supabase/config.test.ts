import { describe, it, expect, afterEach, vi } from "vitest";

import { isSupabaseConfigured } from "./config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isSupabaseConfigured", () => {
  it("true quando URL e ANON KEY estão presentes", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("false quando falta a ANON KEY", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://x.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("false quando ambas faltam", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(isSupabaseConfigured()).toBe(false);
  });
});
