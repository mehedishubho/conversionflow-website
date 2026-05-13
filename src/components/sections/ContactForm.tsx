"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("contactForm");
  const [form, setForm] = useState<FormData>(INIT);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = t("errName");
    if (!form.phone.trim()) e.phone = t("errPhone");
    if (!form.email.trim()) e.email = t("errEmail");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t("errEmailInvalid");
    if (!form.enquiry) e.enquiry = t("errEnquiry");
    if (form.enquiry === "support" && !form.subject.trim()) e.subject = t("errSubject");
    if (!form.message.trim()) e.message = t("errMessage");
    else if (form.message.trim().length < 10) e.message = t("errMessageShort");
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
    form.enquiry === "pre-sales" ? t("preSalesMessagePlaceholder")
    : form.enquiry === "others" ? t("othersMessagePlaceholder")
    : t("messagePlaceholder");

  if (submitted) {
    return (
      <div className="contact-form" style={{ textAlign: "center", padding: "60px 40px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px", color: "var(--green)" }}>✓</div>
        <div className="sec-title" style={{ fontSize: "24px" }}>{t("successTitle")}</div>
        <p className="sec-sub">{t("successSub")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">

      {/* Row 1: Name + Phone */}
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="cf-name">{t("nameLabel")}</label>
          <input id="cf-name" className="form-input" type="text" placeholder={t("namePlaceholder")} value={form.name} onChange={set("name")} />
          {err(errors.name)}
        </div>
        <div className="form-group">
          <label htmlFor="cf-phone">{t("phoneLabel")}</label>
          <input id="cf-phone" className="form-input" type="tel" placeholder={t("phonePlaceholder")} value={form.phone} onChange={set("phone")} />
          {err(errors.phone)}
        </div>
      </div>

      {/* Row 2: Email + Enquiry */}
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="cf-email">{t("emailLabel")}</label>
          <input id="cf-email" className="form-input" type="email" placeholder={t("emailPlaceholder")} value={form.email} onChange={set("email")} />
          {err(errors.email)}
        </div>
        <div className="form-group">
          <label htmlFor="cf-enquiry">{t("enquiryLabel")}</label>
          <select id="cf-enquiry" className="form-input form-select" value={form.enquiry} onChange={set("enquiry")}>
            <option value="">{t("enquiryPlaceholder")}</option>
            <option value="pre-sales">{t("enquiryPreSales")}</option>
            <option value="support">{t("enquirySupport")}</option>
            <option value="others">{t("enquiryOthers")}</option>
          </select>
          {err(errors.enquiry)}
        </div>
      </div>

      {/* Conditional: Support fields */}
      {form.enquiry === "support" && (
        <div className="form-grid cf-animate">
          <div className="form-group">
            <label htmlFor="cf-license">{t("licenseLabel")}</label>
            <input id="cf-license" className="form-input" type="text" placeholder={t("licensePlaceholder")} value={form.licenseKey} onChange={set("licenseKey")} />
          </div>
          <div className="form-group">
            <label htmlFor="cf-website">{t("websiteLabel")}</label>
            <input id="cf-website" className="form-input" type="url" placeholder={t("websitePlaceholder")} value={form.website} onChange={set("website")} />
          </div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="cf-subject">{t("subjectLabel")}</label>
            <input id="cf-subject" className="form-input" type="text" placeholder={t("subjectPlaceholder")} value={form.subject} onChange={set("subject")} />
            {err(errors.subject)}
          </div>
        </div>
      )}

      {/* Conditional: Pre-Sales fields */}
      {form.enquiry === "pre-sales" && (
        <div className="form-grid cf-animate">
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="cf-product">{t("productLabel")}</label>
            <input id="cf-product" className="form-input" type="text" placeholder={t("productPlaceholder")} value={form.product} onChange={set("product")} />
          </div>
        </div>
      )}

      {/* Message — always shown once enquiry is selected */}
      {form.enquiry && (
        <div className="form-group cf-animate" style={{ marginBottom: "20px" }}>
          <label htmlFor="cf-message">{t("messageLabel")}</label>
          <textarea id="cf-message" className="form-input" placeholder={messagePlaceholder} value={form.message} onChange={set("message")} />
          {err(errors.message)}
        </div>
      )}

      {/* Message shown before enquiry selection too */}
      {!form.enquiry && (
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label htmlFor="cf-message">{t("messageLabel")}</label>
          <textarea id="cf-message" className="form-input" placeholder={t("messagePlaceholder")} value={form.message} onChange={set("message")} />
          {err(errors.message)}
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-lg" style={{ cursor: "pointer" }}>
        {t("submit")}
      </button>
    </form>
  );
}
