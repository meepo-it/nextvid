import { HeaderSection } from '@/components/shared/header-section';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const m = {
  title: 'FAQs',
  subtitle: 'Frequently asked questions',
  items: {
    'item-1': {
      question: 'Can I change my plan later?',
      answer:
        'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of the next billing cycle.',
    },
    'item-2': {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards, PayPal, and wire transfer for annual plans.',
    },
    'item-3': {
      question: 'Is there a free trial?',
      answer:
        'Yes, we offer a 14-day free trial on all paid plans. No credit card required.',
    },
    'item-4': {
      question: 'What is your refund policy?',
      answer:
        'We offer a 30-day money-back guarantee. Contact support for a full refund.',
    },
    'item-5': {
      question: 'How do I get support?',
      answer:
        'Email support is included for all plans. Pro and above get priority support.',
    },
  },
};

const faqItems = [
  {
    id: 'item-1',
    question: m.items['item-1'].question,
    answer: m.items['item-1'].answer,
  },
  {
    id: 'item-2',
    question: m.items['item-2'].question,
    answer: m.items['item-2'].answer,
  },
  {
    id: 'item-3',
    question: m.items['item-3'].question,
    answer: m.items['item-3'].answer,
  },
  {
    id: 'item-4',
    question: m.items['item-4'].question,
    answer: m.items['item-4'].answer,
  },
  {
    id: 'item-5',
    question: m.items['item-5'].question,
    answer: m.items['item-5'].answer,
  },
] as const;

export default function FaqSection() {
  return (
    <section id="faqs" className="px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <HeaderSection
          title={m.title}
          titleAs="h2"
          subtitle={m.subtitle}
          subtitleAs="p"
        />

        <div className="mx-auto mt-12 max-w-4xl">
          <Accordion className="ring-muted w-full rounded-2xl border px-8 py-3 shadow-sm ring-4 dark:ring-0">
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-dashed"
              >
                <AccordionTrigger className="text-base hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-base text-muted-foreground">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
