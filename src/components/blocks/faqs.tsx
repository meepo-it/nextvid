import { HeaderSection } from '@/components/shared/header-section';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import * as m from '@/paraglide/messages.js';

const faqItems = [
  {
    id: 'item-1',
    question: () => m.blocks_faqs_item1_question(),
    answer: () => m.blocks_faqs_item1_answer(),
  },
];

export default function FaqSection() {
  return (
    <section id="faqs" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal>
          <HeaderSection
            title={m.blocks_faqs_title()}
            subtitle={m.blocks_faqs_subtitle()}
          />
        </ScrollReveal>

        <ScrollReveal delay={150} className="mx-auto mt-12 max-w-4xl">
          <Accordion className="ring-primary/10 w-full rounded-2xl border border-primary/15 px-4 py-3 shadow-sm ring-4 dark:ring-primary/5 dark:border-primary/10 sm:px-8">
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-dashed"
              >
                <AccordionTrigger className="text-base hover:no-underline">
                  {item.question()}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-base text-muted-foreground">
                    {item.answer()}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
}
