// Freezes the first two columns (action checkbox + ID) on the left and the last
// column (options menu) on the right of every data table, so only the middle
// columns scroll sideways. Purely visual: it adds a class and two CSS variables
// per table and never touches table contents.

const MIN_COLUMNS = 5;

function opaqueBackground(el) {
  for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
    const bg = getComputedStyle(e).backgroundColor;
    const m = bg.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const parts = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      if (parts.length < 4 || parts[3] > 0.9) return bg;
    }
  }
  return getComputedStyle(document.body).backgroundColor || '#fff';
}

function isEligible(table) {
  const head = table.tHead;
  if (!head || head.rows.length !== 1) return false; // multi-row headers (grouped columns) are skipped
  const cells = head.rows[0].cells;
  if (cells.length < MIN_COLUMNS) return false;
  return ![...cells].some((c) => c.colSpan > 1);
}

function apply() {
  document.querySelectorAll('.of-main table, .main-container table').forEach((table) => {
    if (!isEligible(table)) {
      table.classList.remove('nf-sticky-table');
      return;
    }
    const headCells = table.tHead.rows[0].cells;
    const first = headCells[0];
    // Read colours from a middle column, which is never frozen: frozen cells
    // already carry the colour set here, so reading them would keep a stale
    // colour (e.g. a dark theme's) after the theme changes.
    const bodyRow = [...(table.tBodies[0]?.rows || [])].find((r) => r.cells.length === headCells.length);
    table.classList.add('nf-sticky-table');
    table.style.setProperty('--nf-col1-w', `${first.getBoundingClientRect().width}px`);
    table.style.setProperty('--nf-sticky-bg', opaqueBackground(bodyRow ? bodyRow.cells[2] : table));
    table.style.setProperty('--nf-sticky-head-bg', opaqueBackground(headCells[2]));
  });
}

let queued = false;
function schedule() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    apply();
  });
}

export function initStickyColumns() {
  if (typeof window === 'undefined' || !('MutationObserver' in window)) return;
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', schedule);
  // theme changes alter the backgrounds the sticky cells must match
  new MutationObserver(schedule).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  schedule();
}
