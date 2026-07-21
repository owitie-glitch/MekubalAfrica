"use client";

import { useState } from "react";
import { Field } from "@/components/ui";
import { ActionForm, type ActionResult } from "@/components/action-form";
import { slugify } from "@/lib/slug";

/** Section heading with a hairline rule, so groups read as groups without
 *  indenting their fields off the form's shared left edge. */
function Section({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="pt-2">
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[--color-muted]">
          {title}
        </h2>
        <span className="h-px flex-1 bg-[--color-border]" />
      </div>
      {hint && <p className="mt-1.5 text-xs text-[--color-muted]">{hint}</p>}
    </div>
  );
}

/**
 * The web address is derived from the shop name as you type, and stays derived
 * until you deliberately edit it. An applicant should not have to understand
 * URL slugs to open a shop.
 */
export function ShopForm({
  action,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  const effectiveSlug = slugEdited ? slugify(slug) : slugify(name);

  return (
    <ActionForm action={action} submitLabel="Submit application" className="space-y-5">
      <Section title="Your shop" />

      <Field
        label="Shop name"
        name="name"
        required
        placeholder="Jossie Bakes"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium" htmlFor="slug">
          Web address
        </label>
        <div className="flex items-center rounded-lg border border-[--color-border] pl-3 focus-within:border-black">
          <span className="shrink-0 text-sm text-[--color-muted]">/shops/</span>
          <input
            id="slug"
            name="slug"
            value={effectiveSlug}
            placeholder="jossie-bakes"
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(e.target.value);
            }}
            className="w-full bg-transparent px-1 py-2 text-sm outline-none"
          />
        </div>
        <p className="text-xs text-[--color-muted]">
          Filled in from your shop name — edit it if you&apos;d like something
          different.
        </p>
      </div>

      <Field
        label="Tagline"
        name="tagline"
        placeholder="One line about your shop"
      />

      <label className="block space-y-1">
        <span className="text-sm font-medium">Description</span>
        <textarea
          name="description"
          rows={4}
          placeholder="What you sell and what makes it worth buying."
          className="w-full rounded-lg border border-[--color-border] px-3 py-2 text-sm outline-none focus:border-black"
        />
      </label>

      <Section
        title="Shop location"
        hint="Where you trade from. Buyers see this so they know where orders ship from."
      />

      <Field
        label="Street address"
        name="addressLine"
        placeholder="123 Ngong Road"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="City" name="city" required placeholder="Nairobi" />
        <Field label="County / State" name="region" placeholder="Nairobi" />
        <Field label="Postal code" name="postalCode" placeholder="00100" />
        <Field label="Country" name="country" required placeholder="Kenya" />
      </div>
    </ActionForm>
  );
}
