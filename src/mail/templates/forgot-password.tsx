import EmailButton from '../components/email-button'
import EmailLayout from '../components/email-layout'
import { Text } from '@react-email/components'

interface ForgotPasswordProps {
  url: string
  name: string
}

export default function ForgotPassword({ url, name }: ForgotPasswordProps) {
  return (
    <EmailLayout>
      <Text>Hi, {name}.</Text>
      <Text>Please click the link below to reset your password.</Text>
      <EmailButton href={url}>Reset password</EmailButton>
    </EmailLayout>
  )
}
