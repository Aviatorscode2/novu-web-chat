"use client";

import { useState } from "react";
import { NovuProvider } from "@novu/react";
import { useChatSession } from "@/lib/use-chat-session";
import { getNovuRegionUrls } from "@/lib/novu-region-client";
import { ChatPanel } from "./ChatPanel";

const applicationIdentifier = process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER;
const agentId = process.env.NEXT_PUBLIC_NOVU_AGENT_IDENTIFIER;

export function ChatLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const session = useChatSession();

  if (!applicationIdentifier || !agentId) {
    return (
      <ConfigWarning message="Set NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER and NEXT_PUBLIC_NOVU_AGENT_IDENTIFIER in .env.local (see .env.example)." />
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        <ChatIcon />
        Ask the release agent
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="relative h-full w-full max-w-md shadow-xl">
            {session.status === "error" && (
              <ConfigWarning message={session.message} onClose={() => setIsOpen(false)} />
            )}
            {session.status === "loading" && (
              <div className="flex h-full items-center justify-center bg-white text-sm text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                Connecting to the release agent…
              </div>
            )}
            {session.status === "ready" && (
              <NovuProvider
                applicationIdentifier={applicationIdentifier}
                subscriber={session.subscriberId}
                subscriberHash={session.subscriberHash}
                {...getNovuRegionUrls()}
              >
                {!session.hmacEnabled && <HmacBadge />}
                <ChatPanel
                  agentId={agentId}
                  agentHash={session.agentHash}
                  subscriberId={session.subscriberId}
                  onClose={() => setIsOpen(false)}
                />
              </NovuProvider>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function HmacBadge() {
  return (
    <div className="absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-medium text-amber-800 shadow dark:bg-amber-900 dark:text-amber-200">
      HMAC disabled — local prototype only
    </div>
  );
}

function ConfigWarning({ message, onClose }: { message: string; onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col justify-center gap-3 bg-white p-6 text-sm text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
      <p className="font-semibold text-red-600 dark:text-red-400">Chat not configured</p>
      <p>{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="self-start rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium dark:border-neutral-700"
        >
          Close
        </button>
      )}
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 3.5C2 2.67 2.67 2 3.5 2h9c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5H6l-2.5 2.5V11H3.5C2.67 11 2 10.33 2 9.5v-6Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
