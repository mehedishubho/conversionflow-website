"use client";

const bnChannels = [{"title":"ইমেইল সাপোর্ট","description":"আমাদের বিস্তারিত মেসেজ পাঠান এবং আমরা ২৪ ঘণ্টার মধ্যে উত্তর দেব, সাধারণত এর চেয়ে দ্রুত।"},{"title":"WhatsApp (BD)","description":"বাংলাদেশে সরাসরি WhatsApp সাপোর্ট। অফিস চলাকালীন (সকাল ৯টা – সন্ধ্যা ৬টা BST) রেসপন্স পাবেন।"},{"title":"ডকুমেন্টেশন","description":"প্রতিটি মডিউলের জন্য ধাপে ধাপে গাইড — প্রথম ইনস্টলেশন থেকে শুরু করে অ্যাডভান্সড CAPI কনফিগারেশন পর্যন্ত।","action":"ডকস দেখুন →"}];


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
            <div className="eyebrow">সাপোর্ট</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(30px,4vw,50px)", letterSpacing: "-2px" }}
          >
            আমরা আপনার পাশে আছি
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "460px", margin: "0 auto" }}
          >
            বাংলাদেশি বিক্রেতাদের জন্য ডেডিকেটেড সাপোর্ট। আমরা আপনার টাইম জোনে, বাংলা বা ইংরেজিতে সাড়া দিই।
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
                <div className="sc-title">{bnChannels[i].title}</div>
                <div className="sc-desc">{bnChannels[i].description}</div>
                {ch.href.startsWith("mailto:") ? (
                  <a href={ch.href} className="btn btn-outline">{ch.action}</a>
                ) : (
                  <Link 
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    href={ch.href} 
                    className="btn btn-outline"
                  >
                    {bnChannels[i].action || ch.action}
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
            <div className="eyebrow">যোগাযোগ ফর্ম</div>
            <div className="sec-title">একটি মেসেজ পাঠান</div>
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
