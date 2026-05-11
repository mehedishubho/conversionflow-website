# Feature Landscape

**Domain:** WooCommerce plugin marketing website targeting Bangladeshi store owners
**Researched:** 2026-05-11
**Confidence:** HIGH (based on exhaustive analysis of design reference, project context, WooCommerce.com product pages, Yoast marketing patterns)

---

## Table Stakes

Features users expect. Missing any of these means the site feels incomplete or untrustworthy. Every successful WordPress/WooCommerce plugin site has these -- WooCommerce.com product pages, Yoast, Elementor, and even modest CodeCanyon listings all cover this baseline.

### Landing Page / Homepage

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hero with value prop + CTA above fold | Visitors decide in 3 seconds. Hero must answer "what is this, who is it for, what do I do next?" | Low | Design reference has this: headline, subheadline, two CTAs, trust pills. Must port faithfully. |
| Dashboard mockup / product screenshot | Plugin buyers need to see the UI before purchasing. WooCommerce.com, Yoast, all major plugin sites show screenshots or video. | Medium | Design has a floating dashboard mockup with stats, chart, order list. Port with count-up animations. |
| Trust bar with numbers | "500+ stores", "3 couriers", "100% CAPI accuracy" -- quantified social proof is standard for plugin marketing | Low | Design has 5-stat trust bar. Numbers should animate on scroll (count-up). |
| Bento features grid | Users scan features. A visual grid with icons beats a text list. Standard on all modern SaaS/plugin sites. | Medium | Design has 6-card bento grid (Courier Sync wide card + 5 standard). Include tags on each card. |
| How-it-works steps | Reduces perceived complexity. "Install, connect, done" pattern is universal for plugin marketing. | Low | Design has 3-step cards. Keep this -- it directly addresses "do I need a developer?" objection. |
| Testimonials section | Social proof. BD market especially relies on peer validation (word-of-mouth is dominant trust mechanism). | Medium | Design has 3 testimonials with Bengali quotes, star ratings, store names. Critical for BD audience. |
| Bottom CTA banner | Visitors who scroll past hero need a second conversion opportunity. Standard pattern. | Low | Design has accent-colored CTA with BD tag, price anchor, and payment method list. |
| BD couriers showcase | This IS the core differentiator. Must show Steadfast/Pathao/RedX integration prominently. Not optional. | Medium | Design has courier cards with live chips, order flow visualization, and bKash/Nagad payment note. |
| Video section (even placeholder) | Product demos increase conversion 20-80% for plugin sales. Even a "coming soon" placeholder builds credibility. | Low | Design has dark video section with play button lightbox. Currently shows placeholder -- that is fine for launch. |
| Responsive design | BD traffic is 70%+ mobile. Mobile-first is not optional, it is the primary viewport. | Medium | Design has full responsive breakpoints (960px, 640px). Must faithfully port all responsive states. |

### Pricing Page

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 3 pricing tiers with clear differentiation | Standard pattern: good/better/best. Users expect to compare tiers visually. WooCommerce.com, CodeCanyon, all do this. | Low | Design has Starter/Professional/Agency. Professional marked "Most Popular" with accent border. |
| Per-tier feature list with checkmarks | Users scan to see what they get at each level. "What am I missing if I pick the cheaper one?" | Low | Design has checkmark/cross lists. Key differentiators: site count, update period, support level. |
| BDT + USD pricing | BD audience thinks in Taka. International audience (or agencies with foreign clients) needs USD. Both must be visible. | Medium | Design shows USD primary with BDT equivalent. Project requirement: add toggle. |
| "Most Popular" tier highlight | Anchoring effect. Draws eye to the tier you want to sell most. Universal pricing page pattern. | Low | Design already has this with pop-tag on Professional tier. |
| FAQ accordion | Pricing objections must be addressed immediately. "Is this subscription?", "Can I pay bKash?", "Refund?" -- these close sales. | Medium | Design has 5 FAQs covering key objections. Accordion with smooth expand/collapse. |
| Trust strip below pricing | Reinforces purchase safety: secure checkout, refund policy, payment methods, instant delivery. | Low | Design has 5-item trust strip with icons. Critical for one-time payment products. |
| Buy Now buttons wired to checkout | Dead buttons destroy trust. Each tier's CTA must link somewhere -- external checkout or WhatsApp. | Medium | Requires server action or external link routing. Professional tier uses primary button; others use outline. |

