"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { completeSetup } from "./actions";

export default function SetupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        email,
        password,
        name,
        fetchOptions: {
          body: {
            phone: "+880000000000",
          },
        },
      });

      if (result.error) {
        setError(result.error.message || "Failed to create account");
        setLoading(false);
        return;
      }

      if (result.data?.user?.id) {
        const setupResult = await completeSetup(result.data.user.id);

        if (setupResult.error) {
          setError(setupResult.error);
          setLoading(false);
          return;
        }

        router.push("/admin/dashboard");
      } else {
        setError("Account created but user ID not returned. Please log in manually.");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-6">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-foreground text-2xl sm:text-3xl">
              Initial Admin Setup
            </h1>
            <p className="text-sm text-muted">
              Create the first super admin account for ConversionFlow
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {error && (
                  <div className="p-3 text-sm rounded-lg bg-red-lt text-red border border-red/20">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-foreground">
                    Full Name <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Admin Name"
                    required
                    className="w-full px-4 py-3 text-sm rounded-lg bg-surface border border-border2 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-foreground">
                    Email <span className="text-red">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    className="w-full px-4 py-3 text-sm rounded-lg bg-surface border border-border2 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-foreground">
                    Password <span className="text-red">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      className="w-full px-4 py-3 text-sm rounded-lg bg-surface border border-border2 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute -translate-y-1/2 cursor-pointer right-3 top-1/2 text-muted hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-foreground">
                    Confirm Password <span className="text-red">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    minLength={8}
                    className="w-full px-4 py-3 text-sm rounded-lg bg-surface border border-border2 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-accent hover:bg-accent-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating Admin Account..." : "Create Super Admin Account"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
