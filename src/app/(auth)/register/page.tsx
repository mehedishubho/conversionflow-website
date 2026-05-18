import SignUpForm from "@/components/auth/SignUpForm";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent items-center justify-center">
        <div className="text-white text-center px-12">
          <h1 className="font-heading text-4xl font-bold mb-4">
            ConversionFlow
          </h1>
          <p className="text-lg opacity-90">
            Start automating your WooCommerce store today
          </p>
        </div>
      </div>
      {/* Right: Sign-up form */}
      <Suspense>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
