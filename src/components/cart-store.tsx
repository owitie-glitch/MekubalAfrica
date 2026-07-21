"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

export type CartLine = {
  id: string;
  variantId: string;
  quantity: number;
  title: string;
  slug: string;
  variantName: string;
  unitPrice: number;
  inventory: number;
  image: string | null;
};

export type CartState = { count: number; subtotal: number; items: CartLine[] };

type CartContext = CartState & {
  open: boolean;
  busy: boolean;
  notice: string | null;
  openCart: () => void;
  closeCart: () => void;
  add: (variantId: string, quantity?: number) => Promise<void>;
  setQuantity: (itemId: string, quantity: number) => Promise<void>;
};

const Ctx = createContext<CartContext | null>(null);

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/**
 * Holds cart state client-side so adding never costs a page load. The server
 * stays the source of truth: every mutation returns the recomputed cart, and
 * router.refresh() re-runs the server components that show stock levels.
 */
export function CartProvider({
  initial,
  children,
}: {
  initial: CartState;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<CartState>(initial);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  // The server render is authoritative on load and after any navigation.
  useEffect(() => setState(initial), [initial]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const sync = useCallback(
    async (res: Response) => {
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setNotice(data?.error ?? "Something went wrong.");
        return;
      }
      setState(data);
      if (data.clamped != null) {
        setNotice(`Only ${data.clamped} in stock — we've adjusted the quantity.`);
      }
      // Refresh server components so stock counts elsewhere stay honest.
      startTransition(() => router.refresh());
    },
    [router],
  );

  const add = useCallback(
    async (variantId: string, quantity = 1) => {
      setBusy(true);
      setOpen(true);
      try {
        await sync(
          await fetch("/api/cart", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ variantId, quantity }),
          }),
        );
      } finally {
        setBusy(false);
      }
    },
    [sync],
  );

  const setQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      setBusy(true);
      // Optimistic: the drawer responds immediately, the server confirms.
      setState((s) => ({
        ...s,
        items: s.items
          .map((i) => (i.id === itemId ? { ...i, quantity } : i))
          .filter((i) => i.quantity > 0),
      }));
      try {
        await sync(
          await fetch("/api/cart", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ itemId, quantity }),
          }),
        );
      } finally {
        setBusy(false);
      }
    },
    [sync],
  );

  const value = useMemo(
    () => ({
      ...state,
      open,
      busy,
      notice,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      add,
      setQuantity,
    }),
    [state, open, busy, notice, add, setQuantity],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
