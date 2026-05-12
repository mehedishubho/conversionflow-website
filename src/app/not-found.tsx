import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-hero-sm" style={{ minHeight: "70vh", display: "flex", alignItems: "center" }}>
      <div className="max-w-[1160px] mx-auto px-7 page-hero-sm-inner">
        <div
          className="font-syne font-black text-foreground"
          style={{ fontSize: "clamp(80px, 12vw, 140px)", letterSpacing: "-4px", lineHeight: 1 }}
        >
          404
        </div>
        <div className="sec-title" style={{ marginTop: "16px" }}>
          Page Not Found
        </div>
        <p className="sec-sub" style={{ maxWidth: "460px", margin: "0 auto 32px" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/" className="btn btn-primary btn-lg">
            Back to Home
          </Link>
          <Link href="/features" className="btn btn-outline btn-lg">
            View Features
          </Link>
          <Link href="/pricing" className="btn btn-outline btn-lg">
            See Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
