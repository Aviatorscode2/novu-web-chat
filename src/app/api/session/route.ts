import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  getNovuSecretKey,
  getPublicAgentIdentifier,
} from "@/lib/novu-env";
import { hmacSha256Hex } from "@/lib/novu-hmac";

const SUBSCRIBER_COOKIE = "lb_subscriber_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

// Demo-grade "session": one random subscriber id per browser, stored in an
// httpOnly cookie so it survives refreshes but is never exposed to a
// publicly shared, fixed subscriber identity. A real product would map this
// to its own signed-in user id instead. See README "Limitations".
export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const existing = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SUBSCRIBER_COOKIE}=`))
    ?.split("=")[1];

  const subscriberId = existing || `demo-${randomUUID()}`;

  let agentId: string;
  try {
    agentId = getPublicAgentIdentifier();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Missing agent identifier" },
      { status: 500 }
    );
  }

  const secret = getNovuSecretKey();
  const subscriberHash = secret ? hmacSha256Hex(secret, subscriberId) : undefined;
  const agentHash = secret ? hmacSha256Hex(secret, agentId) : undefined;

  const response = NextResponse.json({
    subscriberId,
    subscriberHash,
    agentHash,
    hmacEnabled: Boolean(secret),
  });

  if (!existing) {
    response.cookies.set(SUBSCRIBER_COOKIE, subscriberId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_YEAR_SECONDS,
    });
  }

  return response;
}
