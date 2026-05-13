interface NavLink {
  name: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Changelog", href: "/changelog" },
  { name: "Support", href: "/support" },
];

export const footerProductLinks: NavLink[] = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Changelog", href: "/changelog" },
  { name: "Documentation", href: "/docs" },
  { name: "Support", href: "/support" },
];

export const footerResourceLinks: NavLink[] = [
  { name: "Blog", href: "/blog" },
  { name: "Devsroom", href: "https://devsroom.com" },
  { name: "WPMHS", href: "https://wpmhs.com" },
  { name: "WhatsApp BD", href: "https://wa.me/8801721328992" },
  { name: "mhs@wpmhs.com", href: "mailto:mhs@wpmhs.com" },
];

export const footerLegalLinks: NavLink[] = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Refund Policy", href: "/refund" },
  { name: "License Agreement", href: "/license" },
];
