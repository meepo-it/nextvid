import {
  Container,
  Font,
  Head,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import { websiteConfig } from '@/config/website';
import * as m from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';

interface EmailLayoutProps {
  children: React.ReactNode;
}

/**
 * Shared email layout (same structure as MkSaaS).
 */
export default function EmailLayout({ children }: EmailLayoutProps) {
  const year = new Date().getFullYear();
  return (
    <Html lang={getLocale()}>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Tailwind>
        <Section className="bg-background p-4">
          <Container className="rounded-lg bg-card p-6 text-card-foreground">
            {children}
            <Hr className="my-8" />
            <Text className="mt-4">
              {websiteConfig.metadata?.name} {m.mail_layout_team()}
            </Text>
            <Text>
              ©️ {year} {m.mail_layout_copyright()}
            </Text>
          </Container>
        </Section>
      </Tailwind>
    </Html>
  );
}
