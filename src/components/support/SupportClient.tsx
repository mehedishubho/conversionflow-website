"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { supportChannels } from "@/data/support";
import { ContactForm } from "@/components/sections/ContactForm";


const ease = [0.22, 1, 0.36, 1] as const;

export default function SupportClient() {


  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1280px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">Support</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(30px,4vw,50px)", letterSpacing: "-2px" }}
          >
            We&apos;ve Got Your Back
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "460px", margin: "0 auto" }}
          >
            Dedicated support for Bangladeshi sellers. We respond in your time zone, in Bangla or English.
          </motion.p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="support-grid">
            {supportChannels.map((ch, i) => (
              <motion.div
                key={ch.title}
                className="support-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease }}
              >
                <div className="sc-icon">{ch.icon}</div>
                <div className="sc-title">{ch.title}</div>
                <div className="sc-desc">{ch.description}</div>
                {ch.href.startsWith("mailto:") ? (
                  <a href={ch.href} className="btn btn-outline">{ch.action}</a>
                ) : (
                  <Link
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={ch.href}
                    className="btn btn-outline"
                  >
                    {ch.action}
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            className="sh center" style={{ marginBottom: "40px" }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, ease }}
          >
            <div className="eyebrow">Contact Form</div>
            <div className="sec-title">Send a Message</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, ease }}
          >
            <ContactForm />
          </motion.div>
        </div>
      </section>
    </>
  );
}