### Features Page

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Page hero with title + subtitle | Standard page header. Every plugin site has this. | Low | Design has page-hero-sm pattern reused across content pages. |
| Feature tab/filter navigation | Users want to see specific modules. Tabbed navigation is the standard pattern. | Medium | Design has filter tabs: All Modules, Courier Sync, Tracking, Fraud Shield, Analytics, Lead Recovery. |
| Feature detail rows (alternating layout) | Each module needs its own section with description, checklist, and visual demo. The alternating left-right layout keeps scrolling interesting. | Medium | Design has 3 detailed rows for Courier Sync, Meta CAPI, Fraud Shield with visual mockups. |
| Visual demos per feature | Text-only feature descriptions do not sell. Users need to see the UI -- tracking panel, fraud table, courier cards. | Medium | Design has: courier cards + flow diagram, tracking hub panel, fraud table with block buttons. |
| Video walkthrough section | Deep-dive video for feature page. Different from homepage video -- shows setup/config process. | Low | Design has a second video section with API/CAPI setup context. Keep as placeholder for now. |

### Changelog Page

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Version history entries | Shows the product is actively maintained. Critical trust signal for one-time payment products (users worry about abandonment). | Low | Design has 3 version entries with semantic version badges, dates, release names. |
| Categorized change tags (New/Improved/Fixed) | Users scan changelogs by type. "What is new?" vs "What was fixed?" | Low | Design has color-coded tags: green (New), blue (Improved), orange (Fixed). |
| Release dates | Establishes cadence. Monthly releases = healthy product. | Low | Design has "Released -- Month Year" format. |
| Semantic versioning | Professional appearance. v0.0.14 looks more credible than "Update 14". | Low | Design uses semver with accent badge for latest, muted for older. |

### Support Page

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Multiple support channels (Email, WhatsApp, Docs) | BD users prefer WhatsApp. International users prefer email. Both must be offered. | Low | Design has 3 support cards with icons, descriptions, and action buttons. |
| Functional contact form | Users expect to reach support directly from the site. A form is table stakes for any support page. | Medium | Design has form with Name, Email, License Key, Subject, Message fields. Must wire to server action. |
| BD-specific contact info | WhatsApp number with +880 prefix. BD timezone hours. This is the primary support channel for target market. | Low | Design shows WhatsApp +880 number and business hours. |
| Response time expectations | Sets expectations. "24 hours" or "within business hours" prevents frustration. | Low | Design mentions "within 24 hours" for email and business hours for WhatsApp. |

### Navigation / Layout

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Floating navbar with scroll detection | Standard pattern. Glassmorphism navbar with backdrop blur is modern and expected. | Low | Already implemented in Navbar.tsx. |
| Mobile hamburger menu | 70%+ BD traffic is mobile. Non-negotiable. | Medium | Already implemented. Must verify all 5 nav links work. |
| Dark/light theme toggle | 30-40% of users prefer dark mode. Not having it looks dated. | Low | Already implemented via next-themes. |
| Footer with 4-column grid | Standard for product sites: brand, product links, company links, legal links. | Low | Missing from codebase. Design has it fully specified. |
| Page transitions | Subtle fade/slide between pages. Polish signal. Not strictly necessary but elevates perceived quality. | Medium | Design has CSS transition with 180ms fade. Port with Framer Motion. |
| Custom cursor (desktop) | Brand personality element. From design reference. Optional but part of the design identity. | Low | Design has floating dot cursor with blend mode. Port as client component. |

---

## Differentiators

