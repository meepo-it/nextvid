import EmailButton from '../components/email-button';
import EmailLayout from '../components/email-layout';
import { Text } from '@react-email/components';
import * as m from '@/paraglide/messages.js';

interface ForgotPasswordProps {
  url: string;
  name: string;
}

export default function ForgotPassword({ url, name }: ForgotPasswordProps) {
  return (
    <EmailLayout>
      <Text>
        {m.mail_forgot_password_greeting()} {name}.
      </Text>
      <Text>{m.mail_forgot_password_body()}</Text>
      <EmailButton href={url}>{m.mail_forgot_password_button()}</EmailButton>
    </EmailLayout>
  );
}
