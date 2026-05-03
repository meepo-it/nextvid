import EmailLayout from '../components/email-layout';
import { Heading, Text } from '@react-email/components';
import * as m from '@/paraglide/messages.js';

export default function SubscribeNewsletter() {
  return (
    <EmailLayout>
      <Heading className="text-xl">
        {m.mail_subscribe_newsletter_title()}
      </Heading>
      <Text>{m.mail_subscribe_newsletter_body()}</Text>
    </EmailLayout>
  );
}
