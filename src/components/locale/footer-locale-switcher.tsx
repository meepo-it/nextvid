import { getLocale, locales, setLocale } from '@/paraglide/runtime.js';
import * as m from '@/paraglide/messages.js';
import { setUserLocale } from '@/api/user-locale';
import { IconLanguage } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

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

export function FooterLocaleSwitcher() {
  const currentLocale = getLocale();

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <IconLanguage className="size-4 shrink-0" />
      {locales.map((locale, i) => (
        <span key={locale} className="flex items-center">
          {i > 0 && <span className="mx-1 text-border">|</span>}
          <button
            type="button"
            onClick={() => {
              void setUserLocale({ data: { locale } }).catch(() => {});
              setLocale(locale);
            }}
            className={cn(
              'cursor-pointer transition-colors hover:text-foreground',
              locale === currentLocale && 'text-foreground font-medium',
            )}
          >
            {getLocaleLabel(locale)}
          </button>
        </span>
      ))}
    </div>
  );
}
