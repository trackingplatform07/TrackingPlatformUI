import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ShortUrlPage.css";

const SHORT_URLS_API = "https://localhost:7150/api/ShortUrls";
const OFFERS_API = "https://localhost:7150/api/Offers";
const AFFILIATES_API = "https://localhost:7029/api/Affiliates";
const SHORT_DOMAIN = "https://short.offer18.com/c";

const affiliateName = (affiliate) =>
  [affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || "Unnamed Affiliate";

export default function ShortUrlPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [view, setView] = useState("list");

  const [shortUrls, setShortUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [affiliates, setAffiliates] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState(["All"]);
  const [offerFilter, setOfferFilter] = useState("");
  const [affiliateFilter, setAffiliateFilter] = useState("");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filtersSectionOpen, setFiltersSectionOpen] = useState(true);
  const [pendingStatuses, setPendingStatuses] = useState(["All"]);
  const [pendingOfferId, setPendingOfferId] = useState("");
  const [pendingAffiliateId, setPendingAffiliateId] = useState("");
  const [showEntries, setShowEntries] = useState(20);
  const [openMenu, setOpenMenu] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadDirectory = async () => {
      try {
        const [offersRes, affiliatesRes] = await Promise.all([
          fetch(OFFERS_API, { headers: { accept: "*/*" }, signal: controller.signal }),
          fetch(AFFILIATES_API, { headers: { accept: "*/*" }, signal: controller.signal }),
        ]);
        const offersData = offersRes.ok ? await offersRes.json() : [];
        const affiliatesData = affiliatesRes.ok ? await affiliatesRes.json() : [];
        setOffers(Array.isArray(offersData) ? offersData : offersData.items || offersData.data || []);
        setAffiliates(Array.isArray(affiliatesData) ? affiliatesData : affiliatesData.items || affiliatesData.data || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setOffers([]);
          setAffiliates([]);
        }
      }
    };

    loadDirectory();
    return () => controller.abort();
  }, []);

  const loadShortUrls = async () => {
    try {
      setLoading(true);
      const response = await fetch(SHORT_URLS_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load short URLs");
      const data = await response.json();
      setShortUrls(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setShortUrls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "list") loadShortUrls();
  }, [view]);

  const offerLabel = (offerId) => {
    const offer = offers.find((item) => String(item.id) === String(offerId));
    return offer ? `${offer.id} ~ ${offer.offerName}` : "-";
  };

  const affiliateLabel = (affiliateId) => {
    const affiliate = affiliates.find((item) => String(item.id) === String(affiliateId));
    return affiliate ? `${affiliate.id} - ${affiliateName(affiliate)}` : "-";
  };

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const activeStatuses = statusFilters.filter((status) => status !== "All");
    return shortUrls.filter((row) => {
      if (activeStatuses.length > 0 && !activeStatuses.includes(row.status)) return false;
      if (offerFilter && String(row.offerId) !== String(offerFilter)) return false;
      if (affiliateFilter && String(row.affiliateId) !== String(affiliateFilter)) return false;
      if (!term) return true;
      return [row.code, row.originalUrl, offerLabel(row.offerId), affiliateLabel(row.affiliateId)]
        .some((value) => String(value || "").toLowerCase().includes(term));
    });
  }, [shortUrls, search, statusFilters, offerFilter, affiliateFilter, offers, affiliates]);

  const openFiltersPanel = () => {
    setPendingStatuses(statusFilters);
    setPendingOfferId(offerFilter);
    setPendingAffiliateId(affiliateFilter);
    setFiltersSectionOpen(true);
    setShowFiltersPanel(true);
  };

  const removePendingStatus = (status) => {
    setPendingStatuses((current) => current.filter((item) => item !== status));
  };

  const addPendingStatus = (status) => {
    if (!status) return;
    setPendingStatuses((current) => {
      if (status === "All") return ["All"];
      const withoutAll = current.filter((item) => item !== "All");
      return withoutAll.includes(status) ? withoutAll : [...withoutAll, status];
    });
  };

  const applyFilters = () => {
    setStatusFilters(pendingStatuses.length > 0 ? pendingStatuses : ["All"]);
    setOfferFilter(pendingOfferId);
    setAffiliateFilter(pendingAffiliateId);
    setShowFiltersPanel(false);
  };

  const visibleRows = filteredRows.slice(0, Number(showEntries) || filteredRows.length);

  const copyShortUrl = async (row) => {
    const url = `${SHORT_DOMAIN}?s=${row.code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(row.id);
      setTimeout(() => setCopiedId((current) => (current === row.id ? null : current)), 1500);
    } catch {
      alert(url);
    }
  };

  const toggleStatus = async (row) => {
    setOpenMenu(null);
    const nextStatus = row.status === "Enabled" ? "Disabled" : "Enabled";
    try {
      const response = await fetch(`${SHORT_URLS_API}/${row.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(nextStatus),
      });
      if (!response.ok) throw new Error("Unable to update status");
      await loadShortUrls();
    } catch {
      alert("Unable to update the short URL status. Please check the API and try again.");
    }
  };

  const deleteShortUrl = async (row) => {
    setOpenMenu(null);
    if (!window.confirm(`Delete short URL "${row.code}"?`)) return;
    try {
      const response = await fetch(`${SHORT_URLS_API}/${row.id}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to delete short URL");
      await loadShortUrls();
    } catch {
      alert("Unable to delete the short URL. Please check the API and try again.");
    }
  };

  const submitNewUrl = async () => {
    if (!newUrl.trim()) {
      alert("Please enter a URL.");
      return;
    }
    try {
      setSaving(true);
      const response = await fetch(SHORT_URLS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({ url: newUrl.trim() }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || error || "Unable to create short URL");
      }
      setNewUrl("");
      setView("list");
    } catch (error) {
      alert(typeof error?.message === "string" ? error.message : "Unable to create the short URL. Please check the API and try again.");
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

        <main className="short-url-page">
          <section className="short-url-card">
            {view === "list" && (
              <>
                <div className="short-url-toolbar">
                  <h1><span aria-hidden="true">🔗</span> Short URL</h1>
                  <div className="short-url-actions">
                    <button type="button" className="short-url-button primary" onClick={() => setView("form")}>
                      <span aria-hidden="true">⊕</span> Add URL
                    </button>
                    <div className="short-url-search">
                      <span aria-hidden="true">🔍</span>
                      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" aria-label="Search short URLs" />
                    </div>
                    <label className="short-url-entries">Show
                      <input
                        type="number"
                        min="5"
                        value={showEntries}
                        onChange={(event) => setShowEntries(event.target.value)}
                        aria-label="Short URLs per page"
                      />
                      entries
                    </label>
                    <button type="button" className="short-url-filter-btn" onClick={openFiltersPanel} aria-label="Open filters">▽</button>
                  </div>
                </div>

                <div className="short-url-table-scroll">
                  <table className="short-url-table">
                    <thead>
                      <tr>
                        <th>Short URL Code</th>
                        <th>Offer</th>
                        <th>Affiliate</th>
                        <th>Short URL</th>
                        <th>Last Updated</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && <tr><td colSpan="7" className="short-url-message">Loading short URLs…</td></tr>}
                      {!loading && visibleRows.length === 0 && <tr><td colSpan="7" className="short-url-message">No Data available</td></tr>}
                      {!loading && visibleRows.map((row) => (
                        <tr key={row.id}>
                          <td><span className="short-url-code">{row.code}</span></td>
                          <td>{offerLabel(row.offerId)}</td>
                          <td>{affiliateLabel(row.affiliateId)}</td>
                          <td>
                            <div className="short-url-cell">
                              <a href={`${SHORT_DOMAIN}?s=${row.code}`} target="_blank" rel="noopener noreferrer">{`${SHORT_DOMAIN}?s=${row.code}`}</a>
                              <button type="button" className="short-url-copy-btn" onClick={() => copyShortUrl(row)} title="Copy">
                                {copiedId === row.id ? "✓" : "⧉"}
                              </button>
                            </div>
                          </td>
                          <td>{row.modifiedOn || row.createdOn ? new Date(row.modifiedOn || row.createdOn).toLocaleString() : "-"}</td>
                          <td><span className={`short-url-status ${row.status === "Enabled" ? "enabled" : "disabled"}`}>{row.status === "Enabled" ? "✓" : "✕"} {row.status}</span></td>
                          <td>
                            <div className="short-url-menu-wrapper">
                              <button
                                type="button"
                                className="short-url-options"
                                aria-label={`Options for ${row.code}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenMenu(openMenu === row.id ? null : row.id);
                                }}
                              >
                                ⋮
                              </button>
                              {openMenu === row.id && (
                                <div className="short-url-row-dropdown">
                                  <button type="button" onClick={() => toggleStatus(row)}>{row.status === "Enabled" ? "Disable" : "Enable"}</button>
                                  <button type="button" className="danger" onClick={() => deleteShortUrl(row)}>Delete</button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {view === "form" && (
              <div className="short-url-form">
                <div className="short-url-form-header">
                  <h1><span aria-hidden="true">👤</span> Create Short URL</h1>
                  <button type="button" className="short-url-close-btn" onClick={() => setView("list")}>✕ Close</button>
                </div>

                <div className="short-url-form-field">
                  <label>URL</label>
                  <input placeholder="URL" value={newUrl} onChange={(event) => setNewUrl(event.target.value)} />
                </div>

                <button type="button" className="short-url-submit-btn" onClick={submitNewUrl} disabled={saving}>
                  <span aria-hidden="true">▶</span> {saving ? "Saving…" : "Submit"}
                </button>
              </div>
            )}
          </section>

          {showFiltersPanel && (
            <div className="short-url-filters-overlay" onClick={() => setShowFiltersPanel(false)}>
              <div className="short-url-filters-panel" onClick={(event) => event.stopPropagation()}>
                <div className="short-url-filters-header">
                  <h2><span aria-hidden="true">▽</span> Filters</h2>
                  <button type="button" onClick={() => setShowFiltersPanel(false)}>✕</button>
                </div>

                <div className="short-url-filters-body">
                  <button type="button" className="short-url-filters-section-toggle" onClick={() => setFiltersSectionOpen((open) => !open)}>
                    Filters <span aria-hidden="true">{filtersSectionOpen ? "▾" : "▸"}</span>
                  </button>

                  {filtersSectionOpen && (
                    <div className="short-url-filters-fields">
                      <div className="short-url-filters-field">
                        <label>Status</label>
                        <div className="short-url-filters-chip-row">
                          {pendingStatuses.map((status) => (
                            <span className="short-url-filters-chip" key={status}>
                              {status}
                              <button type="button" onClick={() => removePendingStatus(status)} aria-label={`Remove ${status}`}>×</button>
                            </span>
                          ))}
                        </div>
                        <select value="" onChange={(event) => addPendingStatus(event.target.value)}>
                          <option value="">Add status…</option>
                          <option value="All">All</option>
                          <option value="Enabled">Enabled</option>
                          <option value="Disabled">Disabled</option>
                        </select>
                      </div>

                      <div className="short-url-filters-field">
                        <label>Offer</label>
                        <select value={pendingOfferId} onChange={(event) => setPendingOfferId(event.target.value)}>
                          <option value="">Select Offer</option>
                          {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                        </select>
                      </div>

                      <div className="short-url-filters-field">
                        <label>Affiliate</label>
                        <select value={pendingAffiliateId} onChange={(event) => setPendingAffiliateId(event.target.value)}>
                          <option value="">Select Affiliate</option>
                          {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} - {affiliateName(affiliate)}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="short-url-filters-footer">
                  <button type="button" className="short-url-submit-btn" onClick={applyFilters}>
                    <span aria-hidden="true">▶</span> Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
