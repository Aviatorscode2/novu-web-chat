import { release } from "@/lib/demo-data";

export function ReleaseHeader() {
  return (
    <div className="flex flex-col gap-1 border-b border-neutral-200 pb-5 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Release
        </p>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {release.name}{" "}
          <span className="font-normal text-neutral-400">{release.version}</span>
        </h1>
      </div>
      <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          {release.status}
        </span>
        <span>Target {release.targetDate}</span>
      </div>
    </div>
  );
}
