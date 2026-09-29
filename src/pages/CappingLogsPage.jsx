import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ReportsPage.css";
import "../css/ConversionLogsPage.css";
import "../css/CappingLogsPage.css";

const TABLE_COLUMNS = [
  "Time", "Offer ID", "Affiliate ID", "Event", "Type", "Period",
  "Capping Value", "Capping Limit", "Start Time - End Time", "Status", "Rule", "Action",
];

export default function CappingLogsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(true);

  const [cappingLogsOfferId, setCappingLogsOfferId] = useState("");
  const [cappingLogsAffiliateId, setCappingLogsAffiliateId] = useState("");
  const [cappingLogsPeriodStart, setCappingLogsPeriodStart] = useState(() => `${new Date().toISOString().slice(0, 10)}T00:00:00`);
  const [cappingLogsPeriodEnd, setCappingLogsPeriodEnd] = useState(() => `${new Date().toISOString().slice(0, 10)}T23:59:59`);
  const [cappingLogsShowEntries, setCappingLogsShowEntries] = useState(100);

  const [logsLoading, setLogsLoading] = useState(false);

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

  const submitLogs = () => {
    setLogsLoading(true);
    window.setTimeout(() => setLogsLoading(false), 250);
  };

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="capping-logs-page">
          <section className="capping-logs-page-card">
            <div className="postback-logs-header capping-logs-header">
              <h2><span aria-hidden="true">📊</span> Capping Logs</h2>
              <div className="postback-logs-filters">
                <select value={cappingLogsOfferId} onChange={(event) => setCappingLogsOfferId(event.target.value)} disabled={offersLoading}>
                  <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                  {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                </select>
                <select value={cappingLogsAffiliateId} onChange={(event) => setCappingLogsAffiliateId(event.target.value)} disabled={affiliatesLoading}>
                  <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                  {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
                </select>
                <div className="reports-period-range">
                  <input type="datetime-local" value={cappingLogsPeriodStart} onChange={(event) => setCappingLogsPeriodStart(event.target.value)} />
                  <span>-</span>
                  <input type="datetime-local" value={cappingLogsPeriodEnd} onChange={(event) => setCappingLogsPeriodEnd(event.target.value)} />
                </div>
                <span className="capping-logs-divider" aria-hidden="true" />
                <label className="postback-logs-show">
                  Show
                  <input type="number" min="1" value={cappingLogsShowEntries} onChange={(event) => setCappingLogsShowEntries(event.target.value)} />
                </label>
                <button type="button" className="events-dark-btn" onClick={submitLogs} disabled={logsLoading}>
                  <span aria-hidden="true">🕐</span> {logsLoading ? "Loading…" : "Submit"}
                </button>
              </div>
            </div>

            <div className="events-table-wrap">
              <table className="events-table automation-table">
                <thead>
                  <tr>
                    {TABLE_COLUMNS.map((column) => (
                      <th key={column}>{column} <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logsLoading && (
                    <tr><td colSpan={TABLE_COLUMNS.length} className="automation-empty-cell">Loading…</td></tr>
                  )}
                  {!logsLoading && (
                    <tr><td colSpan={TABLE_COLUMNS.length} className="automation-empty-cell">No data available in table</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
