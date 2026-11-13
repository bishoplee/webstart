import { describe, expect, it } from "vitest";
import { cn, formatBytes, formatDate } from "@/lib/utils";
import { getEnv, getIntegrationCapabilities } from "@/lib/env";

describe("Phase 0 Foundation Utilities", () => {
  it("merges Tailwind classes accurately with cn()", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("formats byte sizes into human-readable units", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1048576)).toBe("1 MB");
  });

  it("formats dates safely and handles empty values", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("invalid-date")).toBe("—");
    expect(formatDate("2026-11-13T00:00:00.000Z")).toContain("2026");
  });

  it("evaluates environment defaults and capability flags without throwing", () => {
    const env = getEnv();
    expect(env.NEXT_PUBLIC_APP_URL).toBeDefined();

    const capabilities = getIntegrationCapabilities();
    expect(typeof capabilities.databaseConfigured).toBe("boolean");
    expect(typeof capabilities.clerkConfigured).toBe("boolean");
    expect(typeof capabilities.cloudinaryConfigured).toBe("boolean");
    expect(typeof capabilities.resendConfigured).toBe("boolean");
  });
});
