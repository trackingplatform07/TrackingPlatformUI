import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/Modal.css";
import "../css/CreateOfferPage.css";
import "../css/AutomationPage.css";

const AUTOMATION_RULES_API = "https://localhost:7150/api/AutomationRules";
const AUTOMATION_LOGS_API = "https://localhost:7150/api/AutomationLogs";
const OFFERS_API = "https://localhost:7150/api/Offers";
const ADVERTISERS_API = "https://localhost:7129/api/Advertisers";

const advertiserName = (advertiser) =>
  [advertiser.firstName, advertiser.lastName].filter(Boolean).join(" ") || advertiser.companyName || "Unnamed Advertiser";

const buildEmptyForm = () => ({
  ruleName: "",
  status: "Active",
  blockLevel: "Offer Level",
  advertiserId: "",
  advertiser: "",
  offers: [],
  conversion: "",
  clicks: "",
  impressions: "",
  field: "CR",
  compareType: "< Minimum Value",
  minValue: "0",
  maxValue: "",
  reportStatus: "",
  dataLookBack: "1 Hour",
  schedule: "10 Mint",
  dateStart: new Date().toISOString().slice(0, 10),
  dateEnd: new Date(Date.now() + 61 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  whitelistOffers: "",
  resumeAfter: "1 Hour",
  alertEnabled: false,
});

const toUtcIsoString = (value) => (value ? new Date(`${value}T00:00:00`).toISOString() : null);

export default function AutomationPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [view, setView] = useState("list");
  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [ruleError, setRuleError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [advertisers, setAdvertisers] = useState([]);
  const [advertisersLoading, setAdvertisersLoading] = useState(true);
  const [selectedOfferToAdd, setSelectedOfferToAdd] = useState("");

  const [form, setForm] = useState(buildEmptyForm);
  const [showLogsModal, setShowLogsModal] = useState(false);

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

    const loadAdvertisers = async () => {
      try {
        setAdvertisersLoading(true);
        const response = await fetch(ADVERTISERS_API, { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load advertisers");
        const data = await response.json();
        setAdvertisers(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setAdvertisers([]);
      } finally {
        if (!controller.signal.aborted) setAdvertisersLoading(false);
      }
    };

    loadOffers();
    loadAdvertisers();
    return () => controller.abort();
  }, []);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const openCreate = () => {
    setForm(buildEmptyForm());
    setSelectedOfferToAdd("");
    setEditingId(null);
    setView("form");
    window.scrollTo(0, 0);
  };

  const addOfferChip = (offerId) => {
    setSelectedOfferToAdd("");
    if (!offerId) return;
    const offer = offers.find((item) => String(item.id) === String(offerId));
    if (!offer) return;
    setForm((current) =>
      current.offers.some((item) => String(item.id) === String(offer.id))
        ? current
        : { ...current, offers: [...current.offers, { id: offer.id, name: offer.offerName }] }
    );
  };

  const removeOfferChip = (id) => {
    setForm((current) => ({ ...current, offers: current.offers.filter((offer) => offer.id !== id) }));
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const compareSymbol = (compareType) => ((compareType || "").startsWith(">") ? ">" : (compareType || "").startsWith("=") ? "=" : "<");

  const summaryFor = (data) => `${data.field || "CR"} ${compareSymbol(data.compareType)} Min - / ${data.minValue || 0} - every ${data.schedule || "10 Mint"}`;

  const formatRelativeTime = (isoString) => {
    if (!isoString) return "";
    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
    if (diffSec < 60) return `${diffSec} second${diffSec === 1 ? "" : "s"} ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  };

  const parseOffersJson = (offersJson) => {
    try {
      const parsed = JSON.parse(offersJson || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const buildFormFromApi = (data) => ({
    ruleName: data.ruleName || "",
    status: data.status || "Active",
    blockLevel: data.blockLevel || "Offer Level",
    advertiserId: data.advertiserId || "",
    advertiser: data.advertiser || "",
    offers: parseOffersJson(data.offersJson),
    conversion: data.conversion || "",
    clicks: data.clicks || "",
    impressions: data.impressions || "",
    field: data.field || "CR",
    compareType: data.compareType || "< Minimum Value",
    minValue: data.minValue ?? "0",
    maxValue: data.maxValue || "",
    reportStatus: data.reportStatus || "",
    dataLookBack: data.dataLookBack || "1 Hour",
    schedule: data.schedule || "10 Mint",
    dateStart: data.dateStart ? data.dateStart.slice(0, 10) : new Date().toISOString().slice(0, 10),
    dateEnd: data.dateEnd ? data.dateEnd.slice(0, 10) : new Date(Date.now() + 61 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    whitelistOffers: data.whitelistOffers || "",
    resumeAfter: data.resumeAfter || "1 Hour",
    alertEnabled: Boolean(data.alertEnabled),
  });

  const buildRow = (item) => ({
    id: item.id,
    ruleName: item.ruleName,
    summary: summaryFor(item),
    blockLevel: item.blockLevel,
    field: item.field,
    status: item.status,
    lastCheck: item.lastCheck ? new Date(item.lastCheck).toLocaleString() : "-",
    lastCheckRelative: formatRelativeTime(item.lastCheck),
    alarm: item.alarm && item.alarm !== "none" ? item.alarm : "-",
    form: buildFormFromApi(item),
  });

  const loadRules = async () => {
    try {
      setRulesLoading(true);
      setRuleError("");
      const response = await fetch(AUTOMATION_RULES_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load automation rules");
      const data = await response.json();
      setRules((Array.isArray(data) ? data : data.items || data.data || []).map(buildRow));
    } catch {
      setRuleError("Unable to load automation rules. Please check the API and try again.");
    } finally {
      setRulesLoading(false);
    }
  };

  useEffect(() => {
    if (view === "list") loadRules();
  }, [view]);

  const editRule = (rule) => {
    setForm(rule.form);
    setEditingId(rule.id);
    setView("form");
    window.scrollTo(0, 0);
  };

  const deleteRule = async (id) => {
    if (!window.confirm("Delete this automation rule?")) return;
    try {
      setRuleError("");
      const response = await fetch(`${AUTOMATION_RULES_API}/${id}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to delete automation rule");
      await loadRules();
    } catch {
      setRuleError("Unable to delete the automation rule. Please check the API and try again.");
    }
  };

  const submitForm = async () => {
    if (!form.ruleName.trim()) {
      alert("Please enter a rule name.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        id: editingId || 0,
        ruleName: form.ruleName.trim(),
        status: form.status,
        blockLevel: form.blockLevel,
        advertiser: form.advertiser,
        offersJson: JSON.stringify(form.offers),
        conversion: form.conversion,
        clicks: form.clicks,
        impressions: form.impressions,
        field: form.field,
        compareType: form.compareType,
        minValue: form.minValue,
        maxValue: form.maxValue,
        reportStatus: form.reportStatus,
        dataLookBack: form.dataLookBack,
        schedule: form.schedule,
        dateStart: toUtcIsoString(form.dateStart),
        dateEnd: toUtcIsoString(form.dateEnd),
        whitelistOffers: form.whitelistOffers,
        resumeAfter: form.resumeAfter,
        alertEnabled: form.alertEnabled,
        alarm: form.alertEnabled ? "Alert" : "none",
      };

      const response = await fetch(
        editingId ? `${AUTOMATION_RULES_API}/${editingId}` : AUTOMATION_RULES_API,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", accept: "*/*" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Unable to save automation rule");
      setView("list");
      await loadRules();
    } catch {
      alert("Unable to save the automation rule. Please check the API and try again.");
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
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="automation-page">
          {view === "list" && (
            <div className="offer-form automation-tab">
              <div className="events-section-header">
                <h2><span aria-hidden="true">⚡</span> Automation</h2>
                <div className="events-section-actions">
                  <button type="button" className="events-dark-btn" onClick={openCreate}>+ Create Automation</button>
                  <button type="button" className="events-dark-btn" onClick={() => setShowLogsModal(true)}>▤ Logs</button>
                  <button type="button" className="events-dark-btn" onClick={() => alert("Rules list is already shown below.")}>☰ Rules</button>
                </div>
              </div>

              <div className="events-table-wrap">
                <table className="events-table automation-table">
                  <thead>
                    <tr><th>Rule</th><th>Block Level</th><th>Field</th><th>Status</th><th>Last Check</th><th>Alarm</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {rulesLoading && (
                      <tr><td colSpan="7" className="automation-empty-cell">Loading automation rules…</td></tr>
                    )}
                    {!rulesLoading && ruleError && (
                      <tr><td colSpan="7" className="automation-empty-cell offer-save-error">{ruleError}</td></tr>
                    )}
                    {!rulesLoading && !ruleError && rules.length === 0 && (
                      <tr><td colSpan="7" className="automation-empty-cell">No data available in table</td></tr>
                    )}
                    {!rulesLoading && rules.map((rule) => (
                      <tr key={rule.id}>
                        <td>
                          <div className="automation-rule-name-cell">
                            <span className={`automation-rule-dot ${rule.status === "Active" ? "active" : "stopped"}`} aria-hidden="true" />
                            <div>
                              <div className="automation-rule-title">#{rule.id} - {rule.ruleName}</div>
                              <div className="automation-rule-subtitle">{rule.summary}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="capping-rule-badge capping-rule-badge-type">{rule.blockLevel}</span></td>
                        <td>{rule.field}</td>
                        <td><span className={`automation-status-pill ${rule.status === "Active" ? "active" : "stopped"}`}>{rule.status === "Active" ? "✓" : "⊘"} {rule.status}</span></td>
                        <td>
                          <div>{rule.lastCheck}</div>
                          <div className="automation-rule-subtitle">{rule.lastCheckRelative}</div>
                        </td>
                        <td>{rule.alarm}</td>
                        <td className="events-table-action-cell">
                          <button type="button" title="View details" onClick={() => editRule(rule)}>▤</button>
                          <button type="button" title="Edit" onClick={() => editRule(rule)}>✎</button>
                          <button type="button" title="Delete" className="automation-delete-btn" onClick={() => deleteRule(rule.id)}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="automation-smart-offer-note">*Offer Automation currently not supported with Smart Offer.</p>
            </div>
          )}

          {view === "form" && (
            <div className="offer-form automation-tab">
              <div className="automation-header-bar">
                <h2><span aria-hidden="true">⚡</span> Automation <span className="automation-id">#{editingId || (rules.length + 1)}</span></h2>
                <div className="events-section-actions">
                  <button type="button" className="events-dark-btn" onClick={openCreate}>+ Create Automation</button>
                  <button type="button" className="events-dark-btn" onClick={() => setView("list")}>☰ Rules</button>
                </div>
              </div>

              <div className="automation-summary-badges">
                <span className="capping-rule-badge capping-rule-badge-type">🎚 {form.blockLevel}</span>
                <span className="capping-rule-badge capping-rule-badge-type">≠ {form.field}</span>
                <span className="capping-rule-badge capping-rule-badge-type">⏱ {form.schedule}</span>
                <span className={`automation-status-pill ${form.status === "Active" ? "active" : "stopped"}`}>{form.status === "Active" ? "✓" : "⊘"} {form.status}</span>
              </div>

              <div className="automation-body">
                <aside className="automation-sidebar">
                  <h3><span aria-hidden="true">☰</span> Rule Sections</h3>
                  <ul>
                    <li onClick={() => scrollToSection("automation-section-setup")}><span className="automation-section-number">1</span><div>Setup<small>Name, Status</small></div></li>
                    <li onClick={() => scrollToSection("automation-section-scope")}><span className="automation-section-number">2</span><div>Scope<small>Advertiser, Offers</small></div></li>
                    <li onClick={() => scrollToSection("automation-section-trigger")}><span className="automation-section-number">3</span><div>Trigger<small>Threshold, Compare</small></div></li>
                    <li onClick={() => scrollToSection("automation-section-schedule")}><span className="automation-section-number">4</span><div>Schedule<small>Report Status</small></div></li>
                    <li onClick={() => scrollToSection("automation-section-recovery")}><span className="automation-section-number">5</span><div>Recovery<small>Whitelist, Alert</small></div></li>
                  </ul>
                </aside>

                <div className="automation-sections">
                  <section id="automation-section-setup" className="automation-card">
                    <h4><span aria-hidden="true">☰</span> Setup <small>Rule / Status / Block Level</small></h4>
                    <div className="automation-setup-row">
                      <div className="capping-field">
                        <label><span aria-hidden="true">👤</span> Rule Name</label>
                        <input type="text" placeholder="Rule Name" value={form.ruleName} onChange={(event) => updateForm("ruleName", event.target.value)} />
                      </div>
                      <div className="capping-field">
                        <label><span aria-hidden="true">⏱</span> Status</label>
                        <div className="automation-toggle-buttons">
                          <button type="button" className={`automation-toggle-btn ${form.status === "Active" ? "active" : ""}`} onClick={() => updateForm("status", "Active")}>◉ Active<small>Running</small></button>
                          <button type="button" className={`automation-toggle-btn ${form.status === "Stopped" ? "active" : ""}`} onClick={() => updateForm("status", "Stopped")}>⊘ Stopped<small>Paused</small></button>
                        </div>
                      </div>
                    </div>

                    <div className="capping-field">
                      <label><span aria-hidden="true">🎚</span> Block Level</label>
                      <div className="automation-block-level-options">
                        {["Offer Level", "Affiliate Level", "Sub Source Level"].map((level) => (
                          <button
                            type="button"
                            key={level}
                            className={`automation-block-level-card ${form.blockLevel === level ? "active" : ""}`}
                            onClick={() => updateForm("blockLevel", level)}
                          >
                            <span aria-hidden="true">{level === "Offer Level" ? "🎚" : level === "Affiliate Level" ? "👤" : "🔀"}</span>
                            {level}
                            <small>{level.replace(" Level", "")}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section id="automation-section-scope" className="automation-card">
                    <h4><span aria-hidden="true">▽</span> Scope <small>Advertiser / Offers</small></h4>
                    <div className="automation-scope-row">
                      <div className="capping-field">
                        <label><span aria-hidden="true">👤</span> Advertiser</label>
                        <select
                          value={form.advertiserId}
                          disabled={advertisersLoading}
                          onChange={(event) => {
                            const advertiser = advertisers.find((item) => String(item.id) === event.target.value);
                            updateForm("advertiserId", event.target.value);
                            updateForm("advertiser", advertiser ? `${advertiser.id} ~ ${advertiserName(advertiser)}` : "");
                          }}
                        >
                          <option value="">{advertisersLoading ? "Loading advertisers…" : "Select Advertiser"}</option>
                          {advertisers.map((advertiser) => (
                            <option key={advertiser.id} value={advertiser.id}>{advertiser.id} ~ {advertiserName(advertiser)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="capping-field">
                        <label><span aria-hidden="true">◱</span> Offers</label>
                        <select value={selectedOfferToAdd} disabled={offersLoading} onChange={(event) => addOfferChip(event.target.value)}>
                          <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                          {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                        </select>
                        <div className="automation-chip-row">
                          {form.offers.map((offer) => (
                            <span className="ctit-chip" key={offer.id}>
                              {offer.id} ~ {offer.name}
                              <button type="button" onClick={() => removeOfferChip(offer.id)} aria-label={`Remove ${offer.name}`}>×</button>
                            </span>
                          ))}
                          {form.offers.length === 0 && <span className="automation-rule-subtitle">No offers selected</span>}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section id="automation-section-trigger" className="automation-card">
                    <h4><span aria-hidden="true">↕</span> Trigger <small>Threshold / Compare</small></h4>
                    <div className="automation-trigger-row-3">
                      <div className="capping-field">
                        <label><span aria-hidden="true">✎</span> Conversion</label>
                        <input type="text" value={form.conversion} onChange={(event) => updateForm("conversion", event.target.value)} />
                      </div>
                      <div className="capping-field">
                        <label><span aria-hidden="true">▶</span> Clicks</label>
                        <input type="text" value={form.clicks} onChange={(event) => updateForm("clicks", event.target.value)} />
                      </div>
                      <div className="capping-field">
                        <label><span aria-hidden="true">◉</span> Impressions</label>
                        <input type="text" value={form.impressions} onChange={(event) => updateForm("impressions", event.target.value)} />
                      </div>
                    </div>

                    <div className="events-section-divider" />

                    <div className="automation-trigger-row-2">
                      <div className="capping-field">
                        <label><span aria-hidden="true">📉</span> Field</label>
                        <select value={form.field} onChange={(event) => updateForm("field", event.target.value)}>
                          <option>CR</option>
                          <option>CTR</option>
                          <option>EPC</option>
                          <option>CVR</option>
                        </select>
                      </div>
                      <div className="capping-field">
                        <label><span aria-hidden="true">≠</span> Compare Type (Block if)</label>
                        <select value={form.compareType} onChange={(event) => updateForm("compareType", event.target.value)}>
                          <option>&lt; Minimum Value</option>
                          <option>&gt; Maximum Value</option>
                          <option>Between Min - Max</option>
                        </select>
                      </div>
                    </div>

                    <div className="capping-field">
                      <label><span aria-hidden="true">📏</span> Minimum - Maximum Value</label>
                      <div className="automation-minmax-row">
                        <input type="text" value={form.minValue} onChange={(event) => updateForm("minValue", event.target.value)} />
                        <span>to</span>
                        <input type="text" value={form.maxValue} onChange={(event) => updateForm("maxValue", event.target.value)} />
                      </div>
                    </div>
                  </section>

                  <section id="automation-section-schedule" className="automation-card">
                    <h4><span aria-hidden="true">📅</span> Filters / Schedule <small>Report Status / Data Look Back / Date Start - End</small></h4>
                    <div className="automation-trigger-row-2">
                      <div className="capping-field">
                        <label><span aria-hidden="true">☰</span> Report Status</label>
                        <select value={form.reportStatus} onChange={(event) => updateForm("reportStatus", event.target.value)}>
                          <option value="">Select</option>
                          <option>All</option>
                          <option>Approved</option>
                          <option>Pending</option>
                          <option>Rejected</option>
                        </select>
                      </div>
                      <div className="capping-field">
                        <label><span aria-hidden="true">⏳</span> Data Look Back</label>
                        <select value={form.dataLookBack} onChange={(event) => updateForm("dataLookBack", event.target.value)}>
                          <option>1 Hour</option>
                          <option>6 Hours</option>
                          <option>12 Hours</option>
                          <option>24 Hours</option>
                          <option>7 Days</option>
                        </select>
                      </div>
                    </div>
                    <div className="automation-trigger-row-2">
                      <div className="capping-field">
                        <label><span aria-hidden="true">🗓</span> Schedule</label>
                        <select value={form.schedule} onChange={(event) => updateForm("schedule", event.target.value)}>
                          <option>5 Mint</option>
                          <option>10 Mint</option>
                          <option>15 Mint</option>
                          <option>30 Mint</option>
                          <option>1 Hour</option>
                        </select>
                      </div>
                      <div className="capping-field">
                        <label><span aria-hidden="true">📆</span> Date Start - End</label>
                        <div className="automation-date-range">
                          <input type="date" value={form.dateStart} onChange={(event) => updateForm("dateStart", event.target.value)} />
                          <span>to</span>
                          <input type="date" value={form.dateEnd} onChange={(event) => updateForm("dateEnd", event.target.value)} />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section id="automation-section-recovery" className="automation-card">
                    <h4><span aria-hidden="true">🛡</span> Recovery / Whitelist <small>Resume After / Notification</small></h4>
                    <div className="automation-trigger-row-2">
                      <div className="capping-field">
                        <label><span aria-hidden="true">↻</span> Whitelist Offers</label>
                        <select value={form.whitelistOffers} onChange={(event) => updateForm("whitelistOffers", event.target.value)} disabled={offersLoading}>
                          <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                          {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                        </select>
                      </div>
                      <div className="capping-field">
                        <label><span aria-hidden="true">↺</span> Resume After</label>
                        <select value={form.resumeAfter} onChange={(event) => updateForm("resumeAfter", event.target.value)}>
                          <option>1 Hour</option>
                          <option>6 Hours</option>
                          <option>12 Hours</option>
                          <option>24 Hours</option>
                        </select>
                      </div>
                    </div>
                    <div className="automation-trigger-row-2">
                      <div className="capping-field">
                        <label><span aria-hidden="true">🔔</span> Notification</label>
                        <label className="automation-checkbox">
                          <input type="checkbox" checked={form.alertEnabled} onChange={(event) => updateForm("alertEnabled", event.target.checked)} />
                          Alert
                        </label>
                      </div>
                      <div className="capping-field">
                        <label><span aria-hidden="true">ⓘ</span> Information</label>
                        <div className="automation-info-box">
                          <p>Unique Values Limit : 500</p>
                          <p>Sub Value Length Limit : 50 Character</p>
                          <p>If Sub Values ( Sub Affiliates ) more then 500, then Rule will auto stopped.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="events-settings-submit-row">
                    <button type="button" className="events-settings-submit" onClick={submitForm} disabled={saving}>{saving ? "Saving…" : "⊕ Submit"}</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showLogsModal && <AutomationLogsModal onClose={() => setShowLogsModal(false)} />}
    </div>
  );
}

function AutomationLogsModal({ onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const loadLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(AUTOMATION_LOGS_API, { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load automation logs");
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
      <div className="automation-logs-modal" onClick={(event) => event.stopPropagation()}>
        <div className="automation-logs-modal-header">
          <h2><span aria-hidden="true">☰</span> Automation Logs</h2>
          <button type="button" className="automation-logs-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="automation-logs-table-scroll">
          <table className="events-table automation-table">
            <thead>
              <tr>
                <th>Block Level</th>
                <th>Alarm</th>
                <th>Offer / Affiliate / Sub Values</th>
                <th>Current Value</th>
                <th>Time</th>
                <th>Block Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="7" className="automation-empty-cell">Loading automation logs…</td></tr>}
              {!loading && logs.length === 0 && <tr><td colSpan="7" className="automation-empty-cell">No data available</td></tr>}
              {!loading && logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.blockLevel || "-"}</td>
                  <td>{log.alarm && log.alarm !== "none" ? log.alarm : "-"}</td>
                  <td>{log.targetLabel || "-"}</td>
                  <td>{log.currentValue || "-"}</td>
                  <td>{log.checkedOn ? new Date(log.checkedOn).toLocaleString() : "-"}</td>
                  <td>{log.blockedUntil ? new Date(log.blockedUntil).toLocaleString() : "-"}</td>
                  <td>{log.status || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
