---
name: clone-website
description: Reverse-engineer and clone a website in one shot — extracts assets, CSS, and content section-by-section and proactively dispatches parallel builder agents in worktrees as it goes. Use this whenever the user wants to clone, replicate, rebuild, reverse-engineer, or copy any website. Also triggers on phrases like "make a copy of this site", "rebuild this page", "pixel-perfect clone". Provide the target URL as an argument.
argument-hint: "<url>"
user-invocable: true
---

# Clone Website (TanStack Start Edition)

You are about to reverse-engineer and rebuild **$ARGUMENTS** as a pixel-perfect clone.

This is not a two-phase process (inspect then build). You are a **foreman walking the job site** — as you inspect each section of the page, you write a detailed specification to a file, then hand that file to a specialist builder agent with everything they need. Extraction and construction happen in parallel, but extraction is meticulous and produces auditable artifacts.

## Tech Stack Context

This project uses **TanStack Start** (NOT Next.js). Key differences:
- **Router:** TanStack Router (file-based routes in `src/routes/`)
- **Root layout:** `src/routes/__root.tsx` (equivalent to Next.js `layout.tsx`)
- **Home page:** `src/routes/index.tsx` → renders `src/components/blocks/homepage.tsx`
- **Styles:** `src/styles.css` (equivalent to Next.js `globals.css`)
- **Fonts:** `@fontsource` packages imported in `__root.tsx` (NOT `next/font`)
- **Icons:** Tabler Icons `@tabler/icons-react` (NOT Lucide)
- **Build:** `pnpm build` (NOT `npm run build`)
- **Type check:** `npx tsc --noEmit`
- **Package manager:** pnpm (NOT npm)
- **UI:** shadcn/ui + Base UI React + Tailwind CSS v4 with oklch tokens
- **Deployment:** Cloudflare Workers (avoid Node.js-specific APIs)
- **Head/Meta:** TanStack Router `head()` function in route files (NOT Next.js `metadata`)
- **Component style:** Named exports, PascalCase components, single quotes, semicolons, 2-space indent

## Pre-Flight

1. **Chrome MCP is required.** Test it immediately. If it's not available, stop and tell the user to enable it — this skill cannot work without browser automation.
2. Read `@.claude/skills/clone-website/TARGET.md` for URL and scope. If the URL doesn't match `$ARGUMENTS`, update it.
3. Verify the base project builds: `pnpm build`. The TanStack Start + shadcn/ui + Tailwind v4 scaffold should already be in place. If not, tell the user to set it up first.
4. Create the output directories if they don't exist: `docs/research/`, `docs/research/components/`, `docs/design-references/`, `scripts/`.

## Guiding Principles

These are the truths that separate a successful clone from a "close enough" mess. Internalize them — they should inform every decision you make.

### 1. Completeness Beats Speed

Every builder agent must receive **everything** it needs to do its job perfectly: screenshot, exact CSS values, downloaded assets with local paths, real text content, component structure. If a builder has to guess anything — a color, a font size, a padding value — you have failed at extraction. Take the extra minute to extract one more property rather than shipping an incomplete brief.

### 2. Small Tasks, Perfect Results

When an agent gets "build the entire features section," it glosses over details — it approximates spacing, guesses font sizes, and produces something "close enough" but clearly wrong. When it gets a single focused component with exact CSS values, it nails it every time.

Look at each section and judge its complexity. A simple banner with a heading and a button? One agent. A complex section with 3 different card variants, each with unique hover states and internal layouts? One agent per card variant plus one for the section wrapper. When in doubt, make it smaller.

**Complexity budget rule:** If a builder prompt exceeds ~150 lines of spec content, the section is too complex for one agent. Break it into smaller pieces. This is a mechanical check — don't override it with "but it's all related."

### 3. Real Content, Real Assets

Extract the actual text, images, videos, and SVGs from the live site. This is a clone, not a mockup. Use `element.textContent`, download every `<img>` and `<video>`, extract inline `<svg>` elements as React components. The only time you generate content is when something is clearly server-generated and unique per session.

**Layered assets matter.** A section that looks like one image is often multiple layers — a background watercolor/gradient, a foreground UI mockup PNG, an overlay icon. Inspect each container's full DOM tree and enumerate ALL `<img>` elements and background images within it, including absolutely-positioned overlays. Missing an overlay image makes the clone look empty even if the background is correct.

### 4. Foundation First

Nothing can be built until the foundation exists: global CSS with the target site's design tokens (colors, fonts, spacing), TypeScript types for the content structures, and global assets (fonts, favicons). This is sequential and non-negotiable. Everything after this can be parallel.

### 5. Extract How It Looks AND How It Behaves

A website is not a screenshot — it's a living thing. Elements move, change, appear, and disappear in response to scrolling, hovering, clicking, resizing, and time. If you only extract the static CSS of each element, your clone will look right in a screenshot but feel dead when someone actually uses it.

For every element, extract its **appearance** (exact computed CSS via `getComputedStyle()`) AND its **behavior** (what changes, what triggers the change, and how the transition happens). Not "it looks like 16px" — extract the actual computed value. Not "the nav changes on scroll" — document the exact trigger (scroll position, IntersectionObserver threshold, viewport intersection), the before and after states (both sets of CSS values), and the transition (duration, easing, CSS transition vs. JS-driven vs. CSS `animation-timeline`).

Examples of behaviors to watch for — these are illustrative, not exhaustive. The page may do things not on this list, and you must catch those too:
- A navbar that shrinks, changes background, or gains a shadow after scrolling past a threshold
- Elements that animate into view when they enter the viewport (fade-up, slide-in, stagger delays)
- Sections that snap into place on scroll (`scroll-snap-type`)
- Parallax layers that move at different rates than the scroll
- Hover states that animate (not just change — the transition duration and easing matter)
- Dropdowns, modals, accordions with enter/exit animations
- Scroll-driven progress indicators or opacity transitions
- Auto-playing carousels or cycling content
- Dark-to-light (or any theme) transitions between page sections
- **Tabbed/pill content that cycles** — buttons that switch visible card sets with transitions
- **Scroll-driven tab/accordion switching** — sidebars where the active item auto-changes as content scrolls past (IntersectionObserver, NOT click handlers)
- **Smooth scroll libraries** (Lenis, Locomotive Scroll) — check for `.lenis` class or scroll container wrappers

### 6. Identify the Interaction Model Before Building

This is the single most expensive mistake in cloning: building a click-based UI when the original is scroll-driven, or vice versa. Before writing any builder prompt for an interactive section, you must definitively answer: **Is this section driven by clicks, scrolls, hovers, time, or some combination?**

How to determine this:
1. **Don't click first.** Scroll through the section slowly and observe if things change on their own as you scroll.
2. If they do, it's scroll-driven. Extract the mechanism: `IntersectionObserver`, `scroll-snap`, `position: sticky`, `animation-timeline`, or JS scroll listeners.
3. If nothing changes on scroll, THEN click/hover to test for click/hover-driven interactivity.
4. Document the interaction model explicitly in the component spec: "INTERACTION MODEL: scroll-driven with IntersectionObserver" or "INTERACTION MODEL: click-to-switch with opacity transition."

A section with a sticky sidebar and scrolling content panels is fundamentally different from a tabbed interface where clicking switches content. Getting this wrong means a complete rewrite, not a CSS tweak.

### 7. Extract Every State, Not Just the Default

