import EmailLayout from '../components/email-layout';
import { Heading, Text } from '@react-email/components';
import * as m from '@/paraglide/messages.js';

interface FeatureRequestStatusUpdateProps {
  title: string;
  oldStatus: string;
  newStatus: string;
}

export default function FeatureRequestStatusUpdate({
  title,
  oldStatus,
  newStatus,
}: FeatureRequestStatusUpdateProps) {
  return (
    <EmailLayout>
      <Heading className="text-xl">
        {m.mail_feature_request_status_update_title()}
      </Heading>
      <Text>{m.mail_feature_request_status_update_body({ title })}</Text>
      <Text>
        <strong>{oldStatus}</strong> → <strong>{newStatus}</strong>
      </Text>
      <Text className="text-sm text-gray-500">
        {m.mail_feature_request_status_update_footer()}
      </Text>
    </EmailLayout>
  );
}
