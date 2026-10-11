import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/Modal.css";
import "../css/TicketsPage.css";

const TICKETS_API = "https://localhost:7150/api/SupportTickets";

const TICKET_TYPES = ["Feedback", "Bug", "Billing", "Technical", "Other"];

const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const currentUserName = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
    return name || "Administrator";
  } catch {
    return "Administrator";
  }
};

export default function TicketsPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRaiseModal, setShowRaiseModal] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(TICKETS_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load tickets");
      const data = await response.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="tk-page">
          <section className="tk-card">
            <div className="tk-header">
              <div>
                <h1><span aria-hidden="true">🎫</span> Tickets</h1>
                <p className="tk-subtitle">Raise a support request and follow our replies</p>
              </div>
              <div className="tk-toolbar">
                <button type="button" className="tk-raise-btn" onClick={() => setShowRaiseModal(true)}>
                  <span aria-hidden="true">+</span> Raise a Ticket
                </button>
                <button type="button" className="tk-refresh-btn" onClick={loadTickets}>
                  <span aria-hidden="true">☰</span> Tickets
                </button>
              </div>
            </div>

            <div className="tk-table-scroll">
              <table className="tk-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Created By</th>
                    <th>Created On</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Updated On</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="6" className="tk-message">Loading tickets…</td></tr>}
                  {!loading && tickets.length === 0 && <tr><td colSpan="6" className="tk-message">No tickets raised yet</td></tr>}
                  {!loading && tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <span className="tk-number-badge">{ticket.ticketNumber}</span> {ticket.subject}
                      </td>
                      <td>{ticket.createdBy || "-"}</td>
                      <td>{formatDateTime(ticket.createdOn)}</td>
                      <td>{ticket.type}</td>
                      <td><span className={`tk-status-pill ${ticket.status.toLowerCase()}`}>{ticket.status}</span></td>
                      <td>{ticket.updatedOn ? formatDateTime(ticket.updatedOn) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {showRaiseModal && (
        <RaiseTicketModal onClose={() => setShowRaiseModal(false)} onCreated={loadTickets} />
      )}
    </div>
  );
}

function RaiseTicketModal({ onClose, onCreated }) {
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("");
  const [query, setQuery] = useState("");
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!subject.trim() || !type || !query.trim()) {
      alert("Subject, Type and Query are required.");
      return;
    }
    try {
      setSaving(true);
      const response = await fetch(TICKETS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({
          subject: subject.trim(),
          type,
          query: query.trim(),
          attachmentFileName: fileName || null,
          createdBy: currentUserName(),
        }),
      });
      if (!response.ok) throw new Error("Unable to raise ticket");
      await onCreated();
      onClose();
    } catch {
      alert("Unable to raise the ticket. Please check the API and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="tk-modal" onClick={(event) => event.stopPropagation()}>
        <div className="tk-modal-header">
          <h2>Raise Ticket</h2>
          <button type="button" onClick={onClose}>✕</button>
        </div>
        <div className="tk-modal-body">
          <div className="tk-field">
            <label>Subject</label>
            <input value={subject} onChange={(event) => setSubject(event.target.value)} />
          </div>
          <div className="tk-field">
            <label>Type</label>
            <select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="">Select type</option>
              {TICKET_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="tk-field">
            <label>Upload</label>
            <label className="tk-upload-btn">
              <span aria-hidden="true">⇧</span> Choose Files
              <input type="file" hidden onChange={(event) => setFileName(event.target.files?.[0]?.name || "")} />
            </label>
            {fileName && <div className="tk-upload-filename">{fileName}</div>}
          </div>
          <div className="tk-field">
            <label>Query</label>
            <textarea rows={5} value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="tk-modal-footer">
            <button type="button" className="tk-submit-btn" onClick={submit} disabled={saving}>
              <span aria-hidden="true">⇧</span> {saving ? "Submitting…" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
