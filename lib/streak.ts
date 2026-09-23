// Pure practice-streak bookkeeping. A day counts as "active" when the reader
// opens the daily popup. Kept separate from any browser API so it can be tested.

export type StreakRecord = {
  count: number;
  lastActiveDate: string;
};

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

/**
 * Fold today's visit into the streak. Same day is a no-op; a consecutive day
 * increments; any gap resets to 1.
 */
export function registerActiveDay(record: StreakRecord | null | undefined, today: string): StreakRecord {
  if (!record || !record.lastActiveDate) {
    return { count: 1, lastActiveDate: today };
  }

  if (record.lastActiveDate === today) {
    return record;
  }

  const gap = daysBetween(record.lastActiveDate, today);
  if (gap === 1) {
    return { count: record.count + 1, lastActiveDate: today };
  }

  return { count: 1, lastActiveDate: today };
}
