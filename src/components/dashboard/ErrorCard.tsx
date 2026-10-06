import { checkoutError } from "@/lib/demo-data";

export function ErrorCard() {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
            Open issue
          </span>
          <h3 className="mt-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {checkoutError.error}
          </h3>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="text-neutral-500 dark:text-neutral-400">Area</dt>
          <dd className="font-medium text-neutral-900 dark:text-neutral-100">
            {checkoutError.area}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500 dark:text-neutral-400">Environment</dt>
          <dd className="font-medium text-neutral-900 dark:text-neutral-100">
            {checkoutError.environment}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500 dark:text-neutral-400">Team</dt>
          <dd className="font-medium text-neutral-900 dark:text-neutral-100">
            {checkoutError.team}
          </dd>
        </div>
      </dl>
    </div>
  );
}
