import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ReportsPage.css";
import "../css/ConversionLogsPage.css";
import "../css/IGamingReportsPage.css";

const COLUMN_GROUPS = [
  {
    title: "Timing",
    columns: ["Date", "Month", "Hour", "Time", "AffiliateID", "AdvertiserID", "Status", "Affiliate", "OfferID", "Currency"],
  },
  {
    title: "iGaming",
    columns: [
      "Registrations", "Deposits", "DepositsAmount", "FTD (First Time Deposits)", "FTDAmount",
      "Re-Deposits", "Re-DepositsAmount", "Bets", "BetsAmount", "Wins",
      "WinsAmount", "Withdrawals", "WithdrawalsAmount", "Bonuses", "BonusesAmount",
      "UserID", "ProductID", "GGR (GrossGamingRevenue)", "NGR (NetGamingRevenue)",
    ],
  },
];

const DEFAULT_SELECTED_COLUMNS = [
  "OfferID", "Currency",
  "Registrations", "Deposits", "DepositsAmount", "Bets", "BetsAmount",
  "Wins", "WinsAmount", "Withdrawals", "WithdrawalsAmount", "Bonuses",
  "BonusesAmount", "GGR (GrossGamingRevenue)", "NGR (NetGamingRevenue)",
];

const TOTAL_COLUMN_COUNT = COLUMN_GROUPS.reduce((total, group) => total + group.columns.length, 0);

const TABLE_COLUMNS = [
  "OfferID", "Registrations", "Deposits", "DepositsAmount", "Bets", "BetsAmount",
  "Wins", "WinsAmount", "Withdrawals", "WithdrawalsAmount", "Bonuses", "BonusesAmount",
  "Currency", "GGR", "NGR",
];

const TIMEZONE_OPTIONS = [
  "(GMT +0:00) UTC, Western Europe Time",
  "(GMT +1:00) Central Europe Time",
  "(GMT +5:30) India Standard Time",
  "(GMT -5:00) Eastern Time (US)",
  "(GMT -8:00) Pacific Time (US)",
];

const CURRENCY_OPTIONS = ["USD", "INR", "EUR", "AED", "GBP"];

const monthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const pad = (value) => String(value).padStart(2, "0");
  const iso = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return { start: `${iso(start)}T00:00:00`, end: `${iso(end)}T23:59:59` };
};

