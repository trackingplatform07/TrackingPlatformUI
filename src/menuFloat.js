// Row / header menus (⋮, Action ▼) inside tables are absolutely positioned, so the
// table's scroll box cuts them off. When one opens, this pins it to the viewport at
// the same spot (position: fixed), flips it above the button when there is no room
// below, and keeps it attached while the page or table scrolls. Purely visual: the
// menu stays where React put it in the DOM, so its clicks and outside-click closing
// work as before.

const MENU_CLASS = /(dropdown|menu)/i;
const ITEM_CLASS = /(item|wrapper|wrap|trigger|toggle|btn|button|option-)/i;
const GAP = 6;
const floated = new Set();

const visible = (el) => el.getClientRects().length > 0;

function place(el) {
  const anchor = el.parentElement;
  if (!anchor) return;
  const a = anchor.getBoundingClientRect();
  const { dx, dy, w, h } = el._nfFloat;
  let top = a.top + dy;
  let left = a.left + dx;
  // no room below: open above the button; no room above: open below it
  if (top + h > window.innerHeight - 8 && a.top - h - GAP >= 8) top = a.top - h - GAP;
  else if (top < 8 && a.bottom + GAP + h <= window.innerHeight - 8) top = a.bottom + GAP;
  left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
  el.style.setProperty('top', `${Math.round(top)}px`, 'important');
  el.style.setProperty('left', `${Math.round(left)}px`, 'important');
}

function float(el) {
  const r = el.getBoundingClientRect();
  const a = el.parentElement.getBoundingClientRect();
  el._nfFloat = { dx: r.left - a.left, dy: r.top - a.top, w: r.width, h: r.height };
  el.dataset.nfFloat = '';
  el.style.setProperty('position', 'fixed', 'important');
  el.style.setProperty('right', 'auto', 'important');
  el.style.setProperty('bottom', 'auto', 'important');
  el.style.setProperty('margin', '0', 'important');
  el.style.setProperty('width', `${Math.ceil(r.width)}px`, 'important');
  el.style.setProperty('z-index', '1150', 'important');
  floated.add(el);
  place(el);
}

function unfloat(el) {
  ['position', 'right', 'bottom', 'margin', 'width', 'z-index', 'top', 'left'].forEach((p) => el.style.removeProperty(p));
  delete el.dataset.nfFloat;
  delete el._nfFloat;
  floated.delete(el);
}

function scan() {
  // menus that closed (removed, or hidden by a class) go back to normal
  floated.forEach((el) => { if (!el.isConnected || !visible(el)) unfloat(el); });

  document.querySelectorAll('table td [class], table th [class]').forEach((el) => {
    if (el.dataset.nfFloat !== undefined) return;
    const cls = String(el.className || '');
    if (!MENU_CLASS.test(cls) || ITEM_CLASS.test(cls) || !visible(el)) return;
    if (getComputedStyle(el).position !== 'absolute') return;
    float(el);
  });
}

let queued = false;
function schedule() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; scan(); });
}

function follow() {
  floated.forEach((el) => el.isConnected && place(el));
}

export function initMenuFloat() {
  if (typeof window === 'undefined' || !('MutationObserver' in window)) return;
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  window.addEventListener('scroll', follow, { capture: true, passive: true });
  window.addEventListener('resize', follow);
  schedule();
}
