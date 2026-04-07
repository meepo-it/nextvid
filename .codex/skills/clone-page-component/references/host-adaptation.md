# Host Adaptation

This skill is meant to be reusable across projects. Reuse comes from the common clone workflow. Safety comes from a host adapter.

## Core Principle

Separate the clone process into two layers:

1. Generic clone core
   - scope locking
   - extraction
   - contracts
   - fidelity gates
   - interaction verification
2. Host adapter
   - app root detection
   - framework conventions
   - file ownership
   - command discovery
   - shell preservation

Do not hardcode one project's rules as if they were universal. Do not ignore the current host app in the name of generality.

## What The Adapter Must Discover

Before implementation, confirm:
- the real app root
- the framework or stack
- routing conventions
- styling conventions
- component and folder conventions
- state and data conventions
- metadata and document-head conventions
- package manager and verification commands
- host shell surfaces that must remain untouched

## How To Detect The Host

Start from the user request and find the app that owns the destination.

Prefer the directory that contains:
- `package.json`
- the route or page entry surface to be changed
- a component tree used by that route
- lockfiles and scripts that define the real runtime
- local agent instructions such as `AGENTS.md`

If more than one app is possible, pick the one that owns the preserved shell the user mentioned.

## Host-Native Implementation Rules

The clone must adapt to the host instead of importing source architecture verbatim.

Good adaptation:
- Next app uses `app/` routes, so the clone integrates there
- TanStack app uses `src/routes/`, so the clone integrates there
- Vue app uses SFCs, so the clone is implemented as SFCs
- local design tokens are reused only when they materially match the source

Bad adaptation:
- forcing a React hook architecture into a non-React host
- copying source CSS or DOM blindly into unrelated global files
- changing the host header, footer, nav, or document structure when the user asked to preserve them

## Fidelity Overrides Host Abstractions Only When Necessary

If a host primitive materially changes the recognizable source geometry, use a source-equivalent local primitive inside the clone boundary.

Examples:
- exact bubble tail SVG instead of a generic tooltip triangle
- exact input shell instead of a design-system input with visible outline
- exact icon SVG instead of a mismatched icon-library glyph

This is allowed only inside the clone boundary defined by `TARGET_LOCK.md` and `INTEGRATION_PLAN.md`.

## Current Workspace Note

In this repository, the likely host app is `upmocker/` and the likely host stack is TanStack Start.

That is a workspace-specific detection result, not part of the universal method.
