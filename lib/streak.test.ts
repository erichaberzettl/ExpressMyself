import { describe, expect, it } from "vitest";
import { localDateKey, registerActiveDay } from "@/lib/streak";

describe("streak", () => {
  it("starts a streak at 1 with no prior record", () => {
    expect(registerActiveDay(null, "2026-01-10")).toEqual({ count: 1, lastActiveDate: "2026-01-10" });
  });

  it("does not double-count the same day", () => {
    const record = { count: 3, lastActiveDate: "2026-01-10" };
    expect(registerActiveDay(record, "2026-01-10")).toBe(record);
  });

  it("increments on a consecutive day", () => {
    expect(registerActiveDay({ count: 3, lastActiveDate: "2026-01-10" }, "2026-01-11")).toEqual({
      count: 4,
      lastActiveDate: "2026-01-11"
    });
  });

  it("resets after a missed day", () => {
    expect(registerActiveDay({ count: 9, lastActiveDate: "2026-01-10" }, "2026-01-12")).toEqual({
      count: 1,
      lastActiveDate: "2026-01-12"
    });
  });

  it("handles month boundaries", () => {
    expect(registerActiveDay({ count: 2, lastActiveDate: "2026-01-31" }, "2026-02-01")).toEqual({
      count: 3,
      lastActiveDate: "2026-02-01"
    });
  });

  it("formats a local date key", () => {
    expect(localDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
