export const siteConfig = {
  name: "ConversionFlow",
  legalName: "Devsroom ConversionFlow",
  url: "https://salesconversionflow.com",
  supportEmail: "support@salesconversionflow.com",
  businessEmail: "mhs@wpmhs.com",
  whatsappUrl: "https://wa.me/8801721328992",
  plausibleDomain: "salesconversionflow.com",
  plausibleScriptSrc: "https://plausible.salesconversionflow.com/js/script.js",
};

export function getLocalizedUrl(locale: string, path = "") {
  const prefix = locale === "bn" ? "" : `/${locale}`;
  return `${siteConfig.url}${prefix}${path}`;
}
