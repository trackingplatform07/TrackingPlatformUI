import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/Modal.css";
import "../css/BillingPage.css";
import "../css/BillingOverviewPage.css";

const SUBSCRIPTION_API = "https://localhost:7150/api/BillingSubscriptions";
const PLAN_HISTORY_API = "https://localhost:7150/api/BillingPlanHistoryLogs";
const INVOICES_API = "https://localhost:7150/api/BillingInvoices";

const OVERVIEW_TABS = [
  { label: "Overview", icon: "▦" },
  { label: "Subscription Plan", icon: "💳" },
  { label: "Billing Profile", icon: "🖼" },
  { label: "Tickets", icon: "🎫" },
];

const PLAN_OPTIONS = [
  { name: "Starter", type: "Conversion Based Plan", price: 99, conversions: 5000, clicksUnlimited: false, clicks: 100000, impressions: 2000000, description: "Get started with essential tracking for small affiliate networks." },
  { name: "Professional", type: "Conversion Based Plan", price: 399, conversions: 50000, clicksUnlimited: true, impressions: 20000000, description: "Scale up Business Capabilities with Cost-effective Pricing & Premium Customer Support." },
  { name: "Enterprise", type: "Conversion Based Plan", price: 999, conversions: 250000, clicksUnlimited: true, impressions: 100000000, description: "Full-scale tracking with dedicated support for large affiliate networks." },
];

const AVAILABLE_ADDONS = [
  { key: "iGaming", label: "iGaming", priceMonthly: 1 },
  { key: "LinkTest", label: "LinkTest", priceMonthly: 1 },
  { key: "SuppressionList", label: "Suppression List", priceMonthly: 1 },
  { key: "ShortURL", label: "Short URL", priceMonthly: 1 },
];

const COUNTRY_OPTIONS = ["India", "United States of America", "United Kingdom", "Canada", "Australia", "Germany", "France", "United Arab Emirates"];
const INDIA_STATES = [
  { name: "Maharashtra", code: "27" },
  { name: "Delhi", code: "07" },
  { name: "Karnataka", code: "29" },
  { name: "Gujarat", code: "24" },
  { name: "Tamil Nadu", code: "33" },
  { name: "West Bengal", code: "19" },
  { name: "Rajasthan", code: "08" },
];

const buildEmptyBillingProfile = () => ({
  gstVatNumber: "",
  taxNumberPan: "",
  companyName: "",
  companyAddress: "",
  country: "India",
  state: "",
  stateCode: "",
  city: "",
  zip: "",
  phone: "",
  notificationEmails: [],
});

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;
const formatNumber = (value) => (value === null || value === undefined ? "-" : Number(value).toLocaleString());

const parseAddons = (json) => {
  try {
    const parsed = JSON.parse(json || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const nextRenewalDate = (isoDate) => {
  const date = new Date(isoDate || Date.now());
  const renewal = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()));
  return renewal;
};

const nextMonthRange = (isoDate) => {
  const date = new Date(isoDate);
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 2, 0));
  const toIso = (d) => d.toISOString().slice(0, 10);
  return `${toIso(start)} - ${toIso(end)}`;
};

const buildTicketFromLog = (log) => {
  const changedOn = new Date(log.changedOn);
  const dateLabel = changedOn.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });

  switch (log.action) {
    case "Plan Created":
      return { date: dateLabel, type: "Plan Created", description: `Initial subscription setup, Plan : ${log.toPlanName} Plan`, status: "Completed" };
    case "Plan Changed": {
      const isDowngrade = Number(log.toPrice) < Number(log.fromPrice);
      return {
        date: dateLabel,
        type: isDowngrade ? "Plan Downgrade" : "Plan Upgrade",
        description: `Billing Plan Changed For Next Month (${nextMonthRange(log.changedOn)}), Plan : ${log.toPlanName} Plan`,
        status: "Completed",
      };
    }
    case "Addons Updated":
      return { date: dateLabel, type: "Addon Update", description: `Addons updated for ${log.toPlanName} Plan`, status: "Completed" };
    case "Subscription Cancelled":
      return { date: dateLabel, type: "Subscription Cancelled", description: `Subscription cancelled, Plan : ${log.fromPlanName} Plan`, status: "Completed" };
    default:
      return null;
  }
};

