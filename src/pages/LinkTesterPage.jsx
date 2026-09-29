import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/LinkTesterPage.css";

const RULES_API = "https://localhost:7150/api/LinkTesterRules";
const RESULTS_API = "https://localhost:7150/api/LinkTestResults";
const OFFERS_API = "https://localhost:7150/api/Offers";
const ADVERTISERS_API = "https://localhost:7129/api/Advertisers";

const TOTAL_UNITS = 967;

const BROWSER_OPTIONS = ["Android 7", "Android 10", "Android 13", "iOS 14", "iOS 16", "Desktop Chrome", "Desktop Safari"];
const COUNTRY_OPTIONS = [
  "United States of America", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "India", "Brazil", "Japan", "United Arab Emirates", "South Africa", "Mexico",
];
const HTTP_STATUS_OPTIONS = [200, 301, 302, 303, 307, 404, 500];

const advertiserName = (advertiser) =>
  [advertiser.firstName, advertiser.lastName].filter(Boolean).join(" ") || advertiser.companyName || "Unnamed Advertiser";

const buildEmptyForm = () => ({
  ruleName: "",
  advertiserId: "",
  offerId: "",
  customUrl: "",
  status: "Active",
  schedule: "1 Hour",
  browser: "Android 7",
  testCountry: "United States of America",
  healthyCheckThreshold: "1",
  allowedRedirection: "3",
  resaleDetection: "No Blockage",
  advertiserAppId: "",
  appIdMatch: "",
  allowedHttpStatuses: [200, 302],
  stopOffer: false,
  minimumOneRedirect: false,
});

