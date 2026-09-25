<div align="center">

<img src="https://raw.githubusercontent.com/Nephrite-theme/web/main/public/logo.svg" alt="Nephrite logo" width="72" height="72">

# Nephrite for terminals

**English** · [Español](README.es.md)

A calm, jade-inspired color scheme for Windows Terminal, iTerm2, Alacritty, Kitty, Ghostty, Warp and WezTerm, in three flavors.

[![License: MIT](https://img.shields.io/badge/license-MIT-3db87a)](LICENSE)
[![Palette](https://img.shields.io/badge/palette-Nephrite-1f6b45)](https://github.com/Nephrite-theme/palette)

</div>

## Flavors

| Flavor | ANSI colors | For |
| --- | --- | --- |
| **Forest** | <img src="assets/forest.svg" alt="Forest ANSI colors" width="220"> | Deep and dark, for late nights |
| **Jade** | <img src="assets/jade.svg" alt="Jade ANSI colors" width="220"> | Dark with more green, for long days |
| **Mint** | <img src="assets/mint.svg" alt="Mint ANSI colors" width="220"> | Light and airy, for daylight |

## Install

Every file lives in [`themes/`](themes), one folder per terminal. Replace `forest` with `jade` or `mint` for another flavor.

### Windows Terminal

1. Open **Settings** and click **Open JSON file** at the bottom left.
2. Paste the contents of [`nephrite-forest.json`](themes/windows-terminal/nephrite-forest.json) into the `"schemes"` list.
3. Save, then pick **Nephrite Forest** under **Profiles > Defaults > Appearance > Color scheme**.

### iTerm2

1. Download [`Nephrite Forest.itermcolors`](themes/iterm2/Nephrite%20Forest.itermcolors) and double-click it to import it.
2. Go to **Settings > Profiles > Colors** and choose it from **Color Presets**.

### Alacritty

Save [`nephrite-forest.toml`](themes/alacritty/nephrite-forest.toml) next to your config, then import it in `alacritty.toml`:

```toml
[general]
import = ["~/.config/alacritty/nephrite-forest.toml"]
```

### Kitty

Save [`nephrite-forest.conf`](themes/kitty/nephrite-forest.conf) in `~/.config/kitty/`, then add to `kitty.conf`:

```conf
include nephrite-forest.conf
```

### Ghostty

Save [`Nephrite Forest`](themes/ghostty/Nephrite%20Forest) in `~/.config/ghostty/themes/`, then add to your config:

```conf
theme = Nephrite Forest
```

To follow the system appearance, use `theme = light:Nephrite Mint,dark:Nephrite Forest`.

### Warp

Save [`nephrite-forest.yaml`](themes/warp/nephrite-forest.yaml) in Warp's themes folder, then pick **Nephrite Forest** in **Settings > Appearance > Themes**:

- macOS: `~/.warp/themes/`
- Windows: `%APPDATA%\warp\Warp\data\themes\`
- Linux: `~/.local/share/warp-terminal/themes/`

### WezTerm

Save [`Nephrite Forest.toml`](themes/wezterm/Nephrite%20Forest.toml) in `~/.config/wezterm/colors/`, then set it in `wezterm.lua`:

```lua
config.color_scheme = "Nephrite Forest"
```

## Colors

Every color comes from the [Nephrite palette](https://github.com/Nephrite-theme/palette), mapped by role:

| Terminal surface | Palette color |
| --- | --- |
| Background | `base` |
| Text | `text` |
| Cursor | `jade`, with `base` for the character under it |
| Selection | `surface2` behind `text` |
| Links | `sapphire` |
| Tab bar (Kitty, WezTerm) | `crust`, `base` for the active tab and `mantle` for the rest |
| ANSI 0-15 | The palette's ANSI mapping: `garnet`, `jade`, `citrine`, `sapphire`, `amethyst`, `lagoon`, with `mint` and `rhodonite` as the bright green and magenta, and `overlay1` as bright black for dim text |

## Development

The files in `themes/` and `assets/` are generated, so don't edit them by hand. To pick up palette changes:

```sh
node scripts/sync-palette.mjs   # download the latest palette.json
node scripts/build.mjs          # regenerate every terminal's schemes
```

To add a terminal, write a function in `scripts/build.mjs` that turns a flavor's colors into that terminal's format, and call it in the build loop. Node 18 or newer, no dependencies.

## Contributing

Using a terminal that isn't here, or found a color that clashes? [Open an issue](https://github.com/Nephrite-theme/terminal/issues/new/choose) with a screenshot. For how Nephrite ports are built and reviewed, see the [contributing guide](https://github.com/Nephrite-theme/.github/blob/main/CONTRIBUTING.md).

## Thanks

Created and maintained by [@ingfranciscastillo](https://github.com/ingfranciscastillo). Contributors will be listed here as the community grows.

## More Nephrite

Nephrite is also available for Chrome, Firefox and VS Code. See every app at [getnephrite.dev/ports](https://getnephrite.dev/ports).
