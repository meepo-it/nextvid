import { HeaderSection } from '@/components/shared/header-section';
import { ScrollReveal } from '@/components/shared/scroll-reveal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import * as m from '@/paraglide/messages.js';

type Testimonial = {
  name: string;
  role: string;
  image: string;
  quote: string;
};

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

export default function TestimonialsSection() {
  const testimonials: Testimonial[] = [
    {
      name: m.blocks_testimonials_item1_name(),
      role: m.blocks_testimonials_item1_role(),
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      quote: m.blocks_testimonials_item1_quote(),
    },
    {
      name: m.blocks_testimonials_item2_name(),
      role: m.blocks_testimonials_item2_role(),
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      quote: m.blocks_testimonials_item2_quote(),
    },
    {
      name: m.blocks_testimonials_item3_name(),
      role: m.blocks_testimonials_item3_role(),
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      quote: m.blocks_testimonials_item3_quote(),
    },
    {
      name: m.blocks_testimonials_item4_name(),
      role: m.blocks_testimonials_item4_role(),
      image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Maria',
      quote: m.blocks_testimonials_item4_quote(),
    },
    {
      name: m.blocks_testimonials_item5_name(),
      role: m.blocks_testimonials_item5_role(),
      image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sam',
      quote: m.blocks_testimonials_item5_quote(),
    },
    {
      name: m.blocks_testimonials_item6_name(),
      role: m.blocks_testimonials_item6_role(),
      image: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Jordan',
      quote: m.blocks_testimonials_item6_quote(),
    },
  ];

  const testimonialChunks = chunkArray(
    testimonials,
    Math.ceil(testimonials.length / 3)
  );

  return (
    <section id="testimonials" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <HeaderSection
            title={m.blocks_testimonials_title()}
            subtitle={m.blocks_testimonials_subtitle()}
          />
        </ScrollReveal>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
          {testimonialChunks.map((chunk, chunkIndex) => (
            <ScrollReveal
              key={chunkIndex}
              delay={chunkIndex * 120}
              className="space-y-3"
            >
              {chunk.map(({ name, role, quote, image }, _index) => (
                <Card
                  key={`${name}-${role}`}
                  className="bg-transparent shadow-none transition-colors duration-200 hover:bg-accent dark:hover:bg-card"
                >
                  <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-4">
                    <Avatar className="size-9 border-2 border-primary/25">
                      <AvatarImage
                        alt={name}
                        src={image}
                        loading="lazy"
                        width={120}
                        height={120}
                      />
                      <AvatarFallback className="absolute inset-0">
                        {name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-medium">{name}</h3>
                      <span className="text-muted-foreground block text-sm tracking-wide">
                        {role}
                      </span>
                      <blockquote className="mt-3">
                        <p className="text-muted-foreground">{quote}</p>
                      </blockquote>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
