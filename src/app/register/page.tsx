import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Field } from "@/components/ui";
import { ActionForm } from "@/components/action-form";
import { register } from "../(auth)/actions";

export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(next ?? "/");

  return (
    <div className="mx-auto max-w-md px-5 pt-16 pb-28 md:px-8">
      <div className="eyebrow text-grey-600">Account</div>
      <h1 className="display mt-3 text-[clamp(2.25rem,7vw,4rem)]">
        CREATE
        <br />
        ACCOUNT
      </h1>
      <p className="mt-5 text-sm leading-relaxed text-grey-600">
        One account for your cart, your addresses and every order you place with
        Mekubal.
      </p>

      <div className="mt-12 border-t border-grey-200 pt-10">
        <ActionForm
          action={register}
          submitLabel="Create account"
          className="space-y-7"
        >
          {/* Validated server-side in the action — never trusted as given. */}
          <input type="hidden" name="next" value={next ?? "/"} />
          <Field label="Name" name="name" autoComplete="name" />
          <Field
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <p className="text-xs text-grey-600">At least 8 characters.</p>
        </ActionForm>
      </div>

      <p className="mt-10 text-sm text-grey-600">
        Already registered?{" "}
        <Link
          href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="link-underline text-foreground"
        >
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
