# Features Research: WooCommerce Plugin Marketing Site

**Research Date:** 2026-05-11

## Feature Categories

### Table Stakes (Must Have)
These features are expected by users. Without them, the site looks unprofessional.

| Feature | Description | Complexity | WooBooster Status |
|---------|-------------|-----------|-------------------|
| Hero Section | Clear value proposition, CTA above fold | Low | Missing (needs porting from HTML) |
| Features Page | Product capabilities with visual examples | Medium | Missing |
| Pricing Page | Clear tiers, feature comparison, CTA | Medium | Missing |
| Responsive Design | Mobile-first, works on all devices | Medium | Partial (Navbar responsive, rest missing) |
| Dark/Light Mode | Theme toggle, consistent experience | Low | ✓ Exists (ThemeProvider) |
| Fast Loading | < 3s LCP, optimized assets | Medium | Partial (fonts optimized, but missing content) |
| SEO Basics | Title, meta description, OG tags | Low | Partial (basic metadata only) |
| Footer | Navigation, legal links, social proof | Low | Missing (import breaks build) |
| 404 Page | Branded error experience | Low | Missing |
| Favicon | Brand icon in browser tab | Low | Missing (default Next.js icon) |

### Differentiators (Competitive Advantage)
Features that set WooBooster apart from competitors.

| Feature | Description | Complexity | Priority |
|---------|-------------|-----------|----------|
| Changelog Page | Transparency on updates, builds trust | Low | High |
| Support Page | Help resources, contact info | Low | High |
| Interactive Demo | Live preview of plugin features | High | Low (defer) |
| Testimonials | Social proof from real users | Medium | Medium |
| Comparison Table | WooBooster vs competitors | Medium | Medium |
| Blog/Content | SEO-driven content marketing | High | Low (defer) |
| Animated Sections | Scroll-triggered reveals, micro-interactions | Medium | Medium |

### Anti-Features (Deliberately NOT Build)
Things commonly built but wrong for this project.

| Feature | Why Not |
|---------|---------|
| User authentication | Marketing site, not a SaaS app |
| E-commerce/cart | The product IS WooCommerce; site is marketing only |
| Live chat widget | Adds third-party JS; use support page instead |
| Heavy JavaScript frameworks | Keep it light; Next.js + Framer Motion is enough |
| Auto-playing video | Annoying, hurts performance |

## Feature Dependencies

```
Hero Section (no deps)
├── Features Page (needs feature content)
├── Pricing Page (needs pricing tiers)
│   └── Comparison Table (needs competitor data)
├── Changelog Page (needs changelog data)
└── Support Page (needs support channels)
```

## Research Notes

- **WooCommerce ecosystem**: Plugin marketing sites typically feature screenshots, pricing tiers (free/pro/enterprise), feature comparison tables, and WooCommerce integration highlights
- **Trust signals**: Important for plugin marketplaces — money-back guarantee, active installs count, support response time
- **Design patterns**: Most successful WooCommerce plugin sites use a single-page layout with section anchors + dedicated pages for detailed info
- **Reference design**: `woobooster-v2.html` already implements most table stakes features — porting is the primary work
