// The app uses a single colour theme (Navy); its colours live in css/themes.css.
const THEME = "navy";

export function applyTheme() {
  document.documentElement.dataset.theme = THEME;
  document.documentElement.dataset.bsTheme = "light";
  try {
    // clear the choice saved by the old theme picker
    localStorage.removeItem("nf-theme");
  } catch {
    // storage unavailable (private mode) - nothing to clear
  }
}
