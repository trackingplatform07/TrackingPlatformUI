import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/Modal.css";
import "../css/Affiliates.css";
import "../css/AffiliateBillingPage.css";

const INVOICES_API = "https://localhost:7150/api/AffiliateInvoices";
const AFFILIATES_API = "https://localhost:7029/api/Affiliates";
const COMPANY_PROFILE_API = "https://localhost:7150/api/CompanyProfiles";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const formatMoney = (value) => `${Number(value || 0).toFixed(3)} USD`;

const formatDateDash = (value) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");

const parseInvoiceItems = (note) => {
  if (!note) return [];
  const match = note.split(" | ").find((part) => part.startsWith("Items: "));
  if (!match) return [];
  const itemsText = match.replace("Items: ", "");
  return itemsText
    .split("; ")
    .map((entry) => {
      const result = /^(.*)\s\(([\d.]+)\)$/.exec(entry.trim());
      if (!result) return null;
      return { description: result[1], amount: Number(result[2]) };
    })
    .filter(Boolean);
};

const currentUserName = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Administrator";
  } catch {
    return "Administrator";
  }
};

export default function AffiliateBillingPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [openRowIndex, setOpenRowIndex] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const rowMenuRef = useRef(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch(INVOICES_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load invoices");
      const data = await response.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target)) setOpenRowIndex(null);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const markPaid = async (id) => {
    try {
      const response = await fetch(`${INVOICES_API}/${id}/mark-paid?modifiedBy=${encodeURIComponent(currentUserName())}`, {
        method: "PATCH",
        headers: { accept: "*/*" },
      });
      if (!response.ok) throw new Error("Unable to mark invoice as paid");
      await loadInvoices();
    } catch {
      alert("Unable to mark the invoice as paid. Please check the API and try again.");
    }
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      const response = await fetch(`${INVOICES_API}/${id}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to delete invoice");
      await loadInvoices();
    } catch {
      alert("Unable to delete the invoice. Please check the API and try again.");
    }
  };

  const filtered = statusFilter ? invoices.filter((inv) => inv.status === statusFilter) : invoices;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pageItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, itemsPerPage]);

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((v) => !v)}
        />

        <div className="of-page">
          <div className="abp-header">
            <div>
              <h2><span aria-hidden="true">🧾</span> Affiliate Billing</h2>
              <p className="abp-subtitle">Create Affiliate invoices and track their payment status</p>
            </div>
            <div className="abp-actions">
              <select className="of-select" value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
              <button type="button" className="btn small" onClick={() => setShowFilters((v) => !v)}>
                <span aria-hidden="true">▽</span> Filters
              </button>
              <button type="button" className="btn primary small" onClick={() => navigate("/affiliates/billing/create")}>
                + Create Invoice
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="abp-filters-panel">
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
                  <th>Invoice ID</th>
                  <th>Affiliate</th>
                  <th>Invoice Date / Period</th>
                  <th>Due Date</th>
                  <th>Payment Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="9" style={{ textAlign: "center", padding: "60px" }}>
                    <div className="spinner" style={{ margin: "0 auto" }}></div>
                  </td></tr>
                )}
                {!loading && pageItems.length === 0 && (
                  <tr><td colSpan="9" style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
                    No invoices yet
                  </td></tr>
                )}
                {!loading && pageItems.map((inv, index) => (
                  <tr key={inv.id}>
                    <td className="link" style={{ cursor: "pointer" }} onClick={() => setViewingInvoice(inv)}>#{inv.invoiceNumber}</td>
                    <td>
                      <span className="abp-affiliate-badge">{inv.affiliateId}</span>{" "}
                      <span className="link" style={{ cursor: "pointer" }} onClick={() => navigate(`/affiliate/${inv.affiliateId}`)}>
                        {inv.affiliateName || "-"}
                      </span>
                    </td>
                    <td className="abp-period-cell">
                      <div>Invoice Date : {formatDate(inv.invoiceDate)}</div>
                      <div className="abp-period-sub">
                        Period : {formatDate(inv.periodStart)} - {formatDate(inv.periodEnd)} (TZ {inv.timezoneOffset})
                      </div>
                    </td>
                    <td>{formatDate(inv.dueDate)}</td>
                    <td>{inv.paymentDate ? formatDate(inv.paymentDate) : "-"}</td>
                    <td>{formatMoney(inv.totalAmount)}</td>
                    <td>
                      <span className={`status ${inv.status === "Paid" ? "approved" : "pending"}`}>{inv.status}</span>
                    </td>
                    <td className="abp-note-cell">{inv.note || "-"}</td>
                    <td>
                      <div className="option-wrapper" ref={openRowIndex === index ? rowMenuRef : null}>
                        <button
                          className="option-btn"
                          onClick={(e) => { e.stopPropagation(); setOpenRowIndex(openRowIndex === index ? null : index); }}
                        >
                          ⋮
                        </button>
                        {openRowIndex === index && (
                          <div className="row-dropdown">
                            {inv.status !== "Paid" && (
                              <div className="dropdown-item" onClick={() => { markPaid(inv.id); setOpenRowIndex(null); }}>
                                ✓ Mark as Paid
                              </div>
                            )}
                            <div className="dropdown-item danger" onClick={() => { deleteInvoice(inv.id); setOpenRowIndex(null); }}>
                              🗑 Delete
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
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
      </div>

      {viewingInvoice && (
        <InvoiceDetailModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />
      )}
    </div>
  );
}

function InvoiceDetailModal({ invoice, onClose }) {
  const [company, setCompany] = useState(null);
  const [affiliate, setAffiliate] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(COMPANY_PROFILE_API, { headers: { accept: "*/*" }, signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then(setCompany)
      .catch(() => {});

    fetch(`${AFFILIATES_API}/${invoice.affiliateId}`, { headers: { accept: "*/*" }, signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then(setAffiliate)
      .catch(() => {});

    return () => controller.abort();
  }, [invoice.affiliateId]);

  const items = parseInvoiceItems(invoice.note);
  const subTotal = items.length > 0 ? items.reduce((sum, item) => sum + item.amount, 0) : Number(invoice.totalAmount || 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="inv-modal-topbar">
          <div className="inv-modal-title"><span aria-hidden="true">📄</span> Affiliate Invoice <span className="inv-modal-id">#{invoice.id}</span></div>
          <div className="inv-modal-topbar-actions">
            <button type="button" className="inv-print-btn" onClick={() => window.print()}>
              <span aria-hidden="true">🖶</span> Print
            </button>
            <button type="button" className="inv-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="inv-print-area">
          <div className="inv-row-between">
            <h2 className="inv-h2">Invoice</h2>
            <div className="inv-invoice-number">Invoice No.: {invoice.invoiceNumber}</div>
          </div>

          <div className="inv-from-to">
            <div>
              <div className="inv-label">From:</div>
              <div>{company?.company || "-"}</div>
              <div>{[company?.address, company?.city, company?.state].filter(Boolean).join(", ") || "-"}</div>
              <div>{company?.country || "-"}</div>
              <div>Contact: {company?.accountEmail || "-"}</div>
            </div>
            <div className="inv-to">
              <div className="inv-label">To:</div>
              <div>{affiliate ? `${affiliate.firstName || ""} ${affiliate.lastName || ""}`.trim() || affiliate.company : "-"}</div>
              <div>{affiliate ? [affiliate.address, affiliate.city, affiliate.state].filter(Boolean).join(", ") || "-" : "-"}</div>
              <div>{affiliate?.country || "-"}</div>
              <div>Contact: {affiliate?.email || "-"}</div>
            </div>
          </div>

          <div className="inv-meta">
            <div>Reports Range : {formatDateDash(invoice.periodStart)} to {formatDateDash(invoice.periodEnd)} (TZ {invoice.timezoneOffset})</div>
            <div>Invoice Date : {formatDateDash(invoice.invoiceDate)}</div>
            <div>Due Date : {formatDateDash(invoice.dueDate)}</div>
          </div>

          <table className="inv-items-table">
            <thead>
              <tr><th>Description</th><th>Total Price</th></tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td>{invoice.note || "Invoice total"}</td><td>{formatMoney(invoice.totalAmount)}</td></tr>
              )}
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td>{formatMoney(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="inv-totals">
            <div><span>Sub Total ({invoice.currency}) :</span> <strong>{invoice.currency} {subTotal.toFixed(3)}</strong></div>
            <div><span>Discount % :</span> <strong>{invoice.currency} 0.00</strong></div>
            <div><span>Sub Total after Discount % :</span> <strong>{invoice.currency} {subTotal.toFixed(3)}</strong></div>
            <div className="inv-grand-total"><span>Total :</span> <strong>{invoice.currency} {Number(invoice.totalAmount).toFixed(3)}</strong></div>
          </div>

          <p className="inv-footer-note">This is a computer generated invoice, no signature required.</p>
        </div>
      </div>
    </div>
  );
}
