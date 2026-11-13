import * as React from "react";
import { cn } from "@/lib/utils";

export function Alert({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "warning" | "destructive" | "success";
}) {
  const variantClasses = {
    default: "border-border bg-card text-foreground",
    warning:
      "border-amber-300 bg-amber-50/90 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
    destructive:
      "border-red-300 bg-red-50/90 text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200",
    success:
      "border-emerald-300 bg-emerald-50/90 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
  }[variant];

  return (
    <div
      role="alert"
      className={cn("relative w-full rounded-lg border p-4 text-sm", variantClasses, className)}
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm opacity-90", className)} {...props} />;
}
