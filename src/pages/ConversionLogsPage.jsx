import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ReportsPage.css";
import "../css/ConversionLogsPage.css";

const CONVERSION_LOG_COLUMNS = [
  "Select", "TID", "Total", "Type",
  "OfferID", "SubOfferID", "AdvertiserID", "Advertiser",
  "AffiliateID", "Affiliate", "AdvertiserModel", "AdvertiserRevenue",
  "AffiliateModel", "Sale", "AffiliatePayout", "Currency",
  "Event", "PostbackIP", "ClickIP", "ConversionTime",
  "LandingPage", "Delay", "Date", "AffPostbackStatus",
  "ShortURL", "CreativeID", "ProductID", "SubAffiliate",
  "AffSub1", "AffSub2", "AffSub3", "AffSub4",
  "AffSub5", "AffSub6", "AffSub7", "AffSub8",
  "AffSub9", "AffSub10", "AffClickID", "AdvSub1",
  "AdvSub2", "AdvSub3", "AdvSub4", "AdvSub5",
  "AdvSub7", "Source", "DeviceID", "iosIDFA",
  "GoogleAID", "AndroidID", "FraudDetection", "UserJourney",
  "DepositsAmount", "BetsAmount", "WinsAmount", "WithdrawalsAmount",
  "BonusesAmount", "UserID", "Status", "Note",
  "PrivateNote", "Coupon", "PayoutRule",
];

const DEFAULT_SELECTED_COLUMNS = [
  "Select", "OfferID", "TID", "AffiliateID",
  "Total", "AffiliateModel", "Affiliate", "AffiliatePayout",
  "Event", "AdvertiserRevenue", "Type", "ConversionTime",
  "Status", "Note",
];

