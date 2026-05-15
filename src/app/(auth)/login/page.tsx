import SignInForm from "@/components/auth/SignInForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent items-center justify-center">
        <div className="text-white text-center px-12">
          <h1 className="font-heading text-4xl font-bold mb-4">
            ConversionFlow
          </h1>
          <p className="text-lg opacity-90">
            WooCommerce automation for Bangladeshi eCommerce
          </p>
        </div>
      </div>
      {/* Right: Sign-in form */}
      <SignInForm />
    </div>
  );
}
