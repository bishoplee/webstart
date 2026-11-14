"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MessageSquareReply, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { ClarificationRequestRecord } from "@/db/schema";
import { respondToClarificationAction } from "@/actions/questionnaire";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ClarificationResponder({
  rawToken,
  clarifications,
}: {
  rawToken: string;
  clarifications: ClarificationRequestRecord[];
}) {
  const router = useRouter();
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = React.useState<string | null>(null);

  if (clarifications.length === 0) {
    return null;
  }

  async function handleSendReply(clarificationId: string) {
    const text = drafts[clarificationId]?.trim() ?? "";
    if (!text) {
      toast.error("Please enter your response first.");
      return;
    }

    setSubmittingId(clarificationId);
    try {
      const res = await respondToClarificationAction({
        rawToken,
        clarificationId,
        responseText: text,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Clarification response submitted to the agency.");
      router.refresh();
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <Card className="border-amber-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquareReply className="size-4 text-amber-600" /> Agency
          Clarification Requests ({clarifications.length})
        </CardTitle>
        <CardDescription>
          Please review and respond to the questions below from your project
          manager.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {clarifications.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-border bg-muted/25 p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Section: {item.sectionKey}</Badge>
                {item.questionKey && (
                  <Badge variant="secondary">Field: {item.questionKey}</Badge>
                )}
              </div>
              <Badge
                variant={item.status === "OPEN" ? "warning" : "success"}
              >
                {item.status}
              </Badge>
            </div>

            <p className="text-sm font-medium">{item.message}</p>
            <p className="text-xs text-muted-foreground">
              Requested on {formatDate(item.createdAt)}
            </p>

            {item.clientResponse ? (
              <div className="rounded border border-emerald-300/60 bg-emerald-50/40 p-3 text-xs dark:bg-emerald-950/30">
                <p className="font-semibold flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="size-3.5" /> Your Response:
                </p>
                <p className="mt-1">{item.clientResponse}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  value={drafts[item.id] ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [item.id]: e.target.value,
                    }))
                  }
                  placeholder="Write your clarification answer here..."
                  className="min-h-[76px]"
                />
                <Button
                  size="sm"
                  disabled={submittingId === item.id}
                  onClick={() => void handleSendReply(item.id)}
                >
                  {submittingId === item.id
                    ? "Sending Reply..."
                    : "Submit Clarification Response"}
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
