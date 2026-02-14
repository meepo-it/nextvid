import EmailButton from '../components/email-button'
import EmailLayout from '../components/email-layout'
import { Text } from '@react-email/components'

interface VerifyEmailProps {
  url: string
  name: string
}

export default function VerifyEmail({ url, name }: VerifyEmailProps) {
  return (
    <EmailLayout>
      <Text>Hi, {name}.</Text>
      <Text>Please click the link below to verify your email address.</Text>
      <EmailButton href={url}>Confirm email</EmailButton>
    </EmailLayout>
  )
}
