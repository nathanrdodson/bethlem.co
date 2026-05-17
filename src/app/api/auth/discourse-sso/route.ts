// DiscourseConnect (formerly Discourse SSO) identity-provider endpoint.
//
// Protocol summary:
//  1. User clicks "Log In" on Discourse.
//  2. Discourse redirects here with ?sso=<base64-payload>&sig=<hmac-sha256>.
//  3. We verify the HMAC to confirm the request is genuinely from Discourse.
//  4. We decode the payload to extract the one-time `nonce`.
//  5. We check whether the visitor has a Supabase session.
//      → No session: redirect to /auth/login, then back here after sign-in.
//  6. We build a signed return payload (nonce + user fields) and redirect to
//     Discourse's /session/sso_login, which creates/syncs the account.
//
// Docs: https://meta.discourse.org/t/discourseconnect-official-single-sign-on/13045

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  verifyDiscoursePayload,
  decodePayload,
  buildReturnPayload,
} from "@/lib/discourse/sso";

const DISCOURSE_BASE_URL = process.env.DISCOURSE_BASE_URL!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sso = searchParams.get("sso");
  const sig = searchParams.get("sig");

  // Step 2 — both params must be present
  if (!sso || !sig) {
    return NextResponse.json(
      { error: "Missing sso or sig parameters" },
      { status: 400 }
    );
  }

  // Step 3 — reject if the HMAC doesn't match (timing-safe comparison)
  if (!verifyDiscoursePayload(sso, sig)) {
    console.error("[discourse-sso] Invalid HMAC signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  // Step 4 — decode to get the nonce; Discourse uses it to prevent replay attacks
  const { nonce } = decodePayload(sso);
  if (!nonce) {
    return NextResponse.json(
      { error: "Missing nonce in payload" },
      { status: 400 }
    );
  }

  // Step 5 — check Supabase session
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    // Preserve the full sso+sig querystring so the flow can resume after login
    const loginUrl = new URL(`${SITE_URL}/auth/login`);
    const returnPath = `/api/auth/discourse-sso?sso=${encodeURIComponent(sso)}&sig=${encodeURIComponent(sig)}`;
    loginUrl.searchParams.set("redirect", returnPath);
    return NextResponse.redirect(loginUrl.toString());
  }

  // Fetch the user's profile for the fields Discourse displays (username, name, avatar)
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  // Derive a safe Discourse username from the email prefix if the profile row
  // hasn't been created yet (e.g. the auth trigger hasn't fired yet)
  const username =
    profile?.username ??
    user.email!.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");

  // Step 6 — build the signed return payload and redirect to Discourse
  const { sso: returnSso, sig: returnSig } = buildReturnPayload({
    nonce,
    // Supabase UUID is the stable external_id — Discourse uses this to link accounts.
    // Never change this to email or any mutable field; doing so creates duplicate accounts.
    externalId: user.id,
    email: user.email!,
    username,
    name: profile?.full_name ?? username,
    avatarUrl: profile?.avatar_url ?? undefined,
  });

  const discourseUrl = new URL(`${DISCOURSE_BASE_URL}/session/sso_login`);
  discourseUrl.searchParams.set("sso", returnSso);
  discourseUrl.searchParams.set("sig", returnSig);

  return NextResponse.redirect(discourseUrl.toString());
}
