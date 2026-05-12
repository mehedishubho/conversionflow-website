"use client";

import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  licenseKey: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    licenseKey: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const update =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Please enter a valid email address";
    if (!formData.subject.trim()) errs.subject = "Subject is required";
    if (!formData.message.trim()) errs.message = "Message is required";
    else if (formData.message.trim().length < 10)
      errs.message = "Message must be at least 10 characters";
    return errs;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    // D-06: Success without actual email sending (Resend deferred)
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className="contact-form"
        style={{ textAlign: "center", padding: "60px 40px" }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px", color: "var(--green)" }}>
          &#10003;
        </div>
        <div className="sec-title" style={{ fontSize: "24px" }}>
          Message Sent!
        </div>
        <p className="sec-sub">We&apos;ll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input
            id="name"
            name="name"
            className="form-input"
            type="text"
            placeholder="Rahim Ahmed"
            value={formData.name}
            onChange={update("name")}
          />
          {errors.name && (
            <span style={{ color: "var(--red)", fontSize: "12px", marginTop: "2px" }}>
              {errors.name}
            </span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            className="form-input"
            type="email"
            placeholder="rahim@store.com"
            value={formData.email}
            onChange={update("email")}
          />
          {errors.email && (
            <span style={{ color: "var(--red)", fontSize: "12px", marginTop: "2px" }}>
              {errors.email}
            </span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="licenseKey">License Key</label>
          <input
            id="licenseKey"
            name="licenseKey"
            className="form-input"
            type="text"
            placeholder="WB-XXXX-XXXX-XXXX"
            value={formData.licenseKey}
            onChange={update("licenseKey")}
          />
        </div>
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            name="subject"
            className="form-input"
            type="text"
            placeholder="Steadfast sync not working"
            value={formData.subject}
            onChange={update("subject")}
          />
          {errors.subject && (
            <span style={{ color: "var(--red)", fontSize: "12px", marginTop: "2px" }}>
              {errors.subject}
            </span>
          )}
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: "20px" }}>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          className="form-input"
          placeholder="Describe your issue in detail..."
          value={formData.message}
          onChange={update("message")}
        />
        {errors.message && (
          <span style={{ color: "var(--red)", fontSize: "12px", marginTop: "2px" }}>
            {errors.message}
          </span>
        )}
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-lg"
        style={{ cursor: "pointer" }}
      >
        Send Message →
      </button>
    </form>
  );
}
