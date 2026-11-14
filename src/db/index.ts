import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { getEnv, getIntegrationCapabilities } from "@/lib/env";

let cachedDb: NeonHttpDatabase<typeof schema> | null = null;

export function isDatabaseConfigured(): boolean {
  return getIntegrationCapabilities().databaseConfigured;
}

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (cachedDb) {
    return cachedDb;
  }

  const env = getEnv();
  const connectionString =
    env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/webstart";

  const sql = neon(connectionString);
  cachedDb = drizzle(sql, { schema });
  return cachedDb;
}

export { schema };
