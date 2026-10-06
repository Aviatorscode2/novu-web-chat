// Server-only Novu configuration. Never import this file from a "use client"
// component — NOVU_SECRET_KEY must never reach the browser bundle.
import "server-only";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Copy .env.example to .env.local and fill it in.`
    );
  }
  return value;
}

export function getNovuSecretKey(): string | undefined {
  // Optional on purpose: HMAC is off by default in Novu and this lets the
  // app run as a local-only prototype before HMAC is enabled. See README.
  return process.env.NOVU_SECRET_KEY || undefined;
}

export function getPublicAgentIdentifier(): string {
  return requireEnv("NEXT_PUBLIC_NOVU_AGENT_IDENTIFIER");
}

export function getPublicApplicationIdentifier(): string {
  return requireEnv("NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER");
}
