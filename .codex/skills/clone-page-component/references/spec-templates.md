# Spec Templates

Use these templates as working skeletons. Trim fields only when truly not applicable.

## `TARGET_LOCK.md`

```md
# Target Lock

- Source URL:
- Scope type:
- Scope boundary:
- Destination:
- Host surfaces to preserve:
- Fidelity target:
- In-scope behaviors:
- Out-of-scope behaviors:
- App root:
- Scope slug:
- Approximation bans:
```

## `HOST_ADAPTER.md`

```md
# Host Adapter

## Host Identity
- App root:
- App name:
- Framework / stack:
- Package manager:

## Architecture Rules
- Route location rules:
- Component location rules:
- Styling rules:
- State management rules:
- Data / mock rules:
- Metadata / document-head rules:

## Protected Host Boundaries
- Layout or shell surfaces to preserve:
- Files or folders to avoid touching:
- Shared abstractions safe to reuse:
- Shared abstractions not safe for fidelity-critical surfaces:

## Verification
- Typecheck command:
- Build command:
- Code-quality command:
- Browser verification method:

## Current Clone Mapping
- Destination route owner:
- Destination component owner:
- Asset location rules:
- Notes:
```

## `SURFACE_INVENTORY.md`

```md
# Surface Inventory

| ID | Surface | Region | Interaction Type | Source State(s) | Affected Surface(s) | Required Fidelity | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S-01 | Preview bubble text | preview | click, hover | default, hover, selected | preview editor, left message form | exact | bidirectional text sync |
| S-02 | Avatar uploader | people panel | upload | empty, uploaded | preview header, message avatars | exact | supports local image file |
| S-03 | Message reorder handle | messages panel | drag, drop | idle, dragging, drop target | left list order, preview order | exact | same visible order after drop |
```

## `CRITICAL_FIDELITY.md`

```md
# Critical Fidelity

| ID | Surface | Screenshot | Selector / Locator | Measured Properties | Source Values | Tolerance | Approximation Allowed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C-01 | WhatsApp sender bubble tail | `closeups/bubble-tail-sender.png` | `.whatsapp-tail-sender::after` | width, height, offset, fill | `15x17`, `right:-5`, `fill:#d9fdd3` | `0px` | no |
| C-02 | Status bar wifi icon | `closeups/status-bar.png` | `header .wifi-icon` | width, height, path geometry | `16x16`, source SVG path | `0px` | no |
| C-03 | Footer input shell | `closeups/footer-input.png` | `.footer-shell input` | border, outline, box-shadow, font, padding | `border:none`, `outline:none`, `14/20` | exact | no |
```

## `INTERACTION_MAP.md`

```md
# Interaction Map

| ID | Trigger Surface | Trigger Type | Affected Surface | Visible Outcome | State Owner | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| I-01 | Pricing tab | click | Pricing cards grid | cards swap, active pill changes | pricing section state | affects CTA copy too |
```

## `components/<name>.spec.md`

```md
# <Name> Spec

## Overview
- Target file:
- Screenshot(s):
- Behavioral unit:
- Interaction model:

## DOM Structure
- Container:
- Children:
- Important wrappers:
- Host shell boundaries to preserve:

## Exact Styles

### Container
- display:
- width:
- max-width:
- padding:
- gap:
- background:
- border:
- border-radius:
- box-shadow:

### Key child: <name>
- font:
- color:
- spacing:
- layout:

## Critical Nodes

| Node | Why Critical | Measured Properties | Source Values | Tolerance | Implementation Note |
| --- | --- | --- | --- | --- | --- |
| Bubble tail | recognizable silhouette | size, offset, fill, side | `15x17`, `right:-5` | `0px` | use local SVG, not generic triangle |
| Timestamp + checks | affects line breaks | font-size, line-height, gap, position | `8px`, `10.8px`, `2px`, `right:8 bottom:4` | `0.5px` | preserve placeholder + absolute metadata |

## Typography Metrics
- font-family:
- font-size:
- line-height:
- font-weight:
- letter-spacing:
- text-transform:
- wrap-sensitive notes:

## Pseudo-Elements And Layered Assets
- `::before`:
- `::after`:
- layered backgrounds:
- filters / opacity:
- asset URLs:

## Control Reset
- border:
- outline:
- box-shadow:
- native appearance:
- focus-visible treatment:

## States And Behaviors

### Default
- Visible state:
- Relevant computed styles:

### Hover / Active / Open / Scrolled / Loading
- Trigger:
- Before:
- After:
- Transition:
- Affected sibling or external regions:

## Assets
- Images:
- Videos:
- Icons:
- Backgrounds:
- Fonts:

## Text Content
- Verbatim copy:

## Responsive
- Desktop:
- Tablet:
- Mobile:
- Breakpoint notes:

## Integration Notes
- Imports to reuse:
- State owner:
- Props / hook contract:
```

## `INTEGRATION_PLAN.md`

```md
# Integration Plan

## Host Architecture
- App root:
- Route owner:
- Shared state owner:
- Host surfaces preserved untouched:

## File Plan
- Create:
- Update:
- Avoid touching:

## Wiring
- Route composition:
- Shared hooks/context:
- Data model:
- Asset paths:

## Verification
- Typecheck:
- Build:
- Browser checks:
- Critical fidelity spot checks:
- Host-boundary checks:
```

## `QA_REPORT.md`

```md
# QA Report

## Commands
- `npx tsc --noEmit`:
- `<build command>`:
- `<check command>`:

## Visual Diff
- Desktop:
- Tablet:
- Mobile:
- Critical close-ups:

## Interaction Diff
- State 1:
- State 2:
- State 3:
- Surface inventory coverage:

## Critical Fidelity Spot Checks
- Node:
- Source value:
- Clone value:
- Result:

## Remaining Gaps
- None / list

## Ship Decision
- Ready / Not ready
- Reason:
```
