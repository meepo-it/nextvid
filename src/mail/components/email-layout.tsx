import {
  Container,
  Font,
  Head,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import { APP_NAME } from '../constants'

interface EmailLayoutProps {
  children: React.ReactNode
}

/**
 * Shared email layout (same structure as MkSaaS).
 */
export default function EmailLayout({ children }: EmailLayoutProps) {
  const year = new Date().getFullYear()
  return (
    <Html lang="en">
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
            <Text className="mt-4">{APP_NAME} Team</Text>
            <Text>©️ {year} All Rights Reserved.</Text>
          </Container>
        </Section>
      </Tailwind>
    </Html>
  )
}
