// Gives every page button one consistent look. Buttons in the app come from ~70
// stylesheets with different radii, heights and fonts; this tags each button once
// with its kind (solid / outline / ghost / icon) and its nearest size (sm / md / lg)
// as data attributes, and css/buttons.css styles those. Purely visual: no classes,
// handlers or content are touched.

const SCOPE = '.of-main button, .main-container .content button';

// navigation-like controls keep their own design
const SKIP_CLASS = /(tab|step|toggle|switch|chip|tag|pagination|page-|editor|toolbar|tiptap|dropdown-item|menu-item|accordion|article-header|captcha|password|theme)/i;
const SECONDARY_TEXT = /^(cancel|close|back|discard|reset|no)\b/i;
const SKIP_INSIDE = '[role="tablist"], [class*="editor"], .mailer-toolbar, [class*="tabs"], [class*="pagination"], .nf-shell, .nf-topbar, .nf-theme';

function parse(color) {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
}

function classify(btn) {
  const cs = getComputedStyle(btn);
  const rect = btn.getBoundingClientRect();
  const bg = parse(cs.backgroundColor);
  const text = btn.textContent.trim();

  const isIcon = text.length <= 2 && rect.width <= rect.height * 1.6;
  let kind;
  if (isIcon) {
    kind = 'icon';
  } else if (bg && bg.a > 0.5 && !(bg.r > 225 && bg.g > 225 && bg.b > 225)) {
    const spread = Math.max(bg.r, bg.g, bg.b) - Math.min(bg.r, bg.g, bg.b);
    const light = (bg.r + bg.g + bg.b) / 3;
    // dark, desaturated (grey / slate) buttons are generic actions; light grey ones are soft chips
    kind = spread < 70 && light < 140 ? 'solid-neutral' : spread < 40 && light >= 140 ? 'soft' : 'solid';
  } else if (cs.borderTopStyle !== 'none' && parseFloat(cs.borderTopWidth) > 0) {
    kind = 'outline';
  } else {
    kind = 'ghost';
  }

  const h = rect.height;
  const size = h < 30 ? 'sm' : h < 42 ? 'md' : 'lg';
  const pill = parseFloat(cs.borderTopLeftRadius) >= 20 && !isIcon;
  return { kind, size, pill };
}

function tag(btn) {
  if (btn.dataset.nfBtn || !btn.offsetWidth) return;
  if (SKIP_CLASS.test(btn.className || '') || btn.closest(SKIP_INSIDE) || btn.getAttribute('role') === 'tab') {
    btn.dataset.nfBtn = 'skip';
    return;
  }
  const { kind, size, pill } = classify(btn);
  // cancel / close / back never look like the main action
  btn.dataset.nfBtn = kind !== 'icon' && SECONDARY_TEXT.test(btn.textContent.trim()) ? 'secondary' : kind;
  btn.dataset.nfSize = size;
  if (pill) btn.dataset.nfPill = '';
}

let queued = false;
function schedule() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    document.querySelectorAll(SCOPE).forEach(tag);
  });
}

export function initButtonPolish() {
  if (typeof window === 'undefined' || !('MutationObserver' in window)) return;
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();
}
