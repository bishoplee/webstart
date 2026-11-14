"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PageSpecificationItem {
  pageName: string;
  purpose: string;
  contentAvailability: string;
  specialRequirements: string;
}

export function PageBuilderInput({
  value,
  onChange,
  disabled,
}: {
  value: unknown;
  onChange: (next: PageSpecificationItem[]) => void;
  disabled?: boolean;
}) {
  const items: PageSpecificationItem[] = React.useMemo(() => {
    if (!Array.isArray(value)) return [];
    return value.map((item) => ({
      pageName: String((item as Record<string, unknown>)?.pageName ?? ""),
      purpose: String((item as Record<string, unknown>)?.purpose ?? ""),
      contentAvailability: String(
        (item as Record<string, unknown>)?.contentAvailability ?? "Client will provide"
      ),
      specialRequirements: String(
        (item as Record<string, unknown>)?.specialRequirements ?? ""
      ),
    }));
  }, [value]);

  function handleAddPage() {
    onChange([
      ...items,
      {
        pageName: "",
        purpose: "",
        contentAvailability: "Client will provide",
        specialRequirements: "",
      },
    ]);
  }

  function handleUpdateItem(
    index: number,
    field: keyof PageSpecificationItem,
    fieldValue: string
  ) {
    const next = items.map((item, idx) =>
      idx === index ? { ...item, [field]: fieldValue } : item
    );
    onChange(next);
  }

  function handleRemoveItem(index: number) {
    onChange(items.filter((_, idx) => idx !== index));
  }

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          No individual page specifications or custom pages added yet. Click{" "}
          <strong>Add Page Specification</strong> below to define custom pages or
          per-page content rules.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border bg-muted/25 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Page #{idx + 1}
                </span>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(idx)}
                  >
                    <Trash2 className="size-3.5 text-red-500" /> Remove
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Page Name *</Label>
                  <Input
                    disabled={disabled}
                    value={item.pageName}
                    onChange={(e) =>
                      handleUpdateItem(idx, "pageName", e.target.value)
                    }
                    placeholder="e.g. Admissions Portal / Request a Quote"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Content Availability</Label>
                  <select
                    disabled={disabled}
                    value={item.contentAvailability}
                    onChange={(e) =>
                      handleUpdateItem(
                        idx,
                        "contentAvailability",
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                  >
                    <option value="Ready now">Content is ready now</option>
                    <option value="Client will provide">
                      Client will draft and provide
                    </option>
                    <option value="Need agency assistance">
                      Need agency copywriting assistance
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Page Purpose</Label>
                  <Input
                    disabled={disabled}
                    value={item.purpose}
                    onChange={(e) =>
                      handleUpdateItem(idx, "purpose", e.target.value)
                    }
                    placeholder="What should this page achieve?"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">
                    Special Requirements / Components
                  </Label>
                  <Input
                    disabled={disabled}
                    value={item.specialRequirements}
                    onChange={(e) =>
                      handleUpdateItem(
                        idx,
                        "specialRequirements",
                        e.target.value
                      )
                    }
                    placeholder="e.g. Pricing table, downloadable PDF, interactive map"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddPage}
        >
          <Plus className="size-4" /> Add Page Specification
        </Button>
      )}
    </div>
  );
}
