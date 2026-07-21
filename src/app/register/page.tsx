import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Field, PageHeader } from "@/components/ui";
import { ActionForm } from "@/components/action-form";
import { register } from "../(auth)/actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(next ?? "/");

  return (
    <div className="mx-auto max-w-sm">
      <PageHeader title="Create an account" />
      <ActionForm action={register} submitLabel="Create account">
        <input type="hidden" name="next" value={next ?? "/"} />
        <Field label="Name" name="name" autoComplete="name" />
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <Field
          label="Password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </ActionForm>
      <p className="mt-4 text-sm text-[--color-muted]">
        Already registered?{" "}
        <Link
          href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="underline"
        >
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
