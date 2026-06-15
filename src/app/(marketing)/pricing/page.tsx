import { createPageMetadata } from "@/lib/seo";
import PricingClient from "@/components/pricing/PricingClient";
import { ScrollReveal } from "@/components/layout/ScrollReveal";
import { getPublicPlans, derivePeriod } from "@/lib/plans";

export const generateMetadata = () => createPageMetadata("pricing", "en");

// ISR safety net; admin plan mutations call revalidatePath("/pricing")
// which is the authoritative invalidation. This just bounds staleness.
export const revalidate = 3600;

export default async function PricingPage() {
  const plans = await getPublicPlans();
  // Pre-compute the period string server-side; pass a serializable shape to
  // the client so the client never needs to touch the billing-cycle enums.
  const plansWithPeriod = plans.map((p) => ({
    ...p,
    period: derivePeriod({
      licenseType: p.licenseType,
      billingCycle: p.billingCycle,
      billingDurationMonths: p.billingDurationMonths,
    }),
  }));
  return (
    <ScrollReveal>
      <PricingClient plans={plansWithPeriod} />
    </ScrollReveal>
  );
}
