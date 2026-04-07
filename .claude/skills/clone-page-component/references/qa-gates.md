# QA Gates

These are hard gates, not suggestions.

## Gate 1. Scope Integrity

Pass only if:
- `TARGET.md` is filled
- `TARGET_LOCK.md` exists
- scope boundaries are explicit
- affected surfaces are identified

Fail if:
- the request is still ambiguous
- a supposedly isolated component actually changes another region

## Gate 2. Host Adapter Integrity

Pass only if:
- `HOST_ADAPTER.md` exists
- the real app root is confirmed
- route, style, component, state, data, and metadata conventions are explicit
- verification commands come from the real host app
- protected host surfaces are listed

Fail if:
- the skill assumes a framework without checking
- the clone writes outside the intended host app
- the clone plan would alter host shell areas the user asked to preserve

## Gate 3. Extraction Integrity

Pass only if:
- screenshots exist for the required viewports
- every behavioral unit has a close-up screenshot
- `SURFACE_INVENTORY.md` exists
- component specs are backed by computed styles
- all required states were extracted
- assets and text content are accounted for
- critical surfaces have measured values recorded in `CRITICAL_FIDELITY.md`
- pseudo-elements, layered assets, font metrics, SVG geometry, and control reset states were captured when present

Fail if:
- values were guessed
- only default state was captured
- editable or interactive surfaces were skipped from inventory
- layered assets or pseudo-elements were ignored
- critical surfaces were represented only by general screenshots without numeric extraction

## Gate 4. Architecture Integrity

Pass only if:
- `FOUNDATION_SPEC.md`, `INTERACTION_MAP.md`, and `INTEGRATION_PLAN.md` exist
- state ownership is explicit
- cross-component effects are represented in the plan
- workers have clear write ownership
- the integration plan matches `HOST_ADAPTER.md`

Fail if:
- architecture is implicit
- cross-component effects are implemented with ad hoc DOM manipulation

## Gate 5. Code Integrity

Pass only if:
- `npx tsc --noEmit` passes
- host build command passes
- host code-quality command passes, or pre-existing failures are isolated and documented

For this workspace, the default expectation from the app root is:
- `npx tsc --noEmit`
- `pnpm build`
- `pnpm check`

## Gate 6. Behavioral Integrity

Pass only if:
- every required interaction produces the same visible outcome as the source
- every inventoried interactive surface is implemented, intentionally disabled, or explicitly contracted out
- active, hover, open, scrolled, loading, and error states are covered when applicable
- contract-faithful mocks preserve the same user-visible flows
- focus, disabled, and selected treatments match when they are visible in the source

Fail if:
- buttons look real but do nothing
- one region updates in the source but not in the clone
- upload, reorder, add/remove, or cross-surface sync behaviors were omitted without contract approval
- transitions differ materially without user approval

## Gate 7. Visual Integrity

Pass only if:
- source and clone are compared at the same viewport and state
- spacing, typography, radius, shadows, layering, and asset placement materially match
- responsive layout matches the agreed fidelity target
- critical nodes match their measured source values or documented tolerances
- system chrome recreated inside the page uses source-equivalent geometry, not generic substitutes

Fail if:
- only a single static screenshot was compared
- mobile or tablet were skipped even though required
- critical nodes were not measured
- a generic icon or input shell changed the recognizable source shape

## Gate 8. Ship Integrity

Pass only if `QA_REPORT.md` says:
- commands passed
- visual diff passed
- interaction diff passed
- critical fidelity spot checks passed
- remaining gaps are empty, or explicitly accepted by the user

If any gate fails, the clone is not complete.
