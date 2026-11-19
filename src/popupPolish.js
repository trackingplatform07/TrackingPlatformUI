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

function tagParts(dialog) {
  const box = dialog.getBoundingClientRect();
  const parts = within(dialog, 3).filter(visible);

  const close = [...dialog.querySelectorAll('button, [role="button"], span, i')].find((el) => {
    if (!visible(el)) return false;
    const r = el.getBoundingClientRect();
    const nearTop = r.top - box.top < 90 && box.right - r.right < 90;
    const text = el.textContent.trim();
    return nearTop && (CLOSE_TEXT.test(text) || /close/i.test(el.className || '') || /close/i.test(el.getAttribute('aria-label') || ''));
  });
  if (close) close.dataset.nfClose = '';

  const head = parts.find((el) => {
    const r = el.getBoundingClientRect();
    return r.top - box.top < 40 && r.height < 110 && r.width >= box.width * 0.6 &&
      (el.querySelector('h1, h2, h3, h4, h5, [class*="title"]') || /^h[1-5]$/i.test(el.tagName) || (close && el.contains(close)));
  });
  if (head && !head.matches('h1, h2, h3, h4, h5')) head.dataset.nfDialogHead = '';

  const foot = [...parts].reverse().find((el) => {
    const r = el.getBoundingClientRect();
    return box.bottom - r.bottom < 40 && r.height < 110 && r.width >= box.width * 0.6 &&
      el.querySelector('button') && !el.querySelector('input, select, textarea, table') && el !== head;
  });
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
  dialog.dataset[isDrawer ? 'nfDrawer' : 'nfDialog'] = '';
  tagParts(dialog);
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