export default function ConversionLogsPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [conversionLogsOfferId, setConversionLogsOfferId] = useState("");
  const [dateStart, setDateStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [dateEnd, setDateEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [showEntries, setShowEntries] = useState(20);

  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filtersSectionOpen, setFiltersSectionOpen] = useState(true);
  const [columnsSectionOpen, setColumnsSectionOpen] = useState(false);
  const [columnSearch, setColumnSearch] = useState("");
  const [selectedColumns, setSelectedColumns] = useState(() => new Set(DEFAULT_SELECTED_COLUMNS));

  const [filterSubOffer, setFilterSubOffer] = useState("");
  const [filterAdvertiser, setFilterAdvertiser] = useState("");
  const [filterAffiliate, setFilterAffiliate] = useState("");
  const [filterEvent, setFilterEvent] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterNote, setFilterNote] = useState("All");
  const [filterTid, setFilterTid] = useState("");
  const [filterSubType, setFilterSubType] = useState("");
  const [filterSubValue, setFilterSubValue] = useState("");

  const [advertisers, setAdvertisers] = useState([]);
  const [advertisersLoading, setAdvertisersLoading] = useState(false);
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(false);
  const [eventGoals, setEventGoals] = useState([]);
  const [eventGoalsLoading, setEventGoalsLoading] = useState(false);

  const [logsLoading, setLogsLoading] = useState(false);
  const [logRows, setLogRows] = useState([]);
  const [logsSubmitted, setLogsSubmitted] = useState(false);

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

  useEffect(() => {
    if (!showFiltersPanel) return undefined;
    const controller = new AbortController();

    const loadEventGoals = async () => {
      try {
        setEventGoalsLoading(true);
        const response = await fetch("https://localhost:7150/api/EventGoals", { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load event goals");
        const data = await response.json();
        setEventGoals(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setEventGoals([]);
      } finally {
        if (!controller.signal.aborted) setEventGoalsLoading(false);
      }
    };

    loadEventGoals();
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
    const start = dateStart ? new Date(`${dateStart}T00:00:00`) : null;
    const end = dateEnd ? new Date(`${dateEnd}T23:59:59`) : null;
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  };

  const submitConversionLogs = async () => {
    try {
      setLogsLoading(true);
      const [offersData, advertisersData, affiliatesData, eventGoalsData, linkingRulesData] = await Promise.all([
        fetch("https://localhost:7150/api/Offers", { headers: { accept: "*/*" } }).then((response) => response.ok ? response.json() : []),
        fetch("https://localhost:7129/api/Advertisers", { headers: { accept: "*/*" } }).then((response) => response.ok ? response.json() : []),
        fetch("https://localhost:7029/api/Affiliates", { headers: { accept: "*/*" } }).then((response) => response.ok ? response.json() : []),
        fetch("https://localhost:7150/api/EventGoals", { headers: { accept: "*/*" } }).then((response) => response.ok ? response.json() : []),
        fetch("https://localhost:7150/api/OfferLinkingRules", { headers: { accept: "*/*" } }).then((response) => response.ok ? response.json() : []),
      ]);

      const offerItems = Array.isArray(offersData) ? offersData : offersData.items || offersData.data || [];
      const advertiserItems = Array.isArray(advertisersData) ? advertisersData : advertisersData.items || advertisersData.data || [];
      const affiliateItems = Array.isArray(affiliatesData) ? affiliatesData : affiliatesData.items || affiliatesData.data || [];
      const eventItems = Array.isArray(eventGoalsData) ? eventGoalsData : eventGoalsData.items || eventGoalsData.data || [];
      const linkingRules = Array.isArray(linkingRulesData) ? linkingRulesData : linkingRulesData.items || linkingRulesData.data || [];

      setOffers(offerItems);
      setAdvertisers(advertiserItems);
      setAffiliates(affiliateItems);
      setEventGoals(eventItems);

      const selectedEvent = eventItems.find((row) => String(row.id) === String(filterEvent));

      const rows = offerItems
        .filter((offer) => isWithinPeriod(offer.createdOn))
        .filter((offer) => !conversionLogsOfferId || String(offer.id) === String(conversionLogsOfferId))
        .filter((offer) => !filterSubOffer || String(offer.id) === String(filterSubOffer))
        .filter((offer) => !filterAdvertiser || String(offer.advertiserId) === String(filterAdvertiser))
        .filter((offer) => !filterStatus || String(offer.status || "").toLowerCase() === filterStatus.toLowerCase())
        .map((offer) => {
          const rule = linkingRules.find((row) =>
            String(row.offerIds || "").split(",").map((value) => value.trim()).includes(String(offer.id))
          );
          const affId = rule ? String(rule.affiliateIds || "").split(",").map((value) => value.trim()).filter(Boolean)[0] : "";
          const affiliate = affiliateItems.find((item) => String(item.id) === String(affId));
          const advertiser = advertiserItems.find((item) => String(item.id) === String(offer.advertiserId));

          return {
            id: offer.id,
            tid: offer.id,
            offerLabel: `${offer.id} ~ ${offer.offerName}`,
            offerEditPath: `/offers/${offer.id}/edit`,
            advertiserLabel: advertiser ? `${advertiser.id} ~ ${advertiserName(advertiser)}` : "-",
            affiliateId: affiliate ? affiliate.id : (affId || "-"),
            affiliateLabel: affiliate ? `${affiliate.id} ~ ${affiliateName(affiliate)}` : (affId || "-"),
            type: offer.offerType || "-",
            advertiserRevenue: `${Number(offer.advertiserPrice || 0)} ${offer.advertiserCurrency || "-"}`,
            affiliatePayout: `${Number(offer.affiliatePrice || 0)} ${offer.affiliateCurrency || offer.advertiserCurrency || "-"}`,
            event: selectedEvent ? (selectedEvent.eventName || selectedEvent.token) : "-",
            conversionTime: offer.createdOn ? new Date(offer.createdOn).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-",
            status: offer.status || "-",
          };
        })
        .filter((row) => !filterAffiliate || String(row.affiliateId) === String(filterAffiliate));

      setLogRows(rows);
      setLogsSubmitted(true);
    } finally {
      setLogsLoading(false);
      setShowFiltersPanel(false);
    }
  };

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

  const visibleColumns = CONVERSION_LOG_COLUMNS.filter(columnMatchesSearch);

  const selectedOffer = offers.find((offer) => String(offer.id) === String(conversionLogsOfferId));

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="conversion-logs-page">
          <section className="conversion-logs-page-card">
            <div className="postback-logs-header conversion-logs-header">
              <h2><span aria-hidden="true">📄</span> Conversion Logs</h2>

              <div className="conversion-logs-summary">
                <span className="reports-templates-label"><span aria-hidden="true">🏷</span> Summary :</span>
                <span className="reports-template-tag active">GrossConversions</span>
              </div>

              <div className="postback-logs-filters">
                <div className="postback-logs-offer-chip">
                  <span className="reports-templates-label conversion-logs-offer-label"><span aria-hidden="true">⊕</span> Offer</span>
                  {conversionLogsOfferId ? (
                    <span className="ctit-chip">
                      {selectedOffer ? `${selectedOffer.id} ~ ${selectedOffer.offerName}` : conversionLogsOfferId}
                      <button type="button" onClick={() => setConversionLogsOfferId("")} aria-label="Clear offer">×</button>
                    </span>
                  ) : (
                    <select value="" onChange={(event) => setConversionLogsOfferId(event.target.value)} disabled={offersLoading}>
                      <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                      {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                    </select>
                  )}
                </div>
                <div className="postback-logs-date-range">
                  <input type="date" value={dateStart} onChange={(event) => setDateStart(event.target.value)} />
                  <span>-</span>
                  <input type="date" value={dateEnd} onChange={(event) => setDateEnd(event.target.value)} />
                </div>
                <label className="postback-logs-show">
                  Show
                  <input type="number" min="1" value={showEntries} onChange={(event) => setShowEntries(event.target.value)} />
                  entries
                </label>
                <button type="button" className="events-dark-btn" onClick={submitConversionLogs} disabled={logsLoading}><span aria-hidden="true">🕐</span> {logsLoading ? "Loading…" : "Submit"}</button>
                <button type="button" className="postback-logs-filter-btn" onClick={() => setShowFiltersPanel(true)} aria-label="Filters and columns">▽</button>
              </div>
            </div>

            <div className="conversion-logs-action-row">
              <button type="button" className="conversion-logs-action-btn" onClick={() => alert("Actions are not connected yet.")}>
                <span aria-hidden="true">🏷</span> Action <span aria-hidden="true">▾</span>
              </button>
            </div>

            <div className="events-table-wrap">
              <table className="events-table automation-table">
                <thead>
                  <tr>
                    {["Select", "TID", "Total", "Type", "OfferID", "AffiliateID", "Affiliate", "AdvertiserRevenue", "AffiliatePayout", "Event", "ConversionTime", "Status", "Note"].map((column) => (
                      <th key={column}>{column} <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logsLoading && (
                    <tr><td colSpan="13" className="automation-empty-cell">Loading…</td></tr>
                  )}
                  {!logsLoading && logsSubmitted && logRows.length === 0 && (
                    <tr><td colSpan="13" className="automation-empty-cell">No data available in table</td></tr>
                  )}
                  {!logsLoading && !logsSubmitted && (
                    <tr><td colSpan="13" className="automation-empty-cell">Click Submit to load data.</td></tr>
                  )}
                  {!logsLoading && logRows.slice(0, Number(showEntries) || logRows.length).map((row) => (
                    <tr key={row.id}>
                      <td><input type="checkbox" aria-label={`Select ${row.offerLabel}`} /></td>
                      <td>{row.tid}</td>
                      <td>1</td>
                      <td>{row.type}</td>
                      <td><button type="button" className="reports-row-link" onClick={() => navigate(row.offerEditPath)}>{row.offerLabel}</button></td>
                      <td>{row.affiliateId}</td>
                      <td>{row.affiliateLabel}</td>
                      <td>{row.advertiserRevenue}</td>
                      <td>{row.affiliatePayout}</td>
                      <td>{row.event}</td>
                      <td>{row.conversionTime}</td>
                      <td>{row.status}</td>
                      <td>-</td>
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
                    <label>Sub Offer</label>
                    <select value={filterSubOffer} onChange={(event) => setFilterSubOffer(event.target.value)} disabled={offersLoading}>
                      <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                      {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Advertiser</label>
                    <select value={filterAdvertiser} onChange={(event) => setFilterAdvertiser(event.target.value)} disabled={advertisersLoading}>
                      <option value="">{advertisersLoading ? "Loading advertisers…" : "Select Advertiser"}</option>
                      {advertisers.map((advertiser) => <option key={advertiser.id} value={advertiser.id}>{advertiser.id} ~ {advertiserName(advertiser)}</option>)}
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Affiliate</label>
                    <select value={filterAffiliate} onChange={(event) => setFilterAffiliate(event.target.value)} disabled={affiliatesLoading}>
                      <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                      {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Event</label>
                    <select value={filterEvent} onChange={(event) => setFilterEvent(event.target.value)} disabled={eventGoalsLoading}>
                      <option value="">{eventGoalsLoading ? "Loading events…" : "Select Event"}</option>
                      {eventGoals.map((row) => <option key={row.id} value={row.id}>{row.eventName || row.token || `Event ${row.id}`}</option>)}
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Status</label>
                    <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
                      <option value="">Select Status</option>
                      <option>Approved</option>
                      <option>Pending</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Note Filter</label>
                    <select value={filterNote} onChange={(event) => setFilterNote(event.target.value)}>
                      <option>All</option>
                      <option>With Note</option>
                      <option>Without Note</option>
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>TID Search</label>
                    <input value={filterTid} onChange={(event) => setFilterTid(event.target.value)} placeholder="TID Search" />
                  </div>
                  <div className="conversion-filter-field">
                    <label>Sub* Filters</label>
                    <select value={filterSubType} onChange={(event) => setFilterSubType(event.target.value)}>
                      <option value="">Select</option>
                      <option>AffSub1</option>
                      <option>AffSub2</option>
                      <option>AffSub3</option>
                      <option>AffSub4</option>
                      <option>AffSub5</option>
                      <option>AdvSub1</option>
                      <option>AdvSub2</option>
                    </select>
                  </div>
                  <div className="conversion-filter-field">
                    <label>Value</label>
                    <input value={filterSubValue} onChange={(event) => setFilterSubValue(event.target.value)} placeholder="Value" disabled={!filterSubType} />
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
                    {selectedColumns.size} of {CONVERSION_LOG_COLUMNS.length} selected
                  </label>

                  <input
                    type="text"
                    className="filters-panel-search"
                    value={columnSearch}
                    onChange={(event) => setColumnSearch(event.target.value)}
                    placeholder="Search"
                  />

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
              )}
            </div>

            <div className="filters-panel-footer">
              <button type="button" className="events-dark-btn" onClick={submitConversionLogs} disabled={logsLoading}>
                <span aria-hidden="true">🕐</span> {logsLoading ? "Loading…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
