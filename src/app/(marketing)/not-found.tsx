import Link from "next/link";
import NotFoundLogger from "@/components/common/NotFoundLogger";

export default function NotFound() {
  return (
    <div className="page-hero-sm" style={{ minHeight: "70vh", display: "flex", alignItems: "center" }}>
      <NotFoundLogger />
      <div className="max-w-[1280px] mx-auto px-7 page-hero-sm-inner">
        <div
          className="font-dm-sans font-black text-foreground"
          style={{ fontSize: "clamp(80px, 12vw, 140px)", letterSpacing: "-4px", lineHeight: 1 }}
        >
          404
        </div>
        <div className="sec-title" style={{ marginTop: "16px" }}>
          পেজ পাওয়া যায়নি
        </div>
        <p className="sec-sub" style={{ maxWidth: "460px", margin: "0 auto 32px" }}>
          আপনি যে পেজটি খুঁজছেন তা নেই বা সরানো হয়েছে।
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn btn-primary btn-lg">
            হোমে ফিরুন
          </Link>
          <Link href="/features" className="btn btn-outline btn-lg">
            ফিচার
          </Link>
          <Link href="/pricing" className="btn btn-outline btn-lg">
            মূল্য
          </Link>
        </div>
      </div>
    </div>
  );
}
