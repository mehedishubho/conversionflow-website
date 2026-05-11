import Link from "next/link";
import { footerProductLinks, footerCompanyLinks, footerLegalLinks } from "@/data/navigation";

export function Footer() {
  return (
    <footer className="py-16 pb-8 border-t border-[--border]">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
          {/* Brand column */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-[34px] h-[34px] bg-accent rounded-[10px] flex items-center justify-center text-lg">
                🚀
              </div>
              <div className="font-syne font-black text-[15px] text-foreground tracking-[-0.3px]">
                Woo<span className="text-accent">Booster</span>
              </div>
            </Link>
            <p className="text-[13.5px] text-text2 leading-[1.75] mt-3.5 max-w-[260px]">
              The ultimate WooCommerce automation plugin for Bangladeshi store owners. Courier sync, fraud protection, and tracking — one plugin.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-muted px-3 py-1 rounded-full bg-[--bg2] border border-[--border] mt-3.5">
              🇧🇩 Developed in Dhaka, Bangladesh
            </div>
          </div>

          {/* Product column */}
          <div>
            <h4 className="font-syne text-[11.5px] font-extrabold text-foreground uppercase tracking-[1.3px] mb-4">
              Product
            </h4>
            {footerProductLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-[13.5px] text-text2 mb-2.5 hover:text-accent transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Company column */}
          <div>
            <h4 className="font-syne text-[11.5px] font-extrabold text-foreground uppercase tracking-[1.3px] mb-4">
              Company
            </h4>
            {footerCompanyLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-[13.5px] text-text2 mb-2.5 hover:text-accent transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Legal column */}
          <div>
            <h4 className="font-syne text-[11.5px] font-extrabold text-foreground uppercase tracking-[1.3px] mb-4">
              Legal
            </h4>
            {footerLegalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-[13.5px] text-text2 mb-2.5 hover:text-accent transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-7 border-t border-[--border] flex flex-wrap justify-between items-center gap-3 text-[12.5px] text-muted">
          <div>© 2025 Devsroom · WooBooster. All rights reserved.</div>
          <div>
            Built with ❤️ by{" "}
            <a href="https://wpmhs.com" className="hover:text-accent transition-colors">
              WPMHS
            </a>{" "}
            · Dhaka ·{" "}
            <a href="mailto:mhs@wpmhs.com" className="hover:text-accent transition-colors">
              mhs@wpmhs.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
