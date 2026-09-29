import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ReportsPage.css";

const reportTemplates = [
  { key: "basic", label: "Basic Report", icon: "📊" },
  { key: "offer", label: "Offer" },
  { key: "affiliate", label: "Affiliate" },
  { key: "country", label: "Country" },
  { key: "events", label: "Events" },
  { key: "fraud-fender", label: "Fraud Fender", icon: "🛡", accent: true },
  { key: "igaming-badge", label: "iGaming", icon: "📶" },
];

const reportTemplatesRow2 = [
  { key: "smart-offer", label: "Smart Offer", icon: "🔀" },
  { key: "igaming", label: "igaming", hasCaret: true },
];

const COLUMN_GROUPS = [
  {
    title: "Timing",
    columns: [
      "Date", "Month", "Hour", "Time",
      "OfferID", "SubOfferID", "ExternalOfferID", "AdvertiserID",
      "Advertiser", "AdvertiserManager", "AffiliateID", "Affiliate",
      "AffiliateManager", "SubAffiliate", "OfferCategory",
    ],
  },
  {
    title: "Sum/Count Reports",
    columns: [
      "GrossClicksTotal", "GrossClicksApproved", "GrossClicksRejected", "UniqueClicks",
      "GrossImps", "UniqueImps", "ConversionsTotal", "ConversionsApproved",
      "ConversionsPending", "ConversionsRejected", "AdvertiserModel", "AffiliateModel",
      "AdvertiserPrice", "AdvertiserPriceApproved", "AdvertiserPricePending", "AdvertiserPriceRejected",
      "AffiliatePayout", "AffiliatePayoutApproved", "AffiliatePayoutPending", "AffiliatePayoutRejected",
      "Sale", "SaleApproved", "SalePending", "SaleRejected",
      "Profit", "ProfitApproved", "ProfitPending", "ProfitRejected",
      "Profit(Total-Approved)", "Currency",
    ],
  },
  {
    title: "Device Data",
    columns: [
      "IPaddress", "ProxyIP", "GeoCountry", "GeoState",
      "GeoCity", "GeoISP", "CouponID", "ProductID",
    ],
  },
  {
    title: "Data Sources",
    columns: [
      "UserAgent", "ReferralDomain", "ReferralURL", "DeviceType",
      "DeviceBrowser", "DeviceOS", "DeviceOSver", "DeviceBrand",
      "DeviceModel", "DeviceLanguage", "Event", "TID",
      "ImpressionID", "AffiliateClickID", "AffiliateSub1", "AffiliateSub2",
      "AffiliateSub3", "AffiliateSub4", "AffiliateSub5", "AffiliateSub6",
      "AffiliateSub7", "AffiliateSub8", "AffiliateSub9", "AffiliateSub10",
      "CreativeID", "AdvertiserSub1", "AdvertiserSub2", "AdvertiserSub3",
      "AdvertiserSub4", "AdvertiserSub5", "AdvertiserSub7", "OutURL",
      "TrackingDomain", "LandingPage", "SourceID", "DeviceID",
      "iosIDFA", "ShortURL", "GoogleAID", "AndroidID",
      "FallbackOffer", "FallbackURL", "ClickPixel", "Status",
      "CTR", "EPC", "CPC", "eCPM",
      "eRPM", "eCostPerConversion", "eRevenuePerConversion", "CR",
      "CRApproved", "FilterLog", "StatusType", "CRRejected",
      "CRApprovedClicks/GrossConv.",
    ],
  },
  {
    title: "iGaming",
    columns: [
      "Registrations", "Deposits", "DepositsAmount", "FTD",
      "FTDAmount", "Re-deposits", "Re-depositsAmount", "Wins",
      "WinsAmount", "Withdrawals", "WithdrawalsAmount", "Bonuses",
      "BonusesAmount", "GGR", "NGR", "UserID",
      "(IG)ProductID", "CRReg", "CRDep", "CR(Reg-Dep)",
    ],
  },
];

const DEFAULT_SELECTED_COLUMNS = [
  "OfferID", "Advertiser", "Affiliate",
  "GrossClicksTotal", "ConversionsTotal", "AdvertiserPrice", "AffiliatePayout", "Currency",
  "Status",
];