export default function BillingOverviewPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showBankModal, setShowBankModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [usage, setUsage] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);

  const [billingProfile, setBillingProfile] = useState(buildEmptyBillingProfile);
  const [billingProfileSaving, setBillingProfileSaving] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch(SUBSCRIPTION_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load subscription");
      setSubscription(await response.json());
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      setInvoicesLoading(true);
      const response = await fetch(INVOICES_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load invoices");
      const data = await response.json();
      setInvoices(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setInvoices([]);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      setTicketsLoading(true);
      const response = await fetch(PLAN_HISTORY_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load billing tickets");
      const data = await response.json();
      const logs = Array.isArray(data) ? data : data.items || data.data || [];
      setTickets(logs.map(buildTicketFromLog).filter(Boolean));
    } catch {
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  const loadUsage = async () => {
    try {
      setUsageLoading(true);
      const response = await fetch(`${SUBSCRIPTION_API}/usage`, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load usage");
      setUsage(await response.json());
    } catch {
      setUsage(null);
    } finally {
      setUsageLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
    loadInvoices();
    loadUsage();
  }, []);

  useEffect(() => {
    if (!subscription) return;
    setBillingProfile({
      gstVatNumber: subscription.gstVatNumber || "",
      taxNumberPan: subscription.taxNumberPan || "",
      companyName: subscription.companyName || "",
      companyAddress: subscription.companyAddress || "",
      country: subscription.country || "India",
      state: subscription.state || "",
      stateCode: subscription.stateCode || "",
      city: subscription.city || "",
      zip: subscription.zip || "",
      phone: subscription.phone || "",
      notificationEmails: (subscription.notificationEmails || "").split(",").filter(Boolean),
    });
  }, [subscription]);

  useEffect(() => {
    if (activeTab === "Tickets") loadTickets();
  }, [activeTab]);

  const updateBillingProfile = (field, value) => setBillingProfile((current) => ({ ...current, [field]: value }));

  const addNotificationEmail = () => {
    const value = emailInput.trim();
    if (!value) return;
    setBillingProfile((current) => (current.notificationEmails.includes(value) ? current : { ...current, notificationEmails: [...current.notificationEmails, value] }));
    setEmailInput("");
  };

  const removeNotificationEmail = (email) => {
    setBillingProfile((current) => ({ ...current, notificationEmails: current.notificationEmails.filter((item) => item !== email) }));
  };

  const submitBillingProfile = async () => {
    try {
      setBillingProfileSaving(true);
      const response = await fetch(`${SUBSCRIPTION_API}/billing-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({
          gstVatNumber: billingProfile.gstVatNumber.trim() || null,
          taxNumberPan: billingProfile.taxNumberPan.trim() || null,
          companyName: billingProfile.companyName.trim() || null,
          companyAddress: billingProfile.companyAddress.trim() || null,
          country: billingProfile.country || null,
          state: billingProfile.state || null,
          stateCode: billingProfile.stateCode.trim() || null,
          city: billingProfile.city.trim() || null,
          zip: billingProfile.zip.trim() || null,
          phone: billingProfile.phone.trim() || null,
          notificationEmails: billingProfile.notificationEmails.join(","),
        }),
      });
      if (!response.ok) throw new Error("Unable to save billing profile");
      await loadSubscription();
      alert("Billing profile saved.");
    } catch {
      alert("Unable to save the billing profile. Please check the API and try again.");
    } finally {
      setBillingProfileSaving(false);
    }
  };

  const markInvoicePaid = async (id) => {
    try {
      const response = await fetch(`${INVOICES_API}/${id}/mark-paid`, { method: "POST", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to mark invoice as paid");
      await loadInvoices();
    } catch {
      alert("Unable to mark the invoice as paid. Please check the API and try again.");
    }
  };

  const cancelSubscription = async () => {
    if (!window.confirm("Cancel your subscription? This will not delete your data, but your plan will be marked Cancelled.")) return;
    try {
      const response = await fetch(`${SUBSCRIPTION_API}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(null),
      });
      if (!response.ok) throw new Error("Unable to cancel subscription");
      await loadSubscription();
    } catch {
      alert("Unable to cancel the subscription. Please check the API and try again.");
    }
  };

  const addons = subscription ? parseAddons(subscription.addonsJson) : [];
  const dueInvoices = invoices.filter((invoice) => invoice.status === "Due");
  const amountDue = dueInvoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="bo-page">
          <div className="bo-header">
            <div>
              <h1><span aria-hidden="true">💲</span> Billing</h1>
              <p className="bo-subtitle">Pay invoices and manage your plan and billing profile</p>
            </div>
            <div className="bo-tabs">
              {OVERVIEW_TABS.map((tab) => (
                <button
                  type="button"
                  key={tab.label}
                  className={`bo-tab-btn ${activeTab === tab.label ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.label)}
                >
                  <span aria-hidden="true">{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "Overview" && (
            <>
              {loading && <p className="billing-loading">Loading billing overview…</p>}
              {!loading && !subscription && <p className="billing-loading">Unable to load subscription. Please check the API and try again.</p>}
              {!loading && subscription && (
                <>
                  <div className="bo-top-cards">
                    <div className="bo-card">
                      <div className="bo-card-label"><span aria-hidden="true">📋</span> AMOUNT DUE</div>
                      <div className="bo-card-value">{formatMoney(amountDue)}</div>
                      <div className="bo-card-hint">{dueInvoices.length === 0 ? "All invoices paid" : `${dueInvoices.length} invoice(s) due`}</div>
                    </div>

                    <div className="bo-card">
                      <div className="bo-card-label"><span aria-hidden="true">📆</span> CURRENT PLAN
                        <span className={`bo-plan-badge ${subscription.status === "Cancelled" ? "cancelled" : ""}`}>{subscription.status?.toUpperCase()}</span>
                      </div>
                      <div className="bo-card-value">{subscription.planName}</div>
                      <div className="bo-card-hint">{formatMoney(subscription.planPriceMonthly)} Monthly · renews {formatDate(nextRenewalDate(subscription.modifiedOn || subscription.createdOn))}</div>
                      <button type="button" className="bo-card-btn" onClick={() => setShowChangePlanModal(true)}>Select Plan</button>
                    </div>

                    <div className="bo-card">
                      <div className="bo-card-label"><span aria-hidden="true">🎫</span> ADDONS</div>
                      <div className="bo-card-value">{addons.length} active</div>
                      <div className="bo-card-addon-list">
                        {addons.map((addon) => (
                          <div key={addon.name} className="bo-card-addon-item">{addon.name} {addon.quantity}</div>
                        ))}
                      </div>
                      <button type="button" className="bo-card-btn outline" onClick={() => setShowAddonsModal(true)}>Manage Addons</button>
                    </div>

                    <div className="bo-card">
                      <div className="bo-card-label"><span aria-hidden="true">🏦</span> BANK TRANSFER</div>
                      <div className="bo-card-value">NEFT / RTGS</div>
                      <div className="bo-card-hint">Pay by bank transfer</div>
                      <button type="button" className="bo-card-btn outline" onClick={() => setShowBankModal(true)}>View Details</button>
                    </div>
                  </div>

                  <section className="bo-section">
                    <h3 className="bo-section-title">Usage · this month</h3>
                    {usageLoading && <p className="billing-loading">Loading usage…</p>}
                    {!usageLoading && !usage && <p className="billing-loading">Unable to load usage. Please check the API and try again.</p>}
                    {!usageLoading && usage && (
                      <div className="bo-usage-row">
                        <div className="bo-usage-card">
                          <div className="bo-usage-label"><span aria-hidden="true">📶</span> Impressions</div>
                          <div className="bo-usage-value">{formatNumber(usage.impressionsUsed)} used / out of {formatNumber(usage.impressionsLimit)}</div>
                          <div className="bo-usage-bar"><div style={{ width: `${Math.min(100, (usage.impressionsUsed / (usage.impressionsLimit || 1)) * 100)}%` }} /></div>
                        </div>
                        <div className="bo-usage-card">
                          <div className="bo-usage-label"><span aria-hidden="true">👆</span> Clicks</div>
                          <div className="bo-usage-value">{formatNumber(usage.clicksUsed)} used / out of {usage.clicksUnlimited ? "Unlimited" : formatNumber(usage.clicksLimit)}</div>
                          <div className="bo-usage-bar"><div style={{ width: usage.clicksUnlimited ? "2%" : `${Math.min(100, (usage.clicksUsed / (usage.clicksLimit || 1)) * 100)}%` }} /></div>
                        </div>
                        <div className="bo-usage-card">
                          <div className="bo-usage-label"><span aria-hidden="true">🎯</span> Conversions</div>
                          <div className="bo-usage-value">{formatNumber(usage.conversionsUsed)} used / out of {formatNumber(usage.conversionsLimit)}</div>
                          <div className="bo-usage-bar"><div style={{ width: `${Math.min(100, (usage.conversionsUsed / (usage.conversionsLimit || 1)) * 100)}%` }} /></div>
                        </div>
                      </div>
                    )}
                  </section>

                  <div className="bo-bottom-grid">
                    <section className="bo-panel">
                      <h3 className="bo-section-title">Billing Invoices</h3>
                      <div className="billing-table-scroll">
                        <table className="billing-flat-table">
                          <thead>
                            <tr>
                              <th>Type</th><th>Invoice</th><th>Invoice Date</th><th>Status</th><th>Amount</th><th>Payment Date</th><th>Payment</th><th>Options</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoicesLoading && <tr><td colSpan="8" className="billing-loading">Loading invoices…</td></tr>}
                            {!invoicesLoading && invoices.length === 0 && (
                              <tr>
                                <td colSpan="8">
                                  <div className="bo-empty-state">
                                    <span aria-hidden="true" className="bo-empty-icon">📦</span>
                                    <div className="bo-empty-title">Nothing here yet</div>
                                    <div className="bo-empty-subtitle">There's nothing to show here right now.</div>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {!invoicesLoading && invoices.map((invoice) => (
                              <tr key={invoice.id}>
                                <td>{invoice.type}</td>
                                <td>{invoice.invoiceNumber}</td>
                                <td>{formatDate(invoice.invoiceDate)}</td>
                                <td><span className={`billing-status-pill ${invoice.status.toLowerCase()}`}>{invoice.status}</span></td>
                                <td>{formatMoney(invoice.amount)}</td>
                                <td>{invoice.paymentDate ? formatDate(invoice.paymentDate) : "-"}</td>
                                <td>{invoice.paymentMethod || "-"}</td>
                                <td>
                                  {invoice.status === "Due" ? (
                                    <button type="button" className="billing-outline-btn" onClick={() => markInvoicePaid(invoice.id)}>Mark as Paid</button>
                                  ) : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    <section className="bo-panel">
                      <h3 className="bo-section-title">Addon Services</h3>
                      <table className="billing-flat-table">
                        <thead>
                          <tr><th>Service Name</th><th>Run xTimes</th><th>Units Used</th></tr>
                        </thead>
                        <tbody>
                          {(!usage || usage.addonUsage.length === 0) && <tr><td colSpan="3" className="billing-loading">No addon usage this month.</td></tr>}
                          {usage?.addonUsage.map((addon) => (
                            <tr key={addon.serviceName}>
                              <td>{addon.serviceName}</td>
                              <td>{addon.runTimes}</td>
                              <td>{addon.unitsUsed}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </section>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === "Subscription Plan" && (
            <section className="billing-card">
              <div className="billing-content">
                {loading && <p className="billing-loading">Loading subscription…</p>}
                {!loading && !subscription && <p className="billing-loading">Unable to load subscription. Please check the API and try again.</p>}
                {!loading && subscription && (
                  <div className="billing-plan-card">
                    <span className={`billing-current-plan-badge ${subscription.status === "Cancelled" ? "cancelled" : ""}`}>
                      <span aria-hidden="true">🛒</span> {subscription.status === "Cancelled" ? "Cancelled Plan" : "Current Plan"}
                    </span>

                    <div className="billing-plan-title-row">
                      <h2>{subscription.planName}</h2>
                      <span className="billing-plan-price">{formatMoney(subscription.planPriceMonthly)} Monthly</span>
                    </div>
                    <p className="billing-plan-type">({subscription.planType})</p>
                    <p className="billing-plan-description">{subscription.planDescription}</p>

                    <hr className="billing-divider" />

                    <div className="billing-section-header">
                      <h3><span aria-hidden="true">🎫</span> Plan Benefits</h3>
                      <button type="button" className="billing-outline-btn" onClick={() => setShowHistoryModal(true)}>Plan History</button>
                    </div>
                    <div className="billing-benefit-row">Conversions : {formatNumber(subscription.conversionsLimit)}</div>
                    <div className="billing-benefit-row">Clicks : {subscription.clicksUnlimited ? <>Unlimited <span aria-hidden="true">✅</span></> : formatNumber(subscription.clicksLimit)}</div>
                    <div className="billing-benefit-row">Impressions : {formatNumber(subscription.impressionsLimit)}</div>

                    <hr className="billing-divider" />

                    <div className="billing-section-header">
                      <h3><span aria-hidden="true">🎫</span> Addons</h3>
                      <button type="button" className="billing-outline-btn" onClick={() => setShowAddonsModal(true)}>Manage Addons</button>
                    </div>
                    {addons.length === 0 && <p className="billing-no-addons">No addons yet.</p>}
                    {addons.map((addon) => (
                      <div className="billing-addon-row" key={addon.name}>
                        <span>{addon.name} {addon.quantity}</span>
                        <span>{formatMoney(addon.priceMonthly)} (Monthly)</span>
                      </div>
                    ))}

                    <hr className="billing-divider" />

                    <div className="billing-plan-footer">
                      <button type="button" className="billing-cancel-link" onClick={cancelSubscription} disabled={subscription.status === "Cancelled"}>
                        {subscription.status === "Cancelled" ? "Subscription Cancelled" : "Cancel Subscription"}
                      </button>
                      <button type="button" className="billing-change-plan-btn" onClick={() => setShowChangePlanModal(true)}>Change Plan</button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "Billing Profile" && (
            <section className="billing-card">
              <div className="billing-content">
                <div className="billing-profile-form">
                  <h3 className="billing-profile-section-title">Tax Details</h3>
                  <div className="billing-profile-field">
                    <label>GST / VAT Number</label>
                    <input value={billingProfile.gstVatNumber} onChange={(event) => updateBillingProfile("gstVatNumber", event.target.value)} />
                    <small className="billing-profile-hint">Changes in GST, <span>Only Applicable on Future Invoices.</span></small>
                  </div>
                  <div className="billing-profile-field">
                    <label>Tax Number (PAN)</label>
                    <input value={billingProfile.taxNumberPan} onChange={(event) => updateBillingProfile("taxNumberPan", event.target.value)} />
                  </div>

                  <h3 className="billing-profile-section-title">Company Details</h3>
                  <div className="billing-profile-field">
                    <label>Company Name</label>
                    <input value={billingProfile.companyName} onChange={(event) => updateBillingProfile("companyName", event.target.value)} />
                  </div>
                  <div className="billing-profile-field">
                    <label>Address</label>
                    <input value={billingProfile.companyAddress} onChange={(event) => updateBillingProfile("companyAddress", event.target.value)} />
                  </div>
                  <div className="billing-profile-field">
                    <label>Country</label>
                    <select value={billingProfile.country} onChange={(event) => updateBillingProfile("country", event.target.value)}>
                      {COUNTRY_OPTIONS.map((country) => <option key={country}>{country}</option>)}
                    </select>
                  </div>
                  <div className="billing-profile-field billing-profile-split">
                    <div>
                      <label>State</label>
                      <select
                        value={billingProfile.state}
                        onChange={(event) => {
                          const state = INDIA_STATES.find((item) => item.name === event.target.value);
                          updateBillingProfile("state", event.target.value);
                          updateBillingProfile("stateCode", state ? state.code : billingProfile.stateCode);
                        }}
                      >
                        <option value="">Select State</option>
                        {INDIA_STATES.map((state) => <option key={state.name} value={state.name}>{state.name}</option>)}
                      </select>
                    </div>
                    <input placeholder="State Code 08" value={billingProfile.stateCode} onChange={(event) => updateBillingProfile("stateCode", event.target.value)} />
                  </div>
                  <div className="billing-profile-field">
                    <label>City</label>
                    <input placeholder="Select City" value={billingProfile.city} onChange={(event) => updateBillingProfile("city", event.target.value)} />
                  </div>
                  <div className="billing-profile-field">
                    <label>ZIP</label>
                    <input placeholder="Select ZIP / PIN" value={billingProfile.zip} onChange={(event) => updateBillingProfile("zip", event.target.value)} />
                  </div>
                  <div className="billing-profile-field">
                    <label>Phone</label>
                    <input value={billingProfile.phone} onChange={(event) => updateBillingProfile("phone", event.target.value)} />
                  </div>

                  <h3 className="billing-profile-section-title">Notifications</h3>
                  <div className="billing-profile-field">
                    <label>Email</label>
                    <div className="billing-profile-chip-field">
                      {billingProfile.notificationEmails.map((email) => (
                        <span className="billing-profile-chip" key={email}>
                          {email}
                          <button type="button" onClick={() => removeNotificationEmail(email)} aria-label={`Remove ${email}`}>×</button>
                        </span>
                      ))}
                      <input
                        placeholder="billing@example.com"
                        value={emailInput}
                        onChange={(event) => setEmailInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === ",") {
                            event.preventDefault();
                            addNotificationEmail();
                          }
                        }}
                        onBlur={addNotificationEmail}
                      />
                    </div>
                  </div>

                  <button type="button" className="billing-change-plan-btn" onClick={submitBillingProfile} disabled={billingProfileSaving}>
                    <span aria-hidden="true">🕐</span> {billingProfileSaving ? "Saving…" : "Submit"}
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === "Tickets" && (
            <section className="billing-card">
              <div className="billing-content">
                <div className="billing-table-scroll">
                  <table className="billing-flat-table">
                    <thead>
                      <tr><th>Date</th><th>Type</th><th>Description</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {ticketsLoading && <tr><td colSpan="4" className="billing-loading">Loading tickets…</td></tr>}
                      {!ticketsLoading && tickets.length === 0 && <tr><td colSpan="4" className="billing-loading">No tickets yet.</td></tr>}
                      {!ticketsLoading && tickets.map((ticket, index) => (
                        <tr key={index}>
                          <td>{ticket.date}</td>
                          <td className="billing-ticket-type">{ticket.type}</td>
                          <td>{ticket.description}</td>
                          <td><span className="billing-status-pill completed">{ticket.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {showBankModal && (
        <BankDetailsModal subscription={subscription} onClose={() => setShowBankModal(false)} onSaved={loadSubscription} />
      )}
      {showChangePlanModal && (
        <ChangePlanModal onClose={() => setShowChangePlanModal(false)} onChanged={loadSubscription} />
      )}
      {showAddonsModal && (
        <ManageAddonsModal currentAddons={addons} onClose={() => setShowAddonsModal(false)} onChanged={loadSubscription} />
      )}
      {showHistoryModal && (
        <PlanHistoryModal onClose={() => setShowHistoryModal(false)} />
      )}
    </div>
  );
}

function BankDetailsModal({ subscription, onClose, onSaved }) {
  const [form, setForm] = useState({
    bankName: subscription?.bankName || "",
    bankAccountHolder: subscription?.bankAccountHolder || "",
    bankAccountNumber: subscription?.bankAccountNumber || "",
    bankIfscSwift: subscription?.bankIfscSwift || "",
  });
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${SUBSCRIPTION_API}/bank-details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error("Unable to save bank details");
      await onSaved();
      onClose();
    } catch {
      alert("Unable to save bank details. Please check the API and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="billing-modal" onClick={(event) => event.stopPropagation()}>
        <div className="billing-modal-header">
          <h2><span aria-hidden="true">💲</span> Bank Transfer ( NEFT/RTGS ) Details</h2>
          <button type="button" onClick={onClose}>✕</button>
        </div>
        <div className="billing-modal-body">
          <div className="billing-field">
            <label>Bank Name</label>
            <input value={form.bankName} onChange={(event) => updateField("bankName", event.target.value)} />
          </div>
          <div className="billing-field">
            <label>Account Holder</label>
            <input value={form.bankAccountHolder} onChange={(event) => updateField("bankAccountHolder", event.target.value)} />
          </div>
          <div className="billing-field">
            <label>Account Number</label>
            <input value={form.bankAccountNumber} onChange={(event) => updateField("bankAccountNumber", event.target.value)} />
          </div>
          <div className="billing-field">
            <label>IFSC / SWIFT Code</label>
            <input value={form.bankIfscSwift} onChange={(event) => updateField("bankIfscSwift", event.target.value)} />
          </div>
          <div className="billing-modal-footer">
            <button type="button" className="billing-change-plan-btn" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChangePlanModal({ onClose, onChanged }) {
  const [selectedPlan, setSelectedPlan] = useState(PLAN_OPTIONS[1].name);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const plan = PLAN_OPTIONS.find((item) => item.name === selectedPlan);
    try {
      setSaving(true);
      const response = await fetch(`${SUBSCRIPTION_API}/change-plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({
          planName: plan.name,
          planPriceMonthly: plan.price,
          planType: plan.type,
          planDescription: plan.description,
          conversionsLimit: plan.conversions,
          clicksUnlimited: plan.clicksUnlimited,
          impressionsLimit: plan.impressions,
        }),
      });
      if (!response.ok) throw new Error("Unable to change plan");
      await onChanged();
      onClose();
    } catch {
      alert("Unable to change the plan. Please check the API and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="billing-modal" onClick={(event) => event.stopPropagation()}>
        <div className="billing-modal-header">
          <h2><span aria-hidden="true">🎫</span> Change Plan</h2>
          <button type="button" onClick={onClose}>✕</button>
        </div>
        <div className="billing-modal-body">
          {PLAN_OPTIONS.map((plan) => (
            <label className={`billing-plan-option ${selectedPlan === plan.name ? "selected" : ""}`} key={plan.name}>
              <input type="radio" name="plan" checked={selectedPlan === plan.name} onChange={() => setSelectedPlan(plan.name)} />
              <div>
                <strong>{plan.name}</strong> — {formatMoney(plan.price)} Monthly
                <p>Conversions: {formatNumber(plan.conversions)} · Clicks: {plan.clicksUnlimited ? "Unlimited" : formatNumber(plan.clicks)} · Impressions: {formatNumber(plan.impressions)}</p>
              </div>
            </label>
          ))}
          <div className="billing-modal-footer">
            <button type="button" className="billing-change-plan-btn" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Change Plan"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ManageAddonsModal({ currentAddons, onClose, onChanged }) {
  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(AVAILABLE_ADDONS.map((addon) => [addon.key, currentAddons.find((item) => item.name === addon.label)?.quantity || 0]))
  );
  const [saving, setSaving] = useState(false);

  const updateQuantity = (key, value) => setQuantities((current) => ({ ...current, [key]: Math.max(0, Number(value) || 0) }));

  const submit = async () => {
    const addons = AVAILABLE_ADDONS
      .filter((addon) => quantities[addon.key] > 0)
      .map((addon) => ({ name: addon.label, quantity: quantities[addon.key], priceMonthly: addon.priceMonthly * quantities[addon.key] }));

    try {
      setSaving(true);
      const response = await fetch(`${SUBSCRIPTION_API}/addons`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({ addonsJson: JSON.stringify(addons) }),
      });
      if (!response.ok) throw new Error("Unable to update addons");
      await onChanged();
      onClose();
    } catch {
      alert("Unable to update addons. Please check the API and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="billing-modal" onClick={(event) => event.stopPropagation()}>
        <div className="billing-modal-header">
          <h2><span aria-hidden="true">🎫</span> Manage Addons</h2>
          <button type="button" onClick={onClose}>✕</button>
        </div>
        <div className="billing-modal-body">
          {AVAILABLE_ADDONS.map((addon) => (
            <div className="billing-addon-field" key={addon.key}>
              <label>{addon.label} <small>({formatMoney(addon.priceMonthly)} / unit / month)</small></label>
              <input type="number" min="0" value={quantities[addon.key]} onChange={(event) => updateQuantity(addon.key, event.target.value)} />
            </div>
          ))}
          <div className="billing-modal-footer">
            <button type="button" className="billing-change-plan-btn" onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save Addons"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanHistoryModal({ onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const loadLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(PLAN_HISTORY_API, { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load plan history");
        const data = await response.json();
        setLogs(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setLogs([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadLogs();
    return () => controller.abort();
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="billing-modal billing-history-modal" onClick={(event) => event.stopPropagation()}>
        <div className="billing-modal-header">
          <h2><span aria-hidden="true">🕐</span> Plan History</h2>
          <button type="button" onClick={onClose}>✕</button>
        </div>
        <div className="billing-modal-body">
          <table className="billing-history-table">
            <thead>
              <tr><th>Action</th><th>From</th><th>To</th><th>Date</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="4" className="billing-loading">Loading…</td></tr>}
              {!loading && logs.length === 0 && <tr><td colSpan="4" className="billing-loading">No history yet.</td></tr>}
              {!loading && logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.action}</td>
                  <td>{log.fromPlanName ? `${log.fromPlanName} (${formatMoney(log.fromPrice)})` : "-"}</td>
                  <td>{log.toPlanName ? `${log.toPlanName} (${formatMoney(log.toPrice)})` : "-"}</td>
                  <td>{new Date(log.changedOn).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
