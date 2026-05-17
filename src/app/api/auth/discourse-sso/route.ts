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

  if (!sso || !sig) {
    return NextResponse.json(
      { error: "Missing sso or sig parameters" },
      { status: 400 }
    );
  }

  if (!verifyDiscoursePayload(sso, sig)) {
    console.error("[discourse-sso] Invalid HMAC signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const { nonce } = decodePayload(sso);
  if (!nonce) {
    return NextResponse.json(
      { error: "Missing nonce in payload" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    // Preserve the full sso+sig so the flow resumes after login
    const loginUrl = new URL(`${SITE_URL}/auth/login`);
    const returnPath = `/api/auth/discourse-sso?sso=${encodeURIComponent(sso)}&sig=${encodeURIComponent(sig)}`;
    loginUrl.searchParams.set("redirect", returnPath);
    return NextResponse.redirect(loginUrl.toString());
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  // Derive a safe Discourse username from the email prefix if profile isn't set yet
  const username =
    profile?.username ??
    user.email!.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");

  const { sso: returnSso, sig: returnSig } = buildReturnPayload({
    nonce,
    externalId: user.id, // Supabase UUID is the stable external ID — never change this
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
