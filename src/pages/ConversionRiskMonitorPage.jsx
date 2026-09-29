import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ReportsPage.css";
import "../css/ConversionRiskMonitorPage.css";

const CTIT_OPTIONS = [3, 6, 10, 20, 30, 60, 120, 180, 1800, 3600, 7200, 14400];

const DEFAULT_SELECTED_CTIT = [3, 10, 20, 60, 120, 14400];

export default function ConversionRiskMonitorPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(true);

  const [filterOfferId, setFilterOfferId] = useState("");
  const [filterAffiliateId, setFilterAffiliateId] = useState("");
  const [dateStart, setDateStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [dateEnd, setDateEnd] = useState(() => new Date().toISOString().slice(0, 10));

  const [selectedCtit, setSelectedCtit] = useState(() => new Set(DEFAULT_SELECTED_CTIT));
  const [ctitDropdownOpen, setCtitDropdownOpen] = useState(false);
  const ctitDropdownRef = useRef(null);

  const [reportRows, setReportRows] = useState([]);
  const [reportRowsLoading, setReportRowsLoading] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ctitDropdownRef.current && !ctitDropdownRef.current.contains(event.target)) {
        setCtitDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const affiliateName = (affiliate) =>
    [affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || "Unnamed Affiliate";

  const toggleCtit = (seconds) => {
    setSelectedCtit((current) => {
      const next = new Set(current);
      if (next.has(seconds)) next.delete(seconds);
      else next.add(seconds);
      return next;
    });
  };

  const ctitColumns = CTIT_OPTIONS.filter((seconds) => selectedCtit.has(seconds));

  const isWithinRange = (value) => {
    if (!value) return true;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return true;
    const start = dateStart ? new Date(`${dateStart}T00:00:00`) : null;
    const end = dateEnd ? new Date(`${dateEnd}T23:59:59`) : null;
    if (start && date < start) return false;
    if (end && date > end) return false;
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

      const offerIdsForAffiliate = filterAffiliateId
        ? new Set(
            linkingRules
              .filter((rule) => String(rule.affiliateIds || "").split(",").map((value) => value.trim()).includes(String(filterAffiliateId)))
              .flatMap((rule) => String(rule.offerIds || "").split(",").map((value) => value.trim()))
          )
        : null;

      const items = (Array.isArray(data) ? data : data.items || data.data || [])
        .filter((offer) => isWithinRange(offer.createdOn))
        .filter((offer) => !filterOfferId || String(offer.id) === String(filterOfferId))
        .filter((offer) => !offerIdsForAffiliate || offerIdsForAffiliate.has(String(offer.id)));

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

        <main className="reports-page">
          <section className="reports-page-card">
            <div className="reports-header crm-header">
              <h2><span aria-hidden="true">📈</span> Fraud Detection CTIT</h2>

              <div className="crm-ctit-field" ref={ctitDropdownRef}>
                <button type="button" className="crm-ctit-trigger" onClick={() => setCtitDropdownOpen((value) => !value)}>
                  {ctitColumns.length ? `${ctitColumns.length} selected` : "Select"}
                </button>
                {ctitDropdownOpen && (
                  <div className="crm-ctit-dropdown">
                    {CTIT_OPTIONS.map((seconds) => (
                      <button
                        type="button"
                        key={seconds}
                        className={`crm-ctit-option${selectedCtit.has(seconds) ? " active" : ""}`}
                        onClick={() => toggleCtit(seconds)}
                      >
                        {seconds} Seconds
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="crm-field">
                <span className="reports-period-label">Affiliate:</span>
                <select value={filterAffiliateId} onChange={(event) => setFilterAffiliateId(event.target.value)} disabled={affiliatesLoading}>
                  <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                  {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
                </select>
              </div>

              <div className="crm-field">
                <span className="reports-period-label">Offer:</span>
                <select value={filterOfferId} onChange={(event) => setFilterOfferId(event.target.value)} disabled={offersLoading}>
                  <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                  {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                </select>
              </div>

              <div className="reports-period">
                <span className="reports-period-label"><span aria-hidden="true">📅</span> Period</span>
                <div className="reports-period-range">
                  <input type="date" value={dateStart} onChange={(event) => setDateStart(event.target.value)} />
                  <span>-</span>
                  <input type="date" value={dateEnd} onChange={(event) => setDateEnd(event.target.value)} />
                </div>
              </div>

              <button type="button" className="events-dark-btn" onClick={submitReport} disabled={reportRowsLoading}>
                <span aria-hidden="true">🕐</span> {reportRowsLoading ? "Loading…" : "Submit"}
              </button>
            </div>

            <div className="events-table-wrap">
              <table className="events-table automation-table reports-table">
                <thead>
                  <tr>
                    <th>OfferID</th>
                    {ctitColumns.map((seconds) => (
                      <th key={seconds}>{seconds} Seconds</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ctitColumns.length === 0 && (
                    <tr><td className="automation-empty-cell">Select at least one CTIT range.</td></tr>
                  )}
                  {ctitColumns.length > 0 && reportRowsLoading && (
                    <tr><td colSpan={1 + ctitColumns.length} className="automation-empty-cell">Loading…</td></tr>
                  )}
                  {ctitColumns.length > 0 && !reportRowsLoading && reportSubmitted && reportRows.length === 0 && (
                    <tr><td colSpan={1 + ctitColumns.length} className="automation-empty-cell">No matching records found</td></tr>
                  )}
                  {ctitColumns.length > 0 && !reportRowsLoading && !reportSubmitted && (
                    <tr><td colSpan={1 + ctitColumns.length} className="automation-empty-cell">No matching records found</td></tr>
                  )}
                  {ctitColumns.length > 0 && !reportRowsLoading && reportRows.map((row) => (
                    <tr key={row.id}>
                      <td><button type="button" className="reports-row-link" onClick={() => navigate(row.editPath)}>{row.label}</button></td>
                      {ctitColumns.map((seconds) => <td key={seconds}>0</td>)}
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