Many components have multiple visual states — a tab bar shows different cards per tab, a header looks different at scroll position 0 vs 100, a card has hover effects. You must extract ALL states, not just whatever is visible on page load.

For tabbed/stateful content:
- Click each tab/button via Chrome MCP
- Extract the content, images, and card data for EACH state
- Record which content belongs to which state
- Note the transition animation between states (opacity, slide, fade, etc.)

For scroll-dependent elements:
- Capture computed styles at scroll position 0 (initial state)
- Scroll past the trigger threshold and capture computed styles again (scrolled state)
- Diff the two to identify exactly which CSS properties change
- Record the transition CSS (duration, easing, properties)
- Record the exact trigger threshold (scroll position in px, or viewport intersection ratio)

### 8. Spec Files Are the Source of Truth

Every component gets a specification file in `docs/research/components/` BEFORE any builder is dispatched. This file is the contract between your extraction work and the builder agent. The builder receives the spec file contents inline in its prompt — the file also persists as an auditable artifact that the user (or you) can review if something looks wrong.

The spec file is not optional. It is not a nice-to-have. If you dispatch a builder without first writing a spec file, you are shipping incomplete instructions based on whatever you can remember from a Chrome MCP session, and the builder will guess to fill gaps.

### 9. Build Must Always Compile

Every builder agent must verify `npx tsc --noEmit` passes before finishing. After merging worktrees, you verify `pnpm build` passes. A broken build is never acceptable, even temporarily.

### 10. Never Write Specs from Memory — Only from Extraction

This is a hard rule with zero exceptions. Every CSS value, every color, every layout property in a spec file MUST come from a `getComputedStyle()` extraction or Chrome MCP visual inspection of the ACTUAL rendered page. Never write a spec value based on:
- What you "know" a well-known product looks like (e.g., "WhatsApp headers are dark green")
- General knowledge of a platform's design system
- Assumptions about standard UI patterns
- Educated guesses based on component names or class names

The target site may use a custom theme, modified version, or completely different visual treatment. The only truth is what `getComputedStyle()` returns from the live page. If you catch yourself typing a CSS value without having extracted it, STOP and go extract it first.

### 11. Close-Up Screenshots Before Specs

For every section that will become a component, take a **dedicated close-up screenshot** via Chrome MCP BEFORE writing the spec. Full-page screenshots are too small to see details — they miss:
- Subtle border styles and shadows
- Icon details and small UI elements (read receipts, status dots, badges)
- Background patterns and textures (wallpaper, grain, gradients)
- Pseudo-element decorations (bubble tails, arrows, dividers)
- Text rendering details (letter-spacing, font weight differences)

For **"page-within-page" elements** (phone simulators, embedded editors, preview windows, iframes), take TWO screenshots:
1. The outer container showing its position in the page
2. A zoomed-in screenshot of just the inner content area

These close-up screenshots are what you compare against during Visual QA. Without them, you can't catch fine-grained visual differences.

### 12. Deep Extraction for Nested UI

Some components have deeply nested DOM structures (chat apps, email clients, social feeds, code editors). The default extraction script walks 4 levels deep, which is insufficient for these.

**Rule:** If the component is a simulator/mockup/preview of another product's UI, increase the extraction depth to 8 levels and run the extraction script SEPARATELY on each meaningful sub-region:
- Status bar area
- Header/navigation area
- Content/body area
- Input/footer area
- Overlay/watermark area

For each sub-region, also check:
- **Pseudo-elements:** Run `getComputedStyle(el, '::before')` and `getComputedStyle(el, '::after')` for any element that has visual decorations (bubble tails, arrows, badges, quote marks)
- **Background images/patterns:** Check `backgroundImage` — not just `backgroundColor`. Many UIs use repeating SVG patterns, gradients, or image textures
- **SVG icons inline:** Extract the actual SVG markup for small icons (checkmarks, arrows, status indicators) rather than approximating with emoji or text
- **Clip-paths and masks:** Check `clipPath` and `mask` properties that create non-rectangular shapes

### 13. Visual Output = Full CSS Stack

An element's final appearance is the composite of ALL its CSS layers, not just the first non-transparent property you find. When extracting any element, check the full visual stack:
- `backgroundColor` AND `backgroundImage` (patterns, gradients, SVG textures)
- `::before` and `::after` pseudo-elements (decorations, tails, arrows, overlays)
- Child elements with `position: absolute` that overlay the parent
- `boxShadow`, `filter`, `backdropFilter`, `mixBlendMode`
- `clipPath`, `mask`, `transform`

If you extract only `backgroundColor` and stop, you will miss wallpaper patterns, gradient overlays, decorative pseudo-elements, and layered compositions. Every layer contributes to the final pixel output.

### 14. DOM Structure Determines Layout

Two pieces of text that are siblings in a flex row render inline; the same text nested as parent-child renders stacked. The DOM tree structure — not just the CSS of individual elements — determines how things are laid out.

When extracting, always capture:
- Whether elements are siblings or parent-child
- The parent's `display`, `flexDirection`, `gap`, `alignItems`, `justifyContent`
- Which elements are wrappers vs. content-bearing

If you extract only text content and individual styles without capturing the tree relationships, the builder will guess the layout structure and get it wrong.

### 15. Every Spec Value Must Be Traceable

Every value in a spec file must be traceable to a specific extraction step. If you cannot answer "which `getComputedStyle()` call or Chrome MCP screenshot produced this value?", the value is a guess and must be re-extracted.

This applies to colors, sizes, spacing, font properties, border-radius, shadows — everything. A spec that mixes extracted values with assumptions is worse than a spec that is incomplete, because the builder cannot tell which values to trust.

### 16. Visual Complexity Drives Extraction Granularity

Extraction depth is not fixed — it is driven by visual complexity. A plain text section with a heading and paragraph needs only top-level style extraction. A section containing a simulated phone screen with chat bubbles, status indicators, timestamps, and background patterns requires separate extraction passes on each sub-region.

Before extracting any section, look at your close-up screenshot and judge: how many visually distinct layers, sub-components, and states does this section contain? That number determines how many extraction passes you need. One pass per visually distinct sub-region.

### 17. Per-Component Visual QA, Not Just End-to-End

Do not defer all visual comparison to the final Phase 5 QA. After each builder agent completes a component, immediately:
1. Take a screenshot of the built component in the clone
2. Take a screenshot of the same region on the original site
3. Compare them side-by-side

Catch discrepancies at the single-component level where they are easiest to diagnose and fix. A full-page QA at the end makes it hard to tell which component is causing a visual mismatch, and by then you may have built dependent components on top of incorrect ones.

### 18. Match Icons Against Existing Libraries First

The project already has icon libraries installed (check `package.json` for `@tabler/icons-react`, `lucide-react`, or similar). When extracting icons from the target site:
1. Identify the icon's visual function (arrow, chevron, search, phone, video, check, etc.)
2. Search the project's existing icon library for a matching icon
3. Only create custom SVG components for icons that have no close match in the existing library

This avoids bloating the project with redundant hand-crafted SVGs when a one-line import would produce the same result. Custom SVGs should be the fallback, not the default.

### 19. Interaction QA: Compare Every State, Not Just Default

After building an interactive component (tabs, accordions, dropdowns, toggles, carousels), QA must cover every interaction state, not just the default appearance:
1. Trigger the same interaction on BOTH the original site and the clone (via Chrome MCP or manual testing)
2. Screenshot each state on both
3. Compare: does the same click/hover/scroll produce the same visual result?

