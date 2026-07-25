import { redirect } from "next/navigation";

// Orders are placed over WhatsApp now — no account, no on-site checkout. This
// route only exists to catch old links and bookmarks and send them to the cart,
// where the "Order on WhatsApp" button lives.
export default function CheckoutPage() {
  redirect("/cart");
}
