"use client";

import { useEffect, useRef, useState } from "react";
import { useWebChat } from "@novu/react";
import type {
  AgentMessage,
  AgentMessagePart,
  AgentPendingAction,
  AgentToolApprovalDecision,
} from "@novu/react";
import { suggestedPrompt } from "@/lib/demo-data";
import { Markdown } from "./Markdown";

// Novu appends a "_Powered by [Novu](...)_" attribution line to agent
// replies. Split it out so it renders as a small footer instead of being
// blended into the answer bubble.
const POWERED_BY_RE = /\n*_Powered by \[([^\]]+)\]\(([^)]+)\)_\s*$/;

function splitPoweredBy(text: string): {
  body: string;
  poweredBy?: { label: string; url: string };
} {
  const match = text.match(POWERED_BY_RE);
  if (!match) return { body: text };
  return {
    body: text.slice(0, match.index).trimEnd(),
    poweredBy: { label: match[1], url: match[2] },
  };
}

type ChatPanelProps = {
  agentId: string;
  agentHash?: string;
  subscriberId: string;
  onClose: () => void;
};

function conversationStorageKey(subscriberId: string, agentId: string) {
  return `novu-webchat:conversation:${subscriberId}:${agentId}`;
}

export function ChatPanel({ agentId, agentHash, subscriberId, onClose }: ChatPanelProps) {
  const storageKey = conversationStorageKey(subscriberId, agentId);
  const [initialConversationId] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return window.localStorage.getItem(storageKey) ?? undefined;
  });

  const {
    messages,
    pendingActions,
    sendMessage,
    retryMessage,
    respondToAction,
    startNewConversation,
    isLoading,
    isRunning,
    error,
    conversationId: liveConversationId,
  } = useWebChat({ agentId, agentHash, conversationId: initialConversationId });

  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const persistedConversationId = useRef<string | undefined>(initialConversationId);

  useEffect(() => {
    if (liveConversationId && liveConversationId !== persistedConversationId.current) {
      persistedConversationId.current = liveConversationId;
      window.localStorage.setItem(storageKey, liveConversationId);
    }
  }, [liveConversationId, storageKey]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pendingActions]);

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const { error: sendError } = await sendMessage(trimmed);
    if (!sendError) {
      setDraft("");
    }
  }

  function handleNewConversation() {
    startNewConversation();
    persistedConversationId.current = undefined;
    window.localStorage.removeItem(storageKey);
  }

  const isComposerDisabled = isLoading || isRunning;

  return (
    <div className="flex h-full flex-col bg-white dark:bg-neutral-900">
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Release agent
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {isRunning ? "Working…" : isLoading ? "Connecting…" : "Connected"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNewConversation}
            className="rounded-md px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            New chat
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <CloseIcon />
          </button>
        </div>
      </header>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.length === 0 && (
          <EmptyState onUsePrompt={() => setDraft(suggestedPrompt)} />
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRetry={() => retryMessage(message.id)}
          />
        ))}

        {pendingActions.map((action) => (
          <PendingActionCard
            key={action.type === "approval" ? action.approvalId : action.actionId}
            action={action}
            onRespond={respondToAction}
          />
        ))}

        {isRunning && <TypingIndicator />}
      </div>

      {error && (
        <div
          role="alert"
          className="mx-4 mb-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        >
          {error.message || "Something went wrong. Try again."}
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSend(draft);
        }}
        className="border-t border-neutral-200 p-3 dark:border-neutral-800"
      >
        <label htmlFor="chat-composer" className="sr-only">
          Message the release agent
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="chat-composer"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend(draft);
              }
            }}
            disabled={isComposerDisabled}
            placeholder="Ask the release agent…"
            rows={2}
            className="flex-1 resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          />
          <button
            type="submit"
            disabled={isComposerDisabled || !draft.trim()}
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

function EmptyState({ onUsePrompt }: { onUsePrompt: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
      <p>Ask the release agent to file a Linear issue for the checkout error below.</p>
      <button
        type="button"
        onClick={onUsePrompt}
        className="mt-3 rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        Use suggested prompt
      </button>
    </div>
  );
}

