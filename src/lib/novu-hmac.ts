import "server-only";
import { createHmac } from "node:crypto";

// HMAC-SHA256(secret, value) as lowercase hex, computed server-side only.
// Used for both subscriberHash and agentHash — see
// https://docs.novu.co/agents/channels/web-chat/security
export function hmacSha256Hex(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}
