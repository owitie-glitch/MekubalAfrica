"use client";

import { useActionState } from "react";
import { Button } from "./ui";

export type ActionResult = { error: string } | undefined;

/**
 * Wraps a server action that returns `{ error }` on failure and redirects on
 * success, so every form in the app reports errors the same way without each
 * page needing its own client component.
 */
export function ActionForm({
  action,
  submitLabel,
  children,
  className = "space-y-4",
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => action(formData),
    undefined,
  );

  return (
    <form action={formAction} className={className}>
      {children}
      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Working…" : submitLabel}
      </Button>
    </form>
  );
}
