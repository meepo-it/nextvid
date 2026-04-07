---
name: clone-page-component
description: Rebuild a target page, section, or component as a production-grade clone inside the current codebase. Use when the user wants maximum visual and behavioral fidelity, including UI states, interactions, dependencies, and cross-component effects, while staying native to the existing framework and architecture.
---

# Clone Page Or Component

This skill is for production cloning, not inspiration work. The target output must match the source at four levels:

1. Visual fidelity
2. Interaction fidelity
3. Functional fidelity
4. Integration fidelity inside the current app

If the source behavior cannot be implemented with the real backend, build a typed contract-faithful mock that preserves the same user-visible flows, state changes, validation, and cross-component effects.

## Read First

1. Read `TARGET.md` in this skill folder and lock the request into that structure.
2. Read `references/host-adaptation.md`.
3. Read `references/architecture-contract.md`.
4. Read `references/spec-templates.md`.
5. Read `references/qa-gates.md`.

Keep `SKILL.md` lean. Put the heavy detail into the artifact files you generate for the target clone.

## Host Detection And App Root Detection

Before doing anything else, detect the real host app and the real app root.

Prefer the directory that contains:
- `package.json`
- `src/routes` or `src/app`
- `src/components`
- project agent instructions such as `AGENTS.md`

If multiple candidates exist, choose the one that:
- owns the route or entry surface the user wants to modify
- has the active package manager lockfile
- contains the host shell that must remain intact

In this workspace, start by checking `upmocker/`, but treat that as a workspace hint, not a universal rule.

Then:
- Read `<app-root>/AGENTS.md`
- Read the host architecture and commands through `references/host-adaptation.md`
- Use the package manager and build commands defined by the detected host app
- Keep all clone outputs inside that app root

## Non-Negotiables

- Browser automation is required. Prefer Chrome MCP when available.
- Never write CSS values, layout assumptions, or behavioral details from memory.
- For pixel-critical subregions, approximate visuals are not acceptable. Extract and reproduce the real structure.
- Pseudo-elements, inline placeholders, layered backgrounds, SVG geometry, font metrics, and focus treatment are mandatory extraction targets when present.
- If the source depends on a specific icon shape, raw input shell, or other micro-UI geometry, do not default to a generic design-system primitive just because one exists locally.
- Missing fonts, wallpapers, icons, and similar clone-critical assets must be installed or localized when licensing and project policy allow it.
- Never ship dead controls. Every interactive affordance must either work, be intentionally disabled because the source is disabled, or be explicitly marked out of scope by the user.
- If one surface affects another surface, they belong to the same behavioral unit and must be specified together.
- No “single giant prompt” implementation. Use architectural decomposition, specs, and gated integration.
- Completion requires the QA gates in `references/qa-gates.md`, not just a passing screenshot.

## Architecture-First Workflow

### 1. Lock The Scope Contract

Update `TARGET.md` before writing code.

Determine whether the target is:
- A full page
- A section
- A single component
- A composite behavioral unit

A composite behavioral unit is the default whenever clicking, hovering, scrolling, or typing in one region changes another region.

Create a scope slug and reserve these folders:
- `<app-root>/docs/research/clone/<scope-slug>/`
- `<app-root>/docs/design-references/clone/<scope-slug>/`
- `<app-root>/scripts/clone/<scope-slug>/` when asset or extraction scripts are needed

### 2. Build The Host Adapter Before Building UI

Create `HOST_ADAPTER.md` first.

This is the bridge between the generic clone workflow and the current codebase. It must lock:
- the real host stack and entry points
- routing, styling, state, data, and metadata conventions
- package manager and verification commands
- host surfaces that must remain untouched
- where source-equivalent micro-primitives are allowed or forbidden

Generic skill quality comes from the common workflow. Host safety comes from the adapter.

### 3. Build The Clone Contracts Before Building UI

Using `references/architecture-contract.md`, create these artifacts in order:

1. `TARGET_LOCK.md`
2. `HOST_ADAPTER.md`
3. `SURFACE_INVENTORY.md`
4. `CRITICAL_FIDELITY.md`
5. `FOUNDATION_SPEC.md`
6. `INTERACTION_MAP.md`
7. `INTEGRATION_PLAN.md`
8. `components/*.spec.md`
9. `QA_REPORT.md`

Do not dispatch builders until the relevant contract exists.

### 4. Extract Reality, Not Approximation

For the source target:
- Capture desktop, tablet, and mobile states when applicable
- Capture close-up screenshots for each behavioral unit
- Extract computed CSS, DOM structure, assets, text, icons, animations, and transitions
- For every critical fidelity surface, extract numeric measurements for size, spacing, typography, radius, and placement
- Record pseudo-elements, SVG `viewBox` and path geometry, layered background assets, filters, opacity, and control reset styles
- Capture all states: default, hover, active, open, focused, scrolled, loading, error, success
- Capture cause-and-effect behavior, not just the clicked element
- Build a full surface inventory first: editable, hoverable, focusable, draggable, uploadable, reorderable, add/remove actions, selected states, and any cross-surface sync

If the target is a page-within-page mockup or deeply nested UI, increase extraction depth and split extraction by meaningful sub-region.

Treat these as critical fidelity surfaces unless proven otherwise:
- system chrome recreated inside the page, such as status bars, nav bars, toolbars, and chat shells
- message bubbles, tails, timestamps, checks, badges, pills, and other micro-layout elements
- font-sensitive surfaces where line breaks materially affect the clone
- inputs, textareas, and shells whose outline, padding, or icon placement are visible in the source

### 5. Implement In Layers

Build in this order:

1. Foundation
   - fonts
   - color tokens
   - spacing tokens
   - global motion
   - shared assets
2. Primitives
   - icons
   - cards
   - buttons
   - badges
   - shells reused across the clone
3. Behavioral units
   - sections or components with their own local state and visuals
4. Composition
   - route integration
   - cross-component state wiring
   - responsive orchestration
5. QA patches
   - targeted fixes based on diff and behavior failures

### 6. Preserve Host Integrity

The clone must feel native to the existing app, not pasted in from another stack.

Use `HOST_ADAPTER.md` to lock:
- route ownership and file locations
- component locations and import conventions
- style system boundaries
- metadata or document head ownership
- state/data patterns
- test, build, and lint commands

For the current workspace, the likely adapter is TanStack Start under `upmocker/`, but the skill itself must remain valid for any React, Next, Vue, Svelte, or static host as long as the adapter is filled correctly.

For cross-component effects:
- Use explicit props, hooks, context, or router state
- Do not fake architecture with DOM queries or ad hoc event wiring
- Choose a single owner for each piece of state

### 7. Builder Dispatch Rules

You may parallelize only after specs exist.

Dispatch by write ownership:
- one worker for foundation changes
- one worker per independent behavioral unit
- one worker for final route composition if needed

Every builder must receive:
- the full inline spec content
- screenshot paths
- asset paths
- target file ownership
- verification commands

If the prompt for one builder becomes too long, the unit is too large and must be split.

### 8. Production Gates

Before declaring completion:
- Run the commands from the app root discovered in `HOST_ADAPTER.md`
- Pass the QA gates in `references/qa-gates.md`
- Compare source and clone at the same viewports and states
- Verify interactions, not just default appearance

Minimum expectation:
- `npx tsc --noEmit`
- host build command
- host code-quality command if available
- browser-level interaction verification
- browser-level numeric spot checks for critical fidelity surfaces

If a command fails because of unrelated pre-existing issues, isolate that clearly in `QA_REPORT.md`.

## What Good Looks Like

The clone is done only when:
- the page or component matches the original visually at the required viewports
- interactions trigger the same visible outcomes
- local architecture matches the host app’s conventions
- state ownership is explicit
- critical surfaces match the measured source values or documented tolerances
- assets, specs, and QA artifacts are stored and auditable
- another agent could reproduce or maintain the clone by reading the generated contracts
- the generic workflow is preserved without violating host-app constraints because `HOST_ADAPTER.md` and `INTEGRATION_PLAN.md` agree
