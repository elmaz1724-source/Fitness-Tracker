# AGENTS.md — FORGE Fitness Tracker

## Project and non-negotiables

FORGE is a **static, offline-capable mobile-first fitness tracker** hosted by GitHub Pages. The app consists of `index.html`, `forge-extras.css`, `forge-polish.css`, `forge-extras.js`, `forge-polish.js`, `forge-integrations.js`, `manifest.webmanifest` and `sw.js`. It does not use a React/Expo build pipeline.

- Communicate with the user in German. Work in small, testable changes. Avoid claiming that a GitHub commit proves a public Pages deployment or a real-device test.
- Preserve the **Midnight Blue** FORGE identity (dark navy surfaces, readable blue accents such as `#6aadff`, soft rounded cards), three visible core tabs (four only in the archived advanced view), the single source of truth for today's steps, and existing workflows. Do not reintroduce the former lime-green highlight system without a user request.
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

1. **FORGE 8 is Back to Basics.** Show exactly **Heute → Walking → Fortschritt** by default. Make **Training** and other extras available only through a conscious **Weitere Funktionen öffnen** action. Never add a fourth primary tab in basic mode. In advanced mode the existing fourth Training tab remains intact. Maintain 44–48px or greater interactive touch targets *where feasible* without making the entire bar oversize. Never let the bar wrap to a second row.
2. The step counter under Heute owns completed steps; Walking displays its computed remainder, projected duration, and an explicitly planned-not-done state.
3. Make prominent numbers stable using `font-variant-numeric: tabular-nums`. Support narrow 320–390px phones, large text, long German labels, zero, 10,000+, and missing historical records.
4. Inputs on iOS must not auto-zoom on focus; provide at least 16px text for actively editable fields on touch-sized viewports. Never disable page zoom or pinch-to-zoom.
5. Prefer subtle, meaningful, interruptible UI transitions. Motion should typically target `transform` and `opacity`; never introduce `transition: all`. Progress values must update accurately with or without animations.
6. Do not overanimate core fitness counters, heavy drop shadows, blurs, or scroll-dependent elements. Respect `prefers-reduced-motion`, keyboard navigation, visible focus rings, semantics and screen reader status announcements.
7. Avoid sticky hover artefacts on touch: hover effects should be guarded by `@media (hover:hover) and (pointer:fine)`. Keep touch feedback immediate without deleting existing active states.
8. Keep essential actions reachable with the iOS keyboard shown and the fixed navigation in view or intentionally hidden. Use safe-area padding. Test landscape and installed-PWA mode.
9. Real-world user screenshots take precedence over theoretical pixel-perfect tests. Confirm any deployment at the published URL, not merely by commit success.

## FORGE 8.1 visual identity and design-quality standard

The user explicitly prefers **blue rather than lime green**. Preserve the `Midnight Blue` theme across the three basic views and the archived UI:
- Canvas/background: `#0a101b` with restrained navy-blue gradients; surfaces: `#111d2b` / `#172638`; brand accent: `#6aadff`; secondary accent: `#448ef5`; large text: `#f5f8ff`; secondary text: `#9caec4`.
- Blue must be coherent across `index.html` (inline CSS and chart colors), `forge-polish.css`, `forge-extras.css`, PWA `icon.svg`, and `manifest.webmanifest`. Semantic warnings and errors may remain amber/red.
- **Heute**: one central saved step input, reached steps, remaining steps, one blue progress bar. Do not add cards.
- **Walking**: actual steps, remaining steps, **duration estimate first**, then speed and incline inputs. Do not duplicate those inputs in the basic summary. Explain that incline raises exertion, not the estimate of walking duration itself.
- **Fortschritt**: weight snapshot, single weight entry form and weight chart, no speculative forecast in basics.
- Buttons must have adequate contrast and 44px+ touch targets on iPhone; preserve keyboard focus and motion reduction.
- Apply `emil-design-eng` and `mobile-native` for UI changes, plus `break-ui` for unusual values. Favor subtraction and hierarchy over decorative effects.
- A new version must pass `node scripts/test-blue-theme.mjs`, plus all previous regression checks before merging. Do not modify saved data keys just for palette or layout.