Specifically verify:
- Does the transition/animation match (duration, easing, direction)?
- Does the revealed content match (layout, text, images)?
- Does the trigger element change appearance correctly (active tab highlight, chevron rotation, toggle color)?
- Are edge states handled (first/last tab, empty content, overflow)?

A component that looks correct in its default state but behaves differently on interaction is a failed clone.

## Phase 1: Reconnaissance

Navigate to the target URL with Chrome MCP.

### Screenshots

**Full-page screenshots** (master reference):
- Desktop (1440px) and mobile (390px) viewports
- Save to `docs/design-references/fullpage-desktop.png` and `fullpage-mobile.png`

**Per-section close-up screenshots** (MANDATORY — do not skip):
- For EVERY distinct section/component identified in the page topology, scroll to it and take a dedicated screenshot
- Name them descriptively: `docs/design-references/section-hero.png`, `section-features.png`, etc.
- For nested/embedded UIs (phone mockups, chat simulators, editor previews), take an ADDITIONAL zoomed screenshot of just the inner content
- These close-up screenshots are what builders use as visual reference AND what you compare against during QA
- **If you don't have a close-up screenshot of a section, you are NOT ready to write its spec**

### Global Extraction
Extract these from the page before doing anything else:

**Fonts** — Inspect `<link>` tags for Google Fonts or self-hosted fonts. Check computed `font-family` on key elements (headings, body, code, labels). Document every family, weight, and style actually used. Install the corresponding `@fontsource` packages via `pnpm add @fontsource/<font-name>` and import the needed weight files in `src/routes/__root.tsx`.

**Colors** — Extract the site's color palette from computed styles across the page. Update `src/styles.css` with the target's actual colors in the `:root` and `.dark` CSS variable blocks. Map them to shadcn's token names (background, foreground, primary, muted, etc.) where they fit. Add custom properties for colors that don't map to shadcn tokens.

**Favicons & Meta** — Download favicons, apple-touch-icons, OG images, webmanifest to `public/seo/`. Update the `head()` function in `src/routes/__root.tsx` with the correct metadata.

**Global UI patterns** — Identify any site-wide CSS or JS: custom scrollbar hiding, scroll-snap on the page container, global keyframe animations, backdrop filters, gradients used as overlays, **smooth scroll libraries** (Lenis, Locomotive Scroll — check for `.lenis`, `.locomotive-scroll`, or custom scroll container classes). Add these to `src/styles.css` and note any libraries that need to be installed.

### Mandatory Interaction Sweep

This is a dedicated pass AFTER screenshots and BEFORE anything else. Its purpose is to discover every behavior on the page — many of which are invisible in a static screenshot.

**Scroll sweep:** Scroll the page slowly from top to bottom via Chrome MCP. At each section, pause and observe:
- Does the header change appearance? Record the scroll position where it triggers.
- Do elements animate into view? Record which ones and the animation type.
- Does a sidebar or tab indicator auto-switch as you scroll? Record the mechanism.
- Are there scroll-snap points? Record which containers.
- Is there a smooth scroll library active? Check for non-native scroll behavior.

**Click sweep — intent-level analysis:** For every interactive element on the page, determine not just THAT it's clickable, but WHAT clicking it does to the page. This is the most important step in the entire skill — skipping it means builders create dead buttons.

Process:
1. Use Chrome MCP snapshot to enumerate all interactive elements (anything with `cursor: pointer`, `role="button"`, `role="tab"`, `aria-expanded`, `data-state`, `<button>`, `<a>`, clickable `<div>`s)
2. For EACH interactive element:
   a. Screenshot the page BEFORE clicking
   b. Click it via Chrome MCP
   c. Screenshot the page AFTER clicking
   d. Observe and record: what changed? Options include:
      - Nothing (purely navigational link, or already active state)
      - Content swap (different content appears in another area of the page)
      - Style change on the element itself (active state highlight, color, border)
      - New content revealed (accordion opens, dropdown appears, modal pops up)
      - Content in a DIFFERENT section updates (e.g., clicking sidebar button changes main preview)
      - Combination of the above
   e. Record the full cause-and-effect: "Clicking [element X] in [section A] causes [change Y] in [section B]"
3. For element groups (e.g., a grid of 20 app buttons, a row of tabs), click at least 3 representative items to establish the pattern, then document: "All N items in this group follow the same pattern: clicking any one causes [change Y]"
4. Any element with state-indicating attributes (`aria-expanded`, `aria-controls`, `data-state`, `aria-selected`, `aria-checked`) MUST be triggered to reveal all its states. If it has N states, visit all N.

The output of this step is not just "20 clickable buttons found" — it's "clicking any of these 20 buttons swaps the main preview area to show that platform's chat UI, changes the button to active state (green bg), and updates the header badge text."

This cause-and-effect documentation flows directly into component specs and tells builders exactly what behavior to implement.

**Hover sweep:** Hover over every element that might have hover states:
- Buttons, cards, links, images, nav items
- Record what changes: color, scale, shadow, underline, opacity

**Responsive sweep:** Test at 3 viewport widths via Chrome MCP:
- Desktop: 1440px
- Tablet: 768px
- Mobile: 390px
- At each width, note which sections change layout (column -> stack, sidebar disappears, etc.) and at approximately which breakpoint the change occurs.

Save all findings to `docs/research/BEHAVIORS.md`. This is your behavior bible — reference it when writing every component spec.

### Page Topology
Map out every distinct section of the page from top to bottom. Give each a working name. Document:
- Their visual order
- Which are fixed/sticky overlays vs. flow content
- The overall page layout (scroll container, column structure, z-index layers)
- Dependencies between sections (e.g., a floating nav that overlays everything)
- **The interaction model** of each section (static, click-driven, scroll-driven, time-driven)

Save this as `docs/research/PAGE_TOPOLOGY.md` — it becomes your assembly blueprint.

### Page Intent Analysis

After topology and interaction sweep, BEFORE any CSS extraction, synthesize everything into a structured intent document. This is the **foundation of the entire clone** — every subsequent phase depends on the completeness of this analysis. Do not rush it. Do not skip elements because they "look simple."

Create `docs/research/PAGE_INTENT.md`. This document must cover every visible element on the page, not just top-level sections.

