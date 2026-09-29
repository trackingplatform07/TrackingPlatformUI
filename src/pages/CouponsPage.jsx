import React, { useEffect, useMemo, useState } from "react";
import { FaEllipsisV, FaFileImport, FaChartBar, FaPlusCircle, FaTicketAlt } from "react-icons/fa";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/CouponsPage.css";

const COUPONS_API = "https://localhost:7150/api/Coupons";
const OFFERS_API = "https://localhost:7150/api/Offers";
const AFFILIATES_API = "https://localhost:7029/api/Affiliates";

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result.toISOString().slice(0, 10);
};

const buildEmptyForm = () => {
  const today = new Date();
  return {
    id: null,
    couponCode: "",
    offerId: "",
    couponType: "Shared",
    affiliateMode: "Allow",
    affiliateIds: "",
    startDate: today.toISOString().slice(0, 10),
    endDate: addMonths(today, 6),
    quota: "",
    status: "Approved",
    description: "",
  };
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
};

const toUtcIsoString = (value) => (value ? new Date(`${value}T00:00:00`).toISOString() : null);

export default function CouponsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [view, setView] = useState("list");
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterOfferId, setFilterOfferId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showEntries, setShowEntries] = useState(20);
  const [openMenu, setOpenMenu] = useState(null);

  const [reportsSearch, setReportsSearch] = useState("");
  const [reportsOfferId, setReportsOfferId] = useState("");
  const [reportsDateStart, setReportsDateStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [reportsDateEnd, setReportsDateEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [reportsConversionStatus, setReportsConversionStatus] = useState("");
  const [reportsShowEntries, setReportsShowEntries] = useState(20);

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

  const affiliateName = (affiliate) =>
    [affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || "Unnamed Affiliate";

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch(COUPONS_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load coupons");
      const data = await response.json();
      setCoupons(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "list") loadCoupons();
  }, [view]);

  const offerLabel = (offerId) => {
    const offer = offers.find((item) => String(item.id) === String(offerId));
    return offer ? `${offer.id} ~ ${offer.offerName}` : offerId ? String(offerId) : "-";
  };

  const filteredCoupons = useMemo(() => {
    const term = search.trim().toLowerCase();
    return coupons.filter((coupon) => {
      if (filterOfferId && String(coupon.offerId) !== String(filterOfferId)) return false;
      if (filterStatus && String(coupon.status || "").toLowerCase() !== filterStatus.toLowerCase()) return false;
      if (!term) return true;
      return [coupon.couponCode, offerLabel(coupon.offerId)].some((value) => String(value || "").toLowerCase().includes(term));
    });
  }, [coupons, search, filterOfferId, filterStatus, offers]);

  const visibleCoupons = filteredCoupons.slice(0, Number(showEntries) || filteredCoupons.length);

  const openCreateForm = () => {
    setForm(buildEmptyForm());
    setView("form");
  };

  const openEditForm = (coupon) => {
    setForm({
      id: coupon.id,
      couponCode: coupon.couponCode || "",
      offerId: coupon.offerId || "",
      couponType: coupon.couponType || "Shared",
      affiliateMode: coupon.affiliateMode || "Allow",
      affiliateIds: coupon.affiliateIds || "",
      startDate: coupon.startDate ? coupon.startDate.slice(0, 10) : "",
      endDate: coupon.endDate ? coupon.endDate.slice(0, 10) : "",
      quota: coupon.quota ?? "",
      status: coupon.status || "Approved",
      description: coupon.description || "",
    });
    setOpenMenu(null);
    setView("form");
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitForm = async () => {
    if (!form.couponCode.trim()) {
      alert("Please enter a coupon code.");
      return;
    }
    if (!form.offerId) {
      alert("Please select an offer.");
      return;
    }

    const payload = {
      couponCode: form.couponCode.trim(),
      offerId: Number(form.offerId),
      couponType: form.couponType,
      affiliateMode: form.affiliateMode,
      affiliateIds: form.affiliateIds.trim() || null,
      startDate: toUtcIsoString(form.startDate),
      endDate: toUtcIsoString(form.endDate),
      quota: form.quota === "" ? null : Number(form.quota),
      status: form.status,
      description: form.description.trim() || null,
    };

    try {
      setSaving(true);
      const response = await fetch(form.id ? `${COUPONS_API}/${form.id}` : COUPONS_API, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(form.id ? { id: form.id, ...payload } : payload),
      });
      if (!response.ok) throw new Error("Unable to save coupon");
      setView("list");
    } catch {
      alert("Unable to save the coupon. Please check the API and try again.");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (coupon, status) => {
    setOpenMenu(null);
    try {
      const response = await fetch(`${COUPONS_API}/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({ ...coupon, status }),
      });
      if (!response.ok) throw new Error("Unable to update coupon");
      await loadCoupons();
    } catch {
      alert("Unable to update the coupon status. Please check the API and try again.");
    }
  };

  const deleteCoupon = async (coupon) => {
    setOpenMenu(null);
    if (!window.confirm(`Delete coupon "${coupon.couponCode}"?`)) return;
    try {
      const response = await fetch(`${COUPONS_API}/${coupon.id}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to delete coupon");
      await loadCoupons();
    } catch {
      alert("Unable to delete the coupon. Please check the API and try again.");
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
                  <h1><FaTicketAlt /> Coupons</h1>
                  <div className="coupons-actions">
                    <button type="button" className="coupons-button primary" onClick={openCreateForm}><FaPlusCircle /> Create Coupon</button>
                    <button type="button" className="coupons-button" onClick={() => alert("Import Coupons is not connected yet.")}><FaFileImport /> Import Coupons</button>
                    <button
                      type="button"
                      className="coupons-button"
                      onClick={() => {
                        const today = new Date().toISOString().slice(0, 10);
                        setReportsSearch("");
                        setReportsOfferId("");
                        setReportsDateStart(today);
                        setReportsDateEnd(today);
                        setReportsConversionStatus("");
                        setView("reports");
                      }}
                    >
                      <FaChartBar /> Coupon Reports
                    </button>
                    <div className="coupons-search">
                      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" aria-label="Search coupons" />
                    </div>
                    <select className="coupons-filter-select" value={filterOfferId} onChange={(event) => setFilterOfferId(event.target.value)} disabled={offersLoading}>
                      <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                      {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                    </select>
                    <select className="coupons-filter-select" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
                      <option value="">Coupon status</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <label className="coupons-entries">Show
                      <select value={showEntries} onChange={(event) => setShowEntries(event.target.value)} aria-label="Coupons per page">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                      </select>
                    </label>
                    <button type="button" className="coupons-button" onClick={loadCoupons}>Submit</button>
                  </div>
                </div>

                <div className="coupons-table-scroll">
                  <table className="coupons-table">
                    <thead>
                      <tr>
                        <th>Coupon Code</th>
                        <th>OfferID</th>
                        <th>Coupon Type</th>
                        <th>Start Date - End Date</th>
                        <th>Quota</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && <tr><td colSpan="7" className="coupons-message">Loading coupons…</td></tr>}
                      {!loading && visibleCoupons.length === 0 && <tr><td colSpan="7" className="coupons-message">No Data available</td></tr>}
                      {!loading && visibleCoupons.map((coupon) => (
                        <tr key={coupon.id}>
                          <td><button type="button" className="coupons-link" onClick={() => openEditForm(coupon)}>{coupon.couponCode}</button></td>
                          <td><span className="coupons-link">{offerLabel(coupon.offerId)}</span></td>
                          <td>{coupon.couponType}</td>
                          <td>{formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}</td>
                          <td>{coupon.usedCount ?? 0} used / {coupon.quota ?? 0}</td>
                          <td><span className={`coupons-status ${String(coupon.status || "").toLowerCase()}`}>✓ {coupon.status}</span></td>
                          <td>
                            <div className="coupons-menu-wrapper">
                              <button
                                type="button"
                                className="coupons-options"
                                aria-label={`Options for ${coupon.couponCode}`}
                                aria-expanded={openMenu === coupon.id}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenMenu(openMenu === coupon.id ? null : coupon.id);
                                }}
                              >
                                <FaEllipsisV />
                              </button>

                              {openMenu === coupon.id && (
                                <div className="coupons-row-dropdown">
                                  <button type="button" onClick={() => { setOpenMenu(null); alert("Reports is not connected yet."); }}>Reports</button>
                                  <button type="button" onClick={() => openEditForm(coupon)}>Edit</button>
                                  <button type="button" onClick={() => changeStatus(coupon, "Rejected")}>Reject</button>
                                  <button type="button" className="danger" onClick={() => deleteCoupon(coupon)}>Delete</button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!loading && filteredCoupons.length > 0 && (
                  <footer className="coupons-pagination">
                    <span>Showing 1 to {visibleCoupons.length} of {filteredCoupons.length} entries</span>
                    <div>
                      <button type="button" disabled>Previous</button>
                      <span className="coupons-page-number">1</span>
                    </div>
                  </footer>
                )}
              </>
            )}

            {view === "form" && (
              <div className="coupons-form">
                <div className="coupons-form-header">
                  <h1><FaTicketAlt /> {form.id ? "Edit Coupon" : "Create Coupon"}</h1>
                  <button type="button" className="coupons-button" onClick={() => setView("list")}>✕ Close</button>
                </div>

                <div className="coupons-form-row">
                  <div className="coupons-form-field">
                    <label>Coupon Code</label>
                    <input placeholder="Coupon Code" value={form.couponCode} onChange={(event) => updateForm("couponCode", event.target.value)} />
                  </div>
                  <div className="coupons-form-field">
                    <label>Coupon Type</label>
                    <select value={form.couponType} onChange={(event) => updateForm("couponType", event.target.value)}>
                      <option>Shared</option>
                      <option>Unique</option>
                      <option>Affiliate Specific</option>
                    </select>
                  </div>
                </div>

                <div className="coupons-form-field">
                  <label>Offer</label>
                  <select value={form.offerId} onChange={(event) => updateForm("offerId", event.target.value)} disabled={offersLoading}>
                    <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                    {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                  </select>
                </div>

                <div className="coupons-form-field">
                  <label>Affiliate ID</label>
                  <div className="coupons-affiliate-row">
                    <select className="coupons-affiliate-mode" value={form.affiliateMode} onChange={(event) => updateForm("affiliateMode", event.target.value)}>
                      <option>Allow</option>
                      <option>Block</option>
                    </select>
                    <select
                      className="coupons-affiliate-select"
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

                <div className="coupons-form-field">
                  <label>Quota</label>
                  <input type="number" min="0" placeholder="Quota" value={form.quota} onChange={(event) => updateForm("quota", event.target.value)} />
                </div>

                <div className="coupons-form-row">
                  <div className="coupons-form-field">
                    <label>Start Date</label>
                    <input type="date" value={form.startDate} onChange={(event) => updateForm("startDate", event.target.value)} />
                  </div>
                  <div className="coupons-form-field">
                    <label>End Date</label>
                    <input type="date" value={form.endDate} onChange={(event) => updateForm("endDate", event.target.value)} />
                  </div>
                </div>

                <div className="coupons-form-field">
                  <label>Status</label>
                  <select value={form.status} onChange={(event) => updateForm("status", event.target.value)}>
                    <option>Approved</option>
                    <option>Pending</option>
                    <option>Rejected</option>
                  </select>
                </div>

                <div className="coupons-form-field">
                  <label>Description</label>
                  <textarea placeholder="Add some description here" value={form.description} onChange={(event) => updateForm("description", event.target.value)} />
                </div>

                <div className="coupons-form-footer">
                  <p className="coupons-form-note">For Clickless Coupon Tracking, use Coupon Type &quot;Affiliate Specific&quot;.</p>
                  <button type="button" className="coupons-form-submit" onClick={submitForm} disabled={saving}>
                    <span aria-hidden="true">🕐</span> {saving ? "Saving…" : "Submit"}
                  </button>
                </div>
              </div>
            )}

            {view === "reports" && (
              <>
                <div className="coupons-toolbar coupons-reports-toolbar">
                  <h1><FaChartBar /> Coupon Reports</h1>
                  <div className="coupons-actions">
                    <button type="button" className="coupons-button" onClick={() => setView("list")}><FaTicketAlt /> Coupons</button>
                    <div className="coupons-search">
                      <input value={reportsSearch} onChange={(event) => setReportsSearch(event.target.value)} placeholder="Search" aria-label="Search coupon reports" />
                    </div>
                    <select className="coupons-filter-select" value={reportsOfferId} onChange={(event) => setReportsOfferId(event.target.value)} disabled={offersLoading}>
                      <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                      {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                    </select>
                    <div className="coupons-reports-date-range">
                      <input type="date" value={reportsDateStart} onChange={(event) => setReportsDateStart(event.target.value)} />
                      <span>-</span>
                      <input type="date" value={reportsDateEnd} onChange={(event) => setReportsDateEnd(event.target.value)} />
                    </div>
                    <input
                      className="coupons-filter-select"
                      value={reportsConversionStatus}
                      onChange={(event) => setReportsConversionStatus(event.target.value)}
                      placeholder="Conversion status"
                    />
                    <label className="coupons-entries">Show
                      <select value={reportsShowEntries} onChange={(event) => setReportsShowEntries(event.target.value)} aria-label="Coupon reports per page">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                      </select>
                    </label>
                    <button type="button" className="coupons-button" onClick={() => alert("No data available for the selected filters.")}><span aria-hidden="true">🕐</span> Submit</button>
                  </div>
                </div>

                <div className="coupons-table-scroll">
                  <table className="coupons-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Coupon Code</th>
                        <th>Total</th>
                        <th>TID</th>
                        <th>OfferID</th>
                        <th>AffiliateID</th>
                        <th>Event</th>
                        <th>Status</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td colSpan="9" className="coupons-message">No data available</td></tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
