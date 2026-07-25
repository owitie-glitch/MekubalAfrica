import { whatsappUrl, site } from "./site";

/**
 * A price of zero means "not priced yet", not "free".
 *
 * Mekubal takes orders by DM, so an unpriced piece is still worth showing —
 * it just routes to a WhatsApp enquiry instead of the cart. Setting a real
 * price in /admin turns normal buying on with no further changes.
 */
export function isEnquiry(price: unknown) {
  return Number(price) <= 0;
}

/**
 * Pre-fills the WhatsApp enquiry. `photoLink` should be an absolute URL to the
 * product's photo so the seller can see exactly which piece is being asked
 * about (image paths are root-relative, so resolve them against the origin with
 * useOrigin() before calling this).
 */
export function enquiryUrl(photoLink: string) {
  const text = `Hello! Is product available right now? I'd love to get more details on it. Link: ${photoLink}`;
  return `${whatsappUrl}?text=${encodeURIComponent(text)}`;
}

function ksh(value: number) {
  return `KSh ${Math.round(value).toLocaleString("en-KE")}`;
}

export type OrderLine = {
  title: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
};

/**
 * Orders are placed over WhatsApp — no account, no card on file. This pre-fills
 * the chat with the basket so the customer only has to hit send, and the seller
 * confirms delivery and payment in the same thread.
 */
export function orderUrl(items: OrderLine[], subtotal: number) {
  const lines = items.map((i) => {
    const name =
      i.variantName && i.variantName !== "Standard"
        ? `${i.title} (${i.variantName})`
        : i.title;
    return `• ${name} × ${i.quantity} — ${ksh(i.unitPrice * i.quantity)}`;
  });
  const text = [
    `Hi ${site.name}, I'd like to place an order:`,
    "",
    ...lines,
    "",
    `Subtotal: ${ksh(subtotal)}`,
    "",
    "Please let me know delivery and payment details. Thank you!",
  ].join("\n");
  return `${whatsappUrl}?text=${encodeURIComponent(text)}`;
}

export const PRICE_ON_REQUEST = "Price on request";
