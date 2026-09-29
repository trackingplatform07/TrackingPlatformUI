import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBullseye, FaChartBar, FaCheck, FaClock, FaDesktop, FaEllipsisV, FaFilter, FaGift, FaGlobe, FaLink, FaList, FaLock, FaPlus, FaPlusCircle, FaRegSquare, FaSearch, FaTags, FaTrash, FaUnlock, FaUserPlus, FaUsers } from "react-icons/fa";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/ApprovedOffersPage.css";

const API_URL = "https://localhost:7150/api/Offers";

const isApproved = (status) => ["approve", "approved"].includes(String(status || "").trim().toLowerCase());

const priceLabel = (price, currency) => {
  const numericPrice = Number(price || 0);
  return `${Number.isFinite(numericPrice) ? numericPrice : 0} ${currency || "-"}`;
};

export default function ApprovedOffersPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadApprovedOffers() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(API_URL, {
          headers: { accept: "*/*" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load offers");

        const data = await response.json();
        const items = Array.isArray(data) ? data : data.items || data.data || [];
        setOffers(items.filter((offer) => isApproved(offer.status)));
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setOffers([]);
          setError("Unable to load approved offers. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadApprovedOffers();
    return () => controller.abort();
  }, []);

  const filteredOffers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return offers;
    return offers.filter((offer) =>
      [offer.id, offer.offerName, offer.appId, offer.externalOfferId, offer.offerType]
        .some((value) => String(value || "").toLowerCase().includes(term))
    );
  }, [offers, search]);

  const totalPages = Math.max(1, Math.ceil(filteredOffers.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const visibleOffers = filteredOffers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const updateSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const updateItemsPerPage = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const toggleOffer = (id) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const selectOffers = (predicate) => {
    setSelectedIds(filteredOffers.filter(predicate).map((offer) => offer.id));
    setOpenMenu(null);
  };

  const normalizedStatus = (offer) => String(offer.status || "").trim().toLowerCase();

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="approved-offers-page">
          <section className="approved-offers-card">
            <div className="approved-offers-toolbar">
              <h1><FaGift /> Offers</h1>
              <div className="approved-offers-actions">
                <button type="button" className="approved-offers-button primary" onClick={() => navigate("/offers/create")}><FaPlusCircle /> Create Offer</button>
                <button type="button" className="approved-offers-button"><FaBullseye /> Events</button>
                <button type="button" className="approved-offers-button"><FaList /> Categories</button>
                <button type="button" className="approved-offers-button"><FaTags /> Top Offers</button>
                <div className="approved-offers-search">
                  <FaSearch aria-hidden="true" />
                  <input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search" aria-label="Search approved offers" />
                </div>
                <label className="approved-offers-entries">Show
                  <select value={itemsPerPage} onChange={(event) => updateItemsPerPage(event.target.value)} aria-label="Offers per page">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  entries
                </label>
                <button type="button" className="approved-offers-filter" title="Approved offers filter"><FaFilter /></button>
              </div>
            </div>

            <div className="approved-offers-table-scroll">
              <table className="approved-offers-table">
                <thead>
                  <tr>
                    <th className="approved-offers-action-header">
                      <div className="approved-offers-menu-wrapper">
                        <button
                          type="button"
                          className="approved-offers-action-trigger"
                          aria-expanded={openMenu === "action"}
                          onClick={() => setOpenMenu(openMenu === "action" ? null : "action")}
                        >
                          Action <span aria-hidden="true">▼</span>
                        </button>

                        {openMenu === "action" && (
                          <div className="approved-offers-action-dropdown">
                            <div className="approved-offers-dropdown-section">
                              <div className="approved-offers-dropdown-title">Select</div>
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => selectOffers(() => true)}>Select All</button>
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => selectOffers((offer) => isApproved(normalizedStatus(offer)))}>Select Approved</button>
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => selectOffers((offer) => normalizedStatus(offer) === "pending")}>Select Pending</button>
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => selectOffers((offer) => ["end", "ended"].includes(normalizedStatus(offer)))}>Select Ended</button>
                            </div>

                            <div className="approved-offers-dropdown-section">
                              <div className="approved-offers-dropdown-title">Change Status</div>
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaCheck /> Approve</button>
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaClock /> Pending</button>
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaRegSquare /> End</button>
                            </div>

                            <div className="approved-offers-dropdown-section">
                              <div className="approved-offers-dropdown-title">Change Visibility</div>
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaGlobe /> Public</button>
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaUnlock /> Public + Approval</button>
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaLock /> Private</button>
                            </div>

                            <div className="approved-offers-dropdown-section">
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaPlus /> Add to Top Offers</button>
                            </div>
                            <div className="approved-offers-dropdown-section">
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaTrash /> Delete</button>
                              <span className="approved-offers-dropdown-note">(Created/Inactive - last 15 days)</span>
                            </div>
                            <div className="approved-offers-dropdown-section">
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaUserPlus /> Assign Affiliates</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </th>
                    <th>Logo</th>
                    <th>Offer</th>
                    <th>TargetGeo</th>
                    <th>Revenue</th>
                    <th>Payout</th>
                    <th>Status</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="8" className="approved-offers-message">Loading approved offers…</td></tr>}
                  {!loading && error && <tr><td colSpan="8" className="approved-offers-message error">{error}</td></tr>}
                  {!loading && !error && visibleOffers.length === 0 && <tr><td colSpan="8" className="approved-offers-message">No approved offers found.</td></tr>}
                  {!loading && !error && visibleOffers.map((offer) => (
                    <tr key={offer.id}>
                      <td><input type="checkbox" checked={selectedIds.includes(offer.id)} onChange={() => toggleOffer(offer.id)} aria-label={`Select ${offer.offerName || `offer ${offer.id}`}`} /></td>
                      <td>
                        {offer.uploadLogo ? <img className="approved-offers-logo" src={offer.uploadLogo} alt="" /> : <div className="approved-offers-logo-placeholder" aria-hidden="true"><FaGift /></div>}
                      </td>
                      <td><button type="button" className="approved-offers-name" onClick={() => navigate(`/offers/${offer.id}/edit`)}>{offer.id} : {offer.offerName || "Untitled offer"}</button></td>
                      <td><span className="approved-offers-geo">◎</span> {offer.targetGeo || "All Countries"}</td>
                      <td>{priceLabel(offer.advertiserPrice, offer.advertiserCurrency)}</td>
                      <td>{priceLabel(offer.affiliatePrice, offer.affiliateCurrency || offer.advertiserCurrency)}</td>
                      <td><span className="approved-offers-status">◎ Active</span></td>
                      <td>
                        <div className="approved-offers-menu-wrapper">
                          <button
                            type="button"
                            className="approved-offers-options"
                            title={`Options for ${offer.offerName || "offer"}`}
                            aria-label={`Options for ${offer.offerName || "offer"}`}
                            aria-expanded={openMenu === offer.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenMenu(openMenu === offer.id ? null : offer.id);
                            }}
                          >
                            <FaEllipsisV />
                          </button>

                          {openMenu === offer.id && (
                            <div className="approved-offers-row-dropdown">
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaLink /> Affiliate Tracking URL</button>
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaChartBar /> Reports</button>
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaUsers /> Affiliates</button>
                              <button type="button" className="approved-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaDesktop /> Advertiser Test Link</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && !error && filteredOffers.length > 0 && (
              <footer className="approved-offers-pagination">
                <span>Showing {(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, filteredOffers.length)} of {filteredOffers.length}</span>
                <div>
                  <button type="button" disabled={page === 1} onClick={() => setCurrentPage((value) => value - 1)}>Previous</button>
                  <span>{page} / {totalPages}</span>
                  <button type="button" disabled={page === totalPages} onClick={() => setCurrentPage((value) => value + 1)}>Next</button>
                </div>
              </footer>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
