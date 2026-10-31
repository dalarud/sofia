import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

function createPool() {
  const url = process.env.DATABASE_URL ?? "postgres://postgres@localhost:5433/dalarud";
  const local = /localhost|127\.0\.0\.1/.test(url);
  return new Pool({ connectionString: url, max: local ? 10 : 3, ssl: local ? false : { rejectUnauthorized: false } });
}

// Återanvänd samma anslutning mellan anrop (viktigt i Vercels serverfunktioner och i utvecklingsläget).
const g = globalThis as unknown as { __dalarudPool?: Pool };
export const pool = g.__dalarudPool ?? (g.__dalarudPool = createPool());
export const db = drizzle(pool, { schema });
export type DB = typeof db;
export { schema };
