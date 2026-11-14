import { requireWorkspaceContext } from "@/lib/auth/context";
import { listTemplatesForWorkspace } from "@/lib/data/repository";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WebsiteCategoryBadge } from "@/components/projects/status-badge";

export default async function TemplatesPage() {
  await requireWorkspaceContext();
  const templates = listTemplatesForWorkspace();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Adaptive Questionnaire Templates
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure and inspect the 7 specialized website discovery templates and
          their conditional follow-up question groups.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {templates.map((tpl) => {
          const totalQuestions = tpl.sections.reduce(
            (sum, sec) => sum + sec.questions.length,
            0
          );
          const conditionalCount = tpl.sections.reduce(
            (sum, sec) =>
              sum + sec.questions.filter((q) => Boolean(q.conditionalRules)).length,
            0
          );

          return (
            <Card key={tpl.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{tpl.name}</CardTitle>
                  <div className="flex items-center gap-1.5">
                    <WebsiteCategoryBadge category={tpl.websiteCategory} />
                    <Badge variant="success">v{tpl.version} Active</Badge>
                  </div>
                </div>
                <CardDescription>{tpl.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex flex-wrap gap-2 text-muted-foreground">
                  <Badge variant="secondary">
                    {tpl.sections.length} Sections
                  </Badge>
                  <Badge variant="secondary">
                    {totalQuestions} Total Prompts
                  </Badge>
                  <Badge variant="info">
                    {conditionalCount} Conditional Follow-Up Questions
                  </Badge>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="mb-1.5 font-semibold text-foreground">
                    Included Discovery Sections:
                  </p>
                  <ol className="grid gap-1 text-muted-foreground sm:grid-cols-2">
                    {tpl.sections.map((s) => (
                      <li key={s.sectionKey} className="truncate">
                        {s.title}
                      </li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
