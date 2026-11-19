// Gives every popup one consistent design. The app's ~30 popups each draw their
// own box; when one opens, this finds its parts and tags them with data attributes
// (overlay / dialog or drawer / header / close button / footer) that
// css/popups.css styles. Purely visual: no classes, handlers or content change.

const CANDIDATES = '[class*="modal"], [class*="overlay"], [class*="popup"], [class*="backdrop"], [class*="dialog"], [class*="drawer"]';
const IGNORE = '.of-nav-backdrop, .nf-shell, .nf-topbar, .nf-theme-menu, .nf-user-menu';
const CLOSE_TEXT = /^(×|✕|✖|x|X|close)$/;

const visible = (el) => el && el.offsetWidth > 0 && el.offsetHeight > 0;

function biggestChild(el) {
  return [...el.children].filter(visible)
    .sort((a, b) => b.offsetWidth * b.offsetHeight - a.offsetWidth * a.offsetHeight)[0] || null;
}

// elements up to `depth` levels below `root`, in document order
function within(root, depth) {
  const out = [];
  const walk = (el, d) => {
    for (const c of el.children) {
      out.push(c);
      if (d < depth) walk(c, d + 1);
    }
  };
  walk(root, 1);
  return out;
}

// How far an element sits inside the dialog's padding box, so its band can be
// stretched edge to edge with negative margins (measured before any styling).
// The value is gap minus the element's existing margin, so elements that already
// use negative margins (e.g. Bootstrap .row) end up flush too.
function setBleed(el, inner, edges) {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const gap = { l: r.left - inner.left, r: inner.right - r.right, t: r.top - inner.top, b: inner.bottom - r.bottom };
  const margin = { l: cs.marginLeft, r: cs.marginRight, t: cs.marginTop, b: cs.marginBottom };
  for (const e of edges) {
    const v = Math.round(gap[e] - (parseFloat(margin[e]) || 0));
    if (v > 0 && v < 80) el.style.setProperty(`--nf-bleed-${e}`, `${v}px`);
  }
}

function tagParts(dialog) {
  const box = dialog.getBoundingClientRect();
  const dcs = getComputedStyle(dialog);
  const bl = parseFloat(dcs.borderLeftWidth) || 0;
  const scrollbar = dialog.offsetWidth - dialog.clientWidth - bl - (parseFloat(dcs.borderRightWidth) || 0);
  const inner = {
    left: box.left + bl,
    right: box.right - (parseFloat(dcs.borderRightWidth) || 0) - Math.max(0, scrollbar),
    top: box.top + (parseFloat(dcs.borderTopWidth) || 0),
    bottom: box.bottom - (parseFloat(dcs.borderBottomWidth) || 0),
  };
  const parts = within(dialog, 3).filter(visible);

  const close = [...dialog.querySelectorAll('button, [role="button"], span, i')].find((el) => {
    if (!visible(el)) return false;
    const r = el.getBoundingClientRect();
    const nearTop = r.top - box.top < 90 && box.right - r.right < 90;
    const text = el.textContent.trim();
    return nearTop && (CLOSE_TEXT.test(text) || /close/i.test(el.className || '') || /close/i.test(el.getAttribute('aria-label') || ''));
  });

  const head = parts.find((el) => {
    const r = el.getBoundingClientRect();
    return r.top - box.top < 40 && r.height < 110 && r.width >= box.width * 0.6 &&
      (el.querySelector('h1, h2, h3, h4, h5, [class*="title"]') || /^h[1-5]$/i.test(el.tagName) || (close && el.contains(close)));
  });
  const styledHead = head && !head.matches('h1, h2, h3, h4, h5') ? head : null;
  if (styledHead) setBleed(styledHead, inner, ['l', 'r', 't']);

  const foot = [...parts].reverse().find((el) => {
    const r = el.getBoundingClientRect();
    return box.bottom - r.bottom < 40 && r.height < 110 && r.width >= box.width * 0.6 &&
      el.querySelector('button') && !el.querySelector('input, select, textarea, table') && el !== head;
  });
  if (foot) setBleed(foot, inner, ['l', 'r', 'b']);

  // tag only after everything is measured, since tagging restyles the element
  if (close) close.dataset.nfClose = '';
  if (styledHead) styledHead.dataset.nfDialogHead = '';
  if (foot) foot.dataset.nfDialogFoot = '';
}

function tagOverlay(overlay) {
  if (overlay.dataset.nfOverlay !== undefined || overlay.closest(IGNORE) || !visible(overlay)) return;
  const cs = getComputedStyle(overlay);
  const r = overlay.getBoundingClientRect();
  if (cs.position !== 'fixed' || r.width < innerWidth * 0.9 || r.height < innerHeight * 0.9) return;

  let dialog = biggestChild(overlay);
  if (!dialog) return;
  // Bootstrap: .modal-dialog is only a positioning shell around .modal-content
  if (dialog.classList.contains('modal-dialog')) dialog = dialog.querySelector('.modal-content') || dialog;

  overlay.dataset.nfOverlay = '';
  const d = dialog.getBoundingClientRect();
  // a side panel is full height and pinned to the left or right edge
  const atEdge = d.right >= innerWidth - 2 || d.left <= 2;
  const isDrawer = atEdge && d.height >= innerHeight * 0.95 && d.width < innerWidth * 0.8;
  tagParts(dialog);
  dialog.dataset[isDrawer ? 'nfDrawer' : 'nfDialog'] = '';
}

let queued = false;
function schedule() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    document.querySelectorAll(CANDIDATES).forEach(tagOverlay);
  });
}

export function initPopupPolish() {
  if (typeof window === 'undefined' || !('MutationObserver' in window)) return;
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  schedule();
}
