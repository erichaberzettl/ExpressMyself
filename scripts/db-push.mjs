import fs from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = await fs.readFile(path.join(process.cwd(), "db", "schema.sql"), "utf8");
const client = new Client({ connectionString });

try {
  await client.connect();
  await client.query(sql);
  console.log("[db:push] schema applied");
} finally {
  await client.end();
}
