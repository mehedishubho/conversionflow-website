"use client";

import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');

  const toggleLang = () => {
    const nextLocale = locale === 'en' ? 'bn' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLang}
      className={cn(
        "h-9 px-2 border border-border rounded-[9px] flex items-center justify-center text-[12px] font-bold hover:border-accent hover:bg-accent-light transition-all text-text2 gap-1",
        className
      )}
      aria-label="Switch Language"
    >
      <span className={cn(locale === "en" && "text-accent")}>{t("langEn")}</span>
      <span className="text-border">/</span>
      <span className={cn(locale === "bn" && "text-accent")}>{t("langBn")}</span>
    </button>
  );
}
