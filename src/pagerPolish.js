// Gives every pagination bar the same look as the Affiliates / Advertisers pager:
// "Showing … entries" on the left, a ‹ prev / page numbers / next › group on the right.
// Pages build their pagers with different markup (Previous/Next text, « », ‹ ›, << >>,
// Bootstrap .pagination, "1 / 3" counters); this tags the parts with data attributes
// and css/pagination.css styles those. Purely visual: no classes, handlers or content
// are touched.

const PREV = /^(‹|«|<|<<|prev|previous)( page)?$/i;
const NEXT = /^(›|»|>|>>|next)( page)?$/i;
const PAGER_CLASS = /(pagination|pager)/i;
const SKIP_INSIDE = '.nf-topbar, .nf-shell';

const labelOf = (el) => (el.textContent.trim() || el.getAttribute('aria-label') || '').trim();

// the outermost element (up to 4 levels up) whose class says it is a pager
function findBar(el) {
  let bar = null;
  let node = el.parentElement;
  for (let i = 0; i < 4 && node && node !== document.body; i++, node = node.parentElement) {
    if (PAGER_CLASS.test(String(node.className || ''))) bar = node;
  }
  return bar;
}

function tagControl(btn) {
  if (btn.dataset.nfPg || btn.closest(SKIP_INSIDE)) return;
  const label = labelOf(btn);
  let dir = PREV.test(label) ? 'prev' : NEXT.test(label) ? 'next' : null;
  // icon-only arrows (Affiliates / Advertisers): first one is prev, last one is next
  if (!dir && btn.classList.contains('pagination-nav-btn')) {
    const navs = btn.parentElement.querySelectorAll(':scope > .pagination-nav-btn');
    dir = btn === navs[0] ? 'prev' : 'next';
  }
  if (!dir) return;
  const bar = findBar(btn);
  if (!bar) return;

  btn.dataset.nfPg = dir;
  // text-only arrows get a drawn chevron; ones with their own svg icon keep it
  if (!btn.querySelector('svg')) btn.dataset.nfPgText = '';

  // the group holding prev / numbers / next (Bootstrap pagers wrap each in <li>)
  const item = btn.parentElement.tagName === 'LI' ? btn.parentElement : btn;
  const group = item.parentElement;
  group.dataset.nfPgGroup = '';

  bar.dataset.nfPager = '';
  [...bar.children].forEach((child) => {
    if (/^showing\b/i.test(child.textContent.trim())) child.dataset.nfPg = 'info';
  });
}

// page numbers and counters inside a tagged group (re-checked as pages change)
function tagNumbers(group) {
  group.querySelectorAll(':scope > button, :scope > span, :scope > a, :scope > li > button, :scope > li > a, :scope > .pagination-numbers > button').forEach((el) => {
    if (el.dataset.nfPg === 'prev' || el.dataset.nfPg === 'next') return;
    const text = el.textContent.trim();
    if (/^\d+$/.test(text) || text === '...' || text === '…') {
      el.dataset.nfPg = el.tagName === 'SPAN' ? 'current' : 'num';
    } else if (/^\d+\s*\/\s*\d+$/.test(text)) {
      el.dataset.nfPg = 'status';
    }
  });
}

let queued = false;
function schedule() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    document.querySelectorAll('button:not([data-nf-pg]), a.page-link:not([data-nf-pg])').forEach(tagControl);
    document.querySelectorAll('[data-nf-pg-group]').forEach(tagNumbers);
  });
}

export function initPagerPolish() {
  if (typeof window === 'undefined' || !('MutationObserver' in window)) return;
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  schedule();
}
