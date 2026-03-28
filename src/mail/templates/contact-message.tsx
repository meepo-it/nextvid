import EmailLayout from '../components/email-layout';
import { Text } from '@react-email/components';
import * as m from '@/paraglide/messages.js';

interface ContactMessageProps {
  name: string;
  email: string;
  message: string;
}

export default function ContactMessage({
  name,
  email,
  message,
}: ContactMessageProps) {
  return (
    <EmailLayout>
      <Text>
        {m.mail_contact_message_name()} {name}
      </Text>
      <Text>
        {m.mail_contact_message_email()} {email}
      </Text>
      <Text>
        {m.mail_contact_message_message()} {message}
      </Text>
    </EmailLayout>
  );
}