function MessageBubble({
  message,
  onRetry,
}: {
  message: AgentMessage;
  onRetry: () => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          isUser
            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
        }`}
      >
        {message.parts.map((part, index) => (
          <MessagePart key={index} part={part} />
        ))}

        {message.status === "failed" && (
          <div className="mt-2 flex items-center gap-2 text-xs text-red-500">
            <span>Failed to send.</span>
            <button type="button" onClick={onRetry} className="font-medium underline">
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MessagePart({ part }: { part: AgentMessagePart }) {
  switch (part.type) {
    case "text": {
      const { body, poweredBy } = splitPoweredBy(part.text);
      return (
        <div>
          <Markdown text={part.state === "streaming" ? `${body} ▍` : body} />
          {poweredBy && (
            <p className="mt-2 text-[10px] text-neutral-400 dark:text-neutral-500">
              Powered by{" "}
              <a
                href={poweredBy.url}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                {poweredBy.label}
              </a>
            </p>
          )}
        </div>
      );
    }
    case "tool":
      return <ToolPart part={part} />;
    case "approval":
      // Rendered separately via pendingActions once it resolves it becomes
      // read-only history here.
      return (
        <p className="text-xs italic text-neutral-500 dark:text-neutral-400">
          Tool approval: {part.toolName} — {part.state}
        </p>
      );
    case "mcp-connection":
      return (
        <p className="text-xs italic text-neutral-500 dark:text-neutral-400">
          {part.displayName} connection — {part.state}
        </p>
      );
    case "thinking":
      return null;
    case "source":
      return part.url ? (
        <a
          href={part.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-600 underline dark:text-blue-400"
        >
          {part.title || part.url}
        </a>
      ) : null;
    default:
      return null;
  }
}

function ToolPart({ part }: { part: Extract<AgentMessagePart, { type: "tool" }> }) {
  const [open, setOpen] = useState(false);
  const label =
    part.state === "output-error"
      ? "failed"
      : part.state === "output-available"
        ? "done"
        : "running…";

  return (
    <details
      open={open}
      onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
      className="mt-1 rounded border border-neutral-200 bg-white/60 text-xs dark:border-neutral-700 dark:bg-neutral-900/40"
    >
      <summary className="cursor-pointer select-none px-2 py-1 font-medium text-neutral-700 dark:text-neutral-300">
        Tool: {part.toolName} ({label})
      </summary>
      <div className="space-y-1 px-2 pb-2">
        {part.input && (
          <pre className="overflow-x-auto rounded bg-neutral-100 p-1.5 dark:bg-neutral-800">
            {JSON.stringify(part.input, null, 2)}
          </pre>
        )}
        {part.output?.map((block, i) => (
          <pre key={i} className="overflow-x-auto rounded bg-neutral-100 p-1.5 dark:bg-neutral-800">
            {block.type === "text" ? block.text : JSON.stringify(block, null, 2)}
          </pre>
        ))}
      </div>
    </details>
  );
}

function PendingActionCard({
  action,
  onRespond,
}: {
  action: AgentPendingAction;
  onRespond: (args: { approvalId: string; decision: AgentToolApprovalDecision }) => void;
}) {
  if (action.type === "approval") {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950">
        <p className="font-medium text-amber-900 dark:text-amber-200">
          Approval needed: {action.toolName}
        </p>
        {action.input && (
          <pre className="mt-1 overflow-x-auto rounded bg-white/60 p-1.5 text-xs dark:bg-black/20">
            {JSON.stringify(action.input, null, 2)}
          </pre>
        )}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => onRespond({ approvalId: action.approvalId, decision: "approved" })}
            className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => onRespond({ approvalId: action.approvalId, decision: "denied" })}
            className="rounded-md border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200"
          >
            Deny
          </button>
        </div>
      </div>
    );
  }

  // mcp-connection
  return (
    <div className="rounded-lg border border-blue-300 bg-blue-50 p-3 text-sm dark:border-blue-800 dark:bg-blue-950">
      <p className="font-medium text-blue-900 dark:text-blue-200">
        Connect {action.displayName} to continue
      </p>
      {action.message && (
        <p className="mt-1 text-xs text-blue-800 dark:text-blue-300">{action.message}</p>
      )}
      <a
        href={action.authorizeUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
      >
        Connect {action.displayName}
      </a>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-lg bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
