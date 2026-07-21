/**
 * Business details, in one place.
 *
 * Taken from the Mekubal_ÅFRICA Instagram profile. The phone number is the one
 * the owner asked us to use — it replaces the two listed in the bio, so update
 * the bio to match rather than the other way round.
 */
export const site = {
  name: "Mekubal Africa",
  tagline: "Home of luxury",
  hashtag: "#wearanafricanstyle",

  address: {
    line1: "Westlands Market",
    line2: "Shop No. C73",
    city: "Nairobi",
    country: "Kenya",
  },

  // Local format for display, E.164 for tel: and WhatsApp links.
  phone: "0732 441 905",
  phoneE164: "+254732441905",

  email: "mekubal.africa07@gmail.com",

  hours: [
    { days: "Monday – Saturday", time: "9:00am – 6:00pm" },
    { days: "Sunday", time: "Closed" },
  ],

  instagram: "mekubal_africa",
} as const;

export const instagramUrl = `https://www.instagram.com/${site.instagram}`;
export const whatsappUrl = `https://wa.me/${site.phoneE164.replace("+", "")}`;
export const telHref = `tel:${site.phoneE164}`;
export const mailHref = `mailto:${site.email}`;

export const addressLines = [
  site.address.line1,
  site.address.line2,
  site.address.city,
  site.address.country,
];

/** Keyless Google Maps embed — no API key, no billing account required. */
export const mapQuery = encodeURIComponent(
  `${site.address.line1}, ${site.address.city}, ${site.address.country}`,
);
export const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed`;
export const mapLinkUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
