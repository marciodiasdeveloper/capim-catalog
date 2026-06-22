import { describe, expect, it } from "vitest";

import { classifyAging } from "./aging";

const NOW = new Date("2026-06-22T12:00:00Z").getTime();
const hoursAgo = (h: number) => new Date(NOW - h * 3_600_000).toISOString();

describe("classifyAging", () => {
  it("classifica como 'fresh' abaixo de 6h", () => {
    expect(classifyAging(hoursAgo(0), NOW)).toBe("fresh");
    expect(classifyAging(hoursAgo(5.9), NOW)).toBe("fresh");
  });

  it("classifica como 'warning' entre 6h e 24h", () => {
    expect(classifyAging(hoursAgo(6), NOW)).toBe("warning");
    expect(classifyAging(hoursAgo(23.9), NOW)).toBe("warning");
  });

  it("classifica como 'overdue' acima de 24h", () => {
    expect(classifyAging(hoursAgo(24), NOW)).toBe("overdue");
    expect(classifyAging(hoursAgo(100), NOW)).toBe("overdue");
  });
});
