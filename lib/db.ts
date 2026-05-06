import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  dbPool?: Pool;
};

export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export const db =
  globalForDb.dbPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbPool = db;
}

export async function canUseDatabase() {
  if (!hasDatabaseUrl) {
    return false;
  }

  try {
    await db.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
