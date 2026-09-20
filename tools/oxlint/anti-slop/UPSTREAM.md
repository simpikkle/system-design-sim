# Vendored anti-slop Oxlint plugin

Source: [dmmulroy/anti-slop](https://github.com/dmmulroy/anti-slop), installed via the `install-anti-slop`
skill (`skills add dmmulroy/anti-slop`). Exact source commit is unknown — the `skills` CLI clones the
repository to a temporary directory and does not preserve its git history in the installed skill bundle.
The closest available identifier is the skill content hash recorded in `skills-lock.json` at the repo root:
`4031728fbe75bdcad6ee3208fd52b5d66e167b056fefee1fa9758e9a6cb9c0c8`.

Installed: 2026-09-20.

Copied files:

- `index.ts`, `rules/`, `shared/` — the generic plugin (registered in `.oxlintrc.json` as `anti-slop`)
- `effect/` — the opt-in Effect-TS rule set, not registered (this project doesn't depend on `effect`)
- `vendor/eslint-stylistic/` — the vendored `padding-line-between-statements` rule backing
  `require-readable-spacing`; see its own `UPSTREAM.md`/`LICENSE`, preserved verbatim

## Local adaptations

None. Installed as a fresh copy with no local modifications to the plugin source itself.

## Configuration in this repo

`.oxlintrc.json` registers the generic `anti-slop` plugin and enables every rule listed in the
`install-anti-slop` skill's fresh-install instructions, plus the native `oxc/no-accumulating-spread`
companion rule. `tools/oxlint/anti-slop/**` and the standard agent-tooling directories are excluded
from linting via `ignorePatterns`.
