"use client";

const bnEntries = [{"date":"রিলিজ হয়েছে — মে ২০২৫","name":"অ্যানালিটিক্স স্যুট রিলিজ","changes":["রেভিনিউ ট্রেন্ড এবং কুরিয়ার পারফরম্যান্স চার্ট সহ সম্পূর্ণ অ্যানালিটিক্স ড্যাশবোর্ড","ইউনিফাইড ট্র্যাকিং হাব — এক ইন্টারফেস থেকে সব পিক্সেল ম্যানেজ করুন","অটো-রিফ্রেশ স্ট্যাটাস সহ লাইভ ব্যাকগ্রাউন্ড পোলিং","ডুয়াল-থিম ডিজাইন সিস্টেম — গ্লাসমরফিজম লাইট ও ডার্ক মোড","ডেপ্লয়মেন্টের সময় স্থিতিশীলতার জন্য মিসিং-ফাইল গার্ড"]},{"date":"রিলিজ হয়েছে — এপ্রিল ২০২৫","name":"ফ্রড শিল্ড এবং CAPI ইভেন্ট","changes":["ফোন, আইপি এবং ইমেইল ঠিকানা দিয়ে গ্লোবাল ব্ল্যাকলিস্ট","ভেলোসিটি লিমিট — প্রতি ইউজার প্রতিদিন সর্বোচ্চ অর্ডার","OrderDelivered ও OrderReturned Meta CAPI ইভেন্ট","WooCommerce অর্ডার টেবিলে এক-ক্লিক ব্লক বাটন"]},{"date":"রিলিজ হয়েছে — মার্চ ২০২৫","name":"RedX ইন্টিগ্রেশন এবং লিড ক্যাপচার","changes":["অটো স্ট্যাটাস সিঙ্ক সহ RedX কুরিয়ার ডিপ ইন্টিগ্রেশন","অসম্পূর্ণ অর্ডার ক্যাপচার — রিয়েল-টাইমে চেকআউট ফিল্ড সেভ করে","লিড দেখার এবং কনভার্ট করার জন্য লিড ম্যানেজমেন্ট ইন্টারফেস","ধীরগতির নেটওয়ার্কে Pathao API টাইমআউট হ্যান্ডলিং"]}];


import { motion } from "framer-motion";
import { changelogEntries } from "@/data/changelog";


const ease = [0.22, 1, 0.36, 1] as const;

export default function ChangelogClient() {
  const tagLabels: Record<string, { label: string; className: string }> = {
    new: { label: "🆕 নতুন", className: "ct-new" },
    imp: { label: "⬆ উন্নত", className: "ct-imp" },
    fix: { label: "🐛 ফিক্সড", className: "ct-fix" },
  };

  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1280px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">চেঞ্জলগ</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(30px,4vw,50px)", letterSpacing: "-2px" }}
          >
            ConversionFlow-এ নতুন কী
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "480px", margin: "0 auto" }}
          >
            প্রতিটি আপডেট স্বচ্ছভাবে ডকুমেন্ট করা। নতুন ফিচার, উন্নতি এবং বাগ ফিক্স সহ নিয়মিত রিলিজ।
          </motion.p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="clog-list" style={{ maxWidth: "800px", margin: "0 auto" }}>
            {changelogEntries.map((entry, i) => (
              <motion.div
                key={entry.version}
                className="clog-item"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
              >
                <div
                  className="clog-v"
                  style={!entry.isLatest ? { background: "var(--surface2)", color: "var(--text2)", border: "1px solid var(--border)" } : undefined}
                >
                  {entry.version}
                </div>
                <div className="clog-date">{bnEntries[i].date}</div>
                <div className="clog-name">{bnEntries[i].name}</div>
                <div className="clog-changes">
                  {entry.changes.map((change, j) => {
                    const tag = tagLabels[change.type];
                    // Use bnEntries data
                    var localizedText = bnEntries[i] ? bnEntries[i].changes[j] : change.text;
                    return (
                      <div key={j} className="clog-entry">
                        <span className={`clog-tag ${tag.className}`}>{tag.label}</span>
                        <span>{localizedText}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