## Product reset: FORGE 8 Back to Basics

The user explicitly wants FORGE to stop accumulating features. The product's core purpose is **track actual steps, show missing steps to 10,000, calculate Walking-Pad time from speed and incline, and review weight progress**.

- Default body mode is `forge-basics`. **Do not reintroduce** daily checklists, calories, macro references, coaching reminders, extra dashboards, multi-step planning widgets, training logs, Health integration setup, imports, forecasts or other advanced tools into the basic view.
- Show **Heute** (one current-day steps entry), **Walking** (already walked, still missing, speed/incline, estimated time), **Fortschritt** (simple weight entry/chart).
- Old modules remain mounted for backward compatibility and are reached by the explicit top-right **Weitere Funktionen öffnen** menu. This is a reversible presentation change, **not a data migration**. Do not silently delete historical workout, weight, reminder, backup or walking configuration records.
- The automatic missing-step Walking mode must be used for calculations in basics even if the archived user preference is a custom plan; the archived custom values must survive toggling advanced mode.
- No new settings or feature sprawl without the user's explicit approval. Always question whether a suggested addition simplifies the core task. Prefer **removing visible complexity** over adding another switch or card.
- Backups should stay accessible in the basic header menu. A Health Shortcut import must temporarily expose the advanced Training view without putting health measurement fragments in browser history.
- Every new release must test `node scripts/test-basics.mjs` and `node scripts/test-navigation.mjs` plus persistent storage compatibility.

## Familiar navigation conventions (Jakob's Law)

- Treat familiarity as a usability goal, **not** as a requirement to clone Instagram, TikTok or YouTube. Official guidance: Nielsen Norman Group (Jakob's Law) and Apple Human Interface Guidelines (tab bars).
- Keep **three visible primary destinations by default:** **Heute, Walking, Fortschritt**. The old Training tab can appear only after an intentional switch to advanced mode; all old data remains intact. Do not add a Profil tab or new destination without a product reason.
- Use bottom navigation for destinations, **not actions**. Step entry belongs to the step counter and workout entry to Training. Avoid a forced central plus button.
- The top-right `#forgeHeaderMenu` is the predictable access point for secondary options. Its buttons navigate to the real sections for reminders, Health integration, backups and app installation – never duplicate data-entry forms.
- Preserve browser-native gestures rather than hijacking touch input: native swipe/back should work *where the browser supports it* by recording tab visits with History API; do not promise an iOS Home Screen PWA has the same gesture behavior as Safari.
- Do not implement custom pull-to-refresh if a browser already handles it; in offline mode it could be disruptive. Never reload a page while unsaved form input is present without confirmation.
- Keep URLs with `#forge-sync?` private: when Health Shortcuts opens FORGE, skip tab-history entries and let the existing import clear its URL fragment. Do not push the health payload into a new history state.
- Any tab or settings-menu changes must be checked for keyboard and VoiceOver access, real 320px screen width, focus targets, and no new localStorage keys.

## Required process for future changes

1. Inspect affected code, screenshots and current stored-data paths before changing layout.
2. Select **1–3 relevant** skills and state which ones you applied in the PR/report. For animation-only audits, follow the skill's read-only rules before modifying source.
3. Make a prioritized short plan: impact, evidence, risk, change and verification.
4. Prefer a small feature branch and PR. Keep localStorage, backup keys, data ownership and existing calculations intact.
5. Run `node scripts/verify-agent-skills.mjs`, `node --check` for standalone scripts and syntax-check the inline HTML script. Run smoke tests for the three visible basic tabs and the archived fourth Training view, persistent step values, simple Walking pace/incline controls, manual/automatic advanced Walking, backup, Health shortcuts and the offline shell.
6. Review focus, touch behavior, accessibility, reduced motion, 320px layout and long labels. Record **what was actually tested**; do not claim genuine Safari/device results from code inspection.
7. Update version and service-worker cache only when an app update is deployed. Never include `.agents/` or `docs/` in the Pages site bundle.
8. Document what changed, the specific skills used, any remaining risks, and what should be improved next.
