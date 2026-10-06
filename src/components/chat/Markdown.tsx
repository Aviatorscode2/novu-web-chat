"use client";

import ReactMarkdown, { type Components } from "react-markdown";

// Agent replies (including Novu's own "Powered by" attribution line) arrive
// as markdown text, not HTML — render it instead of showing raw syntax.
const components: Components = {
  p: ({ children }) => <p className="whitespace-pre-wrap [&:not(:first-child)]:mt-2">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-1 underline-offset-2 hover:text-blue-600 dark:hover:text-blue-400"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc space-y-0.5 pl-4">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-0.5 pl-4">{children}</ol>,
  code: ({ children }) => (
    <code className="rounded bg-black/10 px-1 py-0.5 text-[0.85em] dark:bg-white/10">
      {children}
    </code>
  ),
};

export function Markdown({ text }: { text: string }) {
  return <ReactMarkdown components={components}>{text}</ReactMarkdown>;
}
