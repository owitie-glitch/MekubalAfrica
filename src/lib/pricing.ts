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

/** Pre-fills the WhatsApp message so the enquiry names the piece. */
export function enquiryUrl(title: string, variant?: string | null) {
  const item = variant && variant !== "Standard" ? `${title} (${variant})` : title;
  const text = `Hi ${site.name}, I'd like to ask about the ${item} I saw on your website.`;
  return `${whatsappUrl}?text=${encodeURIComponent(text)}`;
}

export const PRICE_ON_REQUEST = "Price on request";
