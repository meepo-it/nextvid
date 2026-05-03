import { AuthCard } from '@/components/auth/auth-card';
import * as m from '@/paraglide/messages.js';
import { Routes } from '@/lib/routes';
import { IconAlertTriangle } from '@tabler/icons-react';

const authErrorCodes: Record<string, () => string> = {
  signup_disabled: m.auth_error_codes_signup_disabled,
  account_already_linked_to_different_user:
    m.auth_error_codes_account_already_linked_to_different_user,
  unable_to_link_account: m.auth_error_codes_unable_to_link_account,
  unable_to_get_user_info: m.auth_error_codes_unable_to_get_user_info,
  "email_doesn't_match": m.auth_error_codes_email_doesnt_match,
  email_not_found: m.auth_error_codes_email_not_found,
  oauth_provider_not_found: m.auth_error_codes_oauth_provider_not_found,
  no_callback_url: m.auth_error_codes_no_callback_url,
  no_code: m.auth_error_codes_no_code,
  state_mismatch: m.auth_error_codes_state_mismatch,
  state_not_found: m.auth_error_codes_state_not_found,
  invalid_callback_request: m.auth_error_codes_invalid_callback_request,
};

function getDisplayMessage(
  errorCode: string | undefined,
  errorDescription: string | undefined
): string {
  if (errorCode && authErrorCodes[errorCode]) {
    return authErrorCodes[errorCode]();
  }
  if (errorDescription) {
    return errorDescription;
  }
  if (errorCode) {
    return errorCode;
  }
  return m.auth_error_try_again();
}

export function ErrorCard({
  errorCode,
  errorDescription,
}: {
  errorCode?: string;
  errorDescription?: string;
} = {}) {
  const displayMessage = getDisplayMessage(errorCode, errorDescription);

  return (
    <AuthCard
      headerLabel={m.auth_error_title()}
      bottomButtonHref={Routes.Login}
      bottomButtonLabel={m.auth_error_back_to_login()}
      className="border-none"
    >
      <div className="w-full flex flex-col justify-center items-center py-4 gap-2">
        <div className="flex items-center gap-2">
          <IconAlertTriangle className="text-destructive size-4 shrink-0" />
          <p className="font-medium text-destructive text-center">
            {displayMessage}
          </p>
        </div>
      </div>
    </AuthCard>
  );
}
