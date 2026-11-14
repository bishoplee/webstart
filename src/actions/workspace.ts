"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireWorkspaceContext } from "@/lib/auth/context";
import { addOrUpdateWorkspaceMember } from "@/lib/data/repository";
import { workspaceRoleEnum } from "@/db/schema";
import type { ActionResult } from "./clients";

const inviteMemberSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  email: z.string().trim().email("Valid email address is required."),
  role: z.enum(workspaceRoleEnum.enumValues),
});

export async function inviteWorkspaceMemberAction(rawInput: {
  fullName: string;
  email: string;
  role: (typeof workspaceRoleEnum.enumValues)[number];
}): Promise<ActionResult<{ membershipId: string }>> {
  try {
    const ctx = await requireWorkspaceContext("users:manage");
    const parsed = inviteMemberSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Please enter a valid name, email, and role.",
      };
    }

    const membership = addOrUpdateWorkspaceMember({
      workspaceId: ctx.workspaceId,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      role: parsed.data.role,
    });

    revalidatePath("/dashboard/users");
    return {
      success: true,
      data: { membershipId: membership.id },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unable to update workspace member.",
    };
  }
}
