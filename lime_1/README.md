# hermes-themes

Dark, readable, lime-green themes for the **Hermes Agent** web dashboard.

Three drop-in directions on a near-black neutral canvas with **16px** body text (the
default 15px felt cramped), **Geist** + **JetBrains Mono**, soft grain, a lime-tinted
glow, and a live telemetry HUD in the cockpit rail. Light off-white body text keeps
everything readable; lime drives the interactive bits — focus rings, active tabs,
data-viz and the HUD.

| Theme | Vibe | Background | Lime |
| --- | --- | --- | --- |
| **Lime Signal** (`lime-signal`) | Clean, professional — the safe pick | charcoal `#0c0e0c` | `#a3e635` |
| **Carbon Glow** (`carbon-glow`) | Cool pure-black, glassy cards, glowing data-viz | `#08090b` | `#b6f24a` |
| **Acid Console** (`acid-console`) | Warm green-black terminal, soft CRT scanlines | `#0a0b07` | `#ccff33` |

All three use `layoutVariant: cockpit`, so they pair with the bundled **Cockpit HUD**
plugin that fills the left rail with live telemetry, a header crest and a footer tagline.

---

## Install

### 1. Themes

```bash
mkdir -p ~/.hermes/dashboard-themes
cp themes/*.yaml ~/.hermes/dashboard-themes/
```

Refresh the dashboard, click the palette icon in the header, and pick
**Lime Signal**, **Carbon Glow** or **Acid Console**. Your choice persists to
`config.yaml` under `dashboard.theme`.

> A theme alone is enough — the cockpit rail just shows a placeholder without the
> plugin. Add the plugin below to fill it with the telemetry HUD.

### 2. Cockpit HUD plugin (recommended)

```bash
cp -r plugins/hermes-cockpit ~/.hermes/plugins/
```

Then force a rescan (no restart needed):

```bash
curl http://127.0.0.1:9119/api/dashboard/plugins/rescan
```

The HUD is a **slot-only** plugin (`tab.hidden: true`) — it adds no nav tab. It registers
into three shell slots: `sidebar` (telemetry bars + runtime stats, polled from
`SDK.api.getStatus()`), `header-left` (crest) and `footer-right` (tagline). The sidebar
only renders under `layoutVariant: cockpit`, so switching back to a non-cockpit theme
leaves the plugin installed but invisible.

---

## Preview

`Hermes Dashboard.html` (in this repo) is a self-contained mockup of the reskinned
dashboard with a **working theme switcher** — open it in a browser to flip between all
three directions and click through the Overview / Sessions / Config screens before you
install anything. It mirrors the real shell; it does not talk to a live agent.

---

## Customising

Every value lives in the YAML — trim or retune freely. The dashboard derives every
shadcn token from the 3-layer `palette` via `color-mix()`, so small changes cascade.

- **Swap the lime.** Change `colorOverrides.primary` / `accent` / `ring` and the
  matching `border` / glow alphas. Keep `primaryForeground` near-black for contrast.
- **Lighter or darker canvas.** Edit `palette.background`. `palette.midground` is the
  body-text colour — keep it light for readability.
- **More / less grain.** `palette.noiseOpacity` (0–1.2).
- **Tighter / looser.** `layout.density`: `compact` · `comfortable` · `spacious`.
  `layout.radius` sets the corner scale.
- **Eye-candy.** The breathing glow, focus rings and (Acid Console) scanline overlay
  live in each theme's `customCSS` block. Scoped to the active theme; cap 32 KiB.

The plugin's `dist/style.css` references only theme CSS vars
(`--color-primary`, `--color-border`, `--radius`, …), so the HUD restyles itself
whenever you switch theme — no plugin edits required.

---

## Layout

```
hermes-themes/
├── themes/
│   ├── lime-signal.yaml          → ~/.hermes/dashboard-themes/
│   ├── carbon-glow.yaml
│   └── acid-console.yaml
├── plugins/
│   └── hermes-cockpit/           → ~/.hermes/plugins/
│       └── dashboard/
│           ├── manifest.json
│           └── dist/
│               ├── index.js      (plain IIFE — no build step)
│               └── style.css
├── Hermes Dashboard.html         (interactive preview)
└── assets/                       (preview-only CSS/JS)
```

Built against the dashboard theming reference:
<https://hermes-agent.nousresearch.com/docs/user-guide/features/extending-the-dashboard>
