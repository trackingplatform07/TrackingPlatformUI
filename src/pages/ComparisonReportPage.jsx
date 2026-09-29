import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ReportsPage.css";
import "../css/ConversionLogsPage.css";
import "../css/ComparisonReportPage.css";

const METRIC_COLUMNS = [
  "GrossClicks", "UniqueClicks", "GrossImps", "UniqueImps",
  "Conversions", "AdvertiserPrice", "AffiliatePayout", "Sale",
  "Profit", "CTR", "EPC", "CPC",
  "eRPM", "eCPM", "eCostPerConversion", "eRevenuePerConversion",
  "CR",
];

const DEFAULT_SELECTED_METRICS = ["GrossClicks", "Conversions"];

const TIMEZONE_OPTIONS = [
  "(GMT +0:00) UTC, Western Europe Time, London, Lisbon, Casablanca",
  "(GMT +1:00) Central Europe Time",
  "(GMT +5:30) India Standard Time",
  "(GMT -5:00) Eastern Time (US)",
  "(GMT -8:00) Pacific Time (US)",
];

const CURRENCY_OPTIONS = ["USD", "INR", "EUR", "AED", "GBP"];

const STATUS_OPTIONS = ["Approved", "Pending", "Rejected"];

const monthRange = (monthOffset) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0);
  const pad = (value) => String(value).padStart(2, "0");
  const iso = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return { start: iso(start), end: iso(end) };
};

