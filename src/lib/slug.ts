/**
 * Turns free text into a URL-safe slug. Applied server-side to whatever the
 * user typed rather than rejecting it — "Jossie Bakes" becoming "jossie-bakes"
 * is obviously what they meant, so making them retype it is pure friction.
 */
export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents: "Café" -> "cafe"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Finds a free slug by appending -2, -3, … Used so a name collision suggests a
 * working alternative instead of dead-ending the applicant.
 */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
) {
  const root = slugify(base) || "shop";
  if (!(await exists(root))) return root;
  for (let n = 2; n < 100; n++) {
    const candidate = `${root}-${n}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}
