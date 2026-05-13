Global Design System

PROJECT: Devsroom WooBooster — Premium WooCommerce plugin marketing website
AUDIENCE: Bangladeshi WooCommerce store owners, eCommerce agencies
TONE: Premium SaaS, technically credible, conversion-focused, BD-local
DEFAULT THEME: Light (with full dark mode via header toggle)

━━━ FONTS (PREMIUM) ━━━
Display/Headings : Bricolage Grotesque (wt 400–800) — editorial, modern SaaS
Body : Outfit (wt 300–600) — geometric, clean, premium
Monospace : JetBrains Mono (wt 400–600) — code blocks, order IDs
Load via Google Fonts. NEVER use Inter, Roboto, Arial, Space Grotesk.

━━━ COLOR TOKENS ━━━
[Light Mode]
--bg : #F2F4FD (cool blue-white page base)
--surface : #FFFFFF
--surface2 : #F0F3FF
--border : rgba(0,60,220,.10)
--text : #080E2E (near-black navy)
--text2 : #3B4480
--muted : #7C87BB
--accent : #0047FF (electric blue — primary CTA, icons, links)
--accent2 : #0035CC (hover state)
--accent-lt : rgba(0,71,255,.09)
--accent-glow : rgba(0,71,255,.18)
--green : #00BF7A (success, delivered, live)
--red : #F53B5C (fraud, blocked, danger)
--orange : #FF8800 (pending, warning)

[Dark Mode — data-theme="dark"]
--bg : #050C1F
--surface : #0D1630
--accent : #4D8AFF
--text : #EDF0FF
(all others adjusted accordingly via CSS variables)

━━━ EFFECTS & MOTION ━━━

- Custom glow cursor (lerp-animated dot, mix-blend-mode:multiply/screen)
- Hero: animated radial gradient mesh (CSS keyframes, slow float)
- Hero H1: word-by-word staggered reveal (each word fadeUp 60ms delay)
- Hero highlight word: animated underline scales in after 800ms
- Scroll reveals: IntersectionObserver fade-up with staggered children (0.06s delay per child)
- Bento/Pricing/Testimonial cards: 3D magnetic tilt on mouse move (perspective + rotateX/Y, max 6deg)
- Cards hover: translateY(-3px) + box-shadow increase
- Counter animation: count-up from 0 on scroll-enter (1.8s ease-out)
- Buttons: shimmer light sweep on hover (CSS gradient pseudo-element)
- Dashboard mockup: gentle float animation (translateY 0→-8px loop, 6s)
- Video play button: 3 concentric pulsing rings (ringPulse @keyframes, 2.5s staggered)
- Video player: scale(1.01) on hover, lightbox on click (fade-in overlay + scale-up inner)
- Page transitions: fade + translateY(12px) out, then in (180ms)
- Feature icon on card hover: scale(1.12) + rotate(-5deg)
- Courier cards hover: translateX(4px) slide right
- Nav: spring drop-in on page load (translateY(-24px) → 0, cubic-bezier(.22,1,.36,1))
- Status nodes (Pending/Shipped etc): always visible, color-coded border badges

━━━ LAYOUT RULES ━━━

- Nav: NOT full-width. Floating card — max-width:1160px, centered, rounded-2xl,
  glassmorphism (backdrop-blur + semi-transparent bg), top:16px fixed, border visible.
  Active page: animated blue underline on nav link.
- All sections use .container (max-width:1160px, auto margin, 28px padding)
- Section padding: 100px vertical (72px mobile)
- Card radius: 14px standard, 22px for dashboard mock
- Grid: CSS Grid primary, Flexbox for inline elements
- Mobile: all grids collapse to single column at 640px

