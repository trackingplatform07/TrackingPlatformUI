import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/Modal.css";
import "../css/BillingPage.css";

const SUBSCRIPTION_API = "https://localhost:7150/api/BillingSubscriptions";
const PLAN_HISTORY_API = "https://localhost:7150/api/BillingPlanHistoryLogs";

const BILLING_TABS = ["Invoices", "Tickets", "Subscription Plan", "Billing Profile", "Usage"];

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

export default function BillingPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Subscription Plan");

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showBankModal, setShowBankModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch(SUBSCRIPTION_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load subscription");
      const data = await response.json();
      setSubscription(data);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

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

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="billing-page">
          <div className="billing-header">
            <h1><span aria-hidden="true">💲</span> Billing</h1>
            <button type="button" className="billing-bank-btn" onClick={() => setShowBankModal(true)}>
              <span aria-hidden="true">💲</span> Bank Transfer ( NEFT/RTGS ) Details
            </button>
          </div>

          <section className="billing-card">
            <div className="billing-tabs">
              {BILLING_TABS.map((tab) => (
                <button
                  type="button"
                  key={tab}
                  className={`billing-tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="billing-content">
              {activeTab === "Subscription Plan" && (
                <>
                  {loading && <p className="billing-loading">Loading subscription…</p>}
                  {!loading && !subscription && <p className="billing-loading">Unable to load subscription. Please check the API and try again.</p>}
                  {!loading && subscription && (
                    <div className="billing-plan-card">
                      <span className={`billing-current-plan-badge ${subscription.status === "Cancelled" ? "cancelled" : ""}`}>
                        <span aria-hidden="true">🏆</span> {subscription.status === "Cancelled" ? "Cancelled Plan" : "Current Plan"}
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
                </>
              )}

              {activeTab !== "Subscription Plan" && (
                <p className="billing-loading">This section is not available yet.</p>
              )}
            </div>
          </section>
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
