# AGENTS.md — FORGE Fitness Tracker

## Project and non-negotiables

FORGE is a **static, offline-capable mobile-first fitness tracker** hosted by GitHub Pages. The app consists of `index.html`, `forge-extras.css`, `forge-polish.css`, `forge-extras.js`, `forge-polish.js`, `forge-integrations.js`, `manifest.webmanifest` and `sw.js`. It does not use a React/Expo build pipeline.

- Communicate with the user in German. Work in small, testable changes. Avoid claiming that a GitHub commit proves a public Pages deployment or a real-device test.
- Preserve the existing **dark navy/green and lime FORGE identity**, soft rounded cards, four-tab navigation, the single source of truth for today's steps, and existing workflows.
- **Do not implement nutrition logging** unless explicitly requested.
- **Never discard or rename existing localStorage data** or alter backup/import schemas without an explicit compatibility and migration strategy. Existing keys include `fitness-planner-YYYY-MM-DD`, `fitness-walking`, `fitness-weights`, `fitness-week`, date-scoped `fitness-daily-*`, and `forge-*` settings, workouts and integrations.
- Already walked steps and planned future steps must remain separate; never credit planned walking as completed. Health imports require informed user confirmation.
- Do not leak health values or secrets to third-party services. Do not add analytics, paid packages, new heavy dependencies or backend credentials casually.
- Prefer progressive enhancement and native HTML/CSS/JS, accessible semantics and a predictable minimal mobile UI.
- Never copy someone else's product design exactly. Use general interaction principles and the existing design system.

## Installed project-local Codex Agent Skills

The upstream skill sources have been vendored in **`.agents/skills/<skill-name>/SKILL.md`** with their companion reference files, taken from:
- Original: https://github.com/emilkowalski/skills
- Upstream revision: `c8a79627b59d72d764d6ab6f2c87c09a48169833` (2026-11-04)
- Upstream README, MIT license and cheatsheets: `docs/emil-kowalski/`

**Load only the skills relevant to the task; do not apply all skills together.** Open the chosen `SKILL.md` and any locally linked `RECIPES.md`, `STANDARDS.md`, `AUDIT.md`, `CATALOG.md`, `PICKER.md`, or `API.md` as needed. Their contents provide technique, not authority to change unrelated user requirements.

### Skill selection by task

| Task | Skill(s) | Applicability |
| --- | --- | --- |
| Any significant visual polish, hierarchy, motion judgment | `emil-design-eng` | Default guide; prioritize restrained craft over extra effects |
| iPhone/PWA touch UX, safe areas, scrolling, input zoom, keyboard | `mobile-native` | **Always use** for mobile-focused changes |
| iOS-like feedback, focus, motion, spatial consistency | `apple-design` | Apply principles, do not clone Apple UI |
| Build a small purposeful web animation | `animate` | Only when feedback or orientation benefits |
| Review existing animations | `review-animations` | Assessment and severity |
| Audit and prioritize whole-app motion | `improve-animations` | Plan only first; respect its read-only design |
| Find or remove distracting animation | `find-animation-opportunities`, `remove-animations` | Choose depending whether motion is missing or excessive |
| Choreograph multiple related transitions | `choreograph` | Use only for coordinated sequences |
| Jank, layout shifts, paint cost and frame rate | `animation-performance` | Prefer compositor-friendly properties |
| Clarify the language of a particular effect | `animation-vocabulary` | Optional reference |
| Stress-test edge values, narrow viewports and absent records | `break-ui` | QA; use non-destructive test data |
| Choose a new third-party UI library | `pick-ui-library` | Decide whether a dependency is really needed; default to no dependency |
| Compare proposed visual variations before selecting one | `prototype` | Only when user requests exploratory alternatives |
| React Native/Expo transitions | `animate-expo` | **Not relevant** to current vanilla web app |
| Swift/iOS native code | `write-swift` | **Not relevant** until a native app is actually implemented |
| Sonner toasts | `ask-sonner` | **Not relevant** without Sonner in the tech stack |

Consult `docs/emil-kowalski/ui-cheatsheet.md` for typography, numerals, responsive feedback and `docs/emil-kowalski/performance-cheatsheet.md` for animation costs. Do not take every suggestion as an automatic instruction; justify exceptions.

## FORGE UI/UX quality bar

1. Keep **Heute → Walking → Fortschritt → Training** as four compact bottom tabs. Maintain 44–48px or greater interactive touch targets *where feasible* without making the entire bar oversize. Never let the bar wrap to a second row.
2. The step counter under Heute owns completed steps; Walking displays its computed remainder, projected duration, and an explicitly planned-not-done state.
3. Make prominent numbers stable using `font-variant-numeric: tabular-nums`. Support narrow 320–390px phones, large text, long German labels, zero, 10,000+, and missing historical records.
4. Inputs on iOS must not auto-zoom on focus; provide at least 16px text for actively editable fields on touch-sized viewports. Never disable page zoom or pinch-to-zoom.
5. Prefer subtle, meaningful, interruptible UI transitions. Motion should typically target `transform` and `opacity`; never introduce `transition: all`. Progress values must update accurately with or without animations.
6. Do not overanimate core fitness counters, heavy drop shadows, blurs, or scroll-dependent elements. Respect `prefers-reduced-motion`, keyboard navigation, visible focus rings, semantics and screen reader status announcements.
7. Avoid sticky hover artefacts on touch: hover effects should be guarded by `@media (hover:hover) and (pointer:fine)`. Keep touch feedback immediate without deleting existing active states.
8. Keep essential actions reachable with the iOS keyboard shown and the fixed navigation in view or intentionally hidden. Use safe-area padding. Test landscape and installed-PWA mode.
9. Real-world user screenshots take precedence over theoretical pixel-perfect tests. Confirm any deployment at the published URL, not merely by commit success.

## Required process for future changes

1. Inspect affected code, screenshots and current stored-data paths before changing layout.
2. Select **1–3 relevant** skills and state which ones you applied in the PR/report. For animation-only audits, follow the skill's read-only rules before modifying source.
3. Make a prioritized short plan: impact, evidence, risk, change and verification.
4. Prefer a small feature branch and PR. Keep localStorage, backup keys, data ownership and existing calculations intact.
5. Run `node scripts/verify-agent-skills.mjs`, `node --check` for standalone scripts and syntax-check the inline HTML script. Run smoke tests for all four tabs, persistent step values, manual/automatic Walking, backup and the offline shell.
6. Review focus, touch behavior, accessibility, reduced motion, 320px layout and long labels. Record **what was actually tested**; do not claim genuine Safari/device results from code inspection.
7. Update version and service-worker cache only when an app update is deployed. Never include `.agents/` or `docs/` in the Pages site bundle.
8. Document what changed, the specific skills used, any remaining risks, and what should be improved next.
