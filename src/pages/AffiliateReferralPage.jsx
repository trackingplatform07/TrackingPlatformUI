import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/Affiliates.css";
import "../css/AffiliateReferralPage.css";

const REFERRALS_API = "https://localhost:7150/api/AffiliateReferrals";

const currentUserName = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Administrator";
  } catch {
    return "Administrator";
  }
};

export default function AffiliateReferralPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const response = await fetch(REFERRALS_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load referrals");
      const data = await response.json();
      setReferrals(Array.isArray(data) ? data : []);
    } catch {
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  const markPaid = async (id) => {
    try {
      const response = await fetch(`${REFERRALS_API}/${id}/mark-paid?modifiedBy=${encodeURIComponent(currentUserName())}`, {
        method: "PATCH",
        headers: { accept: "*/*" },
      });
      if (!response.ok) throw new Error("Unable to mark referral as paid");
      await loadReferrals();
    } catch {
      alert("Unable to mark the referral as paid. Please check the API and try again.");
    }
  };

  const filtered = statusFilter ? referrals.filter((r) => r.paymentStatus === statusFilter) : referrals;
  const pageItems = filtered.slice(0, itemsPerPage);

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((v) => !v)}
        />

        <div className="of-page">
          <div className="arf-header">
            <div>
              <h2><span aria-hidden="true">🕸</span> Affiliate Referral</h2>
              <p className="arf-subtitle">Track Affiliates referred by other Affiliates and their referral commission</p>
            </div>
            <div className="arf-actions">
              <select className="of-select" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
              <button type="button" className="btn small" onClick={() => setShowFilters((v) => !v)}>
                <span aria-hidden="true">▽</span> Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="arf-filters-panel">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          )}

          <div className="of-table-wrapper">
            <table className="of-table">
              <thead>
                <tr>
                  <th>Referral By</th>
                  <th>Affiliate</th>
                  <th>Referral Percentage</th>
                  <th>Reports</th>
                  <th>Payment Status</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="6" style={{ textAlign: "center", padding: "60px" }}>
                    <div className="spinner" style={{ margin: "0 auto" }}></div>
                  </td></tr>
                )}
                {!loading && pageItems.map((r) => (
                  <tr key={r.id}>
                    <td>{r.referrerName || r.referrerAffiliateId}</td>
                    <td>{r.referredName || r.referredAffiliateId}</td>
                    <td>{r.referralPercentage}%</td>
                    <td>{r.totalCommission?.toFixed(2) ?? "0.00"} USD</td>
                    <td>
                      <span className={`status ${r.paymentStatus === "Paid" ? "approved" : "pending"}`}>{r.paymentStatus}</span>
                    </td>
                    <td>
                      {r.paymentStatus !== "Paid" && (
                        <button type="button" className="arf-manage-btn" onClick={() => markPaid(r.id)}>Mark as Paid</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && pageItems.length === 0 && (
            <div className="arf-empty-state">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 10l8-5 8 5-8 5-8-5z" stroke="#a5b4fc" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M4 10v6l8 5 8-5v-6" stroke="#c7d2fe" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              <div className="arf-empty-title">Nothing here yet</div>
              <div className="arf-empty-subtitle">There's nothing to show here right now.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
