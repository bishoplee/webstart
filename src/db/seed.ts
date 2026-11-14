import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured, schema } from "@/db";
import { loadStore, saveStore } from "@/lib/data/repository";
import { DEFAULT_QUESTIONNAIRE_TEMPLATES } from "@/lib/questionnaire/default-templates";

async function seedNeonDatabase() {
  const db = getDb();
  console.log("Connecting to Neon PostgreSQL to seed default workspace & 7 templates...");

  // 1. Ensure default workspace exists
  let [workspace] = await db
    .select()
    .from(schema.workspaces)
    .where(eq(schema.workspaces.slug, "webstart-agency"))
    .limit(1);

  if (!workspace) {
    const [inserted] = await db
      .insert(schema.workspaces)
      .values({
        name: "WebStart Digital Agency",
        slug: "webstart-agency",
      })
      .returning();
    workspace = inserted;
    console.log(`Created Neon workspace: ${workspace.name} (${workspace.id})`);
  } else {
    console.log(`Found existing Neon workspace: ${workspace.name} (${workspace.id})`);
  }

  // 2. Seed all 7 adaptive templates and their sections & questions
  const existingTemplates = await db
    .select()
    .from(schema.questionnaireTemplates)
    .where(eq(schema.questionnaireTemplates.workspaceId, workspace.id));

  const existingCategories = new Set(
    existingTemplates.map((t) => t.websiteCategory)
  );

  let seededCount = 0;
  for (const tpl of DEFAULT_QUESTIONNAIRE_TEMPLATES) {
    if (existingCategories.has(tpl.websiteCategory)) {
      continue;
    }

    const [createdTemplate] = await db
      .insert(schema.questionnaireTemplates)
      .values({
        workspaceId: workspace.id,
        name: tpl.name,
        websiteCategory: tpl.websiteCategory,
        description: tpl.description,
        isActive: tpl.isActive,
        version: tpl.version,
      })
      .returning();

    for (const sec of tpl.sections) {
      const [createdSection] = await db
        .insert(schema.questionnaireSections)
        .values({
          templateId: createdTemplate.id,
          sectionKey: sec.sectionKey,
          title: sec.title,
          description: sec.description,
          sortOrder: sec.sortOrder,
          isRequired: sec.isRequired,
        })
        .returning();

      if (sec.questions.length > 0) {
        await db.insert(schema.questionnaireQuestions).values(
          sec.questions.map((q) => ({
            sectionId: createdSection.id,
            questionKey: q.questionKey,
            label: q.label,
            description: q.description ?? null,
            inputType: q.inputType,
            options: q.options ?? [],
            validationRules: q.validationRules ?? {},
            conditionalRules: q.conditionalRules ?? null,
            sortOrder: q.sortOrder,
            isRequired: q.isRequired,
          }))
        );
      }
    }
    seededCount += 1;
  }

  console.log(
    `Neon PostgreSQL seed complete: ${seededCount} new template(s) inserted (${existingTemplates.length + seededCount} total active templates).`
  );
}

async function main() {
  console.log("Seeding local development store...");
  const state = loadStore();
  state.templates = structuredClone(DEFAULT_QUESTIONNAIRE_TEMPLATES);
  saveStore(state);

  if (isDatabaseConfigured()) {
    await seedNeonDatabase();
  } else {
    console.log(
      "Note: DATABASE_URL is not configured yet in .env.local — seeded local store only. Once DATABASE_URL is added to .env.local, run `bun run db:push && bun run db:seed` to push and seed Neon PostgreSQL."
    );
  }
}

main().catch((err) => {
  console.error("Failed to seed database:", err);
  process.exit(1);
});
