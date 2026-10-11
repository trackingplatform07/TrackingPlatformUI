import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import AddGlobalPostbackModal from "../components/AddGlobalPostbackModal";
import AddOfferPostbackModal from "../components/AddOfferPostbackModal";
import "../css/Affiliates.css";
import "../css/AffiliatePostbackListPage.css";

const POSTBACK_API = "https://localhost:7029/api/AffiliatePostback";
const AFFILIATES_API = "https://localhost:7029/api/Affiliates";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AffiliatePostbackListPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [affiliatesList, setAffiliatesList] = useState([]);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState("");
  const [search, setSearch] = useState("");

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showGlobalModal, setShowGlobalModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingPostback, setEditingPostback] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const addMenuRef = useRef(null);

  const authHeaders = () => {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    return { accept: "*/*", Authorization: token ? `Bearer ${token}` : "" };
  };

  const loadPostbacks = async () => {
    try {
      setLoading(true);
      const response = await fetch(POSTBACK_API, { headers: authHeaders() });
      if (!response.ok) throw new Error("Unable to load postbacks");
      const apiData = await response.json();
      setData(
        apiData.map((item) => ({
          id: item.id,
          affiliateId: item.affiliateId,
          affiliateLabel: `${item.affiliateId} - ${item.affiliateName}`,
          position: item.position ? item.position.charAt(0).toUpperCase() + item.position.slice(1) : "-",
          offerId: item.offerId || "-",
          event: item.type || "-",
          integrationType: item.integrationType || "-",
          type: item.type || "-",
          postbackUrl: item.postbackURL || item.postbackUrl || "-",
          rawStatus: item.status,
          status: item.status === "active" ? "Approved" : item.status === "rejected" ? "Rejected" : "Pending",
          triggerType: item.triggerType || "-",
          updateTime: item.modifiedOn ? formatDate(item.modifiedOn) : item.createdOn ? `created on ${formatDate(item.createdOn)}` : "-",
          originalData: item,
        }))
      );
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAffiliates = async () => {
    try {
      const response = await fetch(AFFILIATES_API, { headers: authHeaders() });
      if (response.ok) setAffiliatesList(await response.json());
    } catch {
      setAffiliatesList([]);
    }
  };

  useEffect(() => {
    loadPostbacks();
    loadAffiliates();
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) setShowAddMenu(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const toggleActive = async (row) => {
    const nextStatus = row.rawStatus === "active" ? "inactive" : "active";
    try {
      const response = await fetch(`${POSTBACK_API}/status`, {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id, status: nextStatus }),
      });
      if (!response.ok) throw new Error("Unable to update status");
      await loadPostbacks();
    } catch {
      alert("Unable to update the postback's status. Please check the API and try again.");
    }
  };

  const manageRow = (row) => {
    setEditingPostback(row.originalData);
    if (row.offerId && row.offerId !== "-") {
      setShowOfferModal(true);
    } else {
      setShowGlobalModal(true);
    }
  };

  const closeModals = () => {
    setShowGlobalModal(false);
    setShowOfferModal(false);
    setEditingPostback(null);
  };

  const onSaved = () => {
    closeModals();
    loadPostbacks();
  };

  const filtered = data.filter((row) => {
    if (selectedAffiliate && String(row.affiliateId) !== selectedAffiliate) return false;
    if (search) {
      const term = search.toLowerCase();
      if (!row.affiliateLabel.toLowerCase().includes(term) && !row.postbackUrl.toLowerCase().includes(term)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pageItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedAffiliate, search]);

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((v) => !v)}
        />

        <div className="of-page">
          <div className="apb-header">
            <div>
              <h2><span aria-hidden="true">🔗</span> Affiliate Postback</h2>
              <p className="apb-subtitle">Manage global and Offer-level postbacks for your Affiliates</p>
            </div>
            <div className="apb-actions">
              <button type="button" className="btn small" onClick={() => setShowFilters((v) => !v)}>
                <span aria-hidden="true">▽</span> Filters
              </button>
              <div className="apb-add-wrap" ref={addMenuRef}>
                <button type="button" className="apb-add-btn" onClick={() => setShowAddMenu((v) => !v)}>
                  + Add Postback <span aria-hidden="true">▾</span>
                </button>
                {showAddMenu && (
                  <div className="apb-add-menu">
                    <button type="button" onClick={() => { setEditingPostback(null); setShowGlobalModal(true); setShowAddMenu(false); }}>
                      Global Postback
                    </button>
                    <button type="button" onClick={() => { setEditingPostback(null); setShowOfferModal(true); setShowAddMenu(false); }}>
                      Offer Postback
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="apb-filters-panel">
              <select value={selectedAffiliate} onChange={(e) => setSelectedAffiliate(e.target.value)}>
                <option value="">All Affiliates</option>
                {affiliatesList.map((affiliate) => (
                  <option key={affiliate.id} value={affiliate.id}>
                    {affiliate.id} - {`${affiliate.firstName || ""} ${affiliate.lastName || ""}`.trim() || affiliate.email}
                  </option>
                ))}
              </select>
              <input type="text" placeholder="Search postback URL…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          )}

          <div className="of-table-wrapper">
            <table className="of-table">
              <thead>
                <tr>
                  <th>Affiliate ID</th>
                  <th>Position</th>
                  <th>Offer ID</th>
                  <th>Event</th>
                  <th>Integration Type</th>
                  <th>Type</th>
                  <th>Postback URL</th>
                  <th>Status</th>
                  <th>Trigger</th>
                  <th>Action</th>
                  <th>Update Time</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="11" style={{ textAlign: "center", padding: "60px" }}>
                    <div className="spinner" style={{ margin: "0 auto" }}></div>
                  </td></tr>
                )}
                {!loading && pageItems.length === 0 && (
                  <tr><td colSpan="11" style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
                    No postback configurations found
                  </td></tr>
                )}
                {!loading && pageItems.map((row) => (
                  <tr key={row.id}>
                    <td className="link" style={{ cursor: "pointer" }} onClick={() => navigate(`/affiliate/${row.affiliateId}`)}>
                      {row.affiliateLabel}
                    </td>
                    <td>{row.position}</td>
                    <td>{row.offerId}</td>
                    <td>{row.event}</td>
                    <td>{row.integrationType}</td>
                    <td>{row.type}</td>
                    <td className="apb-url-cell" title={row.postbackUrl}>{row.postbackUrl}</td>
                    <td>
                      <span className={`status ${row.status === "Approved" ? "approved" : row.status === "Rejected" ? "rejected" : "pending"}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="apb-manage-btn" onClick={() => manageRow(row)}>Manage</button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`apb-toggle ${row.rawStatus === "active" ? "on" : ""}`}
                        onClick={() => toggleActive(row)}
                        aria-pressed={row.rawStatus === "active"}
                      >
                        <span className="apb-toggle-knob" />
                      </button>
                    </td>
                    <td className="apb-update-time">{row.updateTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
              </div>
              <div className="pagination-controls">
                <button className="pagination-nav-btn" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>‹</button>
                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} className={`pagination-number ${currentPage === p ? "active" : ""}`} onClick={() => setCurrentPage(p)}>{p}</button>
                  ))}
                </div>
                <button className="pagination-nav-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>›</button>
              </div>
            </div>
          )}
        </div>

        {showGlobalModal && (
          <AddGlobalPostbackModal onClose={closeModals} editingData={editingPostback} onSaved={onSaved} />
        )}
        {showOfferModal && (
          <AddOfferPostbackModal onClose={closeModals} editingData={editingPostback} onSaved={onSaved} />
        )}
      </div>
    </div>
  );
}
