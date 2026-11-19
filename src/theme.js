// UI colour themes. The choice is stored per browser and applied as
// <html data-theme="...">; the colours themselves live in css/themes.css.
// `preview` only drives the mini preview in the theme picker:
//   rail / top = shell colours, bg = page background, accent = buttons & highlights.
export const THEMES = [
  { id: "navy", label: "Navy Gold", group: "Vibrant", preview: { rail: "#1b2847", top: "#22355b", bg: "#eef1f6", accent: "#f5c044" } },
  { id: "indigo", label: "Midnight Violet", group: "Vibrant", preview: { rail: "#1e1b4b", top: "linear-gradient(90deg,#1e1b4b,#4c1d95)", bg: "#eef0fb", accent: "#818cf8" } },
  { id: "ocean", label: "Ocean Breeze", group: "Vibrant", preview: { rail: "#082f49", top: "linear-gradient(90deg,#0c4a6e,#0e7490)", bg: "#e9f4fb", accent: "#38bdf8" } },
  { id: "teal", label: "Teal Aurora", group: "Vibrant", preview: { rail: "#042f2e", top: "linear-gradient(90deg,#134e4a,#0e7490)", bg: "#e8f6f3", accent: "#2dd4bf" } },
  { id: "emerald", label: "Emerald Forest", group: "Vibrant", preview: { rail: "#022c22", top: "linear-gradient(90deg,#022c22,#065f46)", bg: "#eaf5ef", accent: "#fcd34d" } },
  { id: "sunset", label: "Sunset Coral", group: "Vibrant", preview: { rail: "#4c0519", top: "linear-gradient(90deg,#be123c,#ea580c)", bg: "#fdf0ee", accent: "#fb7185" } },
  { id: "rose", label: "Rose Gold", group: "Vibrant", preview: { rail: "#500724", top: "linear-gradient(90deg,#831843,#db2777)", bg: "#fcf0f5", accent: "#fcd34d" } },
  { id: "royal", label: "Royal Purple", group: "Vibrant", preview: { rail: "#2e1065", top: "linear-gradient(90deg,#2e1065,#7e22ce)", bg: "#f3eefc", accent: "#f0abfc" } },
  { id: "amber", label: "Amber Glow", group: "Vibrant", preview: { rail: "#2f1302", top: "linear-gradient(90deg,#451a03,#b45309)", bg: "#fbf5ea", accent: "#fde68a" } },
  { id: "steel", label: "Slate Steel", group: "Vibrant", preview: { rail: "#0f172a", top: "linear-gradient(90deg,#1e293b,#334155)", bg: "#f1f4f8", accent: "#60a5fa" } },

  { id: "light", label: "Classic Light", group: "Light", preview: { rail: "#ffffff", top: "#ffffff", bg: "#f5f6f8", accent: "#4f46e5" } },
  { id: "snow", label: "Arctic Blue", group: "Light", preview: { rail: "#ffffff", top: "#f3f8ff", bg: "#f3f7fc", accent: "#2563eb" } },
  { id: "mint", label: "Mint Fresh", group: "Light", preview: { rail: "#ffffff", top: "#f0fbf6", bg: "#f2faf6", accent: "#059669" } },
  { id: "lavender", label: "Lavender", group: "Light", preview: { rail: "#ffffff", top: "#f7f2ff", bg: "#f8f5ff", accent: "#7c3aed" } },

  { id: "graphite", label: "Graphite Dark", group: "Dark", preview: { rail: "#0c0c0e", top: "#111113", bg: "#0f1115", accent: "#3b82f6" } },
  { id: "midnight", label: "Midnight Blue", group: "Dark", preview: { rail: "#070d1a", top: "linear-gradient(90deg,#0a1324,#0f1d3a)", bg: "#0b1220", accent: "#38bdf8" } },
  { id: "neon", label: "Neon Night", group: "Dark", preview: { rail: "#08080f", top: "linear-gradient(90deg,#0d0d18,#1a0b2e,#0b1f2e)", bg: "#0a0a12", accent: "#e879f9" } },
];

export const THEME_GROUPS = ["Vibrant", "Light", "Dark"];

const DARK_THEMES = new Set(["graphite", "midnight", "neon"]);
const STORAGE_KEY = "nf-theme";
const DEFAULT_THEME = THEMES[0].id;

export function getSavedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return THEMES.some((t) => t.id === saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(id) {
  const theme = THEMES.some((t) => t.id === id) ? id : DEFAULT_THEME;
  document.documentElement.dataset.theme = theme;
  // Bootstrap components (form controls, dropdowns, tables) follow along
  document.documentElement.dataset.bsTheme = DARK_THEMES.has(theme) ? "dark" : "light";
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // storage unavailable (private mode) - theme still applies for this visit
  }
  return theme;
}
