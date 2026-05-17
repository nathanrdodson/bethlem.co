import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.DISCOURSE_SSO_SECRET!;

/**
 * Verify the HMAC Discourse sends with the SSO request.
 * Uses timingSafeEqual to prevent timing oracle attacks.
 */
export function verifyDiscoursePayload(sso: string, sig: string): boolean {
  const expected = createHmac("sha256", SECRET).update(sso).digest("hex");
  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(sig, "hex")
    );
  } catch {
    // Buffers of different lengths — definitely invalid
    return false;
  }
}

/** Decode the base64 SSO payload into a key-value map. */
export function decodePayload(sso: string): Record<string, string> {
  const decoded = Buffer.from(sso, "base64").toString("utf-8");
  return Object.fromEntries(new URLSearchParams(decoded));
}

interface ReturnPayloadParams {
  nonce: string;
  externalId: string;
  email: string;
  username: string;
  name: string;
  avatarUrl?: string;
  admin?: boolean;
}

/** Build and HMAC-sign the payload Discourse expects on the return redirect. */
export function buildReturnPayload(params: ReturnPayloadParams): {
  sso: string;
  sig: string;
} {
  const qs = new URLSearchParams({
    nonce: params.nonce,
    external_id: params.externalId,
    email: params.email,
    username: params.username,
    name: params.name,
    // Don't send Discourse's own welcome email — Supabase Auth handles onboarding
    suppress_welcome_message: "true",
    ...(params.avatarUrl ? { avatar_url: params.avatarUrl } : {}),
    ...(params.admin ? { admin: "true" } : {}),
  });

  const sso = Buffer.from(qs.toString()).toString("base64");
  const sig = createHmac("sha256", SECRET).update(sso).digest("hex");
  return { sso, sig };
}
