import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ReportsPage.css";

const FRAUD_FENDER_CARDS = [
  { key: "ip", title: "IP Address", icon: "📶", column: "IP Address" },
  { key: "proxyIp", title: "Proxy IP", icon: "📶", column: "IP Address" },
  { key: "country", title: "Country", icon: "⚑", column: "Country" },
  { key: "isp", title: "ISP", icon: "📶", column: "ISP" },
  { key: "os", title: "OS", icon: "▦", column: "OS" },
  { key: "device", title: "Device", icon: "📱", column: "Device" },
  { key: "browser", title: "Browser", icon: "▭", column: "Browser" },
  { key: "affiliate", title: "Affiliate", icon: "👥", column: "Affiliate" },
  { key: "offer", title: "Offer", icon: "⊙", column: "Offer" },
  { key: "hourly", title: "Hourly", icon: "🕐", column: "Hour" },
  { key: "refDomain", title: "Ref Domain", icon: "📶", column: "Ref Domain" },
  { key: "subAffId", title: "Sub Affiliate ID", icon: "📶", column: "Sub Aff ID" },
];

export default function FraudFenderPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [fraudSubAffFilter, setFraudSubAffFilter] = useState("");
  const [fraudAffiliateId, setFraudAffiliateId] = useState("");
  const [fraudOfferId, setFraudOfferId] = useState("");
  const [fraudDateStart, setFraudDateStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [fraudDateEnd, setFraudDateEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [fraudOffers, setFraudOffers] = useState([]);
  const [fraudOffersLoading, setFraudOffersLoading] = useState(false);
  const [fraudAffiliates, setFraudAffiliates] = useState([]);
  const [fraudAffiliatesLoading, setFraudAffiliatesLoading] = useState(false);
  const [fraudSettings, setFraudSettings] = useState([]);
  const [fraudSettingsLoading, setFraudSettingsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadFraudOffers = async () => {
      try {
        setFraudOffersLoading(true);
        const response = await fetch("https://localhost:7150/api/Offers", { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load offers");
        const data = await response.json();
        setFraudOffers(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setFraudOffers([]);
      } finally {
        if (!controller.signal.aborted) setFraudOffersLoading(false);
      }
    };

    loadFraudOffers();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadFraudAffiliates = async () => {
      try {
        setFraudAffiliatesLoading(true);
        const response = await fetch("https://localhost:7029/api/Affiliates", { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load affiliates");
        const data = await response.json();
        setFraudAffiliates(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setFraudAffiliates([]);
      } finally {
        if (!controller.signal.aborted) setFraudAffiliatesLoading(false);
      }
    };

    loadFraudAffiliates();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadFraudSettings = async () => {
      try {
        setFraudSettingsLoading(true);
        const response = await fetch("https://localhost:7150/api/AntiFraudSettings", { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load anti fraud settings");
        const data = await response.json();
        setFraudSettings(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setFraudSettings([]);
      } finally {
        if (!controller.signal.aborted) setFraudSettingsLoading(false);
      }
    };

    loadFraudSettings();
    return () => controller.abort();
  }, []);

  const affiliateName = (affiliate) =>
    [affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || "Unnamed Affiliate";

  const parseClickBlockFilters = (setting) => {
    try {
      return JSON.parse(setting.clickBlockFiltersJson || "{}") || {};
    } catch {
      return {};
    }
  };

  const fraudFenderCardRows = (cardKey) => {
    const filterField = { ip: "ip", refDomain: "referral_domain", subAffId: "sub_aff_id" }[cardKey];

    if (filterField) {
      const seen = new Set();
      const rows = [];
      fraudSettings.forEach((setting) => {
        const value = parseClickBlockFilters(setting)[filterField];
        if (value && value.trim() && !seen.has(value)) {
          seen.add(value);
          rows.push({ key: `${setting.id}-${value}`, value });
        }
      });
      return rows;
    }

    if (cardKey === "affiliate") {
      const seen = new Set();
      const rows = [];
      fraudSettings.forEach((setting) => {
        const affId = parseClickBlockFilters(setting).aff_id;
        if (affId && affId.trim() && !seen.has(affId)) {
          seen.add(affId);
          const affiliate = fraudAffiliates.find((item) => String(item.id) === String(affId));
          rows.push({ key: `${setting.id}-${affId}`, value: affiliate ? `${affiliate.id} ~ ${affiliateName(affiliate)}` : affId });
        }
      });
      return rows;
    }

    if (cardKey === "offer") {
      const seen = new Set();
      const rows = [];
      fraudSettings.forEach((setting) => {
        if (setting.offerId && !seen.has(setting.offerId)) {
          seen.add(setting.offerId);
          const offer = fraudOffers.find((item) => String(item.id) === String(setting.offerId));
          rows.push({ key: `${setting.id}-${setting.offerId}`, value: offer ? `${offer.id} ~ ${offer.offerName}` : String(setting.offerId) });
        }
      });
      return rows;
    }

    return null;
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
            <div className="fraud-fender-panel">
              <div className="fraud-fender-toolbar">
                <h2><span aria-hidden="true">⚙</span> Fraud Fender <span className="fraud-fender-subtitle">(Monitoring)</span></h2>
                <div className="fraud-fender-filters">
                  <input
                    value={fraudSubAffFilter}
                    onChange={(event) => setFraudSubAffFilter(event.target.value)}
                    placeholder="Sub-Aff-ID/IP/ISP filter 0.0.0.0 verizon"
                  />
                  <select value={fraudAffiliateId} onChange={(event) => setFraudAffiliateId(event.target.value)} disabled={fraudAffiliatesLoading}>
                    <option value="">{fraudAffiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                    {fraudAffiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
                  </select>
                  <select value={fraudOfferId} onChange={(event) => setFraudOfferId(event.target.value)} disabled={fraudOffersLoading}>
                    <option value="">{fraudOffersLoading ? "Loading offers…" : "Select Offer"}</option>
                    {fraudOffers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                  </select>
                  <div className="fraud-fender-date-range">
                    <input type="date" value={fraudDateStart} onChange={(event) => setFraudDateStart(event.target.value)} />
                    <span>-</span>
                    <input type="date" value={fraudDateEnd} onChange={(event) => setFraudDateEnd(event.target.value)} />
                  </div>
                  <button type="button" className="events-dark-btn" onClick={() => alert("No matching records found for the selected filters.")}>
                    <span aria-hidden="true">🕐</span> Submit
                  </button>
                </div>
              </div>

              <div className="fraud-fender-grid">
                {FRAUD_FENDER_CARDS.map((card) => {
                  const rows = fraudFenderCardRows(card.key);
                  return (
                    <div className="fraud-fender-card" key={card.key}>
                      <h3><span aria-hidden="true">{card.icon}</span> {card.title}</h3>
                      <div className="fraud-fender-card-table-head">
                        <span>{card.column} <span aria-hidden="true" className="postback-logs-sort">↕</span></span>
                        <span>Clicks</span>
                        <span>Conversions</span>
                      </div>
                      {fraudSettingsLoading && <p className="fraud-fender-card-empty">Loading…</p>}
                      {!fraudSettingsLoading && (!rows || rows.length === 0) && (
                        <p className="fraud-fender-card-empty">No matching records found</p>
                      )}
                      {!fraudSettingsLoading && rows && rows.length > 0 && (
                        <div className="fraud-fender-card-rows">
                          {rows.map((row) => (
                            <div className="fraud-fender-card-row" key={row.key}>
                              <span>{row.value}</span>
                              <span>-</span>
                              <span>-</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
