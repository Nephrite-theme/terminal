// Generates each flavor's color scheme for every supported terminal from
// palette.json. Usage: node scripts/sync-palette.mjs && node scripts/build.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const palette = JSON.parse(readFileSync(new URL("palette.json", root)));

// Terminal surfaces mapped to palette roles (see the palette's porting guide).
// Most terminals can't blend a translucent selection, so it uses a solid tone.
const ROLES = {
	background: "base",
	foreground: "text",
	cursor: "jade",
	cursorText: "base",
	selectionBackground: "surface2",
	selectionForeground: "text",
	link: "sapphire",
	// Tab bars, for the terminals that draw their own.
	tabBar: "crust",
	tabActive: "base",
	tabActiveText: "text",
	tabInactive: "mantle",
	tabInactiveText: "subtext",
	border: "surface1",
	borderActive: "jade",
};

// The 16 ANSI slots, in the order terminals index them (0-15).
const SLOTS = [
	"black",
	"red",
	"green",
	"yellow",
	"blue",
	"magenta",
	"cyan",
	"white",
	"brightBlack",
	"brightRed",
	"brightGreen",
	"brightYellow",
	"brightBlue",
	"brightMagenta",
	"brightCyan",
	"brightWhite",
];

const ansiOf = (c) => SLOTS.map((slot) => c[palette.ansi[slot]]);
const rolesOf = (c) =>
	Object.fromEntries(Object.entries(ROLES).map(([k, role]) => [k, c[role]]));

function write(path, content) {
	const url = new URL(path, root);
	mkdirSync(new URL("./", url), { recursive: true });
	writeFileSync(url, content);
}

// Windows Terminal: a scheme object for the "schemes" list in settings.json.
// It calls magenta "purple".
function windowsTerminal(name, c) {
	const r = rolesOf(c);
	const ansi = ansiOf(c);
	const scheme = {
		name,
		background: r.background,
		foreground: r.foreground,
		cursorColor: r.cursor,
		selectionBackground: r.selectionBackground,
	};
	SLOTS.forEach((slot, i) => {
		scheme[slot.replace("magenta", "purple").replace("Magenta", "Purple")] = ansi[i];
	});
	return `${JSON.stringify(scheme, null, 2)}\n`;
}

