import { describe, expect, it } from "vitest";
import {
  DAILY_ROTATION_SEED_KEY,
  LANGUAGE_KEY,
  SAVED_IDS_KEY,
  parseSavedIds,
  planReconcile,
  unionSavedIds
} from "@/lib/storage-bridge";

const empty = { savedIds: null, language: null, seed: null };

describe("storage-bridge planReconcile", () => {
  it("parses and unions saved ids defensively", () => {
    expect(parseSavedIds(null)).toEqual([]);
    expect(parseSavedIds("not json")).toEqual([]);
    expect(parseSavedIds('["a", 1, "b"]')).toEqual(["a", "b"]);
    expect(unionSavedIds(["a", "b"], ["b", "c"])).toEqual(["a", "b", "c"]);
  });

  it("unions saves from both stores on first contact so nothing is lost", () => {
    const plan = planReconcile(
      { savedIds: '["a"]', language: "en", seed: null },
      { savedIds: '["b"]', language: null, seed: null },
      false
    );

    expect(JSON.parse(plan.toPage[SAVED_IDS_KEY])).toEqual(["a", "b"]);
    expect(JSON.parse(plan.toExtension[SAVED_IDS_KEY])).toEqual(["a", "b"]);
    expect(plan.savedIdsChangedOnPage).toBe(true);
  });

  it("adopts the page language/seed when the extension has none yet", () => {
    const plan = planReconcile(
      empty,
      { savedIds: null, language: "sv", seed: "seed-123" },
      false
    );

    expect(plan.toExtension[LANGUAGE_KEY]).toBe("sv");
    expect(plan.toExtension[DAILY_ROTATION_SEED_KEY]).toBe("seed-123");
  });

  it("prefers the extension language when both are set", () => {
    const plan = planReconcile(
      { savedIds: null, language: "de", seed: null },
      { savedIds: null, language: "sv", seed: null },
      true
    );

    expect(plan.toPage[LANGUAGE_KEY]).toBe("de");
  });

  it("mirrors the extension store after initialization so deletions propagate", () => {
    // Extension dropped "a"; page still holds it from before. Once initialized,
    // the extension wins and the page should be cleared of "a".
    const plan = planReconcile(
      { savedIds: '["b"]', language: null, seed: null },
      { savedIds: '["a","b"]', language: null, seed: null },
      true
    );

    expect(JSON.parse(plan.toPage[SAVED_IDS_KEY])).toEqual(["b"]);
    expect(plan.savedIdsChangedOnPage).toBe(true);
  });

  it("writes nothing when both stores already agree", () => {
    const plan = planReconcile(
      { savedIds: '["a"]', language: "en", seed: "s" },
      { savedIds: '["a"]', language: "en", seed: "s" },
      true
    );

    expect(plan.toPage).toEqual({});
    expect(plan.toExtension).toEqual({});
    expect(plan.savedIdsChangedOnPage).toBe(false);
  });
});
