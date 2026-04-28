import { getLocale, locales, setLocale } from '@/paraglide/runtime.js';
import * as m from '@/paraglide/messages.js';
import { setUserLocale } from '@/api/user-locale';
import { IconCheck, IconLanguage, IconMailFilled } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

const localeFlags: Record<string, string> = {
  en: '🇺🇸',
  'zh': '🇨🇳',
};

// Localized label/region for a locale code. Pulled from the message system so
// the switcher itself participates in i18n. Add a new locale by:
//   1. adding `language_name_<code>` and `language_region_<code>` keys to all
//      messages/*.json files
//   2. adding a flag emoji here
function getLocaleLabel(code: string): string {
  switch (code) {
    case 'en':
      return m.language_name_en();
    case 'zh':
      return m.language_name_zh();
    default:
      return code;
  }
}

function getLocaleRegion(code: string): string {
  switch (code) {
    case 'en':
      return m.language_region_en();
    case 'zh':
      return m.language_region_zh();
    default:
      return '';
  }
}

const SUPPORT_EMAIL = 'support@tanstarter.dev';

export function LocaleSwitcher() {
  const currentLocale = getLocale();
  const [open, setOpen] = useState(false);

  // Split the request message around the {link} placeholder so we can render
  // the link as a real <a> while keeping the surrounding copy translatable.
  const requestMessage = m.locale_switcher_request_message({ link: '\u0000' });
  const [requestPrefix, requestSuffix] = requestMessage.split('\u0000');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        <IconLanguage className="size-5" />
        <span>{getLocaleLabel(currentLocale)}</span>
      </DialogTrigger>
      <DialogContent showCloseButton className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <IconLanguage className="size-5 text-muted-foreground" />
            {m.locale_switcher_title()}
          </DialogTitle>
          <DialogDescription>
            {m.locale_switcher_description()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-1.5 px-3 pb-2 max-h-72 overflow-y-auto">
          {locales.map((locale) => {
            const isActive = locale === currentLocale;
            return (
              <button
                key={locale}
                type="button"
                onClick={() => {
                  // Best-effort persist on the user row for authenticated
                  // users so background email jobs render in their language.
                  // Errors (e.g. anonymous user → 401) are ignored on purpose.
                  void setUserLocale({ data: { locale } }).catch(() => {});
                  setLocale(locale);
                  setOpen(false);
                }}
                className={`group relative flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all ${
                  isActive
                    ? 'border-primary/30 bg-primary/5 text-primary shadow-sm'
                    : 'border-transparent hover:border-border hover:bg-accent text-foreground'
                }`}
              >
                <span className="text-lg leading-none">{localeFlags[locale]}</span>
                <div className="flex flex-1 flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{getLocaleLabel(locale)}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {getLocaleRegion(locale)}
                  </span>
                </div>
                {isActive && (
                  <IconCheck className="size-3.5 shrink-0 text-primary" />
                )}
              </button>
            );
          })}
        </div>
        <div className="border-t px-5 py-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <IconMailFilled className="inline size-3.5 mr-1 -translate-y-px" />
            {requestPrefix}
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Language%20Request`}
              className="text-foreground underline underline-offset-2 hover:text-primary transition-colors"
            >
              {m.locale_switcher_request_link()}
            </a>
            {requestSuffix}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
