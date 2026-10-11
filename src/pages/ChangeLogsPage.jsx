import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ChangeLogsPage.css";

const CHANGE_LOGS_API = "https://localhost:7150/api/ChangeLogs";
const OFFERS_API = "https://localhost:7150/api/Offers";
const ADVERTISERS_API = "https://localhost:7129/api/Advertisers";
const AFFILIATES_API = "https://localhost:7029/api/Affiliates";

const todayIso = () => new Date().toISOString().slice(0, 10);

const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const advertiserName = (item) =>
  [item.firstName, item.lastName].filter(Boolean).join(" ") || item.companyName || "Unnamed Advertiser";

const affiliateName = (item) =>
  [item.firstName, item.lastName].filter(Boolean).join(" ") || item.companyName || "Unnamed Affiliate";

export default function ChangeLogsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [offers, setOffers] = useState([]);
  const [advertisers, setAdvertisers] = useState([]);
  const [affiliates, setAffiliates] = useState([]);

  const [draftStartDate, setDraftStartDate] = useState(todayIso());
  const [draftEndDate, setDraftEndDate] = useState(todayIso());
  const [draftOfferId, setDraftOfferId] = useState("");
  const [draftAdvertiserId, setDraftAdvertiserId] = useState("");
  const [draftAffiliateId, setDraftAffiliateId] = useState("");

  const [applied, setApplied] = useState({
    startDate: todayIso(),
    endDate: todayIso(),
    offerId: "",
    advertiserId: "",
    affiliateId: "",
  });

  const [pageSize, setPageSize] = useState(100);
  const [showFilters, setShowFilters] = useState(false);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const getJson = (url) =>
      fetch(url, { headers: { accept: "*/*" }, signal: controller.signal })
        .then((response) => (response.ok ? response.json() : []))
        .catch(() => []);

    Promise.all([getJson(OFFERS_API), getJson(ADVERTISERS_API), getJson(AFFILIATES_API)]).then(
      ([offerList, advertiserList, affiliateList]) => {
        setOffers(Array.isArray(offerList) ? offerList : []);
        setAdvertisers(Array.isArray(advertiserList) ? advertiserList : []);
        setAffiliates(Array.isArray(affiliateList) ? affiliateList : []);
      }
    );

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadLogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("startDate", new Date(`${applied.startDate}T00:00:00`).toISOString());
        params.set("endDate", new Date(`${applied.endDate}T23:59:59`).toISOString());
        params.set("pageSize", String(pageSize));
        if (applied.offerId) params.set("offerId", applied.offerId);
        if (applied.advertiserId) params.set("advertiserId", applied.advertiserId);
        if (applied.affiliateId) params.set("affiliateId", applied.affiliateId);

        const response = await fetch(`${CHANGE_LOGS_API}?${params.toString()}`, {
          headers: { accept: "*/*" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load change logs");
        const data = await response.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name !== "AbortError") setLogs([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadLogs();
    return () => controller.abort();
  }, [applied, pageSize]);

  const applyFilters = () => {
    setApplied({
      startDate: draftStartDate,
      endDate: draftEndDate,
      offerId: draftOfferId,
      advertiserId: draftAdvertiserId,
      affiliateId: draftAffiliateId,
    });
    setShowFilters(false);
  };

  const resetFilters = () => {
    setDraftOfferId("");
    setDraftAdvertiserId("");
    setDraftAffiliateId("");
  };

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="clog-page">
          <section className="clog-card">
            <div className="clog-header">
              <div>
                <h1><span aria-hidden="true">↺</span> Change Logs</h1>
                <p className="clog-subtitle">
                  Audit trail of changes made to <span className="clog-highlight">Offers</span>, <span className="clog-highlight-orange">Affiliates</span> and Advertisers
                </p>
              </div>
              <div className="clog-toolbar">
                <div className="clog-date-range">
                  <input type="date" value={draftStartDate} onChange={(event) => setDraftStartDate(event.target.value)} />
                  <span>-</span>
                  <input type="date" value={draftEndDate} onChange={(event) => setDraftEndDate(event.target.value)} />
                </div>
                <select className="clog-page-size" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
                <div className="clog-filters-wrap">
                  <button type="button" className="clog-filters-btn" onClick={() => setShowFilters((open) => !open)}>
                    <span aria-hidden="true">▽</span> Filters
                  </button>
                  {showFilters && (
                    <div className="clog-filters-panel">
                      <div className="clog-filters-panel-header">
                        <span>Filters</span>
                        <button type="button" className="clog-reset-link" onClick={resetFilters}>Reset all</button>
                      </div>
                      <div className="clog-filters-field">
                        <label>Offer</label>
                        <select value={draftOfferId} onChange={(event) => setDraftOfferId(event.target.value)}>
                          <option value="">All offers</option>
                          {offers.map((offer) => (
                            <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>
                          ))}
                        </select>
                      </div>
                      <div className="clog-filters-field">
                        <label>Advertiser</label>
                        <select value={draftAdvertiserId} onChange={(event) => setDraftAdvertiserId(event.target.value)}>
                          <option value="">All advertisers</option>
                          {advertisers.map((advertiser) => (
                            <option key={advertiser.id} value={advertiser.id}>{advertiser.id} ~ {advertiserName(advertiser)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="clog-filters-field">
                        <label>Affiliate</label>
                        <select value={draftAffiliateId} onChange={(event) => setDraftAffiliateId(event.target.value)}>
                          <option value="">All affiliates</option>
                          {affiliates.map((affiliate) => (
                            <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="clog-filters-footer">
                        <button type="button" className="clog-apply-btn" onClick={applyFilters}>Apply</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="clog-table-scroll">
              <table className="clog-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Change Type</th>
                    <th>Action Type</th>
                    <th>Affected User/Offer</th>
                    <th>Action By</th>
                    <th>Log Data</th>
                    <th>User Info</th>
                    <th>URL</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="8" className="clog-message">Loading change logs…</td></tr>}
                  {!loading && logs.length === 0 && <tr><td colSpan="8" className="clog-message">No data available in table</td></tr>}
                  {!loading && logs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatDateTime(log.occurredOn)}</td>
                      <td>{log.changeType}</td>
                      <td>{log.actionType}</td>
                      <td>{log.affectedEntity || "-"}</td>
                      <td>{log.actionBy || "-"}</td>
                      <td>{log.logData || "-"}</td>
                      <td>{log.userInfo || "-"}</td>
                      <td>{log.url || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
