import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import AddAffiliateModal from "../components/AddAffiliateModal";
import "../css/Affiliates.css";
import "../css/PendingAffiliatesPage.css";

const AFFILIATES_API = "https://localhost:7029/api/Affiliates";

const COUNTRY_FLAGS = {
  India: "🇮🇳",
  "United States": "🇺🇸",
  "United States of America": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Pakistan: "🇵🇰",
  "United Arab Emirates": "🇦🇪",
  Brazil: "🇧🇷",
  Bangladesh: "🇧🇩",
};

const DEFAULT_COLUMNS = {
  affiliateId: true,
  name: true,
  email: true,
  contact: true,
  company: true,
  country: true,
  manager: true,
  status: true,
  clicks: true,
  conversions: true,
  options: true,
};

export default function PendingAffiliatesPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [statusFilter, setStatusFilter] = useState("Pending");
  const [countryFilter, setCountryFilter] = useState("");
  const [managerFilter, setManagerFilter] = useState("");
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const [showFilters, setShowFilters] = useState(true);
  const [showColumns, setShowColumns] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
  const [openRowIndex, setOpenRowIndex] = useState(null);

  const columnsRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(AFFILIATES_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load affiliates");
      const resData = await response.json();
      setData(
        Array.isArray(resData)
          ? resData.map((item) => ({
              id: item.id,
              name: `${item.firstName || ""} ${item.lastName || ""}`.trim() || "-",
              email: item.email || "-",
              contact: item.contact || "-",
              company: item.company || "-",
              country: item.country || "-",
              manager: item.manager || "-",
              status: item.status || "Pending",
            }))
          : []
      );
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (columnsRef.current && !columnsRef.current.contains(e.target)) {
        setShowColumns(false);
      }
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`${AFFILIATES_API}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({ id, status, isActive: status === "Approved" }),
      });
      if (!response.ok) throw new Error("Unable to update status");
      setData((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    } catch {
      alert("Unable to update the affiliate's status. Please check the API and try again.");
    }
  };

  const countries = Array.from(new Set(data.map((item) => item.country).filter((c) => c && c !== "-"))).sort();
  const managers = Array.from(new Set(data.map((item) => item.manager).filter((m) => m && m !== "-"))).sort();

  const totalAffiliates = data.length;
  const approvedCount = data.filter((item) => item.status === "Approved").length;
  const rejectedCount = data.filter((item) => item.status === "Rejected").length;
  const pendingCount = data.filter((item) => item.status === "Pending").length;
  const pct = (count) => (totalAffiliates === 0 ? 0 : Math.round((count / totalAffiliates) * 100));

  const filtered = data.filter((item) => {
    if (statusFilter && item.status !== statusFilter) return false;
    if (countryFilter && item.country !== countryFilter) return false;
    if (managerFilter && item.manager !== managerFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      if (
        !item.name.toLowerCase().includes(term) &&
        !item.email.toLowerCase().includes(term) &&
        !item.company.toLowerCase().includes(term) &&
        !String(item.id).includes(term)
      )
        return false;
    }
    return true;
  });

  const activeFilterCount = [statusFilter, countryFilter, managerFilter].filter(Boolean).length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pageItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, countryFilter, managerFilter, search, itemsPerPage]);

  const resetFilters = () => {
    setStatusFilter("Pending");
    setCountryFilter("");
    setManagerFilter("");
  };

  const toggleColumn = (key) => setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <div className="of-page">
          <div className="paff-top">
            <div>
              <h2><span aria-hidden="true">👥</span> Affiliates</h2>
              <p className="paff-subtitle">Manage your Affiliate partners and track their status</p>
            </div>

            <div className="paff-stats">
              <div className="paff-stat-card">
                <span className="paff-stat-icon blue">👤</span>
                <div>
                  <div className="paff-stat-value">{totalAffiliates} <span className="paff-stat-pct">all</span></div>
                  <div className="paff-stat-label">Total Affiliates</div>
                </div>
              </div>
              <div className="paff-stat-card">
                <span className="paff-stat-icon green">✓</span>
                <div>
                  <div className="paff-stat-value">{approvedCount} <span className="paff-stat-pct">{pct(approvedCount)}%</span></div>
                  <div className="paff-stat-label">Approved</div>
                </div>
              </div>
              <div className="paff-stat-card">
                <span className="paff-stat-icon red">✕</span>
                <div>
                  <div className="paff-stat-value">{rejectedCount} <span className="paff-stat-pct">{pct(rejectedCount)}%</span></div>
                  <div className="paff-stat-label">Rejected</div>
                </div>
              </div>
              <div className="paff-stat-card">
                <span className="paff-stat-icon amber">⏳</span>
                <div>
                  <div className="paff-stat-value">{pendingCount} <span className="paff-stat-pct">{pct(pendingCount)}%</span></div>
                  <div className="paff-stat-label">Pending review</div>
                </div>
              </div>
            </div>
          </div>

          <div className="paff-toolbar">
            {showFilters && (
              <div className="paff-filter-row">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
                  <option value="">All Countries</option>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)}>
                  <option value="">All Managers</option>
                  {managers.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <button type="button" className="paff-reset-link" onClick={resetFilters}>Reset</button>
              </div>
            )}

            <div className="paff-actions">
              <input
                type="text"
                placeholder="Search affiliates..."
                className="of-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select className="of-select" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
              <button type="button" className="btn small" onClick={() => setShowFilters((v) => !v)}>
                Filters {activeFilterCount > 0 && <span className="paff-badge">{activeFilterCount}</span>}
              </button>
              <div className="paff-columns-wrap" ref={columnsRef}>
                <button type="button" className="btn small" onClick={() => setShowColumns((v) => !v)}>Columns</button>
                {showColumns && (
                  <div className="paff-columns-dropdown">
                    {Object.keys(DEFAULT_COLUMNS).map((key) => (
                      <label key={key} className="paff-columns-item">
                        <input type="checkbox" checked={visibleColumns[key]} onChange={() => toggleColumn(key)} />
                        <span>{key}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" className="btn primary small" onClick={() => setShowAddModal(true)}>+ Add Affiliate</button>
            </div>
          </div>

          <div className="of-table-wrapper">
            <table className="of-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}></th>
                  {visibleColumns.affiliateId && <th>AffiliateID</th>}
                  {visibleColumns.name && <th>Name</th>}
                  {visibleColumns.email && <th>Email</th>}
                  {visibleColumns.contact && <th>Contact</th>}
                  {visibleColumns.company && <th>Company</th>}
                  {visibleColumns.country && <th>Country</th>}
                  {visibleColumns.manager && <th>Manager</th>}
                  {visibleColumns.status && <th>Status</th>}
                  {visibleColumns.clicks && <th>Clicks</th>}
                  {visibleColumns.conversions && <th>Conversions</th>}
                  {visibleColumns.options && <th>Options</th>}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="12" style={{ textAlign: "center", padding: "60px" }}>
                    <div className="spinner" style={{ margin: "0 auto" }}></div>
                  </td></tr>
                )}
                {!loading && pageItems.length === 0 && (
                  <tr><td colSpan="12" style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
                    No affiliates found
                  </td></tr>
                )}
                {!loading && pageItems.map((row, index) => (
                  <tr key={row.id}>
                    <td style={{ width: "40px" }}></td>
                    {visibleColumns.affiliateId && (
                      <td className="link" style={{ cursor: "pointer" }} onClick={() => navigate(`/affiliate/${row.id}`)}>
                        {row.id}
                      </td>
                    )}
                    {visibleColumns.name && <td>{row.name}</td>}
                    {visibleColumns.email && <td>{row.email}</td>}
                    {visibleColumns.contact && <td>{row.contact}</td>}
                    {visibleColumns.company && <td>{row.company}</td>}
                    {visibleColumns.country && (
                      <td>{COUNTRY_FLAGS[row.country] || "🌐"} {row.country}</td>
                    )}
                    {visibleColumns.manager && <td>{row.manager}</td>}
                    {visibleColumns.status && (
                      <td>
                        <span className={`status ${row.status === "Approved" ? "approved" : row.status === "Rejected" ? "rejected" : "pending"}`}>
                          {row.status}
                        </span>
                      </td>
                    )}
                    {visibleColumns.clicks && <td>-</td>}
                    {visibleColumns.conversions && <td>-</td>}
                    {visibleColumns.options && (
                      <td>
                        <div className="option-wrapper">
                          <button
                            className="option-btn"
                            onClick={(e) => { e.stopPropagation(); setOpenRowIndex(openRowIndex === index ? null : index); }}
                          >
                            ⋮
                          </button>
                          {openRowIndex === index && (
                            <div className="row-dropdown" onClick={(e) => e.stopPropagation()}>
                              <div className="dropdown-item" onClick={() => { navigate(`/affiliate/${row.id}`); setOpenRowIndex(null); }}>👤 View Details</div>
                              <div className="dropdown-divider"></div>
                              <div className="dropdown-item" onClick={() => { updateStatus(row.id, "Approved"); setOpenRowIndex(null); }}>✓ Approve</div>
                              <div className="dropdown-item" onClick={() => { updateStatus(row.id, "Rejected"); setOpenRowIndex(null); }}>✕ Reject</div>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
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

        {showAddModal && (
          <AddAffiliateModal onClose={() => { setShowAddModal(false); loadData(); }} />
        )}
      </div>
    </div>
  );
}
