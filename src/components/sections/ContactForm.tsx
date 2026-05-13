"use client";

import { useState } from "react";
import { useT } from "@/lib/useT";

type EnquiryType = "pre-sales" | "support" | "others" | "";

interface FormData {
  name: string;
  phone: string;
  email: string;
  enquiry: EnquiryType;
  // support-specific
  licenseKey: string;
  website: string;
  subject: string;
  // pre-sales-specific
  product: string;
  // shared
  message: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  enquiry?: string;
  subject?: string;
  message?: string;
}

const INIT: FormData = {
  name: "", phone: "", email: "", enquiry: "",
  licenseKey: "", website: "", subject: "", product: "", message: "",
};

export function ContactForm() {
  const t = useT();
  const [form, setForm] = useState<FormData>(INIT);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = t.contactForm.errName;
    if (!form.phone.trim()) e.phone = t.contactForm.errPhone;
    if (!form.email.trim()) e.email = t.contactForm.errEmail;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t.contactForm.errEmailInvalid;
    if (!form.enquiry) e.enquiry = t.contactForm.errEnquiry;
    if (form.enquiry === "support" && !form.subject.trim()) e.subject = t.contactForm.errSubject;
    if (!form.message.trim()) e.message = t.contactForm.errMessage;
    else if (form.message.trim().length < 10) e.message = t.contactForm.errMessageShort;
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitted(true);
  }

  const err = (msg?: string) => msg ? (
    <span className="cf-error">{msg}</span>
  ) : null;

  const messagePlaceholder =
    form.enquiry === "pre-sales" ? t.contactForm.preSalesMessagePlaceholder
    : form.enquiry === "others" ? t.contactForm.othersMessagePlaceholder
    : t.contactForm.messagePlaceholder;

  if (submitted) {
    return (
      <div className="contact-form" style={{ textAlign: "center", padding: "60px 40px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px", color: "var(--green)" }}>✓</div>
        <div className="sec-title" style={{ fontSize: "24px" }}>{t.contactForm.successTitle}</div>
        <p className="sec-sub">{t.contactForm.successSub}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">

      {/* Row 1: Name + Phone */}
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="cf-name">{t.contactForm.nameLabel}</label>
          <input id="cf-name" className="form-input" type="text" placeholder={t.contactForm.namePlaceholder} value={form.name} onChange={set("name")} />
          {err(errors.name)}
        </div>
        <div className="form-group">
          <label htmlFor="cf-phone">{t.contactForm.phoneLabel}</label>
          <input id="cf-phone" className="form-input" type="tel" placeholder={t.contactForm.phonePlaceholder} value={form.phone} onChange={set("phone")} />
          {err(errors.phone)}
        </div>
      </div>

      {/* Row 2: Email + Enquiry */}
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="cf-email">{t.contactForm.emailLabel}</label>
          <input id="cf-email" className="form-input" type="email" placeholder={t.contactForm.emailPlaceholder} value={form.email} onChange={set("email")} />
          {err(errors.email)}
        </div>
        <div className="form-group">
          <label htmlFor="cf-enquiry">{t.contactForm.enquiryLabel}</label>
          <select id="cf-enquiry" className="form-input form-select" value={form.enquiry} onChange={set("enquiry")}>
            <option value="">{t.contactForm.enquiryPlaceholder}</option>
            <option value="pre-sales">{t.contactForm.enquiryPreSales}</option>
            <option value="support">{t.contactForm.enquirySupport}</option>
            <option value="others">{t.contactForm.enquiryOthers}</option>
          </select>
          {err(errors.enquiry)}
        </div>
      </div>

      {/* Conditional: Support fields */}
      {form.enquiry === "support" && (
        <div className="form-grid cf-animate">
          <div className="form-group">
            <label htmlFor="cf-license">{t.contactForm.licenseLabel}</label>
            <input id="cf-license" className="form-input" type="text" placeholder={t.contactForm.licensePlaceholder} value={form.licenseKey} onChange={set("licenseKey")} />
          </div>
          <div className="form-group">
            <label htmlFor="cf-website">{t.contactForm.websiteLabel}</label>
            <input id="cf-website" className="form-input" type="url" placeholder={t.contactForm.websitePlaceholder} value={form.website} onChange={set("website")} />
          </div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="cf-subject">{t.contactForm.subjectLabel}</label>
            <input id="cf-subject" className="form-input" type="text" placeholder={t.contactForm.subjectPlaceholder} value={form.subject} onChange={set("subject")} />
            {err(errors.subject)}
          </div>
        </div>
      )}

      {/* Conditional: Pre-Sales fields */}
      {form.enquiry === "pre-sales" && (
        <div className="form-grid cf-animate">
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="cf-product">{t.contactForm.productLabel}</label>
            <input id="cf-product" className="form-input" type="text" placeholder={t.contactForm.productPlaceholder} value={form.product} onChange={set("product")} />
          </div>
        </div>
      )}

      {/* Message — always shown once enquiry is selected */}
      {form.enquiry && (
        <div className="form-group cf-animate" style={{ marginBottom: "20px" }}>
          <label htmlFor="cf-message">{t.contactForm.messageLabel}</label>
          <textarea id="cf-message" className="form-input" placeholder={messagePlaceholder} value={form.message} onChange={set("message")} />
          {err(errors.message)}
        </div>
      )}

      {/* Message shown before enquiry selection too */}
      {!form.enquiry && (
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label htmlFor="cf-message">{t.contactForm.messageLabel}</label>
          <textarea id="cf-message" className="form-input" placeholder={t.contactForm.messagePlaceholder} value={form.message} onChange={set("message")} />
          {err(errors.message)}
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-lg" style={{ cursor: "pointer" }}>
        {t.contactForm.submit}
      </button>
    </form>
  );
}
