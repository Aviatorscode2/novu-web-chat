import { ReleaseHeader } from "@/components/dashboard/ReleaseHeader";
import { ErrorCard } from "@/components/dashboard/ErrorCard";
import { ChatLauncher } from "@/components/chat/ChatLauncher";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          LaunchBoard
        </span>
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          Demo product for a Novu Web Chat article — not a real release tool
        </span>
      </div>

      <ReleaseHeader />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Needs attention
        </h2>
        <ErrorCard />
      </section>

      <section className="mt-2 rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900/50">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Get this triaged
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          The release agent can open a Linear issue for the error above, using its own Linear
          tool. Nothing here is filed until the agent confirms it.
        </p>
        <div className="mt-4">
          <ChatLauncher />
        </div>
      </section>
    </main>
  );
}
