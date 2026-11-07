# FORGE UI/UX audit and prioritized improvements
Date: 2026-11-07 | Baseline: FORGE 7.4.0 | Scope: mobile-first static PWA

## Evidence and limits

Reviewed `index.html`, `forge-extras.css`, `forge-polish.css`, the three app JS files and the offline shell, plus the user's earlier iPhone screenshots showing oversized SVG navigation and duplicate step entry. This is a code-based and screenshot-informed audit, **not** a claim to have inspected a current physical iPhone. The live Pages deployment must be checked separately.

Skills consulted for this iteration: `emil-design-eng` (restrained feedback), `mobile-native` (iOS touch and keyboard), `animation-performance` (compositor-friendly effects), `review-animations` (motion scrutiny), `break-ui` (input and screen-size edge cases), and `apple-design` (spatial consistency / reduced motion). Cross-checked the upstream UI and performance cheatsheets copied to `docs/emil-kowalski/`.

## Prioritized findings

| Priority | Evidence | User impact | Change | Verification |
| --- | --- | --- | --- | --- |
| P0 | `#forgeStepFill`, `#walkingProgressFill` animate `width` on step updates | Unnecessary layout/paint work during frequent updates | Keep layout width at 100%, animate `scaleX` on compositor; use same saved step percentage | 0, 50, 100% and 10,000+ values; percentage and ARIA still accurate |
| P0 | iOS input zoom avoidance is not consistently documented across the many inputs | An input under 16px can zoom Safari and disrupt bottom navigation | Touch-only 16px floor for normal text/number/date/time/select fields; do not disable pinch zoom | 320, 375, 390px; keyboard; Safari follow-up |
| P1 | Hover rules not gated by pointer capability and shorthand transitions apply to unspecified properties | Sticky hover and inconsistent microinteraction timing | Guard hover styles, define explicit transitions and press feedback | Tap, mouse and keyboard; reduced-motion preference |
| P1 | Selected nav item is visually active but the code only toggles CSS classes | Assistive technologies may not announce current area | Update `aria-current=\"page\"` and `aria-controls` as selection changes | Tab clicks and selection state |
| P1 | Step history bars animate `height` even though values are historical | Unnecessary layout animation and possible jank | Render static heights; leave optional detail panels interruptible | 7-day updates, empty / sparse history |
| P1 | Large headings, side-by-side values and several settings cards compete for attention | Less obvious action hierarchy on narrow screens | Keep one canonical steps entry and compact Walking summary; refine spacing only where screenshots show a problem | Current iPhone screenshots + small viewport test |
| P2 | Several historical CSS layers and inline styles overlap | Increased risk of specificity regressions | Consolidate styles in later, separately tested release | Screenshot diffs on all four tabs, no storage changes |
| P2 | Full app lacks an automated multi-viewport visual regression suite | Bugs can recur after successful syntax checks | Add reproducible UI smoke and viewport tests, then real iPhone verification | CI, keyboard/focus and real-device inspection |

## First implementation slice

- Compositor-friendly **step progress** animation, no change to stored values or formulas.
- **Touch and focus** consistency: prevent iOS input zoom, avoid sticky hover, immediate button response and explicit motion timing.
- **Accessible selected navigation state**, without rewriting the four tabs.
- Add **Codex skills integrity validation** to the existing publishing workflow.

No new app library, nutrition tracking, external health transfer, backend service or change to localStorage keys.

## Deferred follow-up

1. Verify touch/keyboard interactions and screenshot layout on the user's actual iPhone after Pages deploy.
2. Consolidate duplicate CSS rules only with before/after visual evidence.
3. Make empty states, status messages and loading feedback consistent.
4. Add broader automated visual regression tests and performance profiles (iPhone Safari remains essential).
5. Consider onboarding and priority-based dashboard personalization once existing UI is stable.
