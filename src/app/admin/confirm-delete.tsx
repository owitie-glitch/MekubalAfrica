"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/components/action-form";

/**
 * Deletion is irreversible and usually sits a click away from a save button, so
 * it asks first. Client-side because the action itself redirects on success.
 */
export function ConfirmDelete({
  action,
  id,
  label,
  confirmText,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  id: string;
  label: string;
  confirmText: string;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => action(formData),
    undefined,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm(confirmText)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      {state?.error && (
        <p className="mb-3 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="border border-black px-6 py-3.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors duration-300 hover:bg-black hover:text-white disabled:opacity-40"
      >
        {pending ? "Deleting…" : label}
      </button>
    </form>
  );
}