```markdown
# Page Intent: <site name>

## What This Page Is
<What is this product? What problem does it solve? Who uses it? What is the core user action on this page?>

## Page-Level Behavior
- Default theme: <light/dark/system>
- URL routing: <does clicking elements change the URL? SPA or MPA?>
- Global state: <is there state shared across sections? what drives it?>
- Authentication: <is the user logged in? does the page differ for logged-out users?>

## Sections (top to bottom)

### <Section Name>
- **Purpose:** What this section does for the user
- **Layout:** How it's visually organized (columns, grid, stack, overlay)

#### Elements (every visible element in this section)
For EACH element, document:

| Element | Type | Content | Interactive? | Action → Effect |
|---|---|---|---|---|
| Logo | Image | "Mockly" SVG | Click → navigates to / | Same page (already home) |
| "Chat" tab | Nav link | Text "Chat" | Click → switches page mode | Sidebar shows chat platforms, preview shows chat |
| "AI Chat" tab | Nav link | Text "AI Chat" | Click → switches page mode | Sidebar shows AI platforms, preview shows AI chat |
| Instagram button | Button | Instagram icon + "Instagram" | Click → changes preview | Preview swaps to Instagram chat style, button highlights |
| WhatsApp button | Button | WhatsApp icon + "WhatsApp" | Click → changes preview | Preview swaps to WhatsApp style, button turns green |
| Messages accordion | Accordion | Header "Messages" + badge "7" | Click → expand/collapse | Reveals 7 editable message rows below |
| Message row 1 | Editable | Text "Hey, want to try..." | Click → editable | Text becomes editable, updates preview in real-time |
| "Header" toggle | Toggle switch | Label "Header" | Click → on/off | Toggles phone status bar visibility in preview |
| Download button | Button | Text "Download" | Click → triggers download | Exports preview as image (BLOCKED: requires auth/payment check) |
| ... | ... | ... | ... | ... |

#### States
- **State 1 (default):** <describe what this section looks like on page load>
- **State 2:** <describe after user interaction X>
- **State N:** <describe after user interaction Y>

#### Dependencies
- This section is controlled by: <other section, or none>
- This section controls: <other section, or none>
- Shared state: <what data/state is shared with other sections>

### <Next Section>
...

## Cross-Section Relationships

Map every control relationship:

| Controller | Target | Mechanism | Effect |
|---|---|---|---|
| Header tabs | Sidebar + Preview | Tab click changes page mode | Sidebar options change, preview template changes |
| Sidebar app grid | Preview area | Button click selects platform | Preview renders selected platform's chat style |
| Sidebar "Appearance" toggles | Preview area | Toggle on/off | Preview updates (show/hide header, dark mode, etc.) |
| Sidebar "Messages" editor | Preview chat bubbles | Text edit | Preview bubble content updates in real-time |

## Data Flow
- User selects app (sidebar) → preview renders that app's chat template
- User edits message (sidebar) → preview updates the corresponding bubble
- User toggles appearance option → preview reflects the change
- User clicks download → image export of current preview state

## Scope Decision
For each element/interaction, classify:
- ✅ REPLICATE: Can be cloned with frontend code
- 🔶 SIMPLIFY: Too complex to fully replicate, build a simplified version (document what's simplified)
- 🚫 BLOCKED: Requires backend/auth/payment, skip and document
```

#### Completeness Check

Before proceeding to Phase 1.5, verify the intent document is complete:

1. **Every visible element** on the page appears in at least one section's element table. Scroll through your close-up screenshots and check: is there any text, icon, button, input, toggle, image, or decoration that isn't documented? If yes, add it.
2. **Every interactive element** has an "Action → Effect" column filled in, based on the click sweep results. No element should say "unknown" or "TBD."
3. **Every cross-section relationship** is mapped. If clicking something in Section A changes Section B, that relationship must appear in the Cross-Section Relationships table.
4. **Every state** is enumerated. If a section can look different depending on user actions, each distinct visual state is listed.
5. **Scope decisions** are made for every interaction. Nothing is left undecided.

If any of these checks fail, go back to Chrome MCP and investigate further before proceeding. An incomplete intent document produces incomplete specs which produce incomplete components. This is the single highest-leverage step in the entire pipeline — time spent here saves multiples in rework later.

## Phase 1.5: Interaction Scan & Decision

After reconnaissance, run a dedicated interaction detection pass. This is **fully automated** — AI inspects, classifies, and decides what to implement without human input. The only items that get skipped are those that are technically impossible to replicate (require login, payment, etc.).

### Step 1: Inject Detection Script

Run this via Chrome MCP to discover ALL interactive signals on the page:

```javascript
// Interaction detection script — run via Chrome MCP
(function() {
  const sections = document.querySelectorAll('section, [class*="section"], header, footer, nav, main > div');
  const results = [];

  sections.forEach((section, i) => {
    const rect = section.getBoundingClientRect();
    const sectionId = section.id || section.className?.split(' ')[0] || `section-${i}`;
    const interactions = [];

    // 1. Event listeners (click, scroll, mouseover)
    const allElements = section.querySelectorAll('*');
    const clickables = section.querySelectorAll('button, a, [role="button"], [role="tab"], [onclick], details, summary, input, select, textarea, [data-toggle], [data-tab], [aria-expanded], [aria-controls]');
    if (clickables.length > 0) {
      interactions.push({
        type: 'click-interactive',
        count: clickables.length,
        elements: [...clickables].slice(0, 10).map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 50),
          role: el.getAttribute('role'),
          ariaExpanded: el.getAttribute('aria-expanded'),
          ariaControls: el.getAttribute('aria-controls'),
          href: el.getAttribute('href'),
          type: el.getAttribute('type')
        }))
      });
    }

    // 2. CSS animations & transitions
    const animated = [...allElements].filter(el => {
      const cs = getComputedStyle(el);
      return (cs.animation && cs.animation !== 'none') ||
             (cs.transition && cs.transition !== 'all 0s ease 0s' && cs.transition !== 'none');
    });
    if (animated.length > 0) {
      interactions.push({
        type: 'css-animation',
        count: animated.length,
        samples: animated.slice(0, 5).map(el => ({
          tag: el.tagName,
          classes: el.className?.toString().slice(0, 80),
          animation: getComputedStyle(el).animation,
          transition: getComputedStyle(el).transition
        }))
      });
    }

    // 3. Scroll-driven signals
    const sticky = [...allElements].filter(el => getComputedStyle(el).position === 'sticky');
    const scrollSnap = getComputedStyle(section).scrollSnapType;
    const hasScrollTimeline = [...allElements].some(el => getComputedStyle(el).animationTimeline && getComputedStyle(el).animationTimeline !== 'auto');
    if (sticky.length > 0 || (scrollSnap && scrollSnap !== 'none') || hasScrollTimeline) {
      interactions.push({
        type: 'scroll-driven',
        sticky: sticky.length,
        scrollSnap: scrollSnap !== 'none' ? scrollSnap : null,
        animationTimeline: hasScrollTimeline
      });
    }

    // 4. Video / Canvas / Lottie
    const videos = section.querySelectorAll('video');
    const canvases = section.querySelectorAll('canvas');
    const lotties = section.querySelectorAll('lottie-player, [data-lottie], .lottie');
    if (videos.length || canvases.length || lotties.length) {
      interactions.push({
        type: 'media-dynamic',
        videos: videos.length,
        canvases: canvases.length,
        lotties: lotties.length
      });
    }

    // 5. Third-party library markers
    const libMarkers = [];
    if (document.querySelector('.lenis, .lenis-smooth')) libMarkers.push('lenis');
    if (document.querySelector('.locomotive-scroll')) libMarkers.push('locomotive-scroll');
    if (document.querySelector('.swiper, .swiper-container')) libMarkers.push('swiper');
    if (document.querySelector('[data-embla], .embla')) libMarkers.push('embla');
    if (document.querySelector('[data-aos]')) libMarkers.push('aos');
    if (document.querySelector('.gsap, [data-gsap]')) libMarkers.push('gsap');
    if (document.querySelector('[data-framer], [data-projection-id]')) libMarkers.push('framer-motion');
    if (document.querySelector('.slick-slider')) libMarkers.push('slick');
    if (document.querySelector('.splide')) libMarkers.push('splide');
    if (libMarkers.length > 0) {
      interactions.push({ type: 'third-party-libs', libs: [...new Set(libMarkers)] });
    }

    // 6. Forms and auth-gated elements
    const forms = section.querySelectorAll('form');
    const authGated = section.querySelectorAll('[data-requires-auth], .login-required, [href*="login"], [href*="signin"], [href*="signup"]');
    const payGated = section.querySelectorAll('[href*="pricing"], [href*="checkout"], [href*="subscribe"], [data-stripe]');
    if (forms.length || authGated.length || payGated.length) {
      interactions.push({
        type: 'gated-interaction',
        forms: forms.length,
        authGated: authGated.length,
        payGated: payGated.length
      });
    }

    // 7. Hover-detectable (elements with :hover rules — check via transition presence)
    const hoverCandidates = [...allElements].filter(el => {
      const cs = getComputedStyle(el);
      return cs.cursor === 'pointer' || el.tagName === 'A' || el.tagName === 'BUTTON';
    });
    if (hoverCandidates.length > 0) {
      interactions.push({
        type: 'hover-candidates',
        count: hoverCandidates.length
      });
    }

    results.push({
      index: i,
      id: sectionId,
      top: Math.round(rect.top + window.scrollY),
      height: Math.round(rect.height),
      interactionCount: interactions.length,
      interactions
    });
  });

  // Global signals
  const global = {
    smoothScroll: getComputedStyle(document.documentElement).scrollBehavior,
    hasLenis: !!document.querySelector('.lenis'),
    hasScrollSnap: getComputedStyle(document.documentElement).scrollSnapType !== 'none',
    totalVideos: document.querySelectorAll('video').length,
    totalCanvases: document.querySelectorAll('canvas').length,
    totalForms: document.querySelectorAll('form').length,
    totalIframes: document.querySelectorAll('iframe').length
  };

  return JSON.stringify({ global, sections: results }, null, 2);
})();
```

