import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Field, PageHeader } from "@/components/ui";
import { ActionForm } from "@/components/action-form";
import { login } from "../(auth)/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(next ?? "/");

  return (
    <div className="mx-auto max-w-sm">
      <PageHeader title="Sign in" />
      <ActionForm action={login} submitLabel="Sign in">
        <input type="hidden" name="next" value={next ?? "/"} />
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <Field
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </ActionForm>
      <p className="mt-4 text-sm text-[--color-muted]">
        No account?{" "}
        <Link
          href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="underline"
        >
          Create one
        </Link>
        .
      </p>
    </div>
  );
}
