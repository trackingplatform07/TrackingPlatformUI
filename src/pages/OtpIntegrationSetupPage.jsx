import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { OTP_PARTNERS } from "../data/otpPartners";
import "../css/MobileAttributionPage.css";
import "../css/OfferSyncPage.css";
import "../css/OtpIntegrationPage.css";
import "../css/OtpIntegrationSetupPage.css";

const OFFERS_API = "https://localhost:7150/api/Offers";
const AFFILIATES_API = "https://localhost:7029/api/Affiliates";

const TOKEN_OPTIONS = ["{msisdn}", "{otp}", "{request_id}", "{api_key}"];

const buildEmptyCredentials = () => ({
  name: "",
  offerId: "",
  sendUrl: "",
  sendParams: [{ key: "", value: "{msisdn}" }],
  verifyUrl: "",
  verifyParams: [
    { key: "", value: "{msisdn}" },
    { key: "", value: "{otp}" },
    { key: "", value: "{request_id}" },
  ],
});

export default function OtpIntegrationSetupPage() {
  const navigate = useNavigate();
  const { partnerKey } = useParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const partner = OTP_PARTNERS.find((item) => item.key === partnerKey) || OTP_PARTNERS[0];

  const [activeTab, setActiveTab] = useState("credentials");
  const [credentials, setCredentials] = useState(buildEmptyCredentials);
  const [submitted, setSubmitted] = useState(false);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(true);

  const [pageTitle, setPageTitle] = useState("");
  const [selectedAffiliateIds, setSelectedAffiliateIds] = useState([]);
  const [affiliateDropdownOpen, setAffiliateDropdownOpen] = useState(false);
  const [generatedEndpoint, setGeneratedEndpoint] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadOffers = async () => {
      try {
        setOffersLoading(true);
        const response = await fetch(OFFERS_API, { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load offers");
        const data = await response.json();
        setOffers(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setOffers([]);
      } finally {
        if (!controller.signal.aborted) setOffersLoading(false);
      }
    };

    const loadAffiliates = async () => {
      try {
        setAffiliatesLoading(true);
        const response = await fetch(AFFILIATES_API, { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load affiliates");
        const data = await response.json();
        setAffiliates(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setAffiliates([]);
      } finally {
        if (!controller.signal.aborted) setAffiliatesLoading(false);
      }
    };

    loadOffers();
    loadAffiliates();
    return () => controller.abort();
  }, []);

  const affiliateName = (affiliate) =>
    [affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || "Unnamed Affiliate";

  const updateCredential = (field, value) => {
    setCredentials((current) => ({ ...current, [field]: value }));
  };

  const updateParamRow = (group, index, field, value) => {
    setCredentials((current) => {
      const rows = current[group].map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row));
      return { ...current, [group]: rows };
    });
  };

  const addParamRow = (group) => {
    setCredentials((current) => ({
      ...current,
      [group]: [...current[group], { key: "", value: TOKEN_OPTIONS[0] }],
    }));
  };

  const submitCredentials = () => {
    if (!credentials.name.trim()) {
      alert("Please enter a name.");
      return;
    }
    if (!credentials.offerId) {
      alert("Please select an offer.");
      return;
    }
    if (!credentials.sendUrl.trim() || !credentials.verifyUrl.trim()) {
      alert("Please enter both the OTP Send API URL and OTP Verify API URL.");
      return;
    }
    setSubmitted(true);
    setActiveTab("endpoints");
  };

  const toggleAffiliate = (affiliateId) => {
    setSelectedAffiliateIds((current) =>
      current.includes(affiliateId) ? current.filter((id) => id !== affiliateId) : [...current, affiliateId]
    );
  };

  const generateEndpoint = () => {
    if (!pageTitle.trim()) {
      alert("Please enter a page title.");
      return;
    }
    if (selectedAffiliateIds.length === 0) {
      alert("Please select at least one affiliate.");
      return;
    }
    const slug = pageTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setGeneratedEndpoint(`https://otp.offer18.com/${partner.key}/${slug}?aff=${selectedAffiliateIds.join(",")}`);
  };

  const breadcrumbLabel = submitted && credentials.name.trim() ? credentials.name.trim() : "";

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="mobile-attribution-page">
          <section className="otp-setup-breadcrumb-card">
            <div className="otp-setup-breadcrumb">
              <span aria-hidden="true">☰</span>
              <span>{partner.name}</span>
              {breadcrumbLabel && (
                <>
                  <span aria-hidden="true">›</span>
                  <span>{breadcrumbLabel}</span>
                </>
              )}
            </div>
            <div className="otp-setup-breadcrumb-actions">
              <button type="button" className="otp-setup-remove-btn" onClick={() => navigate("/integration/otp-integration")}>
                <span aria-hidden="true">🗑</span> Remove
              </button>
              <button type="button" className="otp-setup-back-btn" onClick={() => navigate("/integration/otp-integration")}>
                <span aria-hidden="true">«</span> Back
              </button>
            </div>
          </section>

          <div className="otp-setup-layout">
            <aside className="otp-setup-sidebar">
              <div
                className={`otp-setup-logo-card offer-sync-logo-badge otp-logo-${partner.variant}`}
                style={{ color: partner.color, background: partner.bg || undefined }}
              >
                {partner.name}
              </div>
              <nav className="otp-setup-tabs">
                <button
                  type="button"
                  className={`otp-setup-tab ${activeTab === "credentials" ? "active" : ""}`}
                  onClick={() => setActiveTab("credentials")}
                >
                  <span aria-hidden="true">🔑</span> Credentials
                </button>
                <button
                  type="button"
                  className={`otp-setup-tab ${activeTab === "endpoints" ? "active" : ""}`}
                  onClick={() => setActiveTab("endpoints")}
                  disabled={!submitted}
                >
                  <span aria-hidden="true">🔗</span> Affiliate API Endpoints
                </button>
              </nav>
            </aside>

            <section className="otp-setup-panel">
              {activeTab === "credentials" && (
                <>
                  <h3 className="otp-setup-panel-title"><span aria-hidden="true">🔑</span> Credentials</h3>
                  <hr className="otp-setup-divider" />

                  <div className="otp-setup-field">
                    <label>Name <span className="otp-setup-required">*</span></label>
                    <input
                      placeholder="OTP API Name"
                      value={credentials.name}
                      onChange={(event) => updateCredential("name", event.target.value)}
                    />
                  </div>

                  <div className="otp-setup-field">
                    <label>Offer <span className="otp-setup-required">*</span></label>
                    <select
                      value={credentials.offerId}
                      onChange={(event) => updateCredential("offerId", event.target.value)}
                      disabled={offersLoading}
                    >
                      <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                      {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                    </select>
                  </div>

                  <div className="otp-setup-field">
                    <label>OTP Send API URL <span className="otp-setup-required">*</span></label>
                    <textarea
                      value={credentials.sendUrl}
                      onChange={(event) => updateCredential("sendUrl", event.target.value)}
                    />
                  </div>

                  {credentials.sendParams.map((row, index) => (
                    <div className="otp-setup-param-row" key={`send-${index}`}>
                      <input
                        placeholder="Key"
                        value={row.key}
                        onChange={(event) => updateParamRow("sendParams", index, "key", event.target.value)}
                      />
                      <select value={row.value} onChange={(event) => updateParamRow("sendParams", index, "value", event.target.value)}>
                        {TOKEN_OPTIONS.map((token) => <option key={token} value={token}>{token}</option>)}
                      </select>
                    </div>
                  ))}
                  <button type="button" className="otp-setup-add-more" onClick={() => addParamRow("sendParams")}>+Add More</button>

                  <div className="otp-setup-field">
                    <label>OTP Verify API URL <span className="otp-setup-required">*</span></label>
                    <textarea
                      value={credentials.verifyUrl}
                      onChange={(event) => updateCredential("verifyUrl", event.target.value)}
                    />
                  </div>

                  {credentials.verifyParams.map((row, index) => (
                    <div className="otp-setup-param-row" key={`verify-${index}`}>
                      <input
                        placeholder="Key"
                        value={row.key}
                        onChange={(event) => updateParamRow("verifyParams", index, "key", event.target.value)}
                      />
                      <select value={row.value} onChange={(event) => updateParamRow("verifyParams", index, "value", event.target.value)}>
                        {TOKEN_OPTIONS.map((token) => <option key={token} value={token}>{token}</option>)}
                      </select>
                    </div>
                  ))}
                  <button type="button" className="otp-setup-add-more" onClick={() => addParamRow("verifyParams")}>+Add More</button>

                  <div className="otp-setup-footer">
                    <button type="button" className="otp-setup-submit" onClick={submitCredentials}>
                      <span aria-hidden="true">🕐</span> Submit &amp; Next
                    </button>
                  </div>
                </>
              )}

              {activeTab === "endpoints" && (
                <>
                  <h3 className="otp-setup-panel-title"><span aria-hidden="true">🔗</span> Affiliate API Endpoints</h3>
                  <hr className="otp-setup-divider" />

                  <div className="otp-setup-field">
                    <label>Page Title</label>
                    <input
                      placeholder="Page Title"
                      value={pageTitle}
                      onChange={(event) => setPageTitle(event.target.value)}
                    />
                  </div>

                  <div className="otp-setup-field">
                    <label>Select Affiliate</label>
                    <div className="otp-setup-affiliate-select">
                      <div className="otp-setup-affiliate-chips" onClick={() => setAffiliateDropdownOpen((open) => !open)}>
                        {selectedAffiliateIds.length === 0 && (
                          <span className="otp-setup-affiliate-placeholder">
                            {affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}
                          </span>
                        )}
                        {selectedAffiliateIds.map((id) => {
                          const affiliate = affiliates.find((item) => String(item.id) === String(id));
                          return (
                            <span className="otp-setup-affiliate-chip" key={id}>
                              {affiliate ? affiliateName(affiliate) : id}
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleAffiliate(id);
                                }}
                              >
                                ✕
                              </button>
                            </span>
                          );
                        })}
                        <span className="otp-setup-affiliate-caret" aria-hidden="true">▾</span>
                      </div>

                      {affiliateDropdownOpen && (
                        <div className="otp-setup-affiliate-dropdown">
                          {affiliates.length === 0 ? (
                            <p className="otp-setup-affiliate-empty">No affiliates available.</p>
                          ) : (
                            affiliates.map((affiliate) => (
                              <label className="otp-setup-affiliate-option" key={affiliate.id}>
                                <input
                                  type="checkbox"
                                  checked={selectedAffiliateIds.includes(String(affiliate.id))}
                                  onChange={() => toggleAffiliate(String(affiliate.id))}
                                />
                                {affiliateName(affiliate)}
                              </label>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <button type="button" className="otp-setup-generate-btn" onClick={generateEndpoint}>
                    <span aria-hidden="true">🕐</span> Generate
                  </button>

                  {generatedEndpoint && (
                    <div className="otp-setup-generated-box">
                      <label>Generated Endpoint</label>
                      <code>{generatedEndpoint}</code>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
