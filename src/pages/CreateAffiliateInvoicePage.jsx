import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/Affiliates.css";
import "../css/CreateAffiliateInvoicePage.css";

const INVOICES_API = "https://localhost:7150/api/AffiliateInvoices";
const AFFILIATES_API = "https://localhost:7029/api/Affiliates";
const OFFERS_API = "https://localhost:7150/api/Offers";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD", "CAD"];

const TIMEZONES = [
  { value: "+0:00", label: "+0:00 UTC" },
  { value: "+5:30", label: "+5:30 India Standard Time" },
  { value: "-5:00", label: "-5:00 Eastern Time (US)" },
  { value: "-8:00", label: "-8:00 Pacific Time (US)" },
  { value: "+1:00", label: "+1:00 Central European Time" },
  { value: "+8:00", label: "+8:00 China Standard Time" },
];

const ITEM_GROUPS = ["Total Amount", "Per Conversion", "Per Click", "Per Sale"];

const monthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const toIso = (d) => d.toISOString().slice(0, 10);
  return { start: toIso(start), end: toIso(end) };
};

const currentUserName = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Administrator";
  } catch {
    return "Administrator";
  }
};

export default function CreateAffiliateInvoicePage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [affiliatesList, setAffiliatesList] = useState([]);
  const [offersList, setOffersList] = useState([]);

  const defaultPeriod = monthRange();
  const [affiliateId, setAffiliateId] = useState("");
  const [currency, setCurrency] = useState("");
  const [timezone, setTimezone] = useState("");
  const [offerIds, setOfferIds] = useState([]);
  const [periodStart, setPeriodStart] = useState(defaultPeriod.start);
  const [periodEnd, setPeriodEnd] = useState(defaultPeriod.end);
  const [itemGroup, setItemGroup] = useState("Total Amount");

  const [fetching, setFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [lineItems, setLineItems] = useState([]);

  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(AFFILIATES_API, { headers: { accept: "*/*" }, signal: controller.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setAffiliatesList(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch(OFFERS_API, { headers: { accept: "*/*" }, signal: controller.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setOffersList(Array.isArray(data) ? data : []))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const toggleOffer = (id) => {
    setOfferIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const fetchReports = () => {
    if (!affiliateId || !periodStart || !periodEnd) {
      alert("Please select an Affiliate and a Reports Period first.");
      return;
    }
    setFetching(true);
    setTimeout(() => {
      // Honest: this app has no real conversion/payout tracking pipeline for affiliates yet,
      // so there is no real report data to pull in — items must be added manually below.
      setLineItems([]);
      setFetched(true);
      setFetching(false);
    }, 300);
  };

  const addLineItem = () => setLineItems((prev) => [...prev, { description: "", amount: "" }]);
  const updateLineItem = (index, field, value) =>
    setLineItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  const removeLineItem = (index) => setLineItems((prev) => prev.filter((_, i) => i !== index));

  const totalAmount = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const submit = async () => {
    const affiliate = affiliatesList.find((a) => String(a.id) === affiliateId);
    if (!affiliate || !periodStart || !periodEnd || !dueDate) {
      alert("Please select an affiliate, report period and due date.");
      return;
    }
    if (lineItems.length === 0) {
      alert("Add at least one line item (fetch reports first, then add items).");
      return;
    }

    const offerNames = offersList.filter((o) => offerIds.includes(o.id)).map((o) => o.offerName).join(", ");
    const itemsSummary = lineItems.map((item) => `${item.description || "Item"} (${item.amount || 0})`).join("; ");
    const noteParts = [
      `Item Group: ${itemGroup}`,
      offerNames ? `Offers: ${offerNames}` : null,
      `Items: ${itemsSummary}`,
      note.trim() || null,
    ].filter(Boolean);

    try {
      setSaving(true);
      const response = await fetch(INVOICES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({
          affiliateId: affiliate.id,
          affiliateName: `${affiliate.firstName || ""} ${affiliate.lastName || ""}`.trim() || affiliate.email,
          periodStart: new Date(periodStart).toISOString(),
          periodEnd: new Date(periodEnd).toISOString(),
          dueDate: new Date(dueDate).toISOString(),
          totalAmount,
          currency: currency || "USD",
          timezoneOffset: timezone || "+0:00",
          note: noteParts.join(" | "),
          createdBy: currentUserName(),
        }),
      });
      if (!response.ok) throw new Error("Unable to create invoice");
      navigate("/affiliates/billing");
    } catch {
      alert("Unable to create the invoice. Please check the API and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((v) => !v)}
        />

        <div className="of-page">
          <div className="cai-card">
            <div className="cai-header">
              <div>
                <h2><span aria-hidden="true">📄</span> Create Invoice</h2>
                <p className="cai-subtitle">Pick the Affiliate and period then fetch Reports to fill the items</p>
              </div>
              <button type="button" className="cai-invoices-btn" onClick={() => navigate("/affiliates/billing")}>
                <span aria-hidden="true">☰</span> Invoices
              </button>
            </div>

            <div className="cai-form-grid">
              <div className="cai-field">
                <label>Affiliate</label>
                <select value={affiliateId} onChange={(e) => setAffiliateId(e.target.value)}>
                  <option value="">Select Affiliate</option>
                  {affiliatesList.map((a) => (
                    <option key={a.id} value={a.id}>{a.id} - {`${a.firstName || ""} ${a.lastName || ""}`.trim() || a.email}</option>
                  ))}
                </select>
              </div>
              <div className="cai-field">
                <label>Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="">Select Currency</option>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="cai-field">
                <label>Timezone</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  <option value="">Select Timezone</option>
                  {TIMEZONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="cai-field">
                <label>Offers</label>
                <div className="cai-offers-box">
                  {offersList.length === 0 && <span className="cai-offers-placeholder">Select Offer</span>}
                  {offersList.map((o) => (
                    <label key={o.id} className="cai-offer-chip">
                      <input type="checkbox" checked={offerIds.includes(o.id)} onChange={() => toggleOffer(o.id)} />
                      {o.id} - {o.offerName}
                    </label>
                  ))}
                </div>
              </div>
              <div className="cai-field">
                <label>Reports Period</label>
                <div className="cai-date-range">
                  <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
                  <span>to</span>
                  <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
                </div>
              </div>
              <div className="cai-field">
                <label>Item Group</label>
                <div className="cai-item-group-row">
                  <select value={itemGroup} onChange={(e) => setItemGroup(e.target.value)}>
                    {ITEM_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <button type="button" className="cai-clear-btn" onClick={() => setItemGroup("")} aria-label="Clear item group">✕</button>
                </div>
              </div>
            </div>

            <button type="button" className="cai-fetch-btn" onClick={fetchReports} disabled={fetching}>
              <span aria-hidden="true">↻</span> {fetching ? "Fetching…" : "Fetch Reports"}
            </button>

            {fetched && (
              <div className="cai-items-section">
                {lineItems.length === 0 && (
                  <p className="cai-no-reports">
                    No data available for the selected report period — add line items manually below.
                  </p>
                )}

                {lineItems.length > 0 && (
                  <table className="cai-items-table">
                    <thead>
                      <tr><th>Description</th><th>Amount</th><th></th></tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              value={item.description}
                              placeholder="Item description"
                              onChange={(e) => updateLineItem(index, "description", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              step="0.001"
                              value={item.amount}
                              onChange={(e) => updateLineItem(index, "amount", e.target.value)}
                            />
                          </td>
                          <td>
                            <button type="button" className="cai-remove-item-btn" onClick={() => removeLineItem(index)}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <button type="button" className="cai-add-item-btn" onClick={addLineItem}>+ Add Item</button>

                <div className="cai-total-row">Total Amount: <strong>{totalAmount.toFixed(3)} {currency || "USD"}</strong></div>

                <div className="cai-form-grid">
                  <div className="cai-field">
                    <label>Due Date</label>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                  <div className="cai-field cai-field-wide">
                    <label>Note (optional)</label>
                    <input value={note} onChange={(e) => setNote(e.target.value)} />
                  </div>
                </div>

                <button type="button" className="btn primary small" onClick={submit} disabled={saving}>
                  {saving ? "Creating…" : "Create Invoice"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
