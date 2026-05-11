"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks } from "@/data/navigation";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "bn">("en");
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    const saved = localStorage.getItem("lang") as "en" | "bn" | null;
    if (saved) setLang(saved);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLang = () => {
    const next = lang === "en" ? "bn" : "en";
    setLang(next);
    localStorage.setItem("lang", next);
    document.documentElement.lang = next;
  };

  if (!mounted) {
    return (
      <div className="fixed top-4 left-0 right-0 z-[900] flex justify-center px-5 pointer-events-none">
        <div className="max-w-[1160px] w-full h-[56px]" />
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-0 right-0 z-[900] flex justify-center px-5 pointer-events-none">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "max-w-[1160px] w-full flex items-center justify-between glass rounded-[18px] px-4 py-2 pointer-events-auto transition-shadow duration-300",
          isScrolled && "shadow-lg border-opacity-50"
        )}
      >
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-[34px] h-[34px] bg-accent rounded-[10px] flex items-center justify-center text-lg transition-transform group-hover:rotate-[-8deg] group-hover:scale-110">
            🚀
          </div>
          <div className="font-syne font-black text-[15px] text-foreground tracking-[-0.3px]">
            Woo<span className="text-accent">Booster</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
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

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 border border-border rounded-[9px] flex items-center justify-center text-lg hover:border-accent hover:bg-accent-light transition-all text-text2"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={toggleLang}
            className="h-9 px-2 border border-border rounded-[9px] flex items-center justify-center text-[12px] font-bold hover:border-accent hover:bg-accent-light transition-all text-text2 gap-1"
          >
            <span className={cn(lang === "en" && "text-accent")}>EN</span>
            <span className="text-border">/</span>
            <span className={cn(lang === "bn" && "text-accent")}>বাং</span>
          </button>

          <Link
            href="/pricing"
            className="hidden sm:flex btn btn-outline text-[13px] px-4 py-2"
          >
            View Plans
          </Link>
          
          <Link
            href="/pricing"
            className="hidden sm:flex btn btn-primary text-[13px] px-4 py-2"
          >
            Buy Now <ArrowRight size={14} className="ml-1" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 border border-border rounded-[9px] flex items-center justify-center text-text2 hover:bg-accent-light"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
            className="absolute top-20 left-5 right-5 glass rounded-2xl p-4 md:hidden flex flex-col gap-2 pointer-events-auto shadow-2xl"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "p-3 rounded-xl text-sm font-medium transition-colors",
                  pathname === link.href 
                    ? "bg-accent/10 text-accent" 
                    : "text-text2 hover:bg-accent-light"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            <button
              onClick={toggleLang}
              className="p-3 rounded-xl text-sm font-medium transition-colors text-text2 hover:bg-accent-light flex items-center gap-2"
            >
              <span>Language:</span>
              <span className={cn("font-bold", lang === "en" && "text-accent")}>English</span>
              <span>/</span>
              <span className={cn("font-bold", lang === "bn" && "text-accent")}>বাংলা</span>
            </button>
            <div className="h-px bg-border my-2" />
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-primary w-full justify-center py-3"
            >
              Get WooBooster
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
