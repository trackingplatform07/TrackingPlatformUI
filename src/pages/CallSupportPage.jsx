import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/CallSupportPage.css";

const TICKETS_API = "https://localhost:7150/api/SupportTickets";

const PREFERRED_TIMES = ["Morning (9am - 12pm)", "Afternoon (12pm - 4pm)", "Evening (4pm - 7pm)"];

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

export default function CallSupportPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [phone, setPhone] = useState("");
  const [preferredTime, setPreferredTime] = useState(PREFERRED_TIMES[0]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(TICKETS_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load callback requests");
      const data = await response.json();
      setRequests(Array.isArray(data) ? data.filter((ticket) => ticket.type === "Call Support") : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const submitCallback = async () => {
    if (!phone.trim()) {
      alert("Please enter a phone number.");
      return;
    }
    try {
      setSaving(true);
      const response = await fetch(TICKETS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({
          subject: `Callback Request - ${phone.trim()}`,
          type: "Call Support",
          query: `Phone: ${phone.trim()}\nPreferred time: ${preferredTime}\n${message.trim() ? `Message: ${message.trim()}` : ""}`.trim(),
          createdBy: currentUserName(),
        }),
      });
      if (!response.ok) throw new Error("Unable to request callback");
      setPhone("");
      setMessage("");
      await loadRequests();
      alert("Your callback request has been submitted. Our team will reach out shortly.");
    } catch {
      alert("Unable to submit the callback request. Please check the API and try again.");
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

        <main className="cs-page">
          <section className="cs-card">
            <h1><span aria-hidden="true">📞</span> Call Support</h1>
            <p className="cs-subtitle">Reach our team directly or request a callback</p>

            <div className="cs-contact-grid">
              <div className="cs-contact-card">
                <span className="cs-contact-icon">📧</span>
                <div>
                  <div className="cs-contact-label">Email</div>
                  <a className="cs-contact-value" href="mailto:support@offer18.com">support@offer18.com</a>
                </div>
              </div>
              <div className="cs-contact-card">
                <span className="cs-contact-icon">☎️</span>
                <div>
                  <div className="cs-contact-label">Phone</div>
                  <a className="cs-contact-value" href="tel:+18005550199">+1 (800) 555-0199</a>
                </div>
              </div>
              <div className="cs-contact-card">
                <span className="cs-contact-icon">💬</span>
                <div>
                  <div className="cs-contact-label">Support Hours</div>
                  <div className="cs-contact-value">Mon - Fri, 9am - 7pm</div>
                </div>
              </div>
            </div>

            <h2 className="cs-section-title">Request a Callback</h2>
            <div className="cs-form">
              <div className="cs-field">
                <label>Phone Number</label>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+1 555 000 0000" />
              </div>
              <div className="cs-field">
                <label>Preferred Time</label>
                <select value={preferredTime} onChange={(event) => setPreferredTime(event.target.value)}>
                  {PREFERRED_TIMES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className="cs-field cs-field-wide">
                <label>Message (optional)</label>
                <textarea rows={3} value={message} onChange={(event) => setMessage(event.target.value)} />
              </div>
              <button type="button" className="cs-submit-btn" onClick={submitCallback} disabled={saving}>
                {saving ? "Submitting…" : "Request Callback"}
              </button>
            </div>

            <h2 className="cs-section-title">Your Callback Requests</h2>
            <div className="cs-table-scroll">
              <table className="cs-table">
                <thead>
                  <tr><th>Requested On</th><th>Details</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="3" className="cs-message">Loading requests…</td></tr>}
                  {!loading && requests.length === 0 && <tr><td colSpan="3" className="cs-message">No callback requests yet</td></tr>}
                  {!loading && requests.map((request) => (
                    <tr key={request.id}>
                      <td>{formatDateTime(request.createdOn)}</td>
                      <td className="cs-query-cell">{request.query}</td>
                      <td><span className={`cs-status-pill ${request.status.toLowerCase()}`}>{request.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
