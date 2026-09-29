import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ReportsPage.css";
import "../css/ConversionLogsPage.css";
import "../css/AffiliatePostbackLogsPage.css";

const COLUMN_LIST = [
  "TID", "OfferID", "AffiliateID", "Affiliate", "Total", "Type", "Event",
  "PostbackURL", "HttpLog", "PostbackURLraw", "HttpStatus", "Response",
  "PostbackTime", "Status",
];

const DEFAULT_SELECTED_COLUMNS = [
  "TID", "OfferID", "AffiliateID", "Affiliate", "PostbackURL", "HttpStatus", "PostbackTime", "Status",
];

const TIMEZONE_OPTIONS = [
  "(GMT +0:00) UTC, Western Europe Time",
  "(GMT +1:00) Central Europe Time",
  "(GMT +5:30) India Standard Time",
  "(GMT -5:00) Eastern Time (US)",
  "(GMT -8:00) Pacific Time (US)",
];

export default function AffiliatePostbackLogsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(true);

  const [testOnly, setTestOnly] = useState(false);
  const [logsOfferId, setLogsOfferId] = useState("");
  const [logsAffiliateId, setLogsAffiliateId] = useState("");
  const [dateStart, setDateStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [dateEnd, setDateEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [showEntries, setShowEntries] = useState(20);

  const [logsLoading, setLogsLoading] = useState(false);

  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filtersSectionOpen, setFiltersSectionOpen] = useState(true);
  const [columnsSectionOpen, setColumnsSectionOpen] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");
  const [selectedColumns, setSelectedColumns] = useState(() => new Set(DEFAULT_SELECTED_COLUMNS));

  const [filterTimezone, setFilterTimezone] = useState(TIMEZONE_OPTIONS[0]);
  const [filterTid, setFilterTid] = useState("");
  const [disableSort, setDisableSort] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadOffers = async () => {
      try {
        setOffersLoading(true);
        const response = await fetch("https://localhost:7150/api/Offers", { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load offers");
        const data = await response.json();
        setOffers(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setOffers([]);
      } finally {
        if (!controller.signal.aborted) setOffersLoading(false);
      }
    };

    loadOffers();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadAffiliates = async () => {
      try {
        setAffiliatesLoading(true);
        const response = await fetch("https://localhost:7029/api/Affiliates", { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load affiliates");
        const data = await response.json();
        setAffiliates(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setAffiliates([]);
      } finally {
        if (!controller.signal.aborted) setAffiliatesLoading(false);
      }
    };

    loadAffiliates();
    return () => controller.abort();
  }, []);

  const affiliateName = (affiliate) =>
    [affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || "Unnamed Affiliate";

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

  const selectedOffer = offers.find((offer) => String(offer.id) === String(logsOfferId));

  const submitLogs = () => {
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

        <main className="affiliate-postback-logs-page">
          <section className="affiliate-postback-logs-card">
            <div className="postback-logs-header">
              <h2><span aria-hidden="true">👤</span> Affiliate Postback Logs</h2>
              <div className="postback-logs-filters">
                <label className="postback-logs-test-only">
                  <input type="checkbox" checked={testOnly} onChange={(event) => setTestOnly(event.target.checked)} />
                  TestPostback
                </label>

                <div className="postback-logs-offer-affiliate-chip">
                  <div className="postback-logs-offer-chip">
                    {logsOfferId ? (
                      <span className="ctit-chip">
                        {selectedOffer ? `${selectedOffer.id} ~ ${selectedOffer.offerName}` : logsOfferId}
                        <button type="button" onClick={() => setLogsOfferId("")} aria-label="Clear offer">×</button>
                      </span>
                    ) : (
                      <select value="" onChange={(event) => setLogsOfferId(event.target.value)} disabled={offersLoading}>
                        <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                        {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                      </select>
                    )}
                  </div>
                  <select
                    className="postback-logs-affiliate-select"
                    value={logsAffiliateId}
                    onChange={(event) => setLogsAffiliateId(event.target.value)}
                    disabled={affiliatesLoading}
                  >
                    <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                    {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
                  </select>
                </div>

                <div className="postback-logs-date-range">
                  <input type="date" value={dateStart} onChange={(event) => setDateStart(event.target.value)} />
                  <span>-</span>
                  <input type="date" value={dateEnd} onChange={(event) => setDateEnd(event.target.value)} />
                </div>

                <label className="postback-logs-show">
                  Show
                  <input type="number" min="1" value={showEntries} onChange={(event) => setShowEntries(event.target.value)} />
                </label>

                <button type="button" className="events-dark-btn" onClick={submitLogs} disabled={logsLoading}>
                  <span aria-hidden="true">🕐</span> {logsLoading ? "Loading…" : "Submit"}
                </button>
                <button type="button" className="postback-logs-filter-btn" onClick={() => setShowFiltersPanel(true)} aria-label="Filters and columns">▽</button>
              </div>
            </div>

            <div className="events-table-wrap">
              <table className="events-table automation-table">
                <thead>
                  <tr>
                    {tableColumns.map((column) => (
                      <th key={column}>{column} <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
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
                <div className="conversion-filters-grid affiliate-postback-logs-filters-grid">
                  <div className="conversion-filter-field">
                    <label>Timezone</label>
                    <select value={filterTimezone} onChange={(event) => setFilterTimezone(event.target.value)}>
                      {TIMEZONE_OPTIONS.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>TID Search</label>
                    <input value={filterTid} onChange={(event) => setFilterTid(event.target.value)} placeholder="TID Search" />
                  </div>
                  <label className="affiliate-postback-logs-disable-sort">
                    <input type="checkbox" checked={disableSort} onChange={(event) => setDisableSort(event.target.checked)} />
                    DisableSort
                  </label>
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
                        {column}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="filters-panel-footer">
              <button type="button" className="events-dark-btn" onClick={submitLogs} disabled={logsLoading}>
                <span aria-hidden="true">🕐</span> {logsLoading ? "Loading…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
