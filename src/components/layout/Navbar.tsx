"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  const navLinks = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.features"), href: "/features" },
    { name: t("nav.pricing"), href: "/pricing" },
    { name: t("nav.changelog"), href: "/changelog" },
    { name: t("nav.support"), href: "/support" },
    { name: t("nav.docs"), href: "/docs" },
  ];

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed top-2 sm:top-4 left-0 right-0 z-900 flex justify-center px-3 sm:px-4 pointer-events-none">
        <div className="max-w-[1280px] w-full h-13 sm:h-14" />
      </div>
    );
  }

  return (
    <div className="fixed top-2 sm:top-4 left-0 right-0 z-900 flex justify-center px-3 sm:px-4 pointer-events-none">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "max-w-[1280px] w-full flex items-center justify-between glass rounded-2xl sm:rounded-[18px] px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 pointer-events-auto transition-shadow duration-300",
          isScrolled && "shadow-lg border-opacity-50"
        )}
      >
        <Link href="/" className="flex items-center gap-1.5 md:gap-2.5 shrink-0 group">
          <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 md:w-8.5 md:h-8.5 bg-accent rounded-lg sm:rounded-[10px] flex items-center justify-center text-sm sm:text-base md:text-lg transition-transform group-hover:rotate-[-8deg] group-hover:scale-110">
            🚀
          </div>
          <div className="hidden md:block font-black text-[15px] text-foreground tracking-[-0.3px]">
            Conversion<span className="text-accent">Flow</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={link.href as any}
              className={cn(
                "relative text-[13.5px] font-medium px-3.5 py-2 rounded-[9px] transition-all duration-200",
                pathname === link.href
                  ? "text-accent"
                  : "text-text2 hover:text-foreground hover:bg-accent-light"
              )}
            >
              {link.name}
              {pathname === link.href && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute bottom-0.5 left-3.5 right-3.5 h-[2px] bg-accent rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
          <LanguageToggle />

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 border border-border rounded-lg sm:rounded-[9px] flex items-center justify-center hover:border-accent hover:bg-accent-light transition-all text-text2"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={14} className="sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" /> : <Moon size={14} className="sm:w-4 sm:h-4 md:w-4.5 md:h-4.5" />}
          </button>

          <Link href="/pricing" className="hidden sm:flex btn btn-primary text-[13px] px-4 py-2">
            {t("nav.buyNow")} <ArrowRight size={14} className="ml-1" />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-7 h-7 sm:w-8 sm:h-8 border border-border rounded-lg sm:rounded-[9px] flex items-center justify-center text-text2 hover:bg-accent-light"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X size={16} className="sm:w-4.5 sm:h-4.5" /> : <Menu size={16} className="sm:w-4.5 sm:h-4.5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-15 sm:top-20 left-3 right-3 sm:left-5 sm:right-5 glass rounded-xl sm:rounded-2xl p-3 sm:p-4 md:hidden flex flex-col gap-1.5 sm:gap-2 pointer-events-auto shadow-2xl"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                href={link.href as any}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-[13px] sm:text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-accent/10 text-accent"
                    : "text-text2 hover:bg-accent-light"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-border my-1.5 sm:my-2" />
            <div className="p-2.5 sm:p-3 flex items-center justify-between">
              <LanguageToggle />
            </div>
            <div className="h-px bg-border my-1.5 sm:my-2" />
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-primary w-full justify-center py-2.5 sm:py-3 text-[13px] sm:text-sm"
            >
              {t("nav.buyNow")}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
