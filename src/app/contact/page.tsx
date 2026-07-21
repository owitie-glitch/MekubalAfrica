import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import {
  site,
  addressLines,
  instagramUrl,
  whatsappUrl,
  telHref,
  mailHref,
  mapEmbedUrl,
  mapLinkUrl,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Visit & contact",
  description: `${site.name} — ${addressLines.join(", ")}. Open ${site.hours[0].days}, ${site.hours[0].time}.`,
};

/** Label/value row used throughout the details column. */
function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-grey-200 py-5 sm:grid-cols-[140px_1fr] sm:gap-6">
      <dt className="eyebrow text-grey-600">{label}</dt>
      <dd className="text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 pt-10 pb-24 md:px-8">
      <header className="border-b border-grey-200 pb-6">
        <div className="eyebrow text-grey-600">{site.tagline}</div>
        <h1 className="display mt-3 text-[clamp(2.5rem,9vw,7rem)]">
          VISIT US
        </h1>
      </header>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        {/* ------------------------------------------------------ details */}
        <Reveal>
          <dl>
            <Row label="Shop">
              <span className="block">{site.address.line1}</span>
              <span className="block">{site.address.line2}</span>
              <span className="block text-grey-600">
                {site.address.city}, {site.address.country}
              </span>
              <a
                href={mapLinkUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline eyebrow mt-3 inline-block"
              >
                Get directions →
              </a>
            </Row>

            <Row label="Opening hours">
              <ul className="space-y-1">
                {site.hours.map((h) => (
                  <li key={h.days} className="flex flex-wrap gap-x-3">
                    <span className="min-w-44">{h.days}</span>
                    <span className="text-grey-600">{h.time}</span>
                  </li>
                ))}
              </ul>
            </Row>

            <Row label="Phone">
              <a href={telHref} className="link-underline">
                {site.phone}
              </a>
            </Row>

            <Row label="WhatsApp">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline"
              >
                Message us on WhatsApp
              </a>
              <span className="mt-1 block text-xs text-grey-600">
                Usually the fastest way to reach us.
              </span>
            </Row>

            <Row label="Email">
              <a href={mailHref} className="link-underline break-all">
                {site.email}
              </a>
            </Row>

            <Row label="Instagram">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline"
              >
                @{site.instagram}
              </a>
              <span className="mt-1 block text-xs text-grey-600">
                {site.hashtag}
              </span>
            </Row>
          </dl>

          {/* Primary actions, repeated as buttons — most people arriving here
              want to call or message, not read. */}
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={telHref}
              className="flex-1 bg-foreground px-6 py-4 text-center text-[11px] font-semibold tracking-[0.14em] text-white uppercase transition-colors duration-300 hover:bg-foreground/85"
            >
              Call {site.phone}
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex-1 border border-foreground px-6 py-4 text-center text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors duration-300 hover:bg-foreground hover:text-white"
            >
              WhatsApp
            </a>
          </div>
        </Reveal>

        {/* ---------------------------------------------------------- map */}
        <Reveal delay={120}>
          <div className="border border-grey-200">
            <iframe
              src={mapEmbedUrl}
              title={`Map showing ${site.address.line1}, ${site.address.city}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-[420px] w-full lg:h-[560px]"
            />
          </div>
          <p className="mt-3 text-xs text-grey-600">
            The map shows {site.address.line1}. We are{" "}
            {site.address.line2.toLowerCase()} — ask for {site.name} at the
            market.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
