"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  const toggleLang = () => {
    setLocale(locale === "en" ? "bn" : "en");
  };

  return (
    <button
      onClick={toggleLang}
      className={cn(
        "h-8 md:h-9 px-2 md:px-2.5 border border-border rounded-[9px] flex items-center justify-center text-[11px] md:text-[12px] font-bold hover:border-accent hover:bg-accent-light transition-all text-text2 gap-1",
        className
      )}
      aria-label="Switch Language"
    >
      <span className={cn(locale === "en" && "text-accent")}>EN</span>
      <span className="text-border">/</span>
      <span className={cn(locale === "bn" && "text-accent")}>বাং</span>
    </button>
  );
}