export default function IGamingReportsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [periodStart, setPeriodStart] = useState(() => monthRange().start);
  const [periodEnd, setPeriodEnd] = useState(() => monthRange().end);
  const [showEntries, setShowEntries] = useState(100);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [advertisers, setAdvertisers] = useState([]);
  const [advertisersLoading, setAdvertisersLoading] = useState(false);
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(false);

  const [reportRows, setReportRows] = useState([]);
  const [reportRowsLoading, setReportRowsLoading] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filtersSectionOpen, setFiltersSectionOpen] = useState(true);
  const [columnsSectionOpen, setColumnsSectionOpen] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");
  const [selectedColumns, setSelectedColumns] = useState(() => new Set(DEFAULT_SELECTED_COLUMNS));

  const [filterOfferId, setFilterOfferId] = useState("");
  const [filterAdvertiserId, setFilterAdvertiserId] = useState("");
  const [filterAffiliateId, setFilterAffiliateId] = useState("");
  const [filterManager, setFilterManager] = useState("");
  const [filterTimezone, setFilterTimezone] = useState(TIMEZONE_OPTIONS[0]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [filterHour, setFilterHour] = useState("");
  const [filterCurrency, setFilterCurrency] = useState("");

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
    if (!showFiltersPanel) return undefined;
    const controller = new AbortController();

    const loadAdvertisers = async () => {
      try {
        setAdvertisersLoading(true);
        const response = await fetch("https://localhost:7129/api/Advertisers", { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load advertisers");
        const data = await response.json();
        setAdvertisers(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setAdvertisers([]);
      } finally {
        if (!controller.signal.aborted) setAdvertisersLoading(false);
      }
    };

    loadAdvertisers();
    return () => controller.abort();
  }, [showFiltersPanel]);

  useEffect(() => {
    if (!showFiltersPanel) return undefined;
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
  }, [showFiltersPanel]);

  const affiliateName = (affiliate) =>
    [affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || "Unnamed Affiliate";

  const advertiserName = (advertiser) =>
    [advertiser.firstName, advertiser.lastName].filter(Boolean).join(" ") || advertiser.companyName || "Unnamed Advertiser";

  const isWithinPeriod = (value) => {
    if (!value) return true;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return true;
    const start = periodStart ? new Date(periodStart) : null;
    const end = periodEnd ? new Date(periodEnd) : null;
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  };

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

  const submitReport = async () => {
    try {
      setReportRowsLoading(true);
      const response = await fetch("https://localhost:7150/api/Offers", { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load offers");
      const data = await response.json();
      const items = (Array.isArray(data) ? data : data.items || data.data || [])
        .filter((offer) => isWithinPeriod(offer.createdOn))
        .filter((offer) => !filterOfferId || String(offer.id) === String(filterOfferId))
        .filter((offer) => !filterAdvertiserId || String(offer.advertiserId) === String(filterAdvertiserId))
        .filter((offer) => !filterStatus || String(offer.status || "").toLowerCase() === filterStatus.toLowerCase())
        .filter((offer) => !filterCurrency || String(offer.affiliateCurrency || offer.advertiserCurrency || "") === filterCurrency);

      setReportRows(items.map((offer) => ({
        id: offer.id,
        label: `${offer.id} ~ ${offer.offerName}`,
        currency: offer.affiliateCurrency || offer.advertiserCurrency || "-",
      })));
      setReportSubmitted(true);
    } catch {
      setReportRows([]);
      setReportSubmitted(true);
      alert("Unable to load the report data. Please check the API and try again.");
    } finally {
      setReportRowsLoading(false);
    }
  };

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="igaming-reports-page">
          <section className="igaming-reports-toolbar-card">
            <div className="reports-header igaming-reports-header">
              <h2><span aria-hidden="true">🎮</span> iGaming Reports</h2>

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
                <button type="button" className="events-dark-btn" onClick={submitReport} disabled={reportRowsLoading}>
                  <span aria-hidden="true">🕐</span> {reportRowsLoading ? "Loading…" : "Submit"}
                </button>
                <button type="button" className="postback-logs-filter-btn" onClick={() => setShowFiltersPanel(true)} aria-label="Filters and columns">▽</button>
              </div>
            </div>
          </section>

          <section className="igaming-reports-table-card">
            <div className="events-table-wrap">
              <table className="events-table automation-table reports-table">
                <thead>
                  <tr>
                    {TABLE_COLUMNS.map((column) => (
                      <th key={column}>{column} <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportRowsLoading && (
                    <tr><td colSpan={TABLE_COLUMNS.length} className="automation-empty-cell">Loading…</td></tr>
                  )}
                  {!reportRowsLoading && reportSubmitted && reportRows.length === 0 && (
                    <tr><td colSpan={TABLE_COLUMNS.length} className="automation-empty-cell">No data available in table</td></tr>
                  )}
                  {!reportRowsLoading && !reportSubmitted && (
                    <tr><td colSpan={TABLE_COLUMNS.length} className="automation-empty-cell">No data available in table</td></tr>
                  )}
                  {!reportRowsLoading && reportRows.slice(0, Number(showEntries) || reportRows.length).map((row) => (
                    <tr key={row.id}>
                      <td>{row.label}</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>0</td>
                      <td>{row.currency}</td>
                      <td>0</td>
                      <td>0</td>
                    </tr>
                  ))}
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
                <div className="conversion-filters-grid">
                  <div className="conversion-filter-field">
                    <label>Offer</label>
                    <select value={filterOfferId} onChange={(event) => setFilterOfferId(event.target.value)} disabled={offersLoading}>
                      <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                      {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Advertiser</label>
                    <select value={filterAdvertiserId} onChange={(event) => setFilterAdvertiserId(event.target.value)} disabled={advertisersLoading}>
                      <option value="">{advertisersLoading ? "Loading advertisers…" : "Select Advertiser"}</option>
                      {advertisers.map((advertiser) => <option key={advertiser.id} value={advertiser.id}>{advertiser.id} ~ {advertiserName(advertiser)}</option>)}
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Affiliate</label>
                    <select value={filterAffiliateId} onChange={(event) => setFilterAffiliateId(event.target.value)} disabled={affiliatesLoading}>
                      <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                      {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Manager</label>
                    <select value={filterManager} onChange={(event) => setFilterManager(event.target.value)}>
                      <option value="">Select Employee</option>
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Timezone</label>
                    <select value={filterTimezone} onChange={(event) => setFilterTimezone(event.target.value)}>
                      {TIMEZONE_OPTIONS.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Status</label>
                    <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
                      <option value="">Select</option>
                      <option>Approved</option>
                      <option>Pending</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>UserID</label>
                    <input value={filterUserId} onChange={(event) => setFilterUserId(event.target.value)} placeholder="Search UserID" />
                  </div>
                  <div className="conversion-filter-field">
                    <label>Hour Filter</label>
                    <select value={filterHour} onChange={(event) => setFilterHour(event.target.value)}>
                      <option value="">Select</option>
                      {Array.from({ length: 24 }, (_, hour) => (
                        <option key={hour} value={hour}>{String(hour).padStart(2, "0")}:00</option>
                      ))}
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Currency Convert</label>
                    <select value={filterCurrency} onChange={(event) => setFilterCurrency(event.target.value)}>
                      <option value="">Select Currency</option>
                      {CURRENCY_OPTIONS.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <button type="button" className="filters-panel-section-toggle" onClick={() => setColumnsSectionOpen((value) => !value)}>
                <span aria-hidden="true">{columnsSectionOpen ? "⌄" : "›"}</span> Columns
              </button>

              {columnsSectionOpen && (
                <div className="filters-panel-columns">
                  <label className="filters-panel-count">
                    <input type="checkbox" checked readOnly />
                    {selectedColumns.size} of {TOTAL_COLUMN_COUNT} selected
                  </label>

                  <input
                    type="text"
                    className="filters-panel-search"
                    value={columnSearch}
                    onChange={(event) => setColumnSearch(event.target.value)}
                    placeholder="Search"
                  />

                  {COLUMN_GROUPS.map((group) => {
                    const visibleColumns = group.columns.filter(columnMatchesSearch);
                    if (!visibleColumns.length) return null;
                    return (
                      <div className="filters-panel-group" key={group.title}>
                        <h3><span aria-hidden="true">▽</span> {group.title}</h3>
                        <div className="filters-panel-grid">
                          {visibleColumns.map((column) => (
                            <label className="filters-panel-checkbox" key={column}>
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
                    );
                  })}
                </div>
              )}
            </div>

            <div className="filters-panel-footer">
              <button type="button" className="events-dark-btn" onClick={() => setShowFiltersPanel(false)}>
                <span aria-hidden="true">🕐</span> Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
