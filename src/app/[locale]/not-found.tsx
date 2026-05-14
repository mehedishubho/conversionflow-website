import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("notFound");
  const tNav = useTranslations("nav");

  return (
    <div className="page-hero-sm" style={{ minHeight: "70vh", display: "flex", alignItems: "center" }}>
      <div className="max-w-[1280px] mx-auto px-7 page-hero-sm-inner">
        <div
          className="font-dm-sans font-black text-foreground"
          style={{ fontSize: "clamp(80px, 12vw, 140px)", letterSpacing: "-4px", lineHeight: 1 }}
        >
          404
        </div>
        <div className="sec-title" style={{ marginTop: "16px" }}>
          {t("title")}
        </div>
        <p className="sec-sub" style={{ maxWidth: "460px", margin: "0 auto 32px" }}>
          {t("subtitle")}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn btn-primary btn-lg">
            {t("back")}
          </Link>
          <Link href="/features" className="btn btn-outline btn-lg">
            {tNav("features")}
          </Link>
          <Link href="/pricing" className="btn btn-outline btn-lg">
            {tNav("pricing")}
          </Link>
        </div>
      </div>
    </div>
  );
}
