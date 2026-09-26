import { describe, expect, it } from "vitest";
import {
  createInitialRecord,
  getDueIds,
  gradeRecord,
  isDue,
  toDateKey
} from "@/lib/spaced-repetition";

const TODAY = "2026-01-10";

describe("spaced repetition", () => {
  it("treats a never-reviewed card as due", () => {
    expect(isDue(undefined, TODAY)).toBe(true);
    expect(getDueIds(["a", "b"], {}, TODAY)).toEqual(["a", "b"]);
  });

  it("schedules a first 'good' review one day out", () => {
    const record = gradeRecord(createInitialRecord(TODAY), "good", TODAY);
    expect(record.reps).toBe(1);
    expect(record.intervalDays).toBe(1);
    expect(record.due).toBe("2026-01-11");
    expect(isDue(record, TODAY)).toBe(false);
  });

  it("grows the interval across successive 'good' reviews", () => {
    let record = gradeRecord(undefined, "good", TODAY);
    record = gradeRecord(record, "good", record.due);
    expect(record.intervalDays).toBe(3);
    const third = gradeRecord(record, "good", record.due);
    expect(third.intervalDays).toBeGreaterThan(3);
  });

  it("resets the interval and lowers ease on 'again'", () => {
    let record = gradeRecord(undefined, "good", TODAY);
    record = gradeRecord(record, "good", record.due);
    const lapsed = gradeRecord(record, "again", record.due);
    expect(lapsed.reps).toBe(0);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.intervalDays).toBe(1);
    expect(lapsed.ease).toBeLessThan(record.ease);
    expect(lapsed.ease).toBeGreaterThanOrEqual(1.3);
  });

  it("pushes 'easy' further out than 'good'", () => {
    const good = gradeRecord(undefined, "good", TODAY);
    const easy = gradeRecord(undefined, "easy", TODAY);
    expect(easy.intervalDays).toBeGreaterThan(good.intervalDays);
  });

  it("derives a UTC date key", () => {
    expect(toDateKey(new Date(Date.UTC(2026, 0, 5)))).toBe("2026-01-05");
  });
});
