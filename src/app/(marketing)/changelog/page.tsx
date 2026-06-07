import type { Metadata } from "next";
import ChangelogClient from "@/components/changelog/ChangelogClient";

export const metadata: Metadata = {
  title: "Changelog",
  description: "See what's new in ConversionFlow. Release notes, bug fixes, and feature updates for every version.",
};
import { ScrollReveal } from "@/components/layout/ScrollReveal";

export default function ChangelogPage() {
  return (
    <ScrollReveal>
      <ChangelogClient />
    </ScrollReveal>
  );
}
