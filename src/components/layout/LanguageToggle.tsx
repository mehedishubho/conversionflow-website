"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const LANG_OPTIONS = [
  { code: "en" as const, label: "English", short: "EN" },
  { code: "bn" as const, label: "বাংলা", short: "বাং" },
];

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANG_OPTIONS.find((l) => l.code === locale) ?? LANG_OPTIONS[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "h-8 md:h-9 px-2 md:px-2.5 border border-border rounded-[9px] flex items-center justify-center text-[11px] md:text-[12px] font-bold hover:border-accent hover:bg-accent-light transition-all text-text2 gap-1"
        )}
        aria-label="Switch Language"
        aria-expanded={open}
      >
        <span className="text-accent">{current.short}</span>
        <ChevronDown
          size={12}
          className={cn("transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 glass border border-border rounded-xl py-1 min-w-30 shadow-lg z-50">
          {LANG_OPTIONS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setOpen(false);
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-[12px] font-medium flex items-center gap-2 transition-colors",
                locale === lang.code
                  ? "text-accent bg-accent-light"
                  : "text-text2 hover:text-foreground hover:bg-accent-light"
              )}
            >
              <span className="font-bold">{lang.short}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