// iTerm2: an .itermcolors property list with sRGB components.
function iterm(c) {
	const r = rolesOf(c);
	const entry = (key, hex) => {
		const [red, green, blue] = [1, 3, 5].map(
			(i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255,
		);
		return `\t<key>${key}</key>
\t<dict>
\t\t<key>Alpha Component</key>
\t\t<real>1</real>
\t\t<key>Blue Component</key>
\t\t<real>${blue.toFixed(6)}</real>
\t\t<key>Color Space</key>
\t\t<string>sRGB</string>
\t\t<key>Green Component</key>
\t\t<real>${green.toFixed(6)}</real>
\t\t<key>Red Component</key>
\t\t<real>${red.toFixed(6)}</real>
\t</dict>`;
	};
	const entries = [
		...ansiOf(c).map((hex, i) => [`Ansi ${i} Color`, hex]),
		["Background Color", r.background],
		["Badge Color", r.border],
		["Bold Color", r.foreground],
		["Cursor Color", r.cursor],
		["Cursor Guide Color", r.tabInactive],
		["Cursor Text Color", r.cursorText],
		["Foreground Color", r.foreground],
		["Link Color", r.link],
		["Selected Text Color", r.selectionForeground],
		["Selection Color", r.selectionBackground],
		["Tab Color", r.tabActive],
	].sort(([a], [b]) => a.localeCompare(b, "en", { numeric: true }));
	return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
${entries.map(([k, v]) => entry(k, v)).join("\n")}
</dict>
</plist>
`;
}

// Alacritty: a TOML file to import from alacritty.toml.
function alacritty(name, c) {
	const r = rolesOf(c);
	const ansi = ansiOf(c);
	const block = (offset) =>
		["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"]
			.map((slot, i) => `${slot} = "${ansi[offset + i]}"`)
			.join("\n");
	return `# ${name} for Alacritty

[colors.primary]
background = "${r.background}"
foreground = "${r.foreground}"

[colors.cursor]
cursor = "${r.cursor}"
text = "${r.cursorText}"

[colors.selection]
background = "${r.selectionBackground}"
text = "${r.selectionForeground}"

[colors.hints.start]
background = "${c.citrine}"
foreground = "${c.base}"

[colors.hints.end]
background = "${c.surface2}"
foreground = "${c.text}"

[colors.normal]
${block(0)}

[colors.bright]
${block(8)}
`;
}

// Kitty: a .conf file to include from kitty.conf.
function kitty(name, c) {
	const r = rolesOf(c);
	return `# ${name} for Kitty

foreground ${r.foreground}
background ${r.background}
selection_foreground ${r.selectionForeground}
selection_background ${r.selectionBackground}
cursor ${r.cursor}
cursor_text_color ${r.cursorText}
url_color ${r.link}

active_border_color ${r.borderActive}
inactive_border_color ${r.border}
bell_border_color ${c.citrine}

tab_bar_background ${r.tabBar}
active_tab_foreground ${r.tabActiveText}
active_tab_background ${r.tabActive}
inactive_tab_foreground ${r.tabInactiveText}
inactive_tab_background ${r.tabInactive}

mark1_foreground ${c.base}
mark1_background ${c.jade}
mark2_foreground ${c.base}
mark2_background ${c.citrine}
mark3_foreground ${c.base}
mark3_background ${c.amethyst}

${ansiOf(c)
	.map((hex, i) => `color${i} ${hex}`)
	.join("\n")}
`;
}

// Ghostty: a theme file for ~/.config/ghostty/themes, named after the flavor.
function ghostty(c) {
	const r = rolesOf(c);
	return `background = ${r.background}
foreground = ${r.foreground}
cursor-color = ${r.cursor}
cursor-text = ${r.cursorText}
selection-background = ${r.selectionBackground}
selection-foreground = ${r.selectionForeground}
${ansiOf(c)
	.map((hex, i) => `palette = ${i}=${hex}`)
	.join("\n")}
`;
}

// WezTerm: a TOML color scheme for a directory in config.color_scheme_dirs.
function wezterm(name, c) {
	const r = rolesOf(c);
	const ansi = ansiOf(c);
	const list = (colors) => `[${colors.map((hex) => `"${hex}"`).join(", ")}]`;
	return `[metadata]
name = "${name}"
origin_url = "https://github.com/Nephrite-theme/terminal"

[colors]
background = "${r.background}"
foreground = "${r.foreground}"
cursor_bg = "${r.cursor}"
cursor_border = "${r.cursor}"
cursor_fg = "${r.cursorText}"
selection_bg = "${r.selectionBackground}"
selection_fg = "${r.selectionForeground}"
split = "${r.border}"
ansi = ${list(ansi.slice(0, 8))}
brights = ${list(ansi.slice(8))}

[colors.tab_bar]
background = "${r.tabBar}"

[colors.tab_bar.active_tab]
bg_color = "${r.tabActive}"
fg_color = "${r.tabActiveText}"

[colors.tab_bar.inactive_tab]
bg_color = "${r.tabInactive}"
fg_color = "${r.tabInactiveText}"

[colors.tab_bar.new_tab]
bg_color = "${r.tabBar}"
fg_color = "${r.tabInactiveText}"
`;
}

// Warp: a YAML theme for Warp's themes directory.
function warp(name, dark, c) {
	const r = rolesOf(c);
	const ansi = ansiOf(c);
	const block = (offset) =>
		["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"]
			.map((slot, i) => `    ${slot}: '${ansi[offset + i]}'`)
			.join("\n");
	return `name: ${name}
accent: '${c.jade}'
cursor: '${r.cursor}'
background: '${r.background}'
foreground: '${r.foreground}'
details: ${dark ? "darker" : "lighter"}
terminal_colors:
  normal:
${block(0)}
  bright:
${block(8)}
`;
}

for (const [key, flavor] of Object.entries(palette.flavors)) {
	const name = `Nephrite ${flavor.name}`;
	const c = flavor.colors;
	write(`themes/windows-terminal/nephrite-${key}.json`, windowsTerminal(name, c));
	write(`themes/iterm2/${name}.itermcolors`, iterm(c));
	write(`themes/alacritty/nephrite-${key}.toml`, alacritty(name, c));
	write(`themes/kitty/nephrite-${key}.conf`, kitty(name, c));
	write(`themes/ghostty/${name}`, ghostty(c));
	write(`themes/wezterm/${name}.toml`, wezterm(name, c));
	write(`themes/warp/nephrite-${key}.yaml`, warp(name, flavor.dark, c));
	console.log(`${key}: 7 terminals`);
}

// Windows Terminal fragment: every flavor in one file that Terminal loads from
// its Fragments folder, so installing doesn't mean editing settings.json.
const fragment = {
	schemes: Object.values(palette.flavors).map((flavor) =>
		JSON.parse(windowsTerminal(`Nephrite ${flavor.name}`, flavor.colors)),
	),
};
write("themes/windows-terminal/nephrite.json", `${JSON.stringify(fragment, null, 2)}\n`);
console.log("windows terminal: fragment with every flavor");

// README swatches: the 16 ANSI colors plus background and foreground, so the
// preview shows exactly what a shell prints.
mkdirSync(new URL("assets/", root), { recursive: true });
for (const [key, flavor] of Object.entries(palette.flavors)) {
	const c = flavor.colors;
	const ansi = ansiOf(c);
	const size = 32;
	const gap = 8;
	const pad = 14;
	const w = pad * 2 + 8 * size + 7 * gap;
	const h = pad * 2 + 2 * size + gap;
	const cells = ansi
		.map((hex, i) => {
			const x = pad + (i % 8) * (size + gap);
			const y = pad + Math.floor(i / 8) * (size + gap);
			return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="8" fill="${hex}" stroke="${c.surface1}" stroke-width="1"><title>${SLOTS[i]}</title></rect>`;
		})
		.join("");
	writeFileSync(
		new URL(`assets/${key}.svg`, root),
		`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" rx="14" fill="${c.base}"/>${cells}</svg>\n`,
	);
}
console.log("swatches: 16 ANSI colors per flavor");