const TOTAL_COLUMN_COUNT = COLUMN_GROUPS.reduce((total, group) => total + group.columns.length, 0);

const COUNTRY_FLAGS = {
  "India": "🇮🇳",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  "Canada": "🇨🇦",
  "Australia": "🇦🇺",
  "Germany": "🇩🇪",
  "France": "🇫🇷",
  "Japan": "🇯🇵",
  "Brazil": "🇧🇷",
};

const countryFlag = (country) => COUNTRY_FLAGS[country] || "🌐";

const IGAMING_METRICS = [
  "Registrations", "Deposits", "DepositsAmount", "Bets", "BetsAmount",
  "Wins", "WinsAmount", "Withdrawals", "WithdrawalsAmount", "Bonuses",
  "BonusesAmount", "GGR", "NGR",
];

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

export default function TestReportsPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("basic");
  const [periodStart, setPeriodStart] = useState(() => `${new Date().toISOString().slice(0, 10)}T00:00:00`);
  const [periodEnd, setPeriodEnd] = useState(() => `${new Date().toISOString().slice(0, 10)}T23:59:59`);
  const [showEntries, setShowEntries] = useState(100);

  const [reportRows, setReportRows] = useState([]);
  const [reportRowsLoading, setReportRowsLoading] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const [fraudSubAffFilter, setFraudSubAffFilter] = useState("");
  const [fraudAffiliateId, setFraudAffiliateId] = useState("");
  const [fraudOfferId, setFraudOfferId] = useState("");
  const [fraudDateStart, setFraudDateStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [fraudDateEnd, setFraudDateEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [fraudOffers, setFraudOffers] = useState([]);
  const [fraudOffersLoading, setFraudOffersLoading] = useState(false);
  const [fraudAffiliates, setFraudAffiliates] = useState([]);
  const [fraudAffiliatesLoading, setFraudAffiliatesLoading] = useState(false);

  useEffect(() => {
    if (activeTemplate !== "fraud-fender") return undefined;
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
  }, [activeTemplate]);

  useEffect(() => {
    if (activeTemplate !== "fraud-fender") return undefined;
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
  }, [activeTemplate]);

  const [fraudSettings, setFraudSettings] = useState([]);
  const [fraudSettingsLoading, setFraudSettingsLoading] = useState(false);

  useEffect(() => {
    if (activeTemplate !== "fraud-fender") return undefined;
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
  }, [activeTemplate]);

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

  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filtersSectionOpen, setFiltersSectionOpen] = useState(false);
  const [columnsSectionOpen, setColumnsSectionOpen] = useState(true);
  const [columnSearch, setColumnSearch] = useState("");
  const [selectedColumns, setSelectedColumns] = useState(() => new Set(DEFAULT_SELECTED_COLUMNS));

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

  const affiliateName = (affiliate) =>
    [affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || "Unnamed Affiliate";

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

  const selectTemplate = (key) => {
    setActiveTemplate(key);
    setReportSubmitted(false);
    setReportRows([]);
  };

  const submitReport = async () => {
    if (activeTemplate !== "offer" && activeTemplate !== "affiliate" && activeTemplate !== "country" && activeTemplate !== "events" && activeTemplate !== "igaming-badge" && activeTemplate !== "smart-offer" && activeTemplate !== "basic") {
      setReportRows([]);
      setReportSubmitted(true);
      return;
    }

    try {
      setReportRowsLoading(true);
      if (activeTemplate === "basic") {
        const [offersResponse, affiliatesResponse, linkingRulesResponse] = await Promise.all([
          fetch("https://localhost:7150/api/Offers", { headers: { accept: "*/*" } }),
          fetch("https://localhost:7029/api/Affiliates", { headers: { accept: "*/*" } }),
          fetch("https://localhost:7150/api/OfferLinkingRules", { headers: { accept: "*/*" } }),
        ]);
        if (!offersResponse.ok) throw new Error("Unable to load offers");
        const offersData = await offersResponse.json();
        const affiliatesData = affiliatesResponse.ok ? await affiliatesResponse.json() : [];
        const linkingRulesData = linkingRulesResponse.ok ? await linkingRulesResponse.json() : [];
        const affiliateItems = Array.isArray(affiliatesData) ? affiliatesData : affiliatesData.items || affiliatesData.data || [];
        const linkingRules = Array.isArray(linkingRulesData) ? linkingRulesData : linkingRulesData.items || linkingRulesData.data || [];
        const items = (Array.isArray(offersData) ? offersData : offersData.items || offersData.data || []).filter((offer) => isWithinPeriod(offer.createdOn));
        setReportRows(items.map((offer) => {
          const rule = linkingRules.find((row) =>
            String(row.offerIds || "").split(",").map((value) => value.trim()).includes(String(offer.id))
          );
          const affId = rule ? String(rule.affiliateIds || "").split(",").map((value) => value.trim()).filter(Boolean)[0] : "";
          const affiliate = affiliateItems.find((item) => String(item.id) === String(affId));
          return {
            id: offer.id,
            label: `${offer.id} ~ ${offer.offerName}`,
            editPath: `/offers/${offer.id}/edit`,
            affiliateLabel: affiliate ? `${affiliate.id} ~ ${affiliateName(affiliate)}` : (affId || "-"),
            affiliateEditPath: affiliate ? `/affiliate/${affiliate.id}` : null,
            currency: offer.affiliateCurrency || offer.advertiserCurrency || "-",
            status: offer.status || "-",
          };
        }));
      } else if (activeTemplate === "smart-offer") {
        const [offersResponse, affiliatesResponse, linkingRulesResponse] = await Promise.all([
          fetch("https://localhost:7150/api/Offers", { headers: { accept: "*/*" } }),
          fetch("https://localhost:7029/api/Affiliates", { headers: { accept: "*/*" } }),
          fetch("https://localhost:7150/api/OfferLinkingRules", { headers: { accept: "*/*" } }),
        ]);
        if (!linkingRulesResponse.ok) throw new Error("Unable to load offer linking rules");
        const offersData = offersResponse.ok ? await offersResponse.json() : [];
        const affiliatesData = affiliatesResponse.ok ? await affiliatesResponse.json() : [];
        const linkingRulesData = await linkingRulesResponse.json();
        const offerItems = Array.isArray(offersData) ? offersData : offersData.items || offersData.data || [];
        const affiliateItems = Array.isArray(affiliatesData) ? affiliatesData : affiliatesData.items || affiliatesData.data || [];
        const linkingRules = (Array.isArray(linkingRulesData) ? linkingRulesData : linkingRulesData.items || linkingRulesData.data || [])
          .filter((rule) => isWithinPeriod(rule.createdOn));

        const rows = [];
        linkingRules.forEach((rule) => {
          const offerIds = String(rule.offerIds || "").split(",").map((value) => value.trim()).filter(Boolean);
          if (offerIds.length < 2) return;
          const [primaryOfferId, ...subOfferIds] = offerIds;
          const primaryOffer = offerItems.find((item) => String(item.id) === String(primaryOfferId));
          const affId = String(rule.affiliateIds || "").split(",").map((value) => value.trim()).filter(Boolean)[0];
          const affiliate = affiliateItems.find((item) => String(item.id) === String(affId));
          subOfferIds.forEach((subOfferId) => {
            rows.push({
              id: `${rule.id}-${subOfferId}`,
              offerId: primaryOfferId,
              subOfferId,
              affiliateLabel: affiliate ? `${affiliate.id} ~ ${affiliateName(affiliate)}` : (affId || "-"),
              currency: primaryOffer?.affiliateCurrency || primaryOffer?.advertiserCurrency || "-",
              status: primaryOffer?.status || rule.status || "-",
            });
          });
        });
        setReportRows(rows);
      } else if (activeTemplate === "igaming-badge") {
        const [offersResponse, affiliatesResponse, linkingRulesResponse] = await Promise.all([
          fetch("https://localhost:7150/api/Offers", { headers: { accept: "*/*" } }),
          fetch("https://localhost:7029/api/Affiliates", { headers: { accept: "*/*" } }),
          fetch("https://localhost:7150/api/OfferLinkingRules", { headers: { accept: "*/*" } }),
        ]);
        if (!offersResponse.ok) throw new Error("Unable to load offers");
        const offersData = await offersResponse.json();
        const affiliatesData = affiliatesResponse.ok ? await affiliatesResponse.json() : [];
        const linkingRulesData = linkingRulesResponse.ok ? await linkingRulesResponse.json() : [];
        const affiliateItems = Array.isArray(affiliatesData) ? affiliatesData : affiliatesData.items || affiliatesData.data || [];
        const linkingRules = Array.isArray(linkingRulesData) ? linkingRulesData : linkingRulesData.items || linkingRulesData.data || [];
        const items = (Array.isArray(offersData) ? offersData : offersData.items || offersData.data || []).filter((offer) => isWithinPeriod(offer.createdOn));
        setReportRows(items.map((offer) => {
          const rule = linkingRules.find((row) =>
            String(row.offerIds || "").split(",").map((value) => value.trim()).includes(String(offer.id))
          );
          const affId = rule ? String(rule.affiliateIds || "").split(",").map((value) => value.trim()).filter(Boolean)[0] : "";
          const affiliate = affiliateItems.find((item) => String(item.id) === String(affId));
          return {
            id: offer.id,
            label: `${offer.id} ~ ${offer.offerName}`,
            editPath: `/offers/${offer.id}/edit`,
            affiliateId: affiliate ? affiliate.id : (affId || "-"),
            currency: offer.affiliateCurrency || offer.advertiserCurrency || "-",
          };
        }));
      } else if (activeTemplate === "offer" || activeTemplate === "country") {
        const response = await fetch("https://localhost:7150/api/Offers", { headers: { accept: "*/*" } });
        if (!response.ok) throw new Error("Unable to load offers");
        const data = await response.json();
        const items = (Array.isArray(data) ? data : data.items || data.data || []).filter((offer) => isWithinPeriod(offer.createdOn));
        setReportRows(items.map((offer) => ({
          id: offer.id,
          label: `${offer.id} ~ ${offer.offerName}`,
          editPath: `/offers/${offer.id}/edit`,
          currency: offer.affiliateCurrency || offer.advertiserCurrency || "-",
          status: offer.status || "-",
          geoCountry: offer.targetGeo || "All Countries",
        })));
      } else if (activeTemplate === "affiliate") {
        const response = await fetch("https://localhost:7029/api/Affiliates", { headers: { accept: "*/*" } });
        if (!response.ok) throw new Error("Unable to load affiliates");
        const data = await response.json();
        const items = (Array.isArray(data) ? data : data.items || data.data || []).filter((affiliate) => isWithinPeriod(affiliate.createdOn));
        setReportRows(items.map((affiliate) => ({
          id: affiliate.id,
          label: `${affiliate.id} ~ ${affiliateName(affiliate)} (${affiliate.companyName || affiliateName(affiliate)})`,
          editPath: `/affiliate/${affiliate.id}`,
          currency: affiliate.currency || "-",
          status: affiliate.status || "-",
        })));
      } else {
        const [eventsResponse, offersResponse] = await Promise.all([
          fetch("https://localhost:7150/api/EventGoals", { headers: { accept: "*/*" } }),
          fetch("https://localhost:7150/api/Offers", { headers: { accept: "*/*" } }),
        ]);
        if (!eventsResponse.ok) throw new Error("Unable to load event goals");
        const eventsData = await eventsResponse.json();
        const offersData = offersResponse.ok ? await offersResponse.json() : [];
        const offerItems = Array.isArray(offersData) ? offersData : offersData.items || offersData.data || [];
        const items = (Array.isArray(eventsData) ? eventsData : eventsData.items || eventsData.data || []).filter((row) => isWithinPeriod(row.createdOn));
        setReportRows(items.map((row) => {
          const offer = offerItems.find((item) => String(item.id) === String(row.offerId));
          return {
            id: row.id,
            currency: offer?.affiliateCurrency || offer?.advertiserCurrency || "-",
            status: offer?.status || "-",
            event: row.eventName || "",
          };
        }));
      }
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
            <div className="reports-header">
              <h2><span aria-hidden="true">◔</span> Test Reports</h2>

              <div className="reports-templates">
                <span className="reports-templates-label"><span aria-hidden="true">🏷</span> Templates</span>
                <div className="reports-templates-rows">
                  <div className="reports-templates-row">
                    {reportTemplates.map((template) => (
                      <button
                        type="button"
                        key={template.key}
                        className={`reports-template-tag${activeTemplate === template.key ? " active" : ""}${template.accent ? " accent" : ""}`}
                        onClick={() => selectTemplate(template.key)}
                      >
                        {template.icon && <span aria-hidden="true">{template.icon}</span>} {template.label}
                      </button>
                    ))}
                  </div>
                  <div className="reports-templates-row">
                    {reportTemplatesRow2.map((template) => (
                      <button
                        type="button"
                        key={template.key}
                        className={`reports-template-tag${activeTemplate === template.key ? " active" : ""}`}
                        onClick={() => selectTemplate(template.key)}
                      >
                        {template.icon && <span aria-hidden="true">{template.icon}</span>} {template.label} {template.hasCaret && <span aria-hidden="true">▾</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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
                <button type="button" className="events-dark-btn" onClick={submitReport} disabled={reportRowsLoading}><span aria-hidden="true">🕐</span> {reportRowsLoading ? "Loading…" : "Submit"}</button>
                <button type="button" className="postback-logs-filter-btn" onClick={() => setShowFiltersPanel(true)} aria-label="Filters and columns">▽</button>
              </div>
            </div>

            {activeTemplate === "fraud-fender" && (
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
            )}

            {activeTemplate !== "fraud-fender" && (
              <>
            <div className="reports-summary">
              {[
                { label: "Impressions (MTD)", value: "" },
                { label: "Clicks (MTD)", value: "1" },
                { label: "Conversions (MTD)", value: "" },
                { label: "Revenue (MTD)", value: "USD" },
                { label: "Payout (MTD)", value: "USD" },
                { label: "Profit (MTD)", value: "USD" },
              ].map((metric) => (
                <div className="reports-summary-item" key={metric.label}>
                  <span className="reports-summary-label">{metric.label}</span>
                  <span className="reports-summary-value">{metric.value}</span>
                </div>
              ))}
            </div>

            <div className="reports-ai-row">
              <button type="button" className="reports-ai-btn" onClick={() => alert("AI Analyze is not connected yet.")}>
                <span aria-hidden="true">✦</span> AI Analyze
              </button>
            </div>

            <div className="events-table-wrap">
              {activeTemplate === "smart-offer" ? (
                <table className="events-table automation-table reports-table">
                  <thead>
                    <tr>
                      <th rowSpan="2">OfferID <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th rowSpan="2">SubOfferID <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th rowSpan="2">Affiliate <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>GrossClicks</th>
                      <th>Conversions</th>
                      <th>AdvertiserPrice</th>
                      <th>AffiliatePayout</th>
                      <th rowSpan="2">Currency</th>
                      <th rowSpan="2">Status</th>
                    </tr>
                    <tr>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportRowsLoading && (
                      <tr><td colSpan="9" className="automation-empty-cell">Loading…</td></tr>
                    )}
                    {!reportRowsLoading && reportSubmitted && reportRows.length === 0 && (
                      <tr><td colSpan="9" className="automation-empty-cell">No data available in table</td></tr>
                    )}
                    {!reportRowsLoading && !reportSubmitted && (
                      <tr><td colSpan="9" className="automation-empty-cell">Select a Period and click Submit to load data.</td></tr>
                    )}
                    {!reportRowsLoading && reportRows.map((row) => (
                      <tr key={row.id}>
                        <td><button type="button" className="reports-row-link" onClick={() => navigate(`/offers/${row.offerId}/edit`)}>{row.offerId}</button></td>
                        <td><button type="button" className="reports-row-link" onClick={() => navigate(`/offers/${row.subOfferId}/edit`)}>{row.subOfferId}</button></td>
                        <td>{row.affiliateLabel}</td>
                        <td>1</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>{row.currency}</td>
                        <td>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeTemplate === "igaming-badge" ? (
                <table className="events-table automation-table reports-table">
                  <thead>
                    <tr>
                      <th rowSpan="2">OfferID <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th rowSpan="2">AffiliateID <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>GrossClicks</th>
                      <th>Conversions</th>
                      <th>AdvertiserPrice</th>
                      <th>AffiliatePayout</th>
                      <th rowSpan="2">Currency</th>
                      <th colSpan={IGAMING_METRICS.length}>iGaming</th>
                    </tr>
                    <tr>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      {IGAMING_METRICS.map((metric) => (
                        <th key={metric}>{metric} <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportRowsLoading && (
                      <tr><td colSpan={7 + IGAMING_METRICS.length} className="automation-empty-cell">Loading…</td></tr>
                    )}
                    {!reportRowsLoading && reportSubmitted && reportRows.length === 0 && (
                      <tr><td colSpan={7 + IGAMING_METRICS.length} className="automation-empty-cell">No data available in table</td></tr>
                    )}
                    {!reportRowsLoading && !reportSubmitted && (
                      <tr><td colSpan={7 + IGAMING_METRICS.length} className="automation-empty-cell">Select a Period and click Submit to load data.</td></tr>
                    )}
                    {!reportRowsLoading && reportRows.map((row) => (
                      <tr key={row.id}>
                        <td><button type="button" className="reports-row-link" onClick={() => navigate(row.editPath)}>{row.label}</button></td>
                        <td>{row.affiliateId}</td>
                        <td>1</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>{row.currency}</td>
                        {IGAMING_METRICS.map((metric) => <td key={metric}>0</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeTemplate === "events" ? (
                <table className="events-table automation-table reports-table">
                  <thead>
                    <tr>
                      <th>Conversions</th>
                      <th>AdvertiserPrice</th>
                      <th>AffiliatePayout</th>
                      <th rowSpan="2">Currency</th>
                      <th rowSpan="2">Event <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th rowSpan="2">Status</th>
                    </tr>
                    <tr>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportRowsLoading && (
                      <tr><td colSpan="6" className="automation-empty-cell">Loading…</td></tr>
                    )}
                    {!reportRowsLoading && reportSubmitted && reportRows.length === 0 && (
                      <tr><td colSpan="6" className="automation-empty-cell">No data available in table</td></tr>
                    )}
                    {!reportRowsLoading && !reportSubmitted && (
                      <tr><td colSpan="6" className="automation-empty-cell">Select a Period and click Submit to load data.</td></tr>
                    )}
                    {!reportRowsLoading && reportRows.map((row) => (
                      <tr key={row.id}>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>{row.currency}</td>
                        <td>{row.event}</td>
                        <td>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeTemplate === "country" ? (
                <table className="events-table automation-table reports-table">
                  <thead>
                    <tr>
                      <th>GrossClicks</th>
                      <th>Conversions</th>
                      <th>AdvertiserPrice</th>
                      <th>AffiliatePayout</th>
                      <th rowSpan="2">Currency</th>
                      <th rowSpan="2">GeoCountry <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th rowSpan="2">Status</th>
                    </tr>
                    <tr>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportRowsLoading && (
                      <tr><td colSpan="7" className="automation-empty-cell">Loading…</td></tr>
                    )}
                    {!reportRowsLoading && reportSubmitted && reportRows.length === 0 && (
                      <tr><td colSpan="7" className="automation-empty-cell">No data available in table</td></tr>
                    )}
                    {!reportRowsLoading && !reportSubmitted && (
                      <tr><td colSpan="7" className="automation-empty-cell">Select a Period and click Submit to load data.</td></tr>
                    )}
                    {!reportRowsLoading && reportRows.map((row) => (
                      <tr key={row.id}>
                        <td>1</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>{row.currency}</td>
                        <td className="reports-geo-cell"><span aria-hidden="true">{countryFlag(row.geoCountry)}</span> {row.geoCountry}</td>
                        <td>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeTemplate === "offer" || activeTemplate === "affiliate" ? (
                <table className="events-table automation-table reports-table">
                  <thead>
                    <tr>
                      <th rowSpan="2">{activeTemplate === "offer" ? "OfferID" : "Affiliate"} <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>GrossClicks</th>
                      <th>Conversions</th>
                      {activeTemplate === "offer" && <th>AdvertiserPrice</th>}
                      <th>AffiliatePayout</th>
                      <th rowSpan="2">Currency</th>
                      <th rowSpan="2">Status</th>
                    </tr>
                    <tr>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      {activeTemplate === "offer" && <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>}
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportRowsLoading && (
                      <tr><td colSpan={activeTemplate === "offer" ? 7 : 6} className="automation-empty-cell">Loading…</td></tr>
                    )}
                    {!reportRowsLoading && reportSubmitted && reportRows.length === 0 && (
                      <tr><td colSpan={activeTemplate === "offer" ? 7 : 6} className="automation-empty-cell">No data available in table</td></tr>
                    )}
                    {!reportRowsLoading && !reportSubmitted && (
                      <tr><td colSpan={activeTemplate === "offer" ? 7 : 6} className="automation-empty-cell">Select a Period and click Submit to load data.</td></tr>
                    )}
                    {!reportRowsLoading && reportRows.map((row) => (
                      <tr key={row.id}>
                        <td><button type="button" className="reports-row-link" onClick={() => navigate(row.editPath)}>{row.label}</button></td>
                        <td>1</td>
                        <td>0</td>
                        {activeTemplate === "offer" && <td>0</td>}
                        <td>0</td>
                        <td>{row.currency}</td>
                        <td>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="events-table automation-table reports-table">
                  <thead>
                    <tr>
                      <th rowSpan="2">OfferID <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th rowSpan="2">Affiliate <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>GrossClicks</th>
                      <th>Conversions</th>
                      <th>AdvertiserPrice</th>
                      <th>AffiliatePayout</th>
                      <th rowSpan="2">Currency</th>
                      <th rowSpan="2">Status</th>
                    </tr>
                    <tr>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                      <th>Total <span aria-hidden="true" className="postback-logs-sort">↕</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTemplate === "basic" && reportRowsLoading && (
                      <tr><td colSpan="8" className="automation-empty-cell">Loading…</td></tr>
                    )}
                    {activeTemplate === "basic" && !reportRowsLoading && reportSubmitted && reportRows.length === 0 && (
                      <tr><td colSpan="8" className="automation-empty-cell">No data available in table</td></tr>
                    )}
                    {activeTemplate === "basic" && !reportRowsLoading && !reportSubmitted && (
                      <tr><td colSpan="8" className="automation-empty-cell">Select a Period and click Submit to load data.</td></tr>
                    )}
                    {activeTemplate === "basic" && !reportRowsLoading && reportRows.map((row) => (
                      <tr key={row.id}>
                        <td><button type="button" className="reports-row-link" onClick={() => navigate(row.editPath)}>{row.label}</button></td>
                        <td>
                          {row.affiliateEditPath ? (
                            <button type="button" className="reports-row-link" onClick={() => navigate(row.affiliateEditPath)}>{row.affiliateLabel}</button>
                          ) : row.affiliateLabel}
                        </td>
                        <td>1</td>
                        <td>0</td>
                        <td>0</td>
                        <td>0</td>
                        <td>{row.currency}</td>
                        <td>{row.status}</td>
                      </tr>
                    ))}
                    {activeTemplate !== "basic" && (
                      <tr><td colSpan="8" className="automation-empty-cell">No data available in table</td></tr>
                    )}
                  </tbody>
                  {activeTemplate !== "basic" && (
                    <tfoot>
                      <tr>
                        <td />
                        <td />
                        <td>0</td>
                        <td>0</td>
                        <td>0.00 USD</td>
                        <td>0.00 USD</td>
                        <td />
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              )}
            </div>

            <div className="reports-pagination">
              <button type="button" className="reports-export-btn" onClick={() => alert("Export is not connected yet.")} aria-label="Export">⤓</button>
              <div className="reports-pagination-pages">
                <button type="button" aria-label="Previous page">«</button>
                <button type="button" className="active">1</button>
                <button type="button" aria-label="Next page">»</button>
              </div>
            </div>
              </>
            )}
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
                <p className="filters-panel-empty">No filters configured yet.</p>
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
