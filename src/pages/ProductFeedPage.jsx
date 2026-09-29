import React, { useEffect, useMemo, useState } from "react";
import { FaEllipsisV, FaPlusCircle, FaThList } from "react-icons/fa";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/CouponsPage.css";
import "../css/ProductFeedPage.css";

const PRODUCT_FEEDS_API = "https://localhost:7150/api/ProductFeeds";
const OFFERS_API = "https://localhost:7150/api/Offers";
const ADVERTISERS_API = "https://localhost:7129/api/Advertisers";
const AFFILIATES_API = "https://localhost:7029/api/Affiliates";

const buildEmptyForm = () => ({
  id: null,
  feedName: "",
  feedType: "CSV",
  offerId: "",
  advertiserId: "",
  affiliateMode: "Allow",
  affiliateIds: "",
  appendTokens: "",
  status: "Enabled",
  syncFrequency: "Every 24 Hrs",
});

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const datePart = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
  const timePart = date.toLocaleTimeString("en-GB", { hour12: false });
  return `${datePart} ${timePart}`;
};

export default function ProductFeedPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [view, setView] = useState("list");
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [advertisers, setAdvertisers] = useState([]);
  const [advertisersLoading, setAdvertisersLoading] = useState(true);
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterOfferId, setFilterOfferId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showEntries, setShowEntries] = useState(20);
  const [openMenu, setOpenMenu] = useState(null);

  const [form, setForm] = useState(buildEmptyForm);
  const [saving, setSaving] = useState(false);

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
    if (view !== "form") return undefined;
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

    loadAdvertisers();
    loadAffiliates();
    return () => controller.abort();
  }, [view]);

  const loadFeeds = async () => {
    try {
      setLoading(true);
      const response = await fetch(PRODUCT_FEEDS_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load product feeds");
      const data = await response.json();
      setFeeds(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setFeeds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "list") loadFeeds();
  }, [view]);

  const offerLabel = (offerId) => {
    const offer = offers.find((item) => String(item.id) === String(offerId));
    return offer ? `${offer.id} ~ ${offer.offerName}` : offerId ? String(offerId) : "-";
  };

  const advertiserName = (advertiser) =>
    [advertiser.firstName, advertiser.lastName].filter(Boolean).join(" ") || advertiser.companyName || "Unnamed Advertiser";

  const advertiserLabel = (advertiserId) => {
    const advertiser = advertisers.find((item) => String(item.id) === String(advertiserId));
    if (advertiser) return `${advertiser.id}~${advertiserName(advertiser)}`;
    const offerWithAdvertiser = offers.find((item) => String(item.advertiserId) === String(advertiserId));
    return offerWithAdvertiser ? `${advertiserId}~Advertiser` : advertiserId ? String(advertiserId) : "-";
  };

  const affiliateName = (affiliate) =>
    [affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || "Unnamed Affiliate";

  const filteredFeeds = useMemo(() => {
    const term = search.trim().toLowerCase();
    return feeds.filter((feed) => {
      if (filterOfferId && String(feed.offerId) !== String(filterOfferId)) return false;
      if (filterStatus && String(feed.status || "").toLowerCase() !== filterStatus.trim().toLowerCase()) return false;
      if (!term) return true;
      return [feed.feedName, offerLabel(feed.offerId)].some((value) => String(value || "").toLowerCase().includes(term));
    });
  }, [feeds, search, filterOfferId, filterStatus, offers]);

  const visibleFeeds = filteredFeeds.slice(0, Number(showEntries) || filteredFeeds.length);

  const openCreateForm = () => {
    setForm(buildEmptyForm());
    setView("form");
  };

  const openEditForm = (feed) => {
    setForm({
      id: feed.id,
      feedName: feed.feedName || "",
      feedType: feed.feedType || "CSV",
      offerId: feed.offerId || "",
      advertiserId: feed.advertiserId || "",
      affiliateMode: feed.affiliateMode || "Allow",
      affiliateIds: feed.affiliateIds || "",
      appendTokens: feed.appendTokens || "",
      status: feed.status || "Enabled",
      syncFrequency: feed.syncFrequency || "Every 24 Hrs",
    });
    setOpenMenu(null);
    setView("form");
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitForm = async () => {
    if (!form.feedName.trim()) {
      alert("Please enter a feed name.");
      return;
    }
    if (!form.offerId) {
      alert("Please select an offer.");
      return;
    }

    const payload = {
      feedName: form.feedName.trim(),
      feedType: form.feedType,
      offerId: Number(form.offerId),
      advertiserId: form.advertiserId ? Number(form.advertiserId) : null,
      affiliateMode: form.affiliateMode,
      affiliateIds: form.affiliateIds || null,
      appendTokens: form.appendTokens.trim() || null,
      status: form.status,
      syncFrequency: form.syncFrequency,
    };

    try {
      setSaving(true);
      const response = await fetch(form.id ? `${PRODUCT_FEEDS_API}/${form.id}` : PRODUCT_FEEDS_API, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(form.id ? { id: form.id, ...payload } : payload),
      });
      if (!response.ok) throw new Error("Unable to save product feed");
      setView("list");
    } catch {
      alert("Unable to save the product feed. Please check the API and try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteFeed = async (feed) => {
    setOpenMenu(null);
    if (!window.confirm(`Delete product feed "${feed.feedName}"?`)) return;
    try {
      const response = await fetch(`${PRODUCT_FEEDS_API}/${feed.id}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to delete product feed");
      await loadFeeds();
    } catch {
      alert("Unable to delete the product feed. Please check the API and try again.");
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

        <main className="coupons-page">
          <section className="coupons-card">
            {view === "list" && (
              <>
                <div className="coupons-toolbar">
                  <h1><FaThList /> Product Feed</h1>
                  <div className="coupons-actions">
                    <button type="button" className="coupons-button primary" onClick={openCreateForm}><FaPlusCircle /> Create Product Feed</button>
                    <div className="coupons-search">
                      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" aria-label="Search product feeds" />
                    </div>
                    <select className="coupons-filter-select" value={filterOfferId} onChange={(event) => setFilterOfferId(event.target.value)} disabled={offersLoading}>
                      <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                      {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                    </select>
                    <input
                      className="coupons-filter-select"
                      value={filterStatus}
                      onChange={(event) => setFilterStatus(event.target.value)}
                      placeholder="Status"
                    />
                    <label className="coupons-entries">Show
                      <select value={showEntries} onChange={(event) => setShowEntries(event.target.value)} aria-label="Product feeds per page">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="coupons-table-scroll">
                  <table className="coupons-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Feed Name</th>
                        <th>Offer</th>
                        <th>Advertiser</th>
                        <th>Affiliates</th>
                        <th>Feed Type</th>
                        <th>Last Updated</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && <tr><td colSpan="9" className="coupons-message">Loading product feeds…</td></tr>}
                      {!loading && visibleFeeds.length === 0 && <tr><td colSpan="9" className="coupons-message">No Data available</td></tr>}
                      {!loading && visibleFeeds.map((feed) => (
                        <tr key={feed.id}>
                          <td>#{feed.id}</td>
                          <td><button type="button" className="coupons-link" onClick={() => openEditForm(feed)}>{feed.feedName}</button></td>
                          <td><span className="coupons-link">{offerLabel(feed.offerId)}</span></td>
                          <td>{advertiserLabel(feed.advertiserId)}</td>
                          <td>{feed.affiliateIds ? "Selected Affiliates" : "All Affiliates"}</td>
                          <td>{feed.feedType}</td>
                          <td>{formatDateTime(feed.modifiedOn || feed.createdOn)}</td>
                          <td><span className={`coupons-status ${String(feed.status || "").toLowerCase() === "enabled" ? "" : "rejected"}`}>{String(feed.status || "").toLowerCase() === "enabled" ? "✓" : "✕"} {feed.status}</span></td>
                          <td>
                            <div className="coupons-menu-wrapper">
                              <button
                                type="button"
                                className="coupons-options"
                                aria-label={`Options for ${feed.feedName}`}
                                aria-expanded={openMenu === feed.id}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenMenu(openMenu === feed.id ? null : feed.id);
                                }}
                              >
                                <FaEllipsisV />
                              </button>

                              {openMenu === feed.id && (
                                <div className="coupons-row-dropdown">
                                  <button type="button" onClick={() => openEditForm(feed)}>View Feed</button>
                                  <button type="button" onClick={() => openEditForm(feed)}>Edit</button>
                                  <button type="button" className="danger" onClick={() => deleteFeed(feed)}>Delete</button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!loading && filteredFeeds.length > 0 && (
                  <footer className="coupons-pagination">
                    <span>Showing 1 to {visibleFeeds.length} of {filteredFeeds.length} entries</span>
                    <div>
                      <button type="button" disabled>Previous</button>
                      <span className="coupons-page-number">1</span>
                    </div>
                  </footer>
                )}
              </>
            )}

            {view === "form" && (
              <div className="product-feed-form">
                <div className="coupons-form-header">
                  <h1><FaThList /> {form.id ? "Edit Product Feed" : "Create Product Feed"}</h1>
                  <button type="button" className="coupons-button" onClick={() => setView("list")}><FaThList /> Product Feed</button>
                </div>

                <div className="product-feed-form-row">
                  <label>Feed Name</label>
                  <input placeholder="Feed Name" value={form.feedName} onChange={(event) => updateForm("feedName", event.target.value)} />
                </div>

                <div className="product-feed-form-row">
                  <label>Feed Type</label>
                  <div className="product-feed-radio-group">
                    <label className="product-feed-radio">
                      <input type="radio" name="feedType" checked={form.feedType === "CSV"} onChange={() => updateForm("feedType", "CSV")} /> CSV
                    </label>
                    <label className="product-feed-radio">
                      <input type="radio" name="feedType" checked={form.feedType === "API"} onChange={() => updateForm("feedType", "API")} /> API
                    </label>
                  </div>
                </div>

                <div className="product-feed-form-row">
                  <label>Offer</label>
                  <select value={form.offerId} onChange={(event) => updateForm("offerId", event.target.value)} disabled={offersLoading}>
                    <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                    {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                  </select>
                </div>

                <div className="product-feed-form-row">
                  <label>Advertiser</label>
                  <select value={form.advertiserId} onChange={(event) => updateForm("advertiserId", event.target.value)} disabled={advertisersLoading}>
                    <option value="">{advertisersLoading ? "Loading advertisers…" : "Select Advertiser"}</option>
                    {advertisers.map((advertiser) => (
                      <option key={advertiser.id} value={advertiser.id}>{advertiser.id} ~ {advertiserName(advertiser)}</option>
                    ))}
                  </select>
                </div>

                <div className="product-feed-form-row">
                  <label>Affiliate ID</label>
                  <div className="product-feed-affiliate-row">
                    <select className="product-feed-affiliate-mode" value={form.affiliateMode} onChange={(event) => updateForm("affiliateMode", event.target.value)}>
                      <option>Allow</option>
                      <option>Block</option>
                    </select>
                    <select
                      value={form.affiliateIds}
                      onChange={(event) => updateForm("affiliateIds", event.target.value)}
                      disabled={affiliatesLoading}
                    >
                      <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                      {affiliates.map((affiliate) => (
                        <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="product-feed-form-row">
                  <label>Append Tokens</label>
                  <input placeholder="example - &clickid={tid}" value={form.appendTokens} onChange={(event) => updateForm("appendTokens", event.target.value)} />
                </div>

                <div className="product-feed-form-row product-feed-status-row">
                  <label>Status</label>
                  <div className="product-feed-status-fields">
                    <select value={form.status} onChange={(event) => updateForm("status", event.target.value)}>
                      <option>Enabled</option>
                      <option>Disabled</option>
                    </select>
                    <span className="product-feed-sync-label">Sync Frequency</span>
                    <select value={form.syncFrequency} onChange={(event) => updateForm("syncFrequency", event.target.value)}>
                      <option>Every 6 Hrs</option>
                      <option>Every 12 Hrs</option>
                      <option>Every 24 Hrs</option>
                    </select>
                  </div>
                </div>

                <div className="product-feed-form-footer">
                  <button type="button" className="coupons-form-submit" onClick={submitForm} disabled={saving}>
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
