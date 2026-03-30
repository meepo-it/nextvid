import EmailLayout from '../components/email-layout';
import { Heading, Text } from '@react-email/components';
import * as m from '@/paraglide/messages.js';

interface FeatureRequestRejectedProps {
  title: string;
  reason: string;
}

export default function FeatureRequestRejected({
  title,
  reason,
}: FeatureRequestRejectedProps) {
  return (
    <EmailLayout>
      <Heading className="text-xl">
        {m.mail_feature_request_rejected_title()}
      </Heading>
      <Text>
        {m.mail_feature_request_rejected_body({ title })}
      </Text>
      <Text className="rounded bg-gray-100 p-3 italic">{reason}</Text>
      <Text className="text-sm text-gray-500">
        {m.mail_feature_request_rejected_footer()}
      </Text>
    </EmailLayout>
  );
}