Page 1 — Home
SECTION 1: HERO
Layout: 2-column grid (copy left, dashboard mockup right)
Left: - Eyebrow badge: animated pulse dot + "v0.0.14 — Analytics Suite Live" - H1 (Bricolage Grotesque, 58px, wt 800, letter-spacing -2px):
"Run Your WooCommerce Store on Autopilot"
— "Autopilot" is color-highlighted with animated underline - Word-by-word reveal animation on H1 - Subtext (Outfit, 16px): covers courier sync, CAPI, fraud, BD focus - CTA row: [Get WooBooster — ৳3,499] primary + [See Features] ghost - Trust pills: 500+ Active Stores · 30-Day Money Back · bKash & Nagad Ready
Right: - Floating dashboard mockup card (animated float loop) - Shows: revenue stats, 7-bar chart, 4 order rows with status badges - Mock status badges: Delivered (green) / In Transit (blue) / Returned (red) / Pending (orange)
Background: - Animated gradient mesh (radial gradients, slow float keyframes) - Dot grid overlay (radial-gradient dots, 3% opacity)

SECTION 2: TRUST BAR
Full-width white band, 5 stats: 500+ Stores | 3 BD Couriers | 6 Platforms | 100% CAPI | ৳৳৳ BDT
Stat numbers in Bricolage Grotesque, bold. Separated by 1px borders.
Counter animation fires on scroll entry.

SECTION 3: FEATURES BENTO GRID (3-col)
6 cards: Courier Sync (span 2) / Analytics / Fraud Shield / Meta CAPI / Lead Recovery / Premium UI
Each card: icon (animated on hover), Bricolage title, Outfit desc, tag pills
3D magnetic tilt on hover. Emerald glow border on hover.

