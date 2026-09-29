import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ReportsPage.css";
import "../css/ConversionLogsPage.css";
import "../css/AffiliatePostbackLogsPage.css";
import "../css/OtpReportsPage.css";

const COLUMN_LIST = [
  "IntegrationID", "IntegrationName", "UserID", "AffiliateID", "Partner", "ProductId",
  "Generate Request", "Unique Generate Request", "Success Request", "Failed Request",
  "Verification Request", "Unique Verification Request", "Verification Success",
  "Verification Failed", "V.Success Rate", "V.Failed Rate",
];

const DEFAULT_SELECTED_COLUMNS = [
  "IntegrationID", "IntegrationName", "UserID", "AffiliateID",
  "Generate Request", "Success Request", "Failed Request",
  "Verification Request", "Verification Success", "Verification Failed",
  "V.Success Rate", "V.Failed Rate",
];

const COLUMN_LABELS = {
  "V.Success Rate": "V.Success Rate (%)",
  "V.Failed Rate": "V.Failed Rate (%)",
};

const monthRange = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const iso = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return { start: `${iso(now)}T00:00:00`, end: `${iso(now)}T23:59:59` };
};

export default function OtpReportsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [periodStart, setPeriodStart] = useState(() => monthRange().start);
  const [periodEnd, setPeriodEnd] = useState(() => monthRange().end);
  const [showEntries, setShowEntries] = useState(100);

  const [logsLoading, setLogsLoading] = useState(false);

  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filtersSectionOpen, setFiltersSectionOpen] = useState(true);
  const [columnsSectionOpen, setColumnsSectionOpen] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");
  const [selectedColumns, setSelectedColumns] = useState(() => new Set(DEFAULT_SELECTED_COLUMNS));

  const [filterPartner, setFilterPartner] = useState("");
  const [filterUserId, setFilterUserId] = useState("");

  const toggleColumn = (column) => {
    setSelectedColumns((current) => {
      const next = new Set(current);
      if (next.has(column)) next.delete(column);
      else next.add(column);
      return next;
    });
  };

  const columnMatchesSearch = (column) =>
    !columnSearch.trim() || column.toLowerCase().includes(columnSearch.trim().toLowerCase());

  const visibleColumns = COLUMN_LIST.filter(columnMatchesSearch);
  const tableColumns = COLUMN_LIST.filter((column) => selectedColumns.has(column));

  const submitReport = () => {
    setLogsLoading(true);
    window.setTimeout(() => {
      setLogsLoading(false);
      setShowFiltersPanel(false);
    }, 250);
  };

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="otp-reports-page">
          <section className="otp-reports-toolbar-card">
            <div className="reports-header otp-reports-header">
              <h2><span aria-hidden="true">◔</span> Otp Reports</h2>

              <div className="reports-period">
                <span className="reports-period-label"><span aria-hidden="true">📅</span> Period</span>
                <div className="reports-period-range">
                  <input type="datetime-local" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} />
                  <span>-</span>
                  <input type="datetime-local" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} />
                </div>
              </div>

              <div className="reports-results">
                <span className="reports-results-label"><span aria-hidden="true">☰</span> Results</span>
                <label className="postback-logs-show">
                  Show
                  <input type="number" min="1" value={showEntries} onChange={(event) => setShowEntries(event.target.value)} />
                </label>
                <button type="button" className="events-dark-btn" onClick={submitReport} disabled={logsLoading}>
                  <span aria-hidden="true">🕐</span> {logsLoading ? "Loading…" : "Submit"}
                </button>
                <button type="button" className="postback-logs-filter-btn" onClick={() => setShowFiltersPanel(true)} aria-label="Filters and columns">▽</button>
              </div>
            </div>
          </section>

          <section className="otp-reports-table-card">
            <div className="events-table-wrap">
              <table className="events-table automation-table reports-table">
                <thead>
                  <tr>
                    {tableColumns.map((column) => (
                      <th key={column}>{COLUMN_LABELS[column] || column} <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableColumns.length === 0 && (
                    <tr><td className="automation-empty-cell">Select at least one column from Filters &amp; Columns.</td></tr>
                  )}
                  {tableColumns.length > 0 && logsLoading && (
                    <tr><td colSpan={tableColumns.length} className="automation-empty-cell">Loading…</td></tr>
                  )}
                  {tableColumns.length > 0 && !logsLoading && (
                    <tr><td colSpan={tableColumns.length} className="automation-empty-cell">No data available in table</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {showFiltersPanel && (
        <div className="filters-panel-overlay" onClick={() => setShowFiltersPanel(false)}>
          <div className="filters-panel" onClick={(event) => event.stopPropagation()}>
            <header className="filters-panel-header">
              <h2><span aria-hidden="true">▽</span> Filters &amp; Columns</h2>
              <button type="button" onClick={() => setShowFiltersPanel(false)} aria-label="Close">×</button>
            </header>

            <div className="filters-panel-body">
              <button type="button" className="filters-panel-section-toggle" onClick={() => setFiltersSectionOpen((value) => !value)}>
                <span aria-hidden="true">{filtersSectionOpen ? "⌄" : "›"}</span> Filters
              </button>

              {filtersSectionOpen && (
                <div className="otp-reports-filters-grid">
                  <div className="conversion-filter-field">
                    <label>Partner</label>
                    <input value={filterPartner} onChange={(event) => setFilterPartner(event.target.value)} placeholder="Search Partner" />
                  </div>
                  <div className="conversion-filter-field">
                    <label>UserID</label>
                    <input value={filterUserId} onChange={(event) => setFilterUserId(event.target.value)} placeholder="Search UserID" />
                  </div>
                </div>
              )}

              <button type="button" className="filters-panel-section-toggle" onClick={() => setColumnsSectionOpen((value) => !value)}>
                <span aria-hidden="true">{columnsSectionOpen ? "⌄" : "›"}</span> Columns
              </button>

              {columnsSectionOpen && (
                <div className="filters-panel-columns">
                  <label className="filters-panel-count">
                    <input
                      type="checkbox"
                      checked={selectedColumns.size === COLUMN_LIST.length}
                      onChange={(event) => setSelectedColumns(event.target.checked ? new Set(COLUMN_LIST) : new Set())}
                    />
                    {selectedColumns.size} of {COLUMN_LIST.length} selected
                  </label>

                  <input
                    type="text"
                    className="filters-panel-search"
                    value={columnSearch}
                    onChange={(event) => setColumnSearch(event.target.value)}
                    placeholder="Search"
                  />

                  <div className="affiliate-postback-logs-columns-list">
                    {visibleColumns.map((column) => (
                      <label className="affiliate-postback-logs-checkbox-row" key={column}>
                        <input
                          type="checkbox"
                          checked={selectedColumns.has(column)}
                          onChange={() => toggleColumn(column)}
                        />
                        {COLUMN_LABELS[column] || column}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="filters-panel-footer">
              <button type="button" className="events-dark-btn" onClick={submitReport} disabled={logsLoading}>
                <span aria-hidden="true">🕐</span> {logsLoading ? "Loading…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
