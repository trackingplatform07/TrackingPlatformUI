import React, { useEffect, useMemo, useState } from "react";
import { FaEllipsisV, FaFilter, FaPlus, FaSitemap } from "react-icons/fa";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/OfferLinkingRulesPage.css";

const RULES_API = "https://localhost:7150/api/OfferLinkingRules";
const OFFERS_API = "https://localhost:7150/api/Offers";
const AFFILIATES_API = "https://localhost:7029/api/Affiliates";
const ADVERTISERS_API = "https://localhost:7129/api/Advertisers";

const emptyForm = {
  id: null,
  ruleName: "",
  advertiserId: "",
  offersMode: "Include",
  offerIds: "",
  affiliatesMode: "Include",
  affiliateIds: "",
  payoutCurrency: "",
  payoutModel: "",
  minPayout: "",
  maxPayout: "",
  country: "",
  status: "Active",
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function OfferLinkingRulesPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [view, setView] = useState("list");
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(true);
  const [advertisers, setAdvertisers] = useState([]);
  const [advertisersLoading, setAdvertisersLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showEntries, setShowEntries] = useState(20);
  const [openMenu, setOpenMenu] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await fetch(RULES_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load offer linking rules");
      const data = await response.json();
      setRules(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "list") loadRules();
  }, [view]);

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

    loadOffers();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

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

    loadAdvertisers();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (view !== "form") return undefined;
    const controller = new AbortController();

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

    loadAffiliates();
    return () => controller.abort();
  }, [view]);

  const advertiserName = (advertiser) =>
    [advertiser.firstName, advertiser.lastName].filter(Boolean).join(" ") || advertiser.companyName || "Unnamed Advertiser";

  const advertiserLabel = (advertiserId) => {
    const advertiser = advertisers.find((item) => String(item.id) === String(advertiserId));
    return advertiser ? `${advertiser.id} ~ ${advertiserName(advertiser)}` : advertiserId ? String(advertiserId) : "-";
  };

  const filteredRules = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rules;
    return rules.filter((rule) =>
      [rule.ruleName, advertiserLabel(rule.advertiserId)].some((value) => String(value || "").toLowerCase().includes(term))
    );
  }, [rules, search, advertisers]);

  const visibleRules = filteredRules.slice(0, Number(showEntries) || filteredRules.length);

  const openCreateForm = () => {
    setForm(emptyForm);
    setView("form");
  };

  const openEditForm = (rule) => {
    setForm({
      id: rule.id,
      ruleName: rule.ruleName || "",
      advertiserId: rule.advertiserId || "",
      offersMode: rule.offersMode || "Include",
      offerIds: rule.offerIds || "",
      affiliatesMode: rule.affiliatesMode || "Include",
      affiliateIds: rule.affiliateIds || "",
      payoutCurrency: rule.payoutCurrency || "",
      payoutModel: rule.payoutModel || "",
      minPayout: rule.minPayout ?? "",
      maxPayout: rule.maxPayout ?? "",
      country: rule.country || "",
      status: rule.status || "Active",
    });
    setOpenMenu(null);
    setView("form");
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitForm = async () => {
    if (!form.ruleName.trim()) {
      alert("Please enter a rule name.");
      return;
    }
    if (!form.advertiserId) {
      alert("Please select an advertiser.");
      return;
    }

    const payload = {
      ruleName: form.ruleName.trim(),
      advertiserId: Number(form.advertiserId),
      offersMode: form.offersMode,
      offerIds: form.offerIds || null,
      affiliatesMode: form.affiliatesMode,
      affiliateIds: form.affiliateIds || null,
      payoutCurrency: form.payoutCurrency.trim() || null,
      payoutModel: form.payoutModel.trim() || null,
      minPayout: form.minPayout === "" ? null : Number(form.minPayout),
      maxPayout: form.maxPayout === "" ? null : Number(form.maxPayout),
      country: form.country.trim() || null,
      status: form.status,
    };

    try {
      setSaving(true);
      const response = await fetch(form.id ? `${RULES_API}/${form.id}` : RULES_API, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(form.id ? { id: form.id, ...payload } : payload),
      });
      if (!response.ok) throw new Error("Unable to save offer linking rule");
      setView("list");
    } catch {
      alert("Unable to save the rule. Please check the API and try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteRule = async (rule) => {
    setOpenMenu(null);
    if (!window.confirm(`Delete rule "${rule.ruleName}"?`)) return;
    try {
      const response = await fetch(`${RULES_API}/${rule.id}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to delete rule");
      await loadRules();
    } catch {
      alert("Unable to delete the rule. Please check the API and try again.");
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

        <main className="linking-rules-page">
          <section className="linking-rules-card">
            {view === "list" && (
              <>
                <div className="linking-rules-toolbar">
                  <h1><FaSitemap /> Offer Linking Rules</h1>
                  <div className="linking-rules-actions">
                    <button type="button" className="linking-rules-button" onClick={openCreateForm}><FaPlus /> Add Rule</button>
                    <div className="linking-rules-search">
                      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" aria-label="Search offer linking rules" />
                    </div>
                    <label className="linking-rules-entries">Show
                      <select value={showEntries} onChange={(event) => setShowEntries(event.target.value)} aria-label="Rules per page">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                      </select>
                    </label>
                    <button type="button" className="linking-rules-filter" onClick={loadRules}><FaFilter /> Filters</button>
                  </div>
                </div>

                <div className="linking-rules-table-scroll">
                  <table className="linking-rules-table">
                    <thead>
                      <tr>
                        <th>Rule Id</th>
                        <th>Rule Name</th>
                        <th>Advertiser</th>
                        <th>Last Checked</th>
                        <th>CreatedOn</th>
                        <th>Last Updated</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && <tr><td colSpan="8" className="linking-rules-message">Loading rules…</td></tr>}
                      {!loading && visibleRules.length === 0 && <tr><td colSpan="8" className="linking-rules-message">No Data available</td></tr>}
                      {!loading && visibleRules.map((rule) => (
                        <tr key={rule.id}>
                          <td>#{rule.id}</td>
                          <td><button type="button" className="linking-rules-link" onClick={() => openEditForm(rule)}>{rule.ruleName}</button></td>
                          <td><span className="linking-rules-link">{advertiserLabel(rule.advertiserId)}</span></td>
                          <td>{formatDateTime(rule.lastChecked)}</td>
                          <td>{formatDateTime(rule.createdOn)}</td>
                          <td>{formatDateTime(rule.modifiedOn || rule.lastChecked)}</td>
                          <td><span className={`linking-rules-status ${String(rule.status || "").toLowerCase()}`}>✓ {rule.status}</span></td>
                          <td>
                            <div className="linking-rules-menu-wrapper">
                              <button
                                type="button"
                                className="linking-rules-options"
                                aria-label={`Options for ${rule.ruleName}`}
                                aria-expanded={openMenu === rule.id}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenMenu(openMenu === rule.id ? null : rule.id);
                                }}
                              >
                                <FaEllipsisV />
                              </button>

                              {openMenu === rule.id && (
                                <div className="linking-rules-row-dropdown">
                                  <button type="button" onClick={() => openEditForm(rule)}>Edit</button>
                                  <button type="button" className="danger" onClick={() => deleteRule(rule)}>Delete</button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!loading && filteredRules.length > 0 && (
                  <footer className="linking-rules-pagination">
                    <span>Showing 1 to {visibleRules.length} of {filteredRules.length} entries</span>
                    <div>
                      <button type="button" disabled>Previous</button>
                      <span className="linking-rules-page-number">1</span>
                      <button type="button" disabled={visibleRules.length >= filteredRules.length}>Next</button>
                    </div>
                  </footer>
                )}
              </>
            )}

            {view === "form" && (
              <div className="linking-rules-form">
                <div className="linking-rules-form-header">
                  <h1><FaPlus /> {form.id ? "Edit Rule" : "Create New Rule"}</h1>
                  <button type="button" className="linking-rules-button" onClick={() => setView("list")}>✕ Close</button>
                </div>

                <div className="linking-rules-form-field">
                  <label>Rule Name</label>
                  <input placeholder="Rule Name" value={form.ruleName} onChange={(event) => updateForm("ruleName", event.target.value)} />
                </div>

                <div className="linking-rules-form-field">
                  <label>Advertiser</label>
                  <select value={form.advertiserId} onChange={(event) => updateForm("advertiserId", event.target.value)} disabled={advertisersLoading}>
                    <option value="">{advertisersLoading ? "Loading advertisers…" : "Select Advertiser"}</option>
                    {advertisers.map((advertiser) => <option key={advertiser.id} value={advertiser.id}>{advertiser.id} ~ {advertiserName(advertiser)}</option>)}
                  </select>
                </div>

                <div className="linking-rules-form-field">
                  <label>Offers</label>
                  <div className="linking-rules-mode-row">
                    <select className="linking-rules-mode" value={form.offersMode} onChange={(event) => updateForm("offersMode", event.target.value)}>
                      <option>Include</option>
                      <option>Exclude</option>
                    </select>
                    <select value={form.offerIds} onChange={(event) => updateForm("offerIds", event.target.value)} disabled={offersLoading}>
                      <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                      {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                    </select>
                  </div>
                </div>

                <div className="linking-rules-form-field">
                  <label>Affiliates</label>
                  <div className="linking-rules-mode-row">
                    <select className="linking-rules-mode" value={form.affiliatesMode} onChange={(event) => updateForm("affiliatesMode", event.target.value)}>
                      <option>Include</option>
                      <option>Exclude</option>
                    </select>
                    <select value={form.affiliateIds} onChange={(event) => updateForm("affiliateIds", event.target.value)} disabled={affiliatesLoading}>
                      <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                      {affiliates.map((affiliate) => (
                        <option key={affiliate.id} value={affiliate.id}>
                          {affiliate.id} ~ {[affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || "Unnamed Affiliate"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="linking-rules-form-row">
                  <div className="linking-rules-form-field">
                    <label>Payout Currency</label>
                    <select value={form.payoutCurrency} onChange={(event) => updateForm("payoutCurrency", event.target.value)}>
                      <option value="">Select Currency</option>
                      <option>USD</option>
                      <option>INR</option>
                      <option>EUR</option>
                    </select>
                  </div>
                  <div className="linking-rules-form-field">
                    <label>Payout Model</label>
                    <select value={form.payoutModel} onChange={(event) => updateForm("payoutModel", event.target.value)}>
                      <option value="">Select Model</option>
                      <option>CPA</option>
                      <option>CPI</option>
                      <option>CPC</option>
                      <option>Revenue Share</option>
                    </select>
                  </div>
                </div>

                <div className="linking-rules-form-row">
                  <div className="linking-rules-form-field">
                    <label>Min Payout</label>
                    <input type="number" min="0" placeholder="Min Payout" value={form.minPayout} onChange={(event) => updateForm("minPayout", event.target.value)} />
                  </div>
                  <div className="linking-rules-form-field">
                    <label>Max Payout</label>
                    <input type="number" min="0" placeholder="Max Payout" value={form.maxPayout} onChange={(event) => updateForm("maxPayout", event.target.value)} />
                  </div>
                </div>

                <div className="linking-rules-form-row">
                  <div className="linking-rules-form-field">
                    <label>Country</label>
                    <select value={form.country} onChange={(event) => updateForm("country", event.target.value)}>
                      <option value="">Select Country</option>
                      <option>Australia</option>
                      <option>Brazil</option>
                      <option>Canada</option>
                      <option>France</option>
                      <option>Germany</option>
                      <option>India</option>
                      <option>Japan</option>
                      <option>United Kingdom</option>
                      <option>United States</option>
                    </select>
                  </div>
                  <div className="linking-rules-form-field">
                    <label>Status</label>
                    <select value={form.status} onChange={(event) => updateForm("status", event.target.value)}>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="linking-rules-form-actions">
                  <button type="button" className="linking-rules-submit" onClick={submitForm} disabled={saving}>
                    <span aria-hidden="true">🕐</span> {saving ? "Saving…" : "Submit"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
