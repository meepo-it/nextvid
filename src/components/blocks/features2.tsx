import { HeaderSection } from '@/components/shared/header-section';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import {
  IconActivity,
  IconBolt,
  IconCompass,
  IconMail,
} from '@tabler/icons-react';
import * as m from '@/paraglide/messages.js';

export default function Features2Section() {
  return (
    <section id="features2" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-2 lg:px-0 space-y-8 lg:space-y-20">
        <ScrollReveal>
          <HeaderSection
            title={m.blocks_features2_title()}
            subtitle={m.blocks_features2_subtitle()}
            description={m.blocks_features2_description()}
          />
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="grid items-center gap-12 lg:grid-cols-5 lg:gap-24">
            <div className="lg:col-span-2">
              <div className="lg:pr-0">
                <h2 className="text-4xl font-semibold">{m.blocks_features2_title()}</h2>
                <p className="mt-6 text-muted-foreground">{m.blocks_features2_description()}</p>
              </div>

              <ul className="mt-8 divide-y border-y *:flex *:items-center *:gap-3 *:py-3">
                <li>
                  <IconMail className="size-5 shrink-0" />
                  {m.blocks_features2_feature1()}
                </li>
                <li>
                  <IconBolt className="size-5 shrink-0" />
                  {m.blocks_features2_feature2()}
                </li>
                <li>
                  <IconActivity className="size-5 shrink-0" />
                  {m.blocks_features2_feature3()}
                </li>
                <li>
                  <IconCompass className="size-5 shrink-0" />
                  {m.blocks_features2_feature4()}
                </li>
              </ul>
            </div>

            <div className="relative rounded-3xl border border-border/50 p-3 lg:col-span-3">
              <div className="relative aspect-76/59 rounded-2xl bg-linear-to-b from-zinc-300 to-transparent p-px dark:from-zinc-700">
                <img
                  src="https://cdn.mksaas.com/blocks/dark-card.webp"
                  alt="Card illustration dark"
                  className="hidden size-full rounded-[15px] object-cover dark:block"
                  loading="lazy"
                />
                <img
                  src="https://cdn.mksaas.com/blocks/card.png"
                  alt="Card illustration light"
                  className="size-full rounded-[15px] object-cover shadow dark:hidden"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
