// Lightweight SM-2-style spaced repetition for practicing saved phrases.
// Pure and date-string based (yyyy-mm-dd, UTC) so it is easy to unit test and
// safe to persist to storage. The UI grades a card as "again", "good", or
// "easy"; this schedules the next due date.

export type ReviewGrade = "again" | "good" | "easy";

export type ReviewRecord = {
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
  due: string;
  lastReviewed: string;
};

export type ReviewState = Record<string, ReviewRecord>;

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

export function toDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + Math.max(0, Math.round(days)));
  return toDateKey(date);
}

export function createInitialRecord(today: string): ReviewRecord {
  return {
    ease: DEFAULT_EASE,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
    due: today,
    lastReviewed: today
  };
}

export function gradeRecord(
  record: ReviewRecord | undefined,
  grade: ReviewGrade,
  today: string
): ReviewRecord {
  const base = record ?? createInitialRecord(today);
  let { ease, intervalDays, reps, lapses } = base;

  if (grade === "again") {
    reps = 0;
    lapses += 1;
    ease = Math.max(MIN_EASE, ease - 0.2);
    intervalDays = 1;
  } else {
    reps += 1;
    if (grade === "easy") {
      ease += 0.15;
    }

    if (reps === 1) {
      intervalDays = grade === "easy" ? 3 : 1;
    } else if (reps === 2) {
      intervalDays = grade === "easy" ? 6 : 3;
    } else {
      intervalDays = Math.round(intervalDays * ease * (grade === "easy" ? 1.3 : 1));
    }

    intervalDays = Math.max(1, intervalDays);
  }

  return {
    ease,
    intervalDays,
    reps,
    lapses,
    due: addDays(today, intervalDays),
    lastReviewed: today
  };
}

export function isDue(record: ReviewRecord | undefined, today: string): boolean {
  return !record || record.due <= today;
}

export function getDueIds(ids: string[], state: ReviewState, today: string): string[] {
  return ids.filter((id) => isDue(state[id], today));
}
