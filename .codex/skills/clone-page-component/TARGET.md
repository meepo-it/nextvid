# Clone Target

Fill this before implementation. Treat it as the contract for the clone.

## Source

- URL:
- Scope type: `page` | `section` | `component` | `behavioral-unit`
- Source region selector or visual description:
- Reference states that must be covered:
- Required viewports: `desktop` / `tablet` / `mobile`

## Destination

- App root:
- Host app name:
- Host stack / framework:
- Host shell or preserved layout boundary:
- Scope slug:
- Destination route(s):
- Destination component path(s):
- Files expected to change:
- Host surfaces to preserve untouched:

## Host Adapter

- Routing convention:
- Styling convention:
- Component composition convention:
- State management convention:
- Data / mock boundary convention:
- Metadata / document-head convention:
- Package manager:
- Verification commands:
- Source-equivalent micro-primitives allowed where:
- Host-native abstractions that must be respected:

## Fidelity Contract

- Visual fidelity target:
- Interaction fidelity target:
- Functional fidelity target:
- Responsive fidelity target:
- Approximation ban list:

## Critical Fidelity Targets

- Pixel-critical surfaces:
- Must-preserve typography and line breaks:
- Must-preserve assets and layered effects:
- Required numeric locks:
- Allowed tolerances:

## State And Dependency Contract

- Trigger surfaces:
- Affected surfaces:
- Shared state owner:
- Data source: `real` | `contract-faithful mock`
- Explicit out-of-scope behaviors:

## Acceptance

- Must-match states:
- Must-match close-ups:
- Required screenshots:
- Required QA commands:
- Non-goals:

## Notes

- In this workspace, `upmocker/` is the default candidate app root, but it must still be confirmed.
- If the target interaction affects another region, widen scope to a `behavioral-unit`.
