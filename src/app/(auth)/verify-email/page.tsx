"use client";

import { sendVerificationEmail } from "@/lib/auth-client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Better Auth verify-email is a GET endpoint that handles verification
      // The token in URL means the user clicked the email link
      // We verify by calling the verify-email endpoint directly
      fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
        .then(async (res) => {
          const data = await res.json();
          if (res.ok && data.status) {
            setStatus("success");
            setMessage("Your email has been verified successfully.");
          } else {
            setStatus("error");
            setMessage(data.message || "Email verification failed. The link may have expired.");
          }
        })
        .catch(() => {
          setStatus("error");
          setMessage("Email verification failed. Please try again.");
        });
    } else {
      setStatus("error");
      setMessage("No verification token found in the URL.");
    }
  }, [searchParams]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail) return;

    setResendStatus("sending");
    try {
      const result = await sendVerificationEmail({
        email: resendEmail,
        callbackURL: "/verify-email",
      });
      if (result.error) {
        setResendStatus("error");
      } else {
        setResendStatus("sent");
      }
    } catch {
      setResendStatus("error");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Email Verification
          </h1>
          {status === "loading" && (
            <p className="text-muted">Verifying your email...</p>
          )}
          {status === "success" && (
            <>
              <div className="mb-4 p-3 rounded-lg bg-green-lt text-green border border-green/20">
                {message}
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white rounded-lg bg-accent hover:bg-accent-2 transition-colors"
              >
                Go to Dashboard
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <div className="mb-4 p-3 rounded-lg bg-red-lt text-red border border-red/20">
                {message}
              </div>
              <div className="mt-6 text-left">
                <p className="text-sm text-muted mb-3">
                  Need a new verification link? Enter your email below:
                </p>
                <form onSubmit={handleResend} className="space-y-3">
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 text-sm rounded-lg bg-surface border border-border2 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={resendStatus === "sending"}
                    className="w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-accent hover:bg-accent-2 disabled:opacity-50 transition-colors"
                  >
                    {resendStatus === "sending" ? "Sending..." : "Resend Verification Email"}
                  </button>
                  {resendStatus === "sent" && (
                    <p className="text-sm text-green">
                      Verification email sent. Check your inbox.
                    </p>
                  )}
                  {resendStatus === "error" && (
                    <p className="text-sm text-red">
                      Failed to send verification email. Please try again.
                    </p>
                  )}
                </form>
              </div>
            </>
          )}
        </div>
        {status !== "loading" && (
          <p className="text-center text-sm text-muted">
            <Link href="/login" className="text-accent hover:text-accent-2 transition-colors">
              Back to Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted">Loading...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
