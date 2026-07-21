import Link from "next/link";
import { Reveal, Marquee } from "@/components/motion";

export const metadata = {
  title: "About — MEKUBAL",
  description:
    "Mekubal Africa works directly with artisans across Kenya.",
};

const CRAFTS = [
  ["Nairobi", "Brass casting"],
  ["Kisii", "Soapstone carving"],
  ["Kajiado", "Beadwork"],
  ["Kisumu", "Weaving"],
];

export default function AboutPage() {
  return (
    <div>
      <section className="mx-auto max-w-[1600px] px-5 py-14 md:px-8 md:py-20">
        <Reveal>
          <div className="eyebrow text-grey-600">Mekubal Africa</div>
          <h1 className="display mt-6 text-[clamp(2.5rem,8.5vw,8rem)]">
            WE BUY
            <br />
            STRAIGHT FROM
            <br />
            THE MAKER
          </h1>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-16 grid gap-10 border-t border-grey-200 pt-14 lg:grid-cols-[1fr_1fr]">
            <h2 className="display text-[clamp(1.5rem,3.5vw,2.5rem)]">
              MEKUBAL IS
              <br />
              OUR SHOP WINDOW
            </h2>
            <div className="max-w-xl space-y-5 text-sm leading-relaxed text-grey-600">
              <p>
                Mekubal Africa is a Kenyan studio working directly with
                artisans across the country. We commission the work, agree the
                price with the maker, and sell it here ourselves — there is no
                middle layer between the bench it was made on and the box it
                arrives in.
              </p>
              <p>
                The people we work with cast brass in Nairobi, carve soapstone in
                Kisii, bead in Kajiado and weave in Kisumu. Where a maker is happy
                to be named, their name is on the product page, because it is
                their work and not anonymous stock.
              </p>
              <p>
                Everything is made by hand. Colour, grain and finish shift a
                little from one piece to the next — that variation is the point,
                not a flaw to apologise for.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <Marquee
        words={[
          "HAND-MADE IN KENYA",
          "MADE BY NAMED ARTISANS",
          "NO TWO ARE IDENTICAL",
        ]}
      />

      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-8">
        <div className="grid grid-cols-2 gap-px bg-grey-200 md:grid-cols-4">
          {CRAFTS.map(([place, craft], i) => (
            <Reveal key={place} delay={i * 60}>
              <div className="flex h-full min-h-44 flex-col justify-between bg-background p-5">
                <span className="eyebrow text-grey-400">0{i + 1}</span>
                <div className="mt-8">
                  <span className="display block text-xl leading-tight">
                    {place}
                  </span>
                  <span className="mt-2 block text-xs text-grey-600">
                    {craft}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 pb-28 md:px-8">
        <Reveal>
          <div className="flex flex-col gap-8 border-t border-grey-200 pt-14 md:flex-row md:items-end md:justify-between">
            <h2 className="display max-w-3xl text-[clamp(1.75rem,5vw,4rem)]">
              SEE WHAT IS
              <br />
              ON THE BENCH
              <br />
              THIS WEEK
            </h2>
            <div className="flex flex-col gap-4">
              <a
                href="https://www.instagram.com/mekubal_africa"
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline eyebrow inline-flex w-fit items-center gap-3"
              >
                Instagram — @mekubal_africa
                <span aria-hidden>⟶</span>
              </a>
              <Link
                href="/shop"
                className="link-underline eyebrow inline-flex w-fit items-center gap-3"
              >
                Shop the catalogue
                <span aria-hidden>⟶</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
