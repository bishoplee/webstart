"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspaceContext } from "@/lib/auth/context";
import {
  clientFormSchema,
  type ClientFormInput,
} from "@/lib/validations/client";
import {
  createClientRecord,
  updateClientRecord,
} from "@/lib/data/repository";
import type { ClientRecord } from "@/db/schema";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createClientAction(
  rawInput: ClientFormInput
): Promise<ActionResult<ClientRecord>> {
  try {
    const ctx = await requireWorkspaceContext("clients:create");
    const parsed = clientFormSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        success: false,
        error: "Please check the highlighted client fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const client = createClientRecord(ctx.workspaceId, parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard/projects");

    return {
      success: true,
      data: client,
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unable to create client record.",
    };
  }
}

export async function updateClientAction(
  clientId: string,
  rawInput: ClientFormInput
): Promise<ActionResult<ClientRecord>> {
  try {
    const ctx = await requireWorkspaceContext("clients:edit");
    const parsed = clientFormSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        success: false,
        error: "Please check the highlighted client fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const updated = updateClientRecord(ctx.workspaceId, clientId, parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${clientId}`);

    return {
      success: true,
      data: updated,
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unable to update client record.",
    };
  }
}

export async function toggleArchiveClientAction(
  clientId: string,
  isArchived: boolean
): Promise<ActionResult<ClientRecord>> {
  try {
    const ctx = await requireWorkspaceContext("clients:archive");
    const updated = updateClientRecord(ctx.workspaceId, clientId, {
      isArchived,
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${clientId}`);

    return {
      success: true,
      data: updated,
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unable to change client archive status.",
    };
  }
}
