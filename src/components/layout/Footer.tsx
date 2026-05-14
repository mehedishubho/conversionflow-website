"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { footerProductLinks, footerResourceLinks, footerLegalLinks } from "@/data/navigation";
import { LanguageToggle } from "./LanguageToggle";

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com/conversionflow",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/8801721328992",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.845L.057 23.5l5.797-1.522A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.51-5.17-1.4l-.37-.22-3.44.9.92-3.35-.24-.38A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:mhs@wpmhs.com",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/conversionflow",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
];

export function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const [email, setEmail] = useState("");

  const achievements = [
    { icon: "🏪", num: t("badge1Num"), label: t("badge1Label") },
    { icon: "🇧🇩", num: "3", label: t("bdCouriers") },
    { icon: "📊", num: "6", label: t("trackingPlatforms") },
    { icon: "🛡️", num: "100%", label: t("capiAccuracy") },
    { icon: "🔄", num: t("badge2Num"), label: t("badge2Label") },
    { icon: "⚡", num: t("badge3Num"), label: t("badge3Label") },
  ];

  return (
    <footer className="ft">

      {/* ── TOP: Brand + Links grid ── */}
      <div className="ft-top">
        <div className="max-w-[1280px] mx-auto px-7 py-14">
          <div className="ft-grid">

            {/* Brand column — split into left info + right newsletter */}
            <div className="ft-brand">

              {/* Left: identity */}
              <div className="ft-brand-left">
                <Link href="/" className="ft-logo">
                  <div className="ft-logo-icon">🚀</div>
                  <span className="ft-logo-text">Conversion<span>Flow</span></span>
                </Link>

                <p className="ft-tagline">{t("tagline")}</p>

                <div className="ft-contacts">
                  <a href="mailto:mhs@wpmhs.com" className="ft-contact">
                    <span className="ft-contact-icon">✉</span>
                    mhs@wpmhs.com
                  </a>
                  <a href="https://wa.me/8801721328992" target="_blank" rel="noopener noreferrer" className="ft-contact">
                    <span className="ft-contact-icon">💬</span>
                    +880 1721-328992
                  </a>
                  <span className="ft-made-in">{t("madeIn")}</span>
                </div>
              </div>

              {/* Right: newsletter + socials */}
              <div className="ft-brand-right">
                <p className="ft-newsletter-heading">{t("newsletterLabel")}</p>
                <div className="ft-subscribe-row">
                  <input
                    type="email"
                    className="ft-subscribe-input"
                    placeholder={t("newsletterPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button className="ft-subscribe-btn">{t("newsletterBtn")}</button>
                </div>
                <p className="ft-subscribe-note">{t("newsletterNote")}</p>

                <div className="ft-socials-block">
                  <p className="ft-socials-label">{t("connectLabel")}</p>
                  <div className="ft-socials">
                    {socialLinks.map((s) => (
                      <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                        className="ft-social-btn" aria-label={s.label}>
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product column */}
            <div className="ft-col">
              <h4 className="ft-col-heading">{t("product")}</h4>
              {footerProductLinks.map((link) => {
                const navKey = link.name.toLowerCase().includes("doc") ? "docs" : link.name.toLowerCase();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const label = tn.has(navKey as any) ? tn(navKey as any) : link.name;
                return (
                  <Link key={link.href} 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={link.href as any} 
                    className="ft-link"
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Resources column */}
            <div className="ft-col">
              <h4 className="ft-col-heading">{t("resources")}</h4>
              {footerResourceLinks.map((link) => {
                const keyMap: Record<string, string> = {
                  "Blog": "blog",
                  "Devsroom": "devsroom",
                  "WPMHS": "wpmhs",
                  "WhatsApp BD": "whatsappBd",
                };
                const key = keyMap[link.name];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const label = key ? t(key as any) : link.name;
                return (
                  <Link key={link.href} 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={link.href as any} 
                    className="ft-link"
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Legal column */}
            <div className="ft-col">
              <h4 className="ft-col-heading">{t("legal")}</h4>
              {footerLegalLinks.map((link) => {
                const keyMap: Record<string, string> = {
                  "Privacy Policy": "privacyPolicy",
                  "Terms of Service": "termsOfService",
                  "Refund Policy": "refundPolicy",
                  "License Agreement": "licenseAgreement",
                };
                const key = keyMap[link.name];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const label = key ? t(key as any) : link.name;
                return (
                  <Link key={link.href} 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={link.href as any} 
                    className="ft-link"
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── MIDDLE: Achievement strip ── */}
      <div className="ft-achievements">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="ft-ach-grid">
            {achievements.map((a, i) => (
              <div key={i} className="ft-ach-item">
                <span className="ft-ach-icon">{a.icon}</span>
                <div>
                  <div className="ft-ach-num">{a.num}</div>
                  <div className="ft-ach-label">{a.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Copyright + Back to top ── */}
      <div className="ft-bottom">
        <div className="max-w-[1280px] mx-auto px-7 ft-bottom-inner flex items-center justify-between">
          <div className="flex items-center gap-6">
            <p className="ft-copyright">{t("copyright")}</p>
            <LanguageToggle className="h-7 px-1.5 rounded-md border-opacity-30" />
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="ft-back-top"
          >
            {t("backToTop")}
          </button>
        </div>
      </div>

    </footer>
  );
}
