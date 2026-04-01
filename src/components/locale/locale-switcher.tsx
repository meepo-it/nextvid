import { getLocale, locales, setLocale } from '@/paraglide/runtime.js';
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

const localeConfig: Record<
  string,
  { label: string; native: string; flag: string; desc: string }
> = {
  en: {
    label: 'English',
    native: 'English',
    flag: '🇺🇸',
    desc: 'United States',
  },
  zh: {
    label: '中文',
    native: 'Chinese',
    flag: '🇨🇳',
    desc: '简体中文',
  },
  ja: {
    label: '日本語',
    native: 'Japanese',
    flag: '🇯🇵',
    desc: '日本語',
  },
};

const SUPPORT_EMAIL = 'support@tanstarter.dev';

export function LocaleSwitcher() {
  const currentLocale = getLocale();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        <IconLanguage className="size-5" />
        <span>{localeConfig[currentLocale]?.label}</span>
      </DialogTrigger>
      <DialogContent showCloseButton className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <IconLanguage className="size-5 text-muted-foreground" />
            Language
          </DialogTitle>
          <DialogDescription>
            Choose your preferred language for the interface.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-1.5 px-3 pb-2 max-h-72 overflow-y-auto">
          {locales.map((locale) => {
            const config = localeConfig[locale];
            const isActive = locale === currentLocale;
            return (
              <button
                key={locale}
                type="button"
                onClick={() => {
                  setLocale(locale);
                  setOpen(false);
                }}
                className={`group relative flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all ${
                  isActive
                    ? 'border-primary/30 bg-primary/5 text-primary shadow-sm'
                    : 'border-transparent hover:border-border hover:bg-accent text-foreground'
                }`}
              >
                <span className="text-base leading-none">{config?.flag}</span>
                <div className="flex flex-1 flex-col min-w-0">
                  <span className="text-[13px] font-medium truncate">{config?.label}</span>
                  <span className="text-[11px] text-muted-foreground truncate">
                    {config?.desc}
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
          <p className="text-xs text-muted-foreground leading-relaxed">
            <IconMailFilled className="inline size-3.5 mr-1 -translate-y-px" />
            Need another language?{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Language%20Request`}
              className="text-foreground underline underline-offset-2 hover:text-primary transition-colors"
            >
              Let us know
            </a>
            {' '}and we'll add it.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
