// UI colour themes. The choice is stored per browser and applied as
// <html data-theme="...">; the colours themselves live in css/themes.css.
export const THEMES = [
  { id: "indigo", label: "Indigo Night", swatch: ["#141137", "#4f46e5"] },
  { id: "ocean", label: "Ocean Blue", swatch: ["#0b2545", "#0284c7"] },
  { id: "emerald", label: "Emerald", swatch: ["#04291f", "#059669"] },
  { id: "sunset", label: "Sunset Rose", swatch: ["#2d0b1e", "#e11d48"] },
  { id: "royal", label: "Royal Purple", swatch: ["#1e0b3a", "#7c3aed"] },
  { id: "light", label: "Classic Light", swatch: ["#ffffff", "#4f46e5"] },
  { id: "graphite", label: "Graphite Dark", swatch: ["#111113", "#2563eb"] },
];

const DARK_THEMES = new Set(["graphite"]);
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