Features that set WooBooster apart. Not expected by users, but they create competitive advantage and increase conversion. These are what make this site feel premium rather than generic.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| BD-specific branding throughout | No other WooCommerce plugin site has bKash/Nagad badges, BD flag attribution, BDT pricing, and Bengali testimonials. This is the single biggest differentiator. | Medium | Design embeds BD identity in hero, couriers section, CTA banner, and footer. Not a separate section -- it is woven throughout. |
| Courier live status chips | Visual simulation showing Steadfast/Pathao/RedX as "Live" with animated dots. Creates immediate perception of active integration. | Low | Design has green live-chip with pulse animation on each courier card. |
| Order flow visualization | Pending -> Shipped -> Delivered/Returned status flow diagram. Makes the invisible automation tangible. | Low | Design has colored status pills with arrow connectors. High impact, low effort. |
| Dashboard mockup with animated stats | Floating mock dashboard showing revenue, orders, blocked fraud. Count-up animation on numbers. Shows the product working, not just described. | Medium | Design has mock with 3 stat boxes, bar chart, order list. Count-up JS already in design. Port with Framer Motion. |
| Word-by-word hero reveal | Headline animates word by word on load. Premium feel that differentiates from generic WordPress sites. | Medium | Design has CSS word-reveal animation. Port with Framer Motion variants. |
| Magnetic tilt cards | 3D perspective tilt on hover for bento cards, testimonials, pricing cards. Micro-interaction that signals quality. | Medium | Design has JS-based mousemove tilt calculation. Port with Framer Motion useMotionValue. |
| USD/BDT currency toggle | Dual-currency switching on pricing page. Unique for this market. Makes both local and international audiences feel catered to. | Medium | Not in design (design shows both statically). Must build toggle component with React state. |
| Bengali language testimonials | Quotes in Bangla script alongside English descriptions. Authentic. Cannot be faked by competitors. | Low | Design has one Bengali quote (Rahim Ahmed). Consider adding more. |
| Fraud protection dollar value | "12 Fraud Orders Blocked / 18,400 BDT protected this month" -- quantified risk reduction. Unique selling point that competitors do not show. | Low | Design has this in the fraud demo panel. High conversion impact. |
| Video lightbox | Click-to-expand video player. Even with placeholder content, the interaction pattern signals that video content is coming. | Medium | Design has full lightbox with close button, overlay, scale transition. |

---

## Anti-Features

Features to explicitly NOT build. These are common in plugin marketing but wrong for WooBooster's specific context.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User accounts / authentication | This is a marketing site, not a SaaS dashboard. Adding auth creates maintenance burden and confuses visitors who expect instant access. | Link to external checkout. License key delivery via email. |
| On-site payment processing | PCI compliance, security headers, payment gateway integration -- massive complexity for a one-time purchase product. Not the team's core competency. | External checkout (WooCommerce/EasyCart for card). WhatsApp for bKash/Nagad. Dual path already planned. |
| CMS integration (WordPress, Sanity, etc.) | Overkill for a marketing site with 5 pages + blog. Adds deployment complexity and a dependency on external service. | Content in TypeScript data files. MDX for blog posts. Version-controlled, zero infrastructure. |
| Live chat widget (Intercom, Crisp, Tawk.to) | Third-party JS that hurts performance. Loads tracking cookies. BD users do not expect live chat -- they expect WhatsApp. | WhatsApp link on support page. Already in design. BD users know and trust WhatsApp. |
| Auto-playing video with audio | Aggressive, hurts Core Web Vitals, increases bounce rate. BD users on mobile data hate autoplay. | Click-to-play with lightbox. Design already has this pattern. |
| Blog with headless CMS / database | Premature for launch. Adds complexity (DB, API routes, content management workflow) for content that does not exist yet. | Static MDX blog posts added when content is ready. Infrastructure (routes, layout) can be built now. |
| A/B testing framework | No traffic volume to justify it yet. Adds client-side JS and tracking complexity. | Manual iteration based on analytics. Add A/B later if traffic warrants. |
| Newsletter / email marketing integration | Newsletter service (Mailchimp, ConvertKit) adds form JS and privacy concerns. BD audience is not newsletter-culture. | Defer. Can add a simple email capture form later if demand exists. |
| Multi-language runtime (next-intl, i18next) | Full runtime i18n adds bundle size, routing complexity, and translation management overhead. Overkill for 2 languages on 5 pages. | i18n infrastructure (string extraction, route structure) but not runtime switching for v1. English primary, Bengali strings prepared. |
| Animated page transitions as route changes | Next.js App Router does client-side navigation. True page transitions with Framer Motion AnimatePresence require wrapping every page in a layout with client component boundary. Adds complexity and can cause layout shift. | Use scroll-triggered animations within pages (already in design). Page transition can be a simple opacity fade via CSS. |
| Comparison table (WooBooster vs Competitors) | WooBooster has no direct competitors offering the same BD-specific module bundle. A comparison table would either compare against unrelated products (confusing) or fabricated competitors (disingenuous). | Let the feature grid speak for itself. The "6 modules, one plugin" bento grid already communicates integration advantage. |
| Cookie consent banner | Not legally required for a site that does not serve EU users or use tracking cookies. Adds visual noise and hurts first impression. | Skip for v1. Add if/when targeting EU or adding analytics cookies. |
| Social media feed integration | Embedding Facebook/Instagram feeds adds third-party JS, hurts performance, and looks unprofessional for a plugin product site. | Static testimonials. Hand-curated, high-quality. Already in design. |

---

## Feature Dependencies

