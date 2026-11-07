# FORGE Codex skills installation and usage

**Installation snapshot:** 2026-11-07  
**Upstream:** https://github.com/emilkowalski/skills  
**Pinned upstream commit:** `c8a79627b59d72d764d6ab6f2c87c09a48169833`  
**License:** MIT, vendored unchanged at `docs/emil-kowalski/LICENSE`.

## Installation result

The upstream repository includes **17 SKILL.md entry points** and **9 companion reference Markdown files**. All **26 original skill/source files** were copied unchanged into `.agents/skills/` for **project-local Codex discovery**. Their SHA-1 Git blob hashes match the upstream GitHub objects, recorded in `docs/emil-kowalski/manifest.json`.

The upstream `README.md`, `LICENSE`, `ui-cheatsheet.md` and `performance-cheatsheet.md` were also copied unchanged into `docs/emil-kowalski/`. Together this makes **30 verified upstream files**.

The user-requested official command was attempted:

```sh
npx skills@latest add emilkowalski/skills --skill '*' --agent codex
```

It **could not run in the assistant's container**. NPM returned `EAI_AGAIN` for `registry.npmjs.org`; Git CLI also could not resolve `github.com`. The GitHub app connection was therefore used to commit identical project-local skill files directly. This is a **manual project-local equivalent**, not a successful execution of the official CLI. No global skill installation took place.

## What is actually verified?

- The 17 project-local `SKILL.md` files are present at `.agents/skills/<skill-name>/SKILL.md` in the GitHub project.
- Their companion markdown files and the four upstream root documents are present.
- Their Git blob SHA values match the pinned upstream source revision.
- `AGENTS.md` selects appropriate skills for each FORGE UI/UX/performance task.
- `node scripts/verify-agent-skills.mjs` checks file presence, SHA integrity, SKILL frontmatter and Codex project rules; this command is also part of the Pages CI.

**Not verified:** An actual local Codex process discovering or invoking the skills. Codex is not installed in the assistant runtime, and there is no live connection to the user's local Codex process. After checking out the updated repository on a Codex machine, start a **new Codex session in the FORGE directory** and ask it to list/discover project-local skills (for example, `mobile-native` and `emil-design-eng`). It may need a session restart for the new skill files to appear.

## Update or install again

From a local checkout with working npm and GitHub connectivity, the user may run the official command in the repo directory:

```sh
npx skills@latest add emilkowalski/skills --skill '*' --agent codex
```

Before overwriting, review new upstream changes and whether they preserve the pinned snapshot; update the manifest if intentionally upgrading. The `.agents/skills/` files already exist, so a repeat CLI installation is **not required** to read them as local skill instructions.

## Available skills (17)

`animate`, `animate-expo`, `animation-performance`, `animation-vocabulary`,
`apple-design`, `ask-sonner`, `break-ui`, `choreograph`,
`emil-design-eng`, `find-animation-opportunities`, `improve-animations`,
`mobile-native`, `pick-ui-library`, `prototype`,
`remove-animations`, `review-animations`, `write-swift`.

Do **not** invoke all skills at once. FORGE is vanilla web technology: `mobile-native`, `emil-design-eng`, `animation-performance`, `apple-design` and `break-ui` are the most relevant. `write-swift` and `animate-expo` only apply if an actual native implementation is started; `ask-sonner` only if that toast library is added. See the decision table in the root `AGENTS.md`.

## Validation

```sh
node scripts/verify-agent-skills.mjs
node --check forge-extras.js
node --check forge-polish.js
node --check forge-integrations.js
node --check sw.js
```

The GitHub Pages workflow checks the above and verifies the inline `index.html` script. The Pages bundle remains static: it excludes `.agents/`, `docs/` and `scripts/`.

## Using skills in future FORGE work

Read `AGENTS.md`, select the smallest relevant set, read those SKILL.md files and linked local references, explain which ones were applied in the pull request, and avoid changes to localStorage data formats or unrequested nutrition tracking. Real Safari device testing remains separate from static validation.
