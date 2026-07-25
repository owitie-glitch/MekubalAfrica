"use client";

import { useEffect, useState } from "react";

/**
 * The page's absolute origin (e.g. https://mekubal.africa), resolved after
 * mount. Starts empty so server and client render the same markup — the effect
 * fills it in on the client, which is the only place a WhatsApp link is ever
 * followed. Use it to turn a root-relative asset path into an absolute URL.
 */
export function useOrigin() {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  return origin;
}

/** Resolve a possibly-relative URL to absolute against the given origin. */
export function absoluteUrl(origin: string, path: string | undefined) {
  if (!path) return origin;
  return path.startsWith("http") ? path : `${origin}${path}`;
}