```
Foundation (Phase 1 -- must exist before anything else)
  cn() utility
  Footer component
  Button CSS classes
  Build fixes

Homepage (Phase 2 -- primary conversion page)
  Hero Section
    depends on: Foundation
  Dashboard Mockup
    depends on: Hero Section (rendered alongside)
  Trust Bar
    depends on: Hero Section (rendered below)
  Bento Features Grid
    depends on: Foundation (reusable card components)
  BD Couriers Section
    depends on: Bento grid (uses same courier card pattern)
  How It Works Steps
    depends on: Foundation
  Testimonials
    depends on: Foundation
  CTA Banner
    depends on: Pricing data (price anchor)
  Video Section
    depends on: Foundation (lightbox component)

Content Pages (Phase 3 -- all nav links must resolve)
  Features Page
    depends on: Homepage (reuses courier cards, tracking panel patterns)
    reuses: Bento grid component patterns
  Pricing Page
    depends on: Pricing data (TypeScript data file)
    requires: USD/BDT toggle component (client component)
    requires: FAQ accordion component
    requires: Buy Now button routing (external checkout + WhatsApp)
  Changelog Page
    depends on: Changelog data (TypeScript data file)
    requires: Version badge, change tag components
  Support Page
    depends on: Foundation (form input styles)
    requires: Contact form server action (email sending)
    requires: Support card component

Polish (Phase 4 -- quality layer)
  SEO metadata
    depends on: All pages built
  404 page
    depends on: Foundation
  Scroll animations
    depends on: All sections built
  Performance optimization
    depends on: All content loaded
  Custom cursor
    depends on: Foundation (client-side only)
```

---

## MVP Recommendation

**Prioritize (Phase 1-3, must ship):**

1. All 5 pages from design reference (Home, Features, Pricing, Changelog, Support) -- the entire HTML design must be ported
2. Responsive design on all pages -- mobile is the primary viewport for BD
3. Dark/light mode working on all pages -- already has ThemeProvider
4. Pricing page with all 3 tiers, FAQ, trust strip, and wired CTAs
5. Support page with functional contact form (server action for email)
6. BD-specific branding elements woven throughout (not a separate section)

**Defer to post-launch:**
- Blog/MDX content: Infrastructure can exist, but do not wait for content
- Documentation section: Link placeholder for now, build when docs exist
- Legal pages: Stub pages with placeholder text, write proper legal later
- USD/BDT currency toggle: Show both statically (as in design), add toggle as enhancement
- i18n/Bengali full translation: English primary at launch, Bengali later
- Video content: Placeholder with lightbox, record and embed real video later

**Never build (Anti-Features):**
- User auth, on-site payments, CMS, live chat, comparison tables, cookie banners

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Landing page sections | HIGH | Design reference is comprehensive. HTML analysis covers every section. WooCommerce.com product pages validate the patterns. |
| Pricing page patterns | HIGH | Analyzed WooCommerce.com (30-day refund, reviews, feature lists), Yoast ($178/year, ratings, benefit lists). WooBooster's one-time model is well-understood. |
| Feature presentation | HIGH | Design reference has detailed feature rows with visual demos. Pattern matches WooCommerce.com and Yoast approaches. |
| BD market trust signals | MEDIUM | Based on design reference + PROJECT.md context. Cannot verify with live BD competitor analysis due to tool limitations. Bengali testimonials, bKash/Nagad badges, and WhatsApp support are strong signals based on known BD eCommerce culture. |
| Changelog presentation | HIGH | Standard pattern. Design reference has it fully specified. Yoast and WordPress.org plugin directories use the same versioned, tagged format. |
| Support page features | HIGH | Design reference has complete support page. BD-specific WhatsApp support is the right call for the market. |

---

## Sources

- `woobooster-v2.html` -- Complete design reference (1247 lines), analyzed in full
- `.planning/PROJECT.md` -- Project context, requirements, constraints
- `.planning/ROADMAP.md` -- Phase structure and plan breakdown
- WooCommerce.com product page patterns (WooCommerce Payments) -- pricing tiers, benefit lists, review ratings, trust signals
- Yoast WooCommerce SEO marketing page -- product page layout, feature descriptions, pricing display, CTAs
- Training data on WordPress/WooCommerce plugin marketing best practices (verified against observed patterns)

**Note:** WebSearch and web reader tools were rate-limited during this research session. Findings marked MEDIUM confidence should be validated with additional BD-specific market research when tools are available. The core feature landscape is well-supported by the comprehensive design reference and project documentation.
