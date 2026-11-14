import { createHash, randomBytes, timingSafeEqual } from "crypto";
import type { ProjectStatus } from "@/db/schema";

const DEFAULT_EXPIRY_DAYS = 30;

export interface GeneratedInvitationToken {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
}

/**
 * Generates a cryptographically strong 256-bit URL-safe invitation token
 * and its SHA-256 hex digest for storage at rest.
 */
export function generateInvitationToken(
  expiryDays: number = DEFAULT_EXPIRY_DAYS
): GeneratedInvitationToken {
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashInvitationToken(rawToken);
  const expiresAt = new Date(
    Date.now() + Math.max(1, expiryDays) * 24 * 60 * 60 * 1000
  );

  return {
    rawToken,
    tokenHash,
    expiresAt,
  };
}

/**
 * Hashes a raw invitation token using SHA-256.
 * Never store raw invitation tokens in the database.
 */
export function hashInvitationToken(rawToken: string): string {
  return createHash("sha256").update(rawToken.trim()).digest("hex");
}

/**
 * Constant-time verification of a raw token against a stored SHA-256 hex digest.
 */
export function verifyInvitationTokenHash(
  rawToken: string,
  expectedHash: string
): boolean {
  if (!rawToken || !expectedHash || expectedHash.length !== 64) {
    return false;
  }
  const actualHash = hashInvitationToken(rawToken);
  const actualBuffer = Buffer.from(actualHash, "hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");
  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(actualBuffer, expectedBuffer);
}

export interface SessionTokenStateInput {
  expiresAt: Date | string;
  revokedAt?: Date | string | null;
  submittedAt?: Date | string | null;
  projectStatus: ProjectStatus;
  now?: Date;
}

export interface SessionTokenStateResult {
  canRead: boolean;
  canEdit: boolean;
  canRespondToClarification: boolean;
  reason?:
    | "REVOKED"
    | "EXPIRED"
    | "ARCHIVED"
    | "SUBMITTED_LOCKED"
    | "ACTIVE";
}

/**
 * Evaluates whether a client portal session token permits reading,
 * editing questionnaire responses, or responding to clarification requests.
 */
export function evaluateSessionTokenState(
  input: SessionTokenStateInput
): SessionTokenStateResult {
  const now = input.now ?? new Date();
  const expiresAt =
    typeof input.expiresAt === "string"
      ? new Date(input.expiresAt)
      : input.expiresAt;

  if (input.revokedAt) {
    return {
      canRead: false,
      canEdit: false,
      canRespondToClarification: false,
      reason: "REVOKED",
    };
  }

  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= now.getTime()) {
    return {
      canRead: false,
      canEdit: false,
      canRespondToClarification: false,
      reason: "EXPIRED",
    };
  }

  if (input.projectStatus === "ARCHIVED") {
    return {
      canRead: false,
      canEdit: false,
      canRespondToClarification: false,
      reason: "ARCHIVED",
    };
  }

  // When administrator requests clarification, client can view and respond
  if (input.projectStatus === "AWAITING_CLIENT_RESPONSE") {
    return {
      canRead: true,
      canEdit: true,
      canRespondToClarification: true,
      reason: "ACTIVE",
    };
  }

  // Once submitted, Under Review, or Approved, ordinary editing is locked
  if (
    input.submittedAt ||
    input.projectStatus === "SUBMITTED" ||
    input.projectStatus === "UNDER_REVIEW" ||
    input.projectStatus === "APPROVED"
  ) {
    return {
      canRead: true,
      canEdit: false,
      canRespondToClarification: false,
      reason: "SUBMITTED_LOCKED",
    };
  }

  return {
    canRead: true,
    canEdit: true,
    canRespondToClarification: false,
    reason: "ACTIVE",
  };
}