export default function LinkTesterPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [view, setView] = useState("list");
  const [formTab, setFormTab] = useState("rule");

  const [rules, setRules] = useState([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [advertisers, setAdvertisers] = useState([]);
  const [advertisersLoading, setAdvertisersLoading] = useState(true);

  const [form, setForm] = useState(buildEmptyForm);
  const [httpStatusDropdownOpen, setHttpStatusDropdownOpen] = useState(false);

  const [ruleResults, setRuleResults] = useState([]);
  const [ruleResultsLoading, setRuleResultsLoading] = useState(false);

  const [allResultsCount, setAllResultsCount] = useState(0);

  const [quickUrl, setQuickUrl] = useState("");
  const [quickBrowser, setQuickBrowser] = useState("Android 7");
  const [quickCountry, setQuickCountry] = useState("United States of America");
  const [quickResult, setQuickResult] = useState("");
  const [quickTesting, setQuickTesting] = useState(false);

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

  const loadUsage = async () => {
    try {
      const response = await fetch(RESULTS_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load usage");
      const data = await response.json();
      setAllResultsCount((Array.isArray(data) ? data : data.items || data.data || []).length);
    } catch {
      setAllResultsCount(0);
    }
  };

  const loadRules = async () => {
    try {
      setRulesLoading(true);
      const response = await fetch(RULES_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load link tester rules");
      const data = await response.json();
      setRules(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setRules([]);
    } finally {
      setRulesLoading(false);
    }
  };

  useEffect(() => {
    loadUsage();
  }, [view]);

  useEffect(() => {
    if (view === "list") loadRules();
  }, [view]);

  const unitsLeft = Math.max(0, TOTAL_UNITS - allResultsCount);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const toggleHttpStatus = (status) => {
    setForm((current) => ({
      ...current,
      allowedHttpStatuses: current.allowedHttpStatuses.includes(status)
        ? current.allowedHttpStatuses.filter((item) => item !== status)
        : [...current.allowedHttpStatuses, status].sort((a, b) => a - b),
    }));
  };

  const openCreate = () => {
    setForm(buildEmptyForm());
    setEditingId(null);
    setFormTab("rule");
    setRuleResults([]);
    setView("form");
  };

  const openEdit = async (rule) => {
    setForm({
      ruleName: rule.ruleName || "",
      advertiserId: rule.advertiserId || "",
      offerId: rule.offerId || "",
      customUrl: rule.customUrl || "",
      status: rule.status || "Active",
      schedule: rule.schedule || "1 Hour",
      browser: rule.browser || "Android 7",
      testCountry: rule.testCountry || "United States of America",
      healthyCheckThreshold: rule.healthyCheckThreshold || "1",
      allowedRedirection: rule.allowedRedirection || "3",
      resaleDetection: rule.resaleDetection || "No Blockage",
      advertiserAppId: rule.advertiserAppId || "",
      appIdMatch: rule.appIdMatch || "",
      allowedHttpStatuses: (rule.allowedHttpStatuses || "200,302").split(",").map(Number).filter(Boolean),
      stopOffer: Boolean(rule.stopOffer),
      minimumOneRedirect: Boolean(rule.minimumOneRedirect),
    });
    setEditingId(rule.id);
    setFormTab("rule");
    setView("form");
  };

  const loadRuleResults = async (ruleId) => {
    try {
      setRuleResultsLoading(true);
      const response = await fetch(`${RESULTS_API}?ruleId=${ruleId}`, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load test results");
      const data = await response.json();
      setRuleResults(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setRuleResults([]);
    } finally {
      setRuleResultsLoading(false);
    }
  };

  const selectFormTab = (tab) => {
    setFormTab(tab);
    if (tab === "results" && editingId) loadRuleResults(editingId);
  };

  const deleteRule = async () => {
    if (!editingId) return;
    if (!window.confirm("Delete this link tester rule?")) return;
    try {
      const response = await fetch(`${RULES_API}/${editingId}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to delete rule");
      setView("list");
    } catch {
      alert("Unable to delete the rule. Please check the API and try again.");
    }
  };

  const submitForm = async () => {
    if (!form.ruleName.trim()) {
      alert("Please enter a rule name.");
      return;
    }
    const payload = {
      ruleName: form.ruleName.trim(),
      advertiserId: form.advertiserId ? Number(form.advertiserId) : null,
      offerId: form.offerId ? Number(form.offerId) : null,
      customUrl: form.customUrl.trim() || null,
      status: form.status,
      schedule: form.schedule,
      browser: form.browser,
      testCountry: form.testCountry,
      healthyCheckThreshold: form.healthyCheckThreshold,
      allowedRedirection: form.allowedRedirection,
      resaleDetection: form.resaleDetection,
      advertiserAppId: form.advertiserAppId.trim() || null,
      appIdMatch: form.appIdMatch || null,
      allowedHttpStatuses: form.allowedHttpStatuses.join(","),
      stopOffer: form.stopOffer,
      minimumOneRedirect: form.minimumOneRedirect,
    };

    try {
      setSaving(true);
      const response = await fetch(editingId ? `${RULES_API}/${editingId}` : RULES_API, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      if (!response.ok) throw new Error("Unable to save rule");
      setView("list");
    } catch {
      alert("Unable to save the rule. Please check the API and try again.");
    } finally {
      setSaving(false);
    }
  };

  const runQuickTest = async () => {
    if (!quickUrl.trim()) {
      alert("Please enter a URL to test.");
      return;
    }
    try {
      setQuickTesting(true);
      setQuickResult("");
      const response = await fetch(`${RESULTS_API}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({ url: quickUrl.trim(), osDevice: quickBrowser, country: quickCountry }),
      });
      if (!response.ok) throw new Error("Unable to run test");
      const result = await response.json();
      setQuickResult(
        `Status: ${result.status}\nFinal HTTP Code: ${result.finalStatusCode ?? "-"}\nRedirects: ${result.redirectCount}\n\n${result.resultText || ""}`
      );
      await loadUsage();
    } catch {
      setQuickResult("Unable to reach the Link Tester API. Please check the backend and try again.");
    } finally {
      setQuickTesting(false);
    }
  };

  const usageCard = (
    <aside className="link-tester-usage-card">
      <h3>Usage</h3>
      <div className="link-tester-usage-row">
        <span aria-hidden="true">📊</span>
        <span>{unitsLeft} Units Left / {TOTAL_UNITS}</span>
        <button type="button" className="link-tester-buy-btn" onClick={() => alert("Buy Units is not connected yet.")}>Buy Units</button>
      </div>
    </aside>
  );

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="link-tester-page">
          {view === "list" && (
            <div className="link-tester-layout">
              <section className="link-tester-card">
                <div className="link-tester-header">
                  <h1><span aria-hidden="true">👥</span> Link Tester</h1>
                  <div className="link-tester-header-actions">
                    <button type="button" className="link-tester-dark-btn" onClick={openCreate}><span aria-hidden="true">⊕</span> Create Rule</button>
                    <button type="button" className="link-tester-dark-btn" onClick={() => { setQuickResult(""); setView("quickTest"); }}><span aria-hidden="true">▤</span> Test Now</button>
                  </div>
                </div>

                <table className="link-tester-table">
                  <thead>
                    <tr><th>Rule</th><th>Schedule</th><th>Last Check</th><th>Health</th><th>Status</th><th>Logs</th></tr>
                  </thead>
                  <tbody>
                    {rulesLoading && <tr><td colSpan="6" className="link-tester-empty">Loading rules…</td></tr>}
                    {!rulesLoading && rules.length === 0 && <tr><td colSpan="6" className="link-tester-empty">No data available</td></tr>}
                    {!rulesLoading && rules.map((rule) => (
                      <tr key={rule.id}>
                        <td><button type="button" className="link-tester-link" onClick={() => openEdit(rule)}>{rule.ruleName}</button></td>
                        <td>{rule.schedule || "-"}</td>
                        <td>{rule.lastCheck ? new Date(rule.lastCheck).toLocaleString() : "-"}</td>
                        <td>{rule.health || "-"}</td>
                        <td><span className={`link-tester-status-pill ${rule.status === "Active" ? "active" : "stopped"}`}>{rule.status}</span></td>
                        <td><button type="button" className="link-tester-link" onClick={() => { openEdit(rule); }}>View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {usageCard}
            </div>
          )}

          {view === "form" && (
            <div className="link-tester-form-card">
              <div className="link-tester-form-header">
                <h1><span aria-hidden="true">👥</span> Link Tester</h1>
                <div className="link-tester-header-actions">
                  <button type="button" className="link-tester-dark-btn" onClick={() => setView("list")}><span aria-hidden="true">☰</span> Rules</button>
                  {editingId && <button type="button" className="link-tester-delete-btn" onClick={deleteRule}><span aria-hidden="true">🗑</span> Delete</button>}
                </div>
              </div>

              <div className="link-tester-form-body">
                <aside className="link-tester-form-sidebar">
                  <button type="button" className={formTab === "rule" ? "active" : ""} onClick={() => selectFormTab("rule")}><span aria-hidden="true">☰</span> RULE</button>
                  <button type="button" className={formTab === "results" ? "active" : ""} onClick={() => selectFormTab("results")}><span aria-hidden="true">▽</span> TEST RESULTS</button>
                  <button type="button" className={formTab === "logs" ? "active" : ""} onClick={() => selectFormTab("logs")}><span aria-hidden="true">⇄</span> CHANGE LOGS</button>
                </aside>

                <div className="link-tester-form-content">
                  {formTab === "rule" && (
                    <>
                      <div className="link-tester-field">
                        <label>Rule Name</label>
                        <input placeholder="Name" value={form.ruleName} onChange={(event) => updateForm("ruleName", event.target.value)} />
                      </div>

                      <hr className="link-tester-divider" />

                      <h4><span aria-hidden="true">▤</span> Test URL <small>(Advertiser or Offer or Custom URL)</small></h4>
                      <div className="link-tester-field">
                        <label>Advertiser</label>
                        <select value={form.advertiserId} disabled={advertisersLoading} onChange={(event) => updateForm("advertiserId", event.target.value)}>
                          <option value="">{advertisersLoading ? "Loading advertisers…" : "Select Advertiser"}</option>
                          {advertisers.map((advertiser) => <option key={advertiser.id} value={advertiser.id}>{advertiser.id} ~ {advertiserName(advertiser)}</option>)}
                        </select>
                      </div>
                      <div className="link-tester-field">
                        <label>Offers</label>
                        <select value={form.offerId} disabled={offersLoading} onChange={(event) => updateForm("offerId", event.target.value)}>
                          <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                          {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                        </select>
                      </div>
                      <div className="link-tester-field">
                        <label>Custom URL</label>
                        <input placeholder="http://test.com/" value={form.customUrl} onChange={(event) => updateForm("customUrl", event.target.value)} />
                      </div>

                      <hr className="link-tester-divider" />

                      <h4><span aria-hidden="true">⚙</span> Schedule &amp; Targeting</h4>
                      <div className="link-tester-field">
                        <label>Status</label>
                        <select value={form.status} onChange={(event) => updateForm("status", event.target.value)}>
                          <option>Active</option>
                          <option>Stopped</option>
                        </select>
                      </div>
                      <div className="link-tester-field">
                        <label>Schedule</label>
                        <select value={form.schedule} onChange={(event) => updateForm("schedule", event.target.value)}>
                          <option>15 Mint</option>
                          <option>30 Mint</option>
                          <option>1 Hour</option>
                          <option>6 Hours</option>
                          <option>24 Hours</option>
                        </select>
                      </div>
                      <div className="link-tester-field">
                        <label>Browser</label>
                        <select value={form.browser} onChange={(event) => updateForm("browser", event.target.value)}>
                          {BROWSER_OPTIONS.map((browser) => <option key={browser}>{browser}</option>)}
                        </select>
                        <small className="link-tester-hint">If Offer selected, then system will test based on Offer targeting)</small>
                      </div>
                      <div className="link-tester-field">
                        <label>Test Country</label>
                        <select value={form.testCountry} onChange={(event) => updateForm("testCountry", event.target.value)}>
                          {COUNTRY_OPTIONS.map((country) => <option key={country}>{country}</option>)}
                        </select>
                        <small className="link-tester-hint">If Offer selected, then system will test based on Offer targeting)</small>
                      </div>

                      <hr className="link-tester-divider" />

                      <h4><span aria-hidden="true">📶</span> Health Checks</h4>
                      <div className="link-tester-field">
                        <label>Healthy Check Threshold</label>
                        <select value={form.healthyCheckThreshold} onChange={(event) => updateForm("healthyCheckThreshold", event.target.value)}>
                          <option>1</option><option>2</option><option>3</option>
                        </select>
                      </div>
                      <div className="link-tester-field">
                        <label>Allowed Redirection</label>
                        <select value={form.allowedRedirection} onChange={(event) => updateForm("allowedRedirection", event.target.value)}>
                          <option>0</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
                        </select>
                      </div>
                      <div className="link-tester-field">
                        <label>Resale Detection</label>
                        <select value={form.resaleDetection} onChange={(event) => updateForm("resaleDetection", event.target.value)}>
                          <option>No Blockage</option>
                          <option>Block</option>
                          <option>Alert Only</option>
                        </select>
                      </div>

                      <hr className="link-tester-divider" />

                      <h4><span aria-hidden="true">▽</span> Options</h4>
                      <div className="link-tester-field">
                        <label>Advertiser AppID / Domain</label>
                        <input value={form.advertiserAppId} onChange={(event) => updateForm("advertiserAppId", event.target.value)} />
                      </div>
                      <div className="link-tester-field">
                        <label>AppID Match</label>
                        <select value={form.appIdMatch} onChange={(event) => updateForm("appIdMatch", event.target.value)}>
                          <option value="">Select</option>
                          <option>Exact Match</option>
                          <option>Contains</option>
                        </select>
                      </div>
                      <div className="link-tester-field">
                        <label>Allowed Link HTTP Status (200,302)</label>
                        <div className="link-tester-multiselect">
                          <div className="link-tester-multiselect-box" onClick={() => setHttpStatusDropdownOpen((open) => !open)}>
                            {form.allowedHttpStatuses.length === 0 ? (
                              <span className="link-tester-multiselect-placeholder">Select</span>
                            ) : (
                              form.allowedHttpStatuses.map((status) => <span className="link-tester-chip-small" key={status}>{status}</span>)
                            )}
                            <span aria-hidden="true" className="link-tester-multiselect-caret">▾</span>
                          </div>
                          {httpStatusDropdownOpen && (
                            <div className="link-tester-multiselect-dropdown">
                              {HTTP_STATUS_OPTIONS.map((status) => (
                                <label key={status}>
                                  <input type="checkbox" checked={form.allowedHttpStatuses.includes(status)} onChange={() => toggleHttpStatus(status)} />
                                  {status}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="link-tester-toggle-field">
                        <label>Stop Offer</label>
                        <button type="button" className={`link-tester-switch ${form.stopOffer ? "on" : ""}`} onClick={() => updateForm("stopOffer", !form.stopOffer)}>
                          <span />
                        </button>
                      </div>
                      <div className="link-tester-toggle-field">
                        <label>Minimum 1 Redirect</label>
                        <button type="button" className={`link-tester-switch ${form.minimumOneRedirect ? "on" : ""}`} onClick={() => updateForm("minimumOneRedirect", !form.minimumOneRedirect)}>
                          <span />
                        </button>
                      </div>

                      <div className="link-tester-submit-row">
                        <button type="button" className="link-tester-submit-btn" onClick={submitForm} disabled={saving}>
                          <span aria-hidden="true">⊕</span> {saving ? "Saving…" : "Submit"}
                        </button>
                      </div>
                    </>
                  )}

                  {formTab === "results" && (
                    <>
                      <h4><span aria-hidden="true">▽</span> Test Results</h4>
                      <table className="link-tester-table">
                        <thead>
                          <tr><th>Time</th><th>URL</th><th>OS / Device</th><th>Country</th><th>HTTP Status</th><th>Redirects</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          {ruleResultsLoading && <tr><td colSpan="7" className="link-tester-empty">Loading test results…</td></tr>}
                          {!ruleResultsLoading && ruleResults.length === 0 && <tr><td colSpan="7" className="link-tester-empty">No data available</td></tr>}
                          {!ruleResultsLoading && ruleResults.map((result) => (
                            <tr key={result.id}>
                              <td>{new Date(result.startedOn).toLocaleString()}</td>
                              <td className="link-tester-url-cell">{result.url}</td>
                              <td>{result.osDevice || "-"}</td>
                              <td>{result.country || "-"}</td>
                              <td>{result.finalStatusCode ?? "-"}</td>
                              <td>{result.redirectCount}</td>
                              <td>{result.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}

                  {formTab === "logs" && (
                    <>
                      <h4><span aria-hidden="true">⇄</span> Change Logs</h4>
                      <table className="link-tester-table">
                        <thead>
                          <tr><th>Event</th><th>Time</th></tr>
                        </thead>
                        <tbody>
                          {!editingId && <tr><td colSpan="2" className="link-tester-empty">Save the rule to see change logs.</td></tr>}
                          {editingId && (() => {
                            const rule = rules.find((item) => item.id === editingId);
                            if (!rule) return <tr><td colSpan="2" className="link-tester-empty">No data available</td></tr>;
                            return (
                              <>
                                {rule.createdOn && <tr><td>Rule created</td><td>{new Date(rule.createdOn).toLocaleString()}</td></tr>}
                                {rule.modifiedOn && <tr><td>Rule last updated</td><td>{new Date(rule.modifiedOn).toLocaleString()}</td></tr>}
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === "quickTest" && (
            <div className="link-tester-layout">
              <section className="link-tester-card">
                <div className="link-tester-header">
                  <h1><span aria-hidden="true">👥</span> Link Tester</h1>
                  <div className="link-tester-header-actions">
                    <button type="button" className="link-tester-dark-btn" onClick={() => setView("list")}><span aria-hidden="true">☰</span> Rules</button>
                  </div>
                </div>

                <div className="link-tester-field">
                  <label>URL</label>
                  <input placeholder="http://example.com/.." value={quickUrl} onChange={(event) => setQuickUrl(event.target.value)} />
                </div>
                <div className="link-tester-field">
                  <label>OS / Device</label>
                  <select value={quickBrowser} onChange={(event) => setQuickBrowser(event.target.value)}>
                    {BROWSER_OPTIONS.map((browser) => <option key={browser}>{browser}</option>)}
                  </select>
                </div>
                <div className="link-tester-field">
                  <label>Country</label>
                  <select value={quickCountry} onChange={(event) => setQuickCountry(event.target.value)}>
                    {COUNTRY_OPTIONS.map((country) => <option key={country}>{country}</option>)}
                  </select>
                </div>

                <div className="link-tester-quick-test-btn-row">
                  <button type="button" className="link-tester-dark-btn" onClick={runQuickTest} disabled={quickTesting}>
                    {quickTesting ? "Testing…" : "Start Test"}
                  </button>
                </div>

                <div className="link-tester-field">
                  <label>Result</label>
                  <textarea className="link-tester-result-box" value={quickResult} readOnly />
                </div>
              </section>

              {usageCard}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
