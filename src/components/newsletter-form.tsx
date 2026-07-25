"use client";

import { useState } from "react";
import { site } from "@/lib/site";

/**
 * There is no mailing-list backend, so subscribing opens the visitor's mail
 * client addressed to the studio with their address in the body — a real,
 * honest action rather than a form that silently drops the email.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const subject = encodeURIComponent("Add me to the Mekubal list");
        const body = encodeURIComponent(`Please add ${email} to your updates.`);
        window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
      }}
      className="mt-6 flex items-center gap-2 rounded-full bg-background/95 p-1.5 pl-5"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Type your email"
        aria-label="Email address"
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-grey-600"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive text-white transition-colors hover:bg-olive-700"
      >
        →
      </button>
    </form>
  );
}
