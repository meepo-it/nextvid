# Architecture Contract

This skill guarantees clone quality by forcing explicit contracts between extraction, implementation, and QA.

## Artifact Chain

Create these files under `<app-root>/docs/research/clone/<scope-slug>/`.

### 1. `TARGET_LOCK.md`

Locks the exact source, destination, scope boundary, and fidelity bar.

Must answer:
- What is in scope?
- What is explicitly out of scope?
- Which surfaces change together?
- What is the destination inside the host app?

### 2. `HOST_ADAPTER.md`

Locks how the generic clone workflow maps onto the current codebase.

Must answer:
- What is the real host app root?
- Which framework or stack rules matter here?
- Which route, component, style, state, and metadata conventions must be preserved?
- Which commands define done in this host?
- Which host surfaces are protected from clone spillover?

### 3. `SURFACE_INVENTORY.md`

Locks the interactive surface map before implementation.

Include:
- editable surfaces
- hover-only surfaces
- focus-only surfaces
- upload surfaces
- drag or reorder surfaces
- add / remove actions
- selected / active / disabled states
- cross-surface synchronization rules

If a surface exists in the source and changes user-visible output, it must appear here.

### 4. `CRITICAL_FIDELITY.md`

Locks the surfaces where approximation is forbidden.

Include:
- critical node or sub-surface name
- screenshot reference
- selector or structural locator
- exact measured values to preserve
- allowed tolerance, if any
- whether approximation is banned
- whether a generic local primitive is forbidden

### 5. `FOUNDATION_SPEC.md`

Defines the reusable layer the rest of the clone depends on.

Include:
- fonts and weights
- font metrics when line wrapping matters
- color tokens
- spacing scale
- radius and shadows
- shared motion rules
- global CSS behavior
- asset inventory
- layered assets such as wallpapers, overlays, filters, and opacity rules
- reusable primitives to build or reuse
- host-native primitives that are safe to reuse
- source-equivalent micro-primitives that must remain local to the clone

### 6. `INTERACTION_MAP.md`

Defines the behavioral graph.

For every interaction, record:
- trigger surface
- trigger type
- affected surface
- visible change
- hidden state change
- implementation owner

If an interaction changes another region, those regions are one behavioral unit.

### 7. `INTEGRATION_PLAN.md`

Defines how the clone fits the host app.

Include:
- route ownership
- component ownership
- state ownership
- hook/context/router usage
- mock data boundaries
- host surfaces that must remain untouched
- files each worker may edit
- how the clone honors the host adapter without leaking source-specific architecture into unrelated app areas

### 8. `components/*.spec.md`

One spec per behavioral unit or sub-unit.

Every spec must include:
- screenshot reference
- DOM structure
- exact computed styles
- critical nodes and numeric locks
- assets
- pseudo-elements and layered backgrounds
- states and transitions
- text content
- responsive behavior
- integration notes

### 9. `QA_REPORT.md`

Tracks command results, screenshot comparisons, unresolved gaps, and whether the clone is shippable.

## Layering Rules

Implement from low-level stability to high-level composition.

### Layer 1. Foundation

Global tokens, fonts, shared motion, downloaded assets.

### Layer 2. Primitives

Reusable local components needed by multiple units.

Critical note:
- If a source sub-surface relies on exact geometry, a custom local primitive is preferred over a mismatched shared primitive.

### Layer 3. Behavioral Units

Sections or components that own a coherent visual and state boundary.

### Layer 4. Composition

Route wiring, layout orchestration, and cross-unit state flow.

### Layer 5. Verification Fixes

Targeted patches after diff and interaction checks.

Do not skip layers. If Layer 3 needs something from Layer 1 or 2, stop and add it there first.

## Functional Fidelity Rule

There are only three valid implementation modes:

1. `real`
   - Use the actual local business logic because it is in scope.
2. `contract-faithful mock`
   - Use typed local state and deterministic data to preserve the same UX and visible outcomes.
3. `omitted-by-contract`
   - Only allowed when the user accepted the omission in `TARGET_LOCK.md`.

“Looks clickable but does nothing” is not a valid mode.

“Exists in the source but was not inventoried” is also not a valid mode.

## State Ownership Rule

Each piece of state must have one explicit owner:
- local component state
- shared hook
- context
- router state

Never spread ownership implicitly across multiple components.

## Worker Ownership Rule

Parallel workers must have disjoint write scopes whenever possible.

Good split:
- Worker A: `src/styles.css`, assets, shared tokens
- Worker B: `src/components/clone/hero/*`
- Worker C: `src/components/clone/pricing/*`
- Worker D: `src/routes/product.tsx`

Bad split:
- Multiple workers editing the same route and the same stateful component concurrently

## Completion Rule

The clone is complete only when the contracts, implementation, and QA report agree with each other.
The host adapter must also agree with the final file layout, commands, and preserved host boundaries.
