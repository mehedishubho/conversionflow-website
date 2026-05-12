import Link from "next/link";

export function CTASection() {
  return (
    <section className="sec">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="cta-wrap">
          <div className="cta-bd-tag">🇧🇩 Made for Bangladeshi Sellers</div>
          <h2>Start Automating Your Store Today</h2>
          <p>
            Join 500+ WooCommerce store owners who save hours every week with
            WooBooster.
          </p>
          <Link href="/pricing" className="btn-white">
            Get WooBooster Now — ৳3,499 →
          </Link>
          <div className="cta-note">
            One-time payment · 30-day refund · bKash / Nagad · Instant delivery
          </div>
        </div>
      </div>
    </section>
  );
}
