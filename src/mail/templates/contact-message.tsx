import EmailLayout from '../components/email-layout'
import { Text } from '@react-email/components'

interface ContactMessageProps {
  name: string
  email: string
  message: string
}

export default function ContactMessage({
  name,
  email,
  message,
}: ContactMessageProps) {
  return (
    <EmailLayout>
      <Text>Name: {name}</Text>
      <Text>Email: {email}</Text>
      <Text>Message: {message}</Text>
    </EmailLayout>
  )
}
