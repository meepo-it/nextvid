import { HeaderSection } from '@/components/shared/header-section';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

const m = {
  title: 'TESTIMONIALS',
  subtitle: 'What our customers are saying',
  items: {
    'item-1': {
      name: 'Jane Doe',
      role: 'CTO, Acme Inc',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      quote:
        'The best TanStack Starter kit we evaluated. Auth and billing just work.',
    },
    'item-2': {
      name: 'John Smith',
      role: 'Founder, Startup',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      quote:
        'TanStack Starter really saved us months of development. We shipped our MVP in just 2 weeks.',
    },
    'item-3': {
      name: 'Alex Chen',
      role: 'Engineer, Tech Co',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      quote:
        'Clean code, great DX. We extended it for our use case easily.',
    },
    'item-4': {
      name: 'Maria Garcia',
      role: 'Product Lead, ScaleUp',
      image: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Maria',
      quote:
        'Finally a template that includes auth, billing, and dashboard out of the box. No more stitching boilerplate.',
    },
    'item-5': {
      name: 'Sam Wilson',
      role: 'Indie Maker',
      image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sam',
      quote: 'The stack choices and structure are exactly what we needed.',
    },
    'item-6': {
      name: 'Jordan Lee',
      role: 'DevRel, Cloud Co',
      image: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Jordan',
      quote:
        'Best-in-class starter for production SaaS. Our team recommends it to every founder building with modern React.',
    },
  },
};

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
  const testimonials: Testimonial[] = (
    ['item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6'] as const
  ).map((key) => m.items[key]);

  const testimonialChunks = chunkArray(
    testimonials,
    Math.ceil(testimonials.length / 3)
  );

  return (
    <section id="testimonials" className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <HeaderSection
          title={m.title}
          titleAs="h2"
          subtitle={m.subtitle}
          subtitleAs="p"
        />

        <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
          {testimonialChunks.map((chunk, chunkIndex) => (
            <div key={chunkIndex} className="space-y-3">
              {chunk.map(({ name, role, quote, image }, index) => (
                <Card
                  key={index}
                  className="bg-transparent shadow-none hover:bg-accent dark:hover:bg-card"
                >
                  <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-4">
                    <Avatar className="size-9 border-2 border-gray-200">
                      <AvatarImage
                        alt={name}
                        src={image}
                        loading="lazy"
                        width={120}
                        height={120}
                      />
                      <AvatarFallback />
                    </Avatar>

                    <div>
                      <h3 className="font-medium">{name}</h3>
                      <span className="text-muted-foreground block text-sm tracking-wide">
                        {role}
                      </span>
                      <blockquote className="mt-3">
                        <p className="text-gray-700 dark:text-gray-300">
                          {quote}
                        </p>
                      </blockquote>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