export default function ComparisonReportPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [previousStart, setPreviousStart] = useState(() => monthRange(-1).start);
  const [previousEnd, setPreviousEnd] = useState(() => monthRange(-1).end);
  const [currentStart, setCurrentStart] = useState(() => monthRange(0).start);
  const [currentEnd, setCurrentEnd] = useState(() => monthRange(0).end);
  const [showEntries, setShowEntries] = useState(100);

  const [reportRows, setReportRows] = useState([]);
  const [reportRowsLoading, setReportRowsLoading] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filtersSectionOpen, setFiltersSectionOpen] = useState(true);
  const [columnsSectionOpen, setColumnsSectionOpen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(() => new Set(DEFAULT_SELECTED_METRICS));

  const [filterParent, setFilterParent] = useState("Offer");
  const [filterChild, setFilterChild] = useState("");
  const [filterOffer, setFilterOffer] = useState("");
  const [filterAdvertiser, setFilterAdvertiser] = useState("");
  const [filterAffiliate, setFilterAffiliate] = useState("");
  const [filterTimezone, setFilterTimezone] = useState(TIMEZONE_OPTIONS[0]);
  const [filterEvent, setFilterEvent] = useState("");
  const [filterStatuses, setFilterStatuses] = useState(["Approved", "Pending"]);
  const [filterCurrency, setFilterCurrency] = useState("");

  const [filterOffers, setFilterOffers] = useState([]);
  const [filterOffersLoading, setFilterOffersLoading] = useState(false);
  const [filterAdvertisers, setFilterAdvertisers] = useState([]);
  const [filterAdvertisersLoading, setFilterAdvertisersLoading] = useState(false);
  const [filterAffiliates, setFilterAffiliates] = useState([]);
  const [filterAffiliatesLoading, setFilterAffiliatesLoading] = useState(false);

  useEffect(() => {
    if (!showFiltersPanel) return undefined;
    const controller = new AbortController();

    const loadFilterOffers = async () => {
      try {
        setFilterOffersLoading(true);
        const response = await fetch("https://localhost:7150/api/Offers", { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load offers");
        const data = await response.json();
        setFilterOffers(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setFilterOffers([]);
      } finally {
        if (!controller.signal.aborted) setFilterOffersLoading(false);
      }
    };

    loadFilterOffers();
    return () => controller.abort();
  }, [showFiltersPanel]);

  useEffect(() => {
    if (!showFiltersPanel) return undefined;
    const controller = new AbortController();

    const loadFilterAdvertisers = async () => {
      try {
        setFilterAdvertisersLoading(true);
        const response = await fetch("https://localhost:7129/api/Advertisers", { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load advertisers");
        const data = await response.json();
        setFilterAdvertisers(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setFilterAdvertisers([]);
      } finally {
        if (!controller.signal.aborted) setFilterAdvertisersLoading(false);
      }
    };

    loadFilterAdvertisers();
    return () => controller.abort();
  }, [showFiltersPanel]);

  useEffect(() => {
    if (!showFiltersPanel) return undefined;
    const controller = new AbortController();

    const loadFilterAffiliates = async () => {
      try {
        setFilterAffiliatesLoading(true);
        const response = await fetch("https://localhost:7029/api/Affiliates", { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load affiliates");
        const data = await response.json();
        setFilterAffiliates(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setFilterAffiliates([]);
      } finally {
        if (!controller.signal.aborted) setFilterAffiliatesLoading(false);
      }
    };

    loadFilterAffiliates();
    return () => controller.abort();
  }, [showFiltersPanel]);

  const affiliateName = (affiliate) =>
    [affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || "Unnamed Affiliate";

  const advertiserName = (advertiser) =>
    [advertiser.firstName, advertiser.lastName].filter(Boolean).join(" ") || advertiser.companyName || "Unnamed Advertiser";

  const toggleMetric = (metric) => {
    setSelectedMetrics((current) => {
      const next = new Set(current);
      if (next.has(metric)) next.delete(metric);
      else next.add(metric);
      return next;
    });
  };

  const tableMetrics = METRIC_COLUMNS.filter((metric) => selectedMetrics.has(metric));

  const addStatus = (status) => {
    if (!status || filterStatuses.includes(status)) return;
    setFilterStatuses((current) => [...current, status]);
  };

  const removeStatus = (status) => {
    setFilterStatuses((current) => current.filter((item) => item !== status));
  };

  const isWithinRange = (value, start, end) => {
    if (!value) return true;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return true;
    const startDate = start ? new Date(`${start}T00:00:00`) : null;
    const endDate = end ? new Date(`${end}T23:59:59`) : null;
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  };

  const submitReport = async () => {
    try {
      setReportRowsLoading(true);
      const [offersResponse, linkingRulesResponse] = await Promise.all([
        fetch("https://localhost:7150/api/Offers", { headers: { accept: "*/*" } }),
        fetch("https://localhost:7150/api/OfferLinkingRules", { headers: { accept: "*/*" } }),
      ]);
      if (!offersResponse.ok) throw new Error("Unable to load offers");
      const data = await offersResponse.json();
      const linkingRulesData = linkingRulesResponse.ok ? await linkingRulesResponse.json() : [];
      const linkingRules = Array.isArray(linkingRulesData) ? linkingRulesData : linkingRulesData.items || linkingRulesData.data || [];

      const offerIdsForAffiliate = filterAffiliate
        ? new Set(
            linkingRules
              .filter((rule) => String(rule.affiliateIds || "").split(",").map((value) => value.trim()).includes(String(filterAffiliate)))
              .flatMap((rule) => String(rule.offerIds || "").split(",").map((value) => value.trim()))
          )
        : null;

      const items = (Array.isArray(data) ? data : data.items || data.data || [])
        .filter((offer) => isWithinRange(offer.createdOn, currentStart, currentEnd))
        .filter((offer) => !filterOffer || String(offer.id) === String(filterOffer))
        .filter((offer) => !filterAdvertiser || String(offer.advertiserId) === String(filterAdvertiser))
        .filter((offer) => !offerIdsForAffiliate || offerIdsForAffiliate.has(String(offer.id)))
        .filter((offer) => !filterStatuses.length || filterStatuses.some((status) => status.toLowerCase() === String(offer.status || "").toLowerCase()));

      setReportRows(items.map((offer) => ({
        id: offer.id,
        label: `${offer.id} ~ ${offer.offerName}`,
        editPath: `/offers/${offer.id}/edit`,
      })));
      setReportSubmitted(true);
    } catch {
      setReportRows([]);
      setReportSubmitted(true);
      alert("Unable to load the report data. Please check the API and try again.");
    } finally {
      setReportRowsLoading(false);
      setShowFiltersPanel(false);
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

        <main className="comparison-report-page">
          <section className="comparison-report-card">
            <div className="reports-header comparison-report-header">
              <h2><span aria-hidden="true">◔</span> Comparison Report</h2>

              <div className="reports-period">
                <span className="reports-period-label"><span aria-hidden="true">📅</span> Previous</span>
                <div className="reports-period-range">
                  <input type="date" value={previousStart} onChange={(event) => setPreviousStart(event.target.value)} />
                  <span>-</span>
                  <input type="date" value={previousEnd} onChange={(event) => setPreviousEnd(event.target.value)} />
                </div>
              </div>

              <div className="reports-period">
                <span className="reports-period-label"><span aria-hidden="true">📅</span> Current</span>
                <div className="reports-period-range">
                  <input type="date" value={currentStart} onChange={(event) => setCurrentStart(event.target.value)} />
                  <span>-</span>
                  <input type="date" value={currentEnd} onChange={(event) => setCurrentEnd(event.target.value)} />
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

            <div className="events-table-wrap">
              <table className="events-table automation-table reports-table">
                <thead>
                  <tr>
                    <th rowSpan="2">OfferID <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                    {tableMetrics.map((metric) => (
                      <th key={metric} colSpan="3">{metric}</th>
                    ))}
                  </tr>
                  <tr>
                    {tableMetrics.map((metric) => (
                      <React.Fragment key={metric}>
                        <th>Previous</th>
                        <th>Current</th>
                        <th>Variance</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableMetrics.length === 0 && (
                    <tr><td className="automation-empty-cell">Select at least one metric from Filters &amp; Columns.</td></tr>
                  )}
                  {tableMetrics.length > 0 && reportRowsLoading && (
                    <tr><td colSpan={1 + tableMetrics.length * 3} className="automation-empty-cell">Loading…</td></tr>
                  )}
                  {tableMetrics.length > 0 && !reportRowsLoading && reportSubmitted && reportRows.length === 0 && (
                    <tr><td colSpan={1 + tableMetrics.length * 3} className="automation-empty-cell">No data available in table</td></tr>
                  )}
                  {tableMetrics.length > 0 && !reportRowsLoading && !reportSubmitted && (
                    <tr><td colSpan={1 + tableMetrics.length * 3} className="automation-empty-cell">Select a Period and click Submit to load data.</td></tr>
                  )}
                  {tableMetrics.length > 0 && !reportRowsLoading && reportRows.slice(0, Number(showEntries) || reportRows.length).map((row) => (
                    <tr key={row.id}>
                      <td><button type="button" className="reports-row-link" onClick={() => navigate(row.editPath)}>{row.label}</button></td>
                      {tableMetrics.map((metric) => {
                        const value = metric === "GrossClicks" ? 1 : 0;
                        return (
                          <React.Fragment key={metric}>
                            <td>{value}</td>
                            <td>{value}</td>
                            <td className="comparison-report-variance">⊘ 0%</td>
                          </React.Fragment>
                        );
                      })}
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
                <div className="comparison-report-filters-grid">
                  <div className="conversion-filter-field">
                    <label>Parent</label>
                    <select value={filterParent} onChange={(event) => { setFilterParent(event.target.value); setFilterChild(""); }}>
                      <option>Offer</option>
                      <option>Affiliate</option>
                      <option>Advertiser</option>
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Child</label>
                    <select value={filterChild} onChange={(event) => setFilterChild(event.target.value)}>
                      <option value="">Select</option>
                      {filterParent === "Offer" && <option>Affiliate</option>}
                      {filterParent === "Affiliate" && <option>Offer</option>}
                      {filterParent === "Advertiser" && <option>Offer</option>}
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Offer</label>
                    <select value={filterOffer} onChange={(event) => setFilterOffer(event.target.value)} disabled={filterOffersLoading}>
                      <option value="">{filterOffersLoading ? "Loading offers…" : "Select Offer"}</option>
                      {filterOffers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Advertiser</label>
                    <select value={filterAdvertiser} onChange={(event) => setFilterAdvertiser(event.target.value)} disabled={filterAdvertisersLoading}>
                      <option value="">{filterAdvertisersLoading ? "Loading advertisers…" : "Select Advertiser"}</option>
                      {filterAdvertisers.map((advertiser) => <option key={advertiser.id} value={advertiser.id}>{advertiser.id} ~ {advertiserName(advertiser)}</option>)}
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Affiliate</label>
                    <select value={filterAffiliate} onChange={(event) => setFilterAffiliate(event.target.value)} disabled={filterAffiliatesLoading}>
                      <option value="">{filterAffiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                      {filterAffiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Timezone</label>
                    <select value={filterTimezone} onChange={(event) => setFilterTimezone(event.target.value)}>
                      {TIMEZONE_OPTIONS.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Event</label>
                    <input value={filterEvent} onChange={(event) => setFilterEvent(event.target.value)} placeholder="Search Event" />
                  </div>
                  <div className="conversion-filter-field">
                    <label>Status</label>
                    <div className="comparison-report-status-box">
                      {filterStatuses.map((status) => (
                        <span className="ctit-chip" key={status}>
                          {status}
                          <button type="button" onClick={() => removeStatus(status)} aria-label={`Remove ${status}`}>×</button>
                        </span>
                      ))}
                      <select value="" onChange={(event) => addStatus(event.target.value)}>
                        <option value="">{filterStatuses.length ? "" : "Select Status"}</option>
                        {STATUS_OPTIONS.filter((status) => !filterStatuses.includes(status)).map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
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
                    <input
                      type="checkbox"
                      checked={selectedMetrics.size === METRIC_COLUMNS.length}
                      onChange={(event) => setSelectedMetrics(event.target.checked ? new Set(METRIC_COLUMNS) : new Set())}
                    />
                    {selectedMetrics.size} of {METRIC_COLUMNS.length} selected
                  </label>

                  <div className="filters-panel-group">
                    <h3><span aria-hidden="true">▽</span> Sum/Count Reports</h3>
                    <div className="filters-panel-grid">
                      {METRIC_COLUMNS.map((metric) => (
                        <label className="filters-panel-checkbox" key={metric}>
                          <input
                            type="checkbox"
                            checked={selectedMetrics.has(metric)}
                            onChange={() => toggleMetric(metric)}
                          />
                          {metric}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="filters-panel-footer">
              <button type="button" className="events-dark-btn" onClick={submitReport} disabled={reportRowsLoading}>
                <span aria-hidden="true">🕐</span> {reportRowsLoading ? "Loading…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
