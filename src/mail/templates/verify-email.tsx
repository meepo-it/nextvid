import EmailButton from '../components/email-button';
import EmailLayout from '../components/email-layout';
import { Text } from '@react-email/components';
import * as m from '@/paraglide/messages.js';

interface VerifyEmailProps {
  url: string;
  name: string;
}

export default function VerifyEmail({ url, name }: VerifyEmailProps) {
  return (
    <EmailLayout>
      <Text>
        {m.mail_verify_email_greeting()} {name}.
      </Text>
      <Text>{m.mail_verify_email_body()}</Text>
      <EmailButton href={url}>{m.mail_verify_email_button()}</EmailButton>
    </EmailLayout>
  );
}
