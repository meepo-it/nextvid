import { getLocale, locales, setLocale } from '@/paraglide/runtime.js';
import { IconCheck, IconChevronDown, IconLanguage } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const localeLabels: Record<string, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
};

export function LocaleSwitcher() {
  const currentLocale = getLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <IconLanguage className="size-5" />
        <span>{localeLabels[currentLocale]}</span>
        <IconChevronDown className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => setLocale(locale)}
          >
            {locale === currentLocale ? (
              <IconCheck className="mr-2 size-4" />
            ) : (
              <span className="mr-2 size-4" />
            )}
            {localeLabels[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
