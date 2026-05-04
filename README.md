# Kazakh Script Helper

Chrome extension that transliterates Kazakh text between three writing systems:

- **Cyrillic** ↔ **Perso-Arabic** (the original v1 behaviour)
- **Cyrillic** ↔ **Latin (2021 umlaut standard)** — the official 28-letter alphabet adopted by presidential decree, January 2021

Right-click selected Kazakh text on any web page to convert it. The result appears in a Shadow-DOM modal that can't be styled by the host page. A toolbar popup adds whole-page conversion.

## Install (end users)

The extension is not on the Chrome Web Store. The easiest way to use it:

1. Go to [Releases](https://github.com/asqatqazet/kazakh_transliteration_chrome_extension/releases) and download the latest `kazakh-script-helper-*-chrome.zip`.
2. Unzip it anywhere on your computer.
3. In Chrome, open `chrome://extensions`.
4. Toggle **Developer mode** on (top-right).
5. Click **Load unpacked** and select the unzipped folder.
6. The Kazakh Script Helper icon appears in the toolbar.

To update later: download the new release zip, unzip over the old folder, then click the **reload** (↻) button on the extension card in `chrome://extensions`.

> No release yet? You can either build from source (see [Install for development](#install-for-development) below) or grab the build artifact from the latest CI run on the [Actions tab](https://github.com/asqatqazet/kazakh_transliteration_chrome_extension/actions) (artifact name `kazakh-script-helper-chrome-mv3`, retained 14 days).

## Use it

**Convert a selection** — highlight Kazakh text on any page, right-click, and pick one of:
- *Convert to Cyrillic script*
- *Convert to Arabic script*
- *Convert to Latin script (2021)*

The converted text appears in a small dialog. Press **Esc** or click outside to dismiss.

**Convert a whole page** — click the toolbar icon, pick the target script, and click *Convert whole page*. Text is rewritten in place; reload the page to revert. `<code>`, `<pre>`, `<textarea>`, and other code-like elements are skipped automatically.

**Adjust behaviour** — click the toolbar icon, then *Options*. You can:
- Toggle whether И, Й, І collapse to one Latin letter (or disambiguate І as `ı`/`I`)
- Toggle whether Х, Һ collapse to `H` (or render Һ as `Ḣ`/`ḣ`)
- Choose how loanword letters (Ё, Ц, Ч, Щ, Ъ, Ь, Э, Ю, Я) are handled
- Add domains to skip (one per line; matches the host or any subdomain)

Mark any element you don't want touched with `data-no-translit` and the page walker will leave it alone.

## Status

v2.0 is a from-scratch rewrite of the original v1.0. The Cyrillic↔Arabic converter is byte-identical to v1 (locked in by snapshot tests against the legacy code's output). The Latin direction is new.

## Install for development

```bash
pnpm install
pnpm dev          # loads an unpacked Chrome extension with HMR
pnpm dev:firefox  # same, for Firefox
```

`pnpm dev` opens a Chrome window with the extension already loaded. Edit any file in `src/` and the extension reloads automatically.

## Build

```bash
pnpm build       # → .output/chrome-mv3/
pnpm build:firefox
pnpm zip         # signed-zip output ready to upload
```

## Test, lint, typecheck

```bash
pnpm test           # vitest, 145 tests across 4 files
pnpm test:watch
pnpm test:coverage  # coverage report for src/lib/
pnpm compile        # tsc --noEmit
pnpm lint           # eslint flat config
pnpm format         # prettier --write
```

CI runs all four on every push and PR and uploads the built extension as a workflow artifact (see `.github/workflows/ci.yml`).

## Cutting a release

Tag-based — push a `v*` tag and `.github/workflows/release.yml` builds, zips, and attaches the zip to a new GitHub Release:

```bash
git tag v2.0.0
git push origin v2.0.0
```

You can also trigger it manually from the Actions tab (workflow_dispatch input `tag`).

## Project layout

```
src/
  entrypoints/
    background.ts          # service worker — context menus, message routing
    content.ts             # content script — message handler
    popup/                 # toolbar popup
    options/               # options page
  lib/
    converter/             # pure transliteration (no chrome.* deps)
      cyrillic-arabic.ts   # ported verbatim from v1.0
      cyrillic-latin-2021.ts
      script-detect.ts
      index.ts             # public convert() API
    page-walker.ts         # DOM walker with skip list for code/pre/textarea
    ui/modal.ts            # closed Shadow DOM modal
    settings.ts            # chrome.storage.sync wrapper
    messages.ts            # message protocol types
public/
  _locales/                # en_US, zh_CN
  images/
tests/converter/           # vitest specs + JSON fixtures
scripts/                   # one-shot baseline generator
```

## Options

The options page (`chrome://extensions/?options=...` or via the popup) exposes:

- **Collapse И/Й/І to a single Latin letter** — default on; matches the official 2021 decree. Off disambiguates І to dotless `ı`/`I`.
- **Collapse Х/Һ to H** — default on. Off renders Һ as `Ḣ`/`ḣ` (H with dot above) for academic disambiguation.
- **Loanword letter policy** — default _transliterate_ (Ё → Io, Ц → Ts, Ч → Ch, Щ → Şç, Ю → Iu, Я → Ia). Alternative _drop_ removes them entirely (purist 28-letter).
- **Excluded domains** — one per line; matches host or any subdomain.

Settings sync across devices via `chrome.storage.sync`.

## What v2 changed vs v1

- Manifest v2 → v3 with WXT toolchain (TypeScript, Vite, HMR)
- New Latin (2021) script pair, exposed in context menu and popup
- 145-test vitest suite — Cyrillic↔Arabic snapshot-locked against v1.0 output
- ESLint + Prettier + GitHub Actions CI
- Shadow-DOM modal instead of `innerHTML` injection — no XSS surface, immune to host CSS
- Skip list (`<code>`, `<pre>`, `<textarea>`, `<input>`, `<script>`, `<style>`, `[contenteditable]`, `[data-no-translit]`)
- Proper popup that actually exists (the v1 manifest referenced one but the file was missing)
- Options page with per-domain exclusion list
- Service-worker-based MV3 background (replaces persistent v2 background page)

## Out of scope (v2.0)

- MutationObserver-driven live conversion (planned for v2.1)
- In-place page rewrite preserves text but does not stash originals — page must be reloaded to revert
- Keyboard shortcuts — use `chrome://extensions/shortcuts` to bind your own

## License

Same as v1 (see prior commit history).
