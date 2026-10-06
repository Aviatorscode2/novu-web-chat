"use client";

import { useEffect, useState } from "react";

type ChatSession = {
  subscriberId: string;
  subscriberHash?: string;
  agentHash?: string;
  hmacEnabled: boolean;
};

type ChatSessionState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | ({ status: "ready" } & ChatSession);

// Fetches the demo subscriber identity + HMAC hashes from the server. The
// Novu secret key never reaches this file — only the resulting hashes do.
export function useChatSession(): ChatSessionState {
  const [state, setState] = useState<ChatSessionState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/session")
      .then(async (response) => {
        const body = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          throw new Error(body.error || "Failed to start chat session");
        }
        setState({ status: "ready", ...body });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Failed to start chat session",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
