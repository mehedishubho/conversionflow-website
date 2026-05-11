import Link from "next/link";
import type { Metadata } from "next";
import { supportChannels } from "@/data/support";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with WooBooster — email support, WhatsApp for Bangladesh sellers, documentation, and contact form.",
  openGraph: {
    title: "Support — WooBooster",
    description: "Email, WhatsApp, and documentation support for WooBooster users.",
    url: "/support",
  },
};

export default function Support() {
  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1160px] mx-auto px-7 page-hero-sm-inner">
          <div className="eyebrow">Support</div>
          <div
            className="sec-title"
            style={{ fontSize: "clamp(30px,4vw,50px)", letterSpacing: "-2px" }}
          >
            We&apos;ve Got Your Back
          </div>
          <p className="sec-sub" style={{ maxWidth: "460px", margin: "0 auto" }}>
            Dedicated support for Bangladeshi sellers. We respond in your time
            zone, in Bangla or English.
          </p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1160px] mx-auto px-7">
          <div className="support-grid">
            {supportChannels.map((ch) => (
              <div key={ch.title} className="support-card">
                <div className="sc-icon">{ch.icon}</div>
                <div className="sc-title">{ch.title}</div>
                <div className="sc-desc">{ch.description}</div>
                {ch.href.startsWith("mailto:") ? (
                  <a href={ch.href} className="btn btn-outline">
                    {ch.action}
                  </a>
                ) : (
                  <Link href={ch.href} className="btn btn-outline">
                    {ch.action}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="sh center" style={{ marginBottom: "40px" }}>
            <div className="eyebrow">Contact Form</div>
            <div className="sec-title">Send Us a Message</div>
          </div>

          <div className="contact-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Your Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Rahim Ahmed"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="rahim@store.com"
                />
              </div>
              <div className="form-group">
                <label>License Key</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="WB-XXXX-XXXX-XXXX"
                />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Steadfast sync not working"
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label>Message</label>
              <textarea
                className="form-input"
                placeholder="Describe your issue in detail..."
              ></textarea>
            </div>
            <span
              className="btn btn-primary btn-lg"
              style={{ cursor: "pointer" }}
            >
              Send Message →
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