SECTION 4: VIDEO SECTION (dark cinematic)
Dark background section (#080E2E or deep navy in dark mode)
Eyebrow: "Watch it in action"
Title: "See WooBooster Transform Your Store"
Subtitle: "A 3-minute overview of every module"
Video player: 16:9, rounded-2xl, dark plugin UI thumbnail
Inside thumbnail: dot grid bg + blurred WP admin UI preview cards
Play button: white circle with ▶, centered. 3 pulsing rings around it.
Click → fullscreen lightbox overlay (fade-in, scale from .92 → 1)
Caption below: "▶ WooBooster Full Overview — 3 min · 500+ BD stores use it"

SECTION 5: BANGLADESH SECTION
2-column: left = copy + status flow diagram + checklist; right = 3 courier cards + payment note
Courier cards: Steadfast / Pathao / RedX each with live green badge (pulsing dot)
Status flow: Pending → Shipped → Delivered / Returned (color-coded pill badges)
BD payment note: "bKash · Nagad · Bank Transfer — Pay in BDT"
Courier cards hover: slide right (+translateX 4px)

SECTION 6: HOW IT WORKS
3-step cards with large ghost number (opacity .10) behind each
Steps: 01 Install & Activate · 02 Connect Couriers & Pixels · 03 Watch It Run
Cards: hover lift + border highlight

SECTION 7: TESTIMONIALS
3-column grid. Bengali-language testimonials from real-sounding BD store owners.
Card has large decorative quote mark (top right, 8% opacity)
Stars in amber (#F59E0B). Store name + city shown.
Magnetic 3D tilt on hover.

SECTION 8: CTA BANNER
Full-width accent-blue card, rounded-22px, inside the container (not edge-to-edge)
Radial gradient highlight from top. BD flag tag above heading.
H2: "Start Automating Your Store Today"
White button with hover lift + shadow.
Note below: one-time · refund · bKash/Nagad · instant delivery

Page 2 — Features
SECTION 1: PAGE HERO (compact)
Centered text, gradient background matching home hero.
Eyebrow: "All Features"
H1: "Everything WooBooster Does"
Subtext: 1 sentence about 6 modules, one plugin.
Radial glow from top right.

SECTION 2: VIDEO SECTION (different video)
Title: "Courier Sync & CAPI Setup — Full Walkthrough"
Subtitle: "Watch us configure Steadfast, Pathao, and Meta CAPI from a fresh install."
Video thumbnail: shows API key fields + "Live & Firing" status card
Play button + 3 ring pulses. Lightbox on click.
Caption: "▶ Courier Sync & CAPI Setup Walkthrough — 8 min"

SECTION 3: FEATURE TABS
Horizontal tab row: All Modules | Courier Sync | Tracking | Fraud Shield | Analytics | Lead Recovery
Active tab: accent background. Click → animate active state.
Below tabs: deep-dive rows (alternating left/right layout):

ROW 1 — Courier Sync (content left, visual right):
Visual: 3 courier cards with live badges + status flow diagram below

ROW 2 — Meta Pixel + CAPI (visual left, content right) [REVERSED]:
Visual: Unified Tracking Hub panel (5 platform rows, all "Active")

ROW 3 — Fraud Shield (content left, visual right):
Visual: order table with block buttons + "12 Fraud Orders Blocked · ৳18,400 saved" card

Each row: eyebrow label (Module 01 etc), Bricolage H2, Outfit body, check list

SECTION 4: FEATURE COMPARISON TABLE
WooBooster vs Manual vs Competitor
Rows: Courier Sync / CAPI Tracking / Fraud Protection / Lead Capture / Dark UI / BD Pricing
Columns: WooBooster ✅ | Competitor ⚠️ | Manual ❌

Page 3 — Pricing

SECTION 1: PAGE HERO
"Simple, One-Time Pricing"
"No subscriptions. No monthly fees. Pay once, own it forever."
Centered, compact, gradient background.

SECTION 2: PRICING CARDS (3-col)
Starter ($29 / ≈৳3,499) | Professional ($69 / ≈৳8,299) [POPULAR] | Agency ($129 / ≈৳15,499)
Popular card: accent border, 3px outer glow ring, "⭐ MOST POPULAR" floating badge
Each card: - Plan name (uppercase, small, muted) - Price (Bricolage, 46px, -2px letter-spacing) - BDT equivalent (muted, smaller) - 1-line description - Feature checklist (✓ green / ✗ muted) - Full-width CTA button
Magnetic 3D tilt on hover.

SECTION 3: TRUST STRIP
5 trust signals in a contained card: 🔒 Secure · 💳 bKash/Nagad/Card · 🔄 30-Day Refund · ⚡ Instant License · 📞 BD Support

SECTION 4: FAQ ACCORDION
6 questions — payment type, couriers, developer needed, theme compatibility,
BDT payment options, refund policy.
Smooth max-height transition. + rotates to × when open. Active: accent border.

Page 4 — Changelog

SECTION 1: PAGE HERO
"What's New in WooBooster"
"Every update documented transparently."

SECTION 2: VERSION TIMELINE (vertical list, max-width:800px centered)
Each entry: - Version badge (accent bg for latest, surface bg for older) - Release date - Release codename / title (Bricolage, bold) - Change categories: 🆕 New | ⬆ Improved | 🐛 Fixed (color-coded pill badges) - Bullet list of changes
v0.0.14: Analytics Suite Release (LATEST — featured with accent border)
v0.0.13: Fraud Shield & CAPI Events
v0.0.12: RedX Integration & Lead Capture
Cards hover: accent left border animation.

Page 5 — Support

SECTION 1: PAGE HERO
"We've Got Your Back"
"Dedicated support for Bangladeshi sellers. We respond in your time zone."

SECTION 2: SUPPORT OPTIONS (3 cards)
📧 Email Support — mhs@wpmhs.com, 24h response
💬 WhatsApp BD — +880 1721-328992, business hours BST
📖 Documentation — Browse Docs link
Each card: icon + title + desc + CTA button. Hover lift.

SECTION 3: CONTACT FORM
Centered card, max-width:700px
2-column grid: Name + Email | License Key + Subject
Full-width: Message textarea
Submit button: primary accent, full-width on mobile
Input focus state: accent border + glow ring (box-shadow)