### Step 2: Scroll-Through Observation

After running the detection script, perform a **slow automated scroll** from top to bottom via Chrome MCP:

1. Scroll in increments of 300px, pausing 500ms at each step
2. At each pause, take note of:
   - Elements that just appeared or animated into view
   - Changes in the navbar/header
   - Any auto-playing content (carousels, counters, videos)
3. This catches behaviors the static script can't detect (IntersectionObserver-triggered animations, lazy-loaded content, scroll-position-dependent state changes)

### Step 3: AI Classification & Decision

For each section, classify every detected interaction into one of three categories:

**✅ REPLICATE** — The interaction can be triggered by public actions (scroll, hover, click on visible elements). These MUST be implemented in the clone:
- Scroll-triggered entrance animations (fade-in, slide-up, stagger)
- Hover effects (color change, scale, shadow, underline)
- Click-driven tabs, accordions, toggles
- Navbar scroll behavior (shrink, shadow, background change)
- Smooth scrolling (Lenis or CSS)
- Auto-playing carousels / testimonial rotators
- Parallax effects
- Scroll-snap behaviors
- Video/animation backgrounds (autoplay, loop)
- Animated counters / number tickers
- CSS keyframe animations
- Pricing toggle (monthly/yearly — visual only, no real payment)

**🚫 BLOCKED** — The interaction requires external identity or resources. Skip and document:
- Content behind login/signup walls
- Features requiring OAuth / SSO
- Payment-gated content (trial modals, paywall)
- CAPTCHA / verification flows
- Real-time data from authenticated APIs (chat widgets, notifications, user dashboards)
- Form submissions to third-party services (record the form structure but don't wire the submission)
- iframe-embedded third-party apps that require auth

**Decision rule:** If you can trigger and observe the full interaction by scrolling, hovering, or clicking public elements in an incognito browser — it's REPLICATE. If any step requires credentials, payment, or third-party auth — it's BLOCKED.

### Step 4: Output Interaction Map

Write two files:

**`docs/research/INTERACTION_MAP.md`:**

```markdown
# Interaction Map

Generated: <date>
Target: <url>

## Global Interactions
- Smooth scroll: <yes/no, library>
- Navbar scroll behavior: <description>
- Page-level scroll-snap: <yes/no>

## Per-Section Breakdown

### <Section Name> (top: Npx)
| Interaction | Type | Classification | Implementation |
|---|---|---|---|
| Cards fade in on scroll | scroll-triggered | ✅ REPLICATE | framer-motion whileInView |
| Hover shadow on cards | hover | ✅ REPLICATE | Tailwind hover: classes |
| "Start free trial" opens login modal | click-gated | 🚫 BLOCKED | Requires auth |

### <Next Section> ...
```

**`docs/research/BLOCKED_INTERACTIONS.md`:**

```markdown
# Blocked Interactions

These interactions were detected but cannot be replicated because they require
external identity, payment, or third-party services.

| Section | Interaction | Reason | Fallback |
|---|---|---|---|
| Hero | "Sign up" button opens OAuth | Requires auth | Static button, link to # |
| Pricing | Checkout flow | Requires Stripe session | Show pricing cards only |
| Footer | Live chat widget | Requires Crisp/Intercom auth | Omit widget |
```

### How This Feeds Into Later Phases

- **Phase 2 (Foundation):** Install any libraries identified in the interaction map (e.g., `pnpm add lenis framer-motion embla-carousel-react`)
- **Phase 3 (Component Specs):** Every component spec MUST reference its section in INTERACTION_MAP.md. The "States & Behaviors" section of each spec is populated from the interaction map — no guessing.
- **Phase 5 (Visual QA):** Check every ✅ REPLICATE interaction actually works. Scroll, hover, click through the clone and verify each one.
- **Completion Report:** Include the BLOCKED_INTERACTIONS.md contents in the final report under "Unreplicated Interactions."

## Phase 2: Foundation Build

This is sequential. Do it yourself (not delegated to an agent) since it touches many files:

1. **Update fonts** — install `@fontsource` packages for the target site's fonts via `pnpm add`, then import the weight files in `src/routes/__root.tsx`
2. **Update styles.css** with the target's color tokens, spacing values, keyframe animations, utility classes, and any **global scroll behaviors** (Lenis, smooth scroll CSS, scroll-snap on body)
3. **Create TypeScript interfaces** in `src/types/` for the content structures you've observed
4. **Extract SVG icons** — find all inline `<svg>` elements on the page, deduplicate them, and save as named React components in `src/components/icons.tsx`. Name them by visual function (e.g., `SearchIcon`, `ArrowRightIcon`, `LogoIcon`). Use named exports consistent with the project's Tabler Icons convention.
5. **Download global assets** — write and run a Node.js script (`scripts/download-assets.mjs`) that downloads all images, videos, and other binary assets from the page to `public/`. Preserve meaningful directory structure.
6. Verify: `pnpm build` passes

### Asset Discovery Script Pattern

Use Chrome MCP to enumerate all assets on the page:

```javascript
// Run this via Chrome MCP to discover all assets
JSON.stringify({
  images: [...document.querySelectorAll('img')].map(img => ({
    src: img.src || img.currentSrc,
    alt: img.alt,
    width: img.naturalWidth,
    height: img.naturalHeight,
    parentClasses: img.parentElement?.className,
    siblings: img.parentElement ? [...img.parentElement.querySelectorAll('img')].length : 0,
    position: getComputedStyle(img).position,
    zIndex: getComputedStyle(img).zIndex
  })),
  videos: [...document.querySelectorAll('video')].map(v => ({
    src: v.src || v.querySelector('source')?.src,
    poster: v.poster,
    autoplay: v.autoplay,
    loop: v.loop,
    muted: v.muted
  })),
  backgroundImages: [...document.querySelectorAll('*')].filter(el => {
    const bg = getComputedStyle(el).backgroundImage;
    return bg && bg !== 'none';
  }).map(el => ({
    url: getComputedStyle(el).backgroundImage,
    element: el.tagName + '.' + el.className?.split(' ')[0]
  })),
  svgCount: document.querySelectorAll('svg').length,
  fonts: [...new Set([...document.querySelectorAll('*')].slice(0, 200).map(el => getComputedStyle(el).fontFamily))],
  favicons: [...document.querySelectorAll('link[rel*="icon"]')].map(l => ({ href: l.href, sizes: l.sizes?.toString() }))
});
```

Then write a download script that fetches everything to `public/`. Use batched parallel downloads (4 at a time) with proper error handling.

## Phase 3: Component Specification & Dispatch

This is the core loop. For each section in your page topology (top to bottom), you do THREE things: **extract**, **write the spec file**, then **dispatch builders**.

### Step 1: Extract

For each section, use Chrome MCP to extract everything:

1. **Screenshot** the section in isolation (scroll to it, screenshot the viewport). Save to `docs/design-references/`.

2. **Extract CSS** for every element in the section. Use the extraction script below — don't hand-measure individual properties. Run it once per component container and capture the full output:

```javascript
// Per-component extraction — run via Chrome MCP
// Replace SELECTOR with the actual CSS selector for the component
(function(selector) {
  const el = document.querySelector(selector);
  if (!el) return JSON.stringify({ error: 'Element not found: ' + selector });
  const props = [
    'fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color',
    'textTransform','textDecoration','backgroundColor','background',
    'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
    'margin','marginTop','marginRight','marginBottom','marginLeft',
    'width','height','maxWidth','minWidth','maxHeight','minHeight',
    'display','flexDirection','justifyContent','alignItems','gap',
    'gridTemplateColumns','gridTemplateRows',
    'borderRadius','border','borderTop','borderBottom','borderLeft','borderRight',
    'boxShadow','overflow','overflowX','overflowY',
    'position','top','right','bottom','left','zIndex',
    'opacity','transform','transition','cursor',
    'objectFit','objectPosition','mixBlendMode','filter','backdropFilter',
    'whiteSpace','textOverflow','WebkitLineClamp'
  ];
  function extractStyles(element) {
    const cs = getComputedStyle(element);
    const styles = {};
    props.forEach(p => { const v = cs[p]; if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)') styles[p] = v; });
    return styles;
  }
  function walk(element, depth) {
    if (depth > 4) return null;
    const children = [...element.children];
    return {
      tag: element.tagName.toLowerCase(),
      classes: element.className?.toString().split(' ').slice(0, 5).join(' '),
      text: element.childNodes.length === 1 && element.childNodes[0].nodeType === 3 ? element.textContent.trim().slice(0, 200) : null,
      styles: extractStyles(element),
      images: element.tagName === 'IMG' ? { src: element.src, alt: element.alt, naturalWidth: element.naturalWidth, naturalHeight: element.naturalHeight } : null,
      childCount: children.length,
      children: children.slice(0, 20).map(c => walk(c, depth + 1)).filter(Boolean)
    };
  }
  return JSON.stringify(walk(el, 0), null, 2);
})('SELECTOR');
```

3. **Extract multi-state styles** — for any element with multiple states (scroll-triggered, hover, active tab), capture BOTH states:

```javascript
// State A: capture styles at current state (e.g., scroll position 0)
// Then trigger the state change (scroll, click, hover via Chrome MCP)
// State B: re-run the extraction script on the same element
// The diff between A and B IS the behavior specification
```

Record the diff explicitly: "Property X changes from VALUE_A to VALUE_B, triggered by TRIGGER, with transition: TRANSITION_CSS."

4. **Extract real content** — all text, alt attributes, aria labels, placeholder text. Use `element.textContent` for each text node. For tabbed/stateful content, **click each tab and extract content per state**.

5. **Identify assets** this section uses — which downloaded images/videos from `public/`, which icon components from `icons.tsx`. Check for **layered images** (multiple `<img>` or background-images stacked in the same container).

6. **Assess complexity** — how many distinct sub-components does this section contain? A distinct sub-component is an element with its own unique styling, structure, and behavior (e.g., a card, a nav item, a search panel).

7. **Deep-inspect nested UIs** — If the section contains a "page-within-page" (phone simulator, chat mockup, email preview, code editor), run a SEPARATE extraction pass on it:

```javascript
// Deep extraction for nested UI — run via Chrome MCP
// Extracts pseudo-elements, background patterns, and walks 8 levels deep
(function(selector) {
  const el = document.querySelector(selector);
  if (!el) return JSON.stringify({ error: 'Not found: ' + selector });
  const props = [
    'fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color',
    'textTransform','textDecoration','backgroundColor','backgroundImage','background',
    'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
    'margin','marginTop','marginRight','marginBottom','marginLeft',
    'width','height','maxWidth','minWidth','maxHeight','minHeight',
    'display','flexDirection','justifyContent','alignItems','gap',
    'gridTemplateColumns','gridTemplateRows',
    'borderRadius','border','borderTop','borderBottom','borderLeft','borderRight',
    'boxShadow','overflow','overflowX','overflowY',
    'position','top','right','bottom','left','zIndex',
    'opacity','transform','transition','cursor',
    'objectFit','objectPosition','mixBlendMode','filter','backdropFilter',
    'clipPath','mask','whiteSpace','textOverflow','WebkitLineClamp'
  ];
  function extractStyles(element, pseudo) {
    const cs = getComputedStyle(element, pseudo || null);
    const styles = {};
    props.forEach(p => {
      const v = cs[p];
      if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)' && v !== '' && v !== '0s') styles[p] = v;
    });
    return styles;
  }
  function walk(element, depth) {
    if (depth > 8) return null;
    const children = [...element.children];
    const beforeStyles = extractStyles(element, '::before');
    const afterStyles = extractStyles(element, '::after');
    const svgContent = element.tagName === 'SVG' ? element.outerHTML.slice(0, 500) : null;
    return {
      tag: element.tagName.toLowerCase(),
      classes: element.className?.toString().split(' ').slice(0, 5).join(' '),
      text: element.childNodes.length === 1 && element.childNodes[0].nodeType === 3 ? element.textContent.trim().slice(0, 200) : null,
      styles: extractStyles(element),
      before: Object.keys(beforeStyles).length > 0 ? beforeStyles : undefined,
      after: Object.keys(afterStyles).length > 0 ? afterStyles : undefined,
      svg: svgContent,
      images: element.tagName === 'IMG' ? { src: element.src, alt: element.alt } : null,
      childCount: children.length,
      children: children.slice(0, 20).map(c => walk(c, depth + 1)).filter(Boolean)
    };
  }
  return JSON.stringify(walk(el, 0), null, 2);
})('SELECTOR');
```

This script differs from the standard one in 3 ways:
- Walks **8 levels deep** instead of 4
- Extracts **pseudo-element styles** (`::before`, `::after`) which create bubble tails, decorative arrows, badges
- Extracts **backgroundImage** (not just backgroundColor) to catch wallpaper patterns, gradients, SVG textures
- Captures **SVG content** inline for small icon elements
- Checks **clipPath** and **mask** for non-rectangular shapes

### Step 2: Write the Component Spec File

For each section (or sub-component, if you're breaking it up), create a spec file in `docs/research/components/`. This is NOT optional — every builder must have a corresponding spec file.

**File path:** `docs/research/components/<component-name>.spec.md`

**Template:**

```markdown
# <ComponentName> Specification

## Overview
- **Target file:** `src/components/<ComponentName>.tsx`
- **Screenshot:** `docs/design-references/<screenshot-name>.png`
- **Interaction model:** <static | click-driven | scroll-driven | time-driven>

## DOM Structure
<Describe the element hierarchy — what contains what>

## Computed Styles (exact values from getComputedStyle)

### Container
- display: ...
- padding: ...
- maxWidth: ...
- (every relevant property with exact values)

### <Child element 1>
- fontSize: ...
- color: ...
- (every relevant property)

### <Child element N>
...

## States & Behaviors

### <Behavior name, e.g., "Scroll-triggered floating mode">
- **Trigger:** <exact mechanism — scroll position 50px, IntersectionObserver rootMargin "-30% 0px", click on .tab-button, hover>
- **State A (before):** maxWidth: 100vw, boxShadow: none, borderRadius: 0
- **State B (after):** maxWidth: 1200px, boxShadow: 0 4px 20px rgba(0,0,0,0.1), borderRadius: 16px
- **Transition:** transition: all 0.3s ease
- **Implementation approach:** <CSS transition + scroll listener | IntersectionObserver | CSS animation-timeline | etc.>

### Hover states
- **<Element>:** <property>: <before> -> <after>, transition: <value>

## Per-State Content (if applicable)

### State: "Featured"
- Title: "..."
- Subtitle: "..."
- Cards: [{ title, description, image, link }, ...]

### State: "Productivity"
- Title: "..."
- Cards: [...]

## Assets
- Background image: `public/images/<file>.webp`
- Overlay image: `public/images/<file>.png`
- Icons used: <ArrowIcon>, <SearchIcon> from icons.tsx

## Text Content (verbatim)
<All text content, copy-pasted from the live site>

## Responsive Behavior
- **Desktop (1440px):** <layout description>
- **Tablet (768px):** <what changes — e.g., "maintains 2-column, gap reduces to 16px">
- **Mobile (390px):** <what changes — e.g., "stacks to single column, images full-width">
- **Breakpoint:** layout switches at ~<N>px
```

Fill every section. If a section doesn't apply (e.g., no states for a static footer), write "N/A" — but think twice before marking States & Behaviors as N/A. Even a footer might have hover states on links.

### Step 3: Dispatch Builders

Based on complexity, dispatch builder agent(s) in worktree(s):

**Simple section** (1-2 sub-components): One builder agent gets the entire section.

**Complex section** (3+ distinct sub-components): Break it up. One agent per sub-component, plus one agent for the section wrapper that imports them. Sub-component builders go first since the wrapper depends on them.

**What every builder agent receives:**
- The full contents of its component spec file (inline in the prompt — don't say "go read the spec file")
- Path to the section screenshot in `docs/design-references/`
- Which shared components to import (`icons.tsx`, `cn()`, shadcn primitives)
- The target file path (e.g., `src/components/HeroSection.tsx`)
- Instruction to verify with `npx tsc --noEmit` before finishing
- For responsive behavior: the specific breakpoint values and what changes
- **TanStack Start specifics:** remind builders to use named exports, single quotes, semicolons, `@/` path aliases, and Tabler Icons convention

**Don't wait.** As soon as you've dispatched the builder(s) for one section, move to extracting the next section. Builders work in parallel in their worktrees while you continue extraction.

### Step 4: Merge

As builder agents complete their work:
- Merge their worktree branches into main
- You have full context on what each agent built, so resolve any conflicts intelligently
- After each merge, verify the build still passes: `pnpm build`
- If a merge introduces type errors, fix them immediately

The extract -> spec -> dispatch -> merge cycle continues until all sections are built.

## Phase 4: Page Assembly

After all sections are built and merged, wire everything together.

In TanStack Start, the page structure is:
- `src/routes/__root.tsx` — root layout (navbar, footer, providers, global styles)
- `src/routes/index.tsx` — home route, renders the homepage component
- `src/components/blocks/homepage.tsx` — the actual homepage content (import all sections here)

Steps:
- Import all section components into the homepage component
- Implement the page-level layout from your topology doc (scroll containers, column structures, sticky positioning, z-index layering)
- Connect real content to component props
- Implement page-level behaviors: scroll snap, scroll-driven animations, dark-to-light transitions, intersection observers, smooth scroll (Lenis etc.)
- Update the navbar and footer in `src/components/layout/` if needed to match the target
- Update `head()` in the route file for proper SEO metadata
- Verify: `pnpm build` passes clean

## Phase 5: Verification

After assembly, do NOT declare the clone complete. This phase systematically verifies every aspect of the clone against the original, using a MANIFEST-driven approach to guarantee nothing is skipped.

### Step 1: Generate QA MANIFEST

Create `docs/research/QA_MANIFEST.md` — a checklist of EVERYTHING that must be verified. Generate it from:
- PAGE_TOPOLOGY.md (every section)
- INTERACTION_MAP.md (every ✅ REPLICATE interaction)
- Component spec files (every component)

Format:

```markdown
# QA Manifest

## Visual Comparison
| Section | Original Screenshot | Clone Screenshot | Status |
|---|---|---|---|
| Header | docs/qa/original-header.png | docs/qa/clone-header.png | ⬜ |
| Sidebar | docs/qa/original-sidebar.png | docs/qa/clone-sidebar.png | ⬜ |
| Preview | docs/qa/original-preview.png | docs/qa/clone-preview.png | ⬜ |
| Footer | docs/qa/original-footer.png | docs/qa/clone-footer.png | ⬜ |

## Interaction Verification
| Interaction | Section | Trigger | Expected Result | Status |
|---|---|---|---|---|
| Accordion expand | Sidebar | Click "Messages" header | Shows 7 message items | ⬜ |
| Tab switch | Header | Click "AI Chat" | Content area updates | ⬜ |
| Hover effect | Cards | Mouse over card | Shadow + scale change | ⬜ |
| ... | ... | ... | ... | ⬜ |

## Responsive Check
| Viewport | Screenshot | Status |
|---|---|---|
| Desktop 1440px | docs/qa/responsive-desktop.png | ⬜ |
| Tablet 768px | docs/qa/responsive-tablet.png | ⬜ |
| Mobile 390px | docs/qa/responsive-mobile.png | ⬜ |
```

### Step 2: Per-Component Visual Regression

For EACH section in the manifest, execute this loop:

1. **Chrome MCP → original site:** Navigate to the section, take a close-up screenshot, save to `docs/qa/original-<section>.png`
2. **Chrome MCP → clone site:** Navigate to the same section, take a close-up screenshot, save to `docs/qa/clone-<section>.png`
3. **Compare:** Analyze both screenshots. List every visual difference found.
4. **Fix or accept:**
   - If the difference is a genuine mismatch → fix the component, re-screenshot, re-compare
   - If the difference is due to dynamic content (timestamps, user data) → accept and note
5. **Update manifest:** Mark the section as ✅ when screenshots match

Repeat the fix → screenshot → compare loop until the section passes. Do not move to the next section until the current one is verified.

### Step 3: Interactive Element Sweep (the missing-interaction safety net)

This step catches interactions that were detected but never implemented, or that were missed entirely during extraction. It is the architectural guarantee that no interactive element is left as a dead button.

**On the CLONE site**, use Chrome MCP to find every interactive element:

1. Run the same interaction detection script from Phase 1.5 on the clone page
2. For every element with state-indicating attributes (`aria-expanded`, `data-state`, `role="tab"`, `role="button"`, clickable elements with `cursor: pointer`):
   - **Click it** via Chrome MCP
   - **Observe:** Did anything visually change on the page? (content swap, style change, animation, new content appearing)
   - If **nothing happened** → this is a candidate for a dead/unimplemented interaction
3. For each dead interaction found, go back to the **original site** and trigger the same element:
   - If the original ALSO does nothing → it's correctly static, mark as ✅
   - If the original DOES change → this is a **missed interaction**, add to manifest as ❌ and fix

This sweep ensures every clickable/expandable/toggleable element in the clone actually does something — or is confirmed to be correctly static because the original is also static.

### Step 4: Interaction Comparison

For EACH interaction marked ✅ REPLICATE in INTERACTION_MAP.md, plus any new interactions discovered in Step 3:

1. **On original site:** Trigger the interaction via Chrome MCP (click, scroll, hover). Screenshot the BEFORE and AFTER states.
2. **On clone site:** Trigger the same interaction. Screenshot the BEFORE and AFTER states.
3. **Compare both transitions:** Does the same trigger produce the same visual change? Check:
   - Does the revealed/changed content match?
   - Does the transition feel similar (duration, direction)?
   - Does the trigger element change appearance correctly (active highlight, rotation, color)?
   - For multi-state elements (app switcher, tab bar): click EVERY option on both sites and compare each resulting state
4. **Fix or accept:** Same loop as visual regression.
5. **Update manifest:** Mark as ✅ when behavior matches.

### Step 5: Responsive Verification

Using Chrome MCP resize:
1. Resize to 1440px → screenshot clone → compare layout with original
2. Resize to 768px → same
3. Resize to 390px → same

Note any layout breakages (overflow, stacking issues, hidden elements).

### Step 6: Final Manifest Review

Read through the entire QA_MANIFEST.md. Every row must be ✅. If any row is still ⬜ or ❌:
- It's either a known limitation (document in BLOCKED_INTERACTIONS.md)
- Or it needs to be fixed before declaring the clone complete

Only when every verifiable item in the manifest is ✅ is the clone complete.

## Pre-Dispatch Checklist

Before dispatching ANY builder agent, verify you can check every box. If you can't, go back and extract more.

- [ ] Spec file written to `docs/research/components/<name>.spec.md` with ALL sections filled
- [ ] Every CSS value in the spec is from `getComputedStyle()`, not estimated
- [ ] Interaction model is identified and documented (static / click / scroll / time)
- [ ] For stateful components: every state's content and styles are captured
- [ ] For scroll-driven components: trigger threshold, before/after styles, and transition are recorded
- [ ] For hover states: before/after values and transition timing are recorded
- [ ] All images in the section are identified (including overlays and layered compositions)
- [ ] Responsive behavior is documented for at least desktop and mobile
- [ ] Text content is verbatim from the site, not paraphrased
- [ ] The builder prompt is under ~150 lines of spec; if over, the section needs to be split

## What NOT to Do

These are lessons from previous failed clones — each one cost hours of rework:

- **Don't build click-based tabs when the original is scroll-driven (or vice versa).** Determine the interaction model FIRST by scrolling before clicking. This is the #1 most expensive mistake — it requires a complete rewrite, not a CSS fix.
- **Don't extract only the default state.** If there are tabs showing "Featured" on load, click Productivity, Creative, Lifestyle and extract each one's cards/content. If the header changes on scroll, capture styles at position 0 AND position 100+.
- **Don't miss overlay/layered images.** A background watercolor + foreground UI mockup = 2 images. Check every container's DOM tree for multiple `<img>` elements and positioned overlays.
- **Don't build mockup components for content that's actually videos/animations.** Check if a section uses `<video>`, Lottie, or canvas before building elaborate HTML mockups of what the video shows.
- **Don't approximate CSS classes.** "It looks like `text-lg`" is wrong if the computed value is `18px` and `text-lg` is `18px/28px` but the actual line-height is `24px`. Extract exact values.
- **Don't build everything in one monolithic commit.** The whole point of this pipeline is incremental progress with verified builds at each step.
- **Don't reference docs from builder prompts.** Each builder gets the CSS spec inline in its prompt — never "see DESIGN_TOKENS.md for colors." The builder should have zero need to read external docs.
- **Don't skip asset extraction.** Without real images, videos, and fonts, the clone will always look fake regardless of how perfect the CSS is.
- **Don't give a builder agent too much scope.** If you're writing a builder prompt and it's getting long because the section is complex, that's a signal to break it into smaller tasks.
- **Don't bundle unrelated sections into one agent.** A CTA section and a footer are different components with different designs — don't hand them both to one agent and hope for the best.
- **Don't skip responsive extraction.** If you only inspect at desktop width, the clone will break at tablet and mobile. Test at 1440, 768, and 390 during extraction.
- **Don't forget smooth scroll libraries.** Check for Lenis (`.lenis` class), Locomotive Scroll, or similar. Default browser scrolling feels noticeably different and the user will spot it immediately.
- **Don't dispatch builders without a spec file.** The spec file forces exhaustive extraction and creates an auditable artifact. Skipping it means the builder gets whatever you can fit in a prompt from memory.
- **Don't use Node.js-specific APIs.** This project deploys to Cloudflare Workers. Avoid `fs`, `path`, `process` etc. in runtime code. Build scripts are fine.
- **Don't write CSS values from memory or training data.** If you "know" WhatsApp uses dark green headers, that's irrelevant — the target site might use a completely different color scheme. Every value must come from `getComputedStyle()` on the actual rendered page. This is the single most common source of visual mismatches.
- **Don't skip close-up screenshots of complex sub-regions.** A full-page screenshot is too small to see bubble tails, read receipts, status bar icons, background patterns, or subtle border styles. Each section needs its own close-up screenshot BEFORE you write its spec.
- **Don't ignore pseudo-elements.** Chat bubble tails, decorative arrows, quote marks, and many other visual details are rendered via `::before` / `::after` pseudo-elements. Always check for them — they're invisible in a standard DOM walk.
- **Don't assume `backgroundColor` is the only background.** Many elements use `backgroundImage` for patterns, gradients, or SVG textures. Extract both `backgroundColor` AND `backgroundImage`.
- **Don't write a spec for a collapsed/hidden section without first expanding it.** If a sidebar accordion, tab panel, dropdown, or collapsible section is closed on page load, you MUST click it open via Chrome MCP and extract its expanded content. A spec that says "Messages (collapsed)" with no content detail is an incomplete spec and will produce an empty component.
- **Don't use the standard 4-level extraction depth for nested/embedded UIs.** Phone simulators, chat previews, email mockups, and similar "page-within-page" components have deep DOM trees. Increase depth to 8 levels and run extraction separately on each sub-region (status bar, header, body, input bar, overlays).

## Completion

When done, report:
- Total sections built
- Total components created
- Total spec files written (should match components)
- Total assets downloaded (images, videos, SVGs, fonts)
- Build status (`pnpm build` result)
- **QA Manifest summary:** X/Y visual checks passed, X/Y interactions verified, X/Y responsive checks passed
- **Blocked interactions:** list from BLOCKED_INTERACTIONS.md
- **Remaining discrepancies:** any ❌ items with explanation
- Link to `docs/qa/` directory for all comparison screenshots

@.claude/skills/clone-website/TARGET.md
@.claude/skills/clone-website/INSPECTION_GUIDE.md
