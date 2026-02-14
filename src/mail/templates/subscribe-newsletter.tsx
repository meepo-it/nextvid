import EmailLayout from '../components/email-layout'
import { Heading, Text } from '@react-email/components'

export default function SubscribeNewsletter() {
  return (
    <EmailLayout>
      <Heading className="text-xl">Thanks for subscribing</Heading>
      <Text>
        Thank you for subscribing to the newsletter. We will keep you updated
        with the latest news and updates.
      </Text>
    </EmailLayout>
  )
}
