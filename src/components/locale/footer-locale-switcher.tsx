import { getLocale, locales, setLocale } from '@/paraglide/runtime.js';
import { IconLanguage } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const localeLabels: Record<string, string> = {
  en: 'English',
  zh: '简体中文',
  ja: '日本語',
};

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
            onClick={() => setLocale(locale)}
            className={cn(
              'cursor-pointer transition-colors hover:text-foreground',
              locale === currentLocale && 'text-foreground font-medium',
            )}
          >
            {localeLabels[locale]}
          </button>
        </span>
      ))}
    </div>
  );
}
