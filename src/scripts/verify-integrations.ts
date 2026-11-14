import { sql } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { getIntegrationCapabilities } from "@/lib/env";

const EXPECTED_TABLES = [
  "users",
  "workspaces",
  "workspace_members",
  "clients",
  "projects",
  "questionnaire_templates",
  "questionnaire_sections",
  "questionnaire_questions",
  "project_questionnaire_sessions",
  "questionnaire_responses",
  "project_files",
  "project_notes",
  "project_activity_logs",
  "clarification_requests",
  "project_documents",
];

async function verifyAll() {
  console.log("==============================================================");
  console.log("WEBSTART — EXTERNAL SERVICE & SCHEMA SYNC VERIFICATION");
  console.log("==============================================================\n");

  const capabilities = getIntegrationCapabilities();

  // 1. Neon PostgreSQL Check
  if (!isDatabaseConfigured()) {
    console.log(
      "❌ [Neon PostgreSQL] NOT CONFIGURED: DATABASE_URL is missing or still set to the placeholder in .env.local."
    );
  } else {
    try {
      const db = getDb();
      const result = await db.execute(sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);

      const rows: Array<Record<string, unknown>> = Array.isArray(result)
        ? result
        : (result.rows ?? []);
      const existingTables = new Set(
        rows.map((r: Record<string, unknown>) => String(r.table_name))
      );

      const missingTables = EXPECTED_TABLES.filter(
        (t) => !existingTables.has(t)
      );

      if (missingTables.length === 0) {
        console.log(
          `✅ [Neon PostgreSQL] CONNECTED & SYNCED: All ${EXPECTED_TABLES.length}/15 required tables exist in Neon.`
        );
      } else {
        console.log(
          `⚠️ [Neon PostgreSQL] CONNECTED, BUT SCHEMA NOT PUSHED YET. Missing ${missingTables.length} tables: ${missingTables.join(", ")}`
        );
        console.log("   Run: bun run db:push && bun run db:seed");
      }
    } catch (err) {
      console.log(
        `❌ [Neon PostgreSQL] CONNECTION FAILED: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // 2. Clerk Authentication Check
  if (!capabilities.clerkConfigured) {
    console.log(
      "❌ [Clerk Auth] NOT CONFIGURED: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and/or CLERK_SECRET_KEY are missing in .env.local."
    );
  } else {
    console.log(
      "✅ [Clerk Auth] CONFIGURED: Publishable key and Secret key detected."
    );
  }

  // 3. Resend Email Check
  if (!capabilities.resendConfigured) {
    console.log(
      "⚠️ [Resend Email] OPTIONAL / NOT CONFIGURED: RESEND_API_KEY is not set in .env.local (fallback copyable links active)."
    );
  } else {
    console.log(
      "✅ [Resend Email] CONFIGURED: RESEND_API_KEY detected."
    );
  }

  // 4. Cloudinary Storage Check
  if (!capabilities.cloudinaryConfigured) {
    console.log(
      "⚠️ [Cloudinary Storage] OPTIONAL IN DEV / NOT CONFIGURED: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET missing in .env.local."
    );
  } else {
    console.log(
      "✅ [Cloudinary Storage] CONFIGURED: Cloud name, API key, and secret detected."
    );
  }

  console.log("\n==============================================================");
}

verifyAll().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(1);
});
