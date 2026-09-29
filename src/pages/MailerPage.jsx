import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/Modal.css";
import "../css/MailerPage.css";

const ADVERTISERS_API = "https://localhost:7129/api/Advertisers";
const AFFILIATES_API = "https://localhost:7029/api/Affiliates";
const TEMPLATES_API = "https://localhost:7150/api/MailerTemplates";
const SMTP_API = "https://localhost:7150/api/SmtpSettings";
const MAILER_LOGS_API = "https://localhost:7150/api/MailerLogs";

const BULK_STATUSES = ["Approved", "Pending", "Rejected"];

const personName = (person) =>
  [person.firstName, person.lastName].filter(Boolean).join(" ") || person.companyName || `#${person.id}`;

const uniqueCountries = (people) =>
  Array.from(new Set(people.map((person) => person.country).filter(Boolean))).sort();

export default function MailerPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [advertisers, setAdvertisers] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(true);

  const [selectedAdvertiserId, setSelectedAdvertiserId] = useState("");
  const [selectedAffiliateId, setSelectedAffiliateId] = useState("");
  const [bulkAdvertiserStatuses, setBulkAdvertiserStatuses] = useState([]);
  const [bulkAffiliateStatuses, setBulkAffiliateStatuses] = useState([]);
  const [advertiserCountry, setAdvertiserCountry] = useState("");
  const [affiliateCountry, setAffiliateCountry] = useState("");

  const [customEmail, setCustomEmail] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [schedule, setSchedule] = useState("Send Now");
  const [scheduledOn, setScheduledOn] = useState("");

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showSmtpModal, setShowSmtpModal] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadDirectory = async () => {
      try {
        setLoadingDirectory(true);
        const [advertisersRes, affiliatesRes] = await Promise.all([
          fetch(ADVERTISERS_API, { headers: { accept: "*/*" }, signal: controller.signal }),
          fetch(AFFILIATES_API, { headers: { accept: "*/*" }, signal: controller.signal }),
        ]);
        const advertisersData = advertisersRes.ok ? await advertisersRes.json() : [];
        const affiliatesData = affiliatesRes.ok ? await affiliatesRes.json() : [];
        setAdvertisers(Array.isArray(advertisersData) ? advertisersData : advertisersData.items || advertisersData.data || []);
        setAffiliates(Array.isArray(affiliatesData) ? affiliatesData : affiliatesData.items || affiliatesData.data || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setAdvertisers([]);
          setAffiliates([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoadingDirectory(false);
      }
    };

    loadDirectory();
    return () => controller.abort();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch(TEMPLATES_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load templates");
      const data = await response.json();
      setTemplates(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setTemplates([]);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const advertiserCountries = useMemo(() => uniqueCountries(advertisers), [advertisers]);
  const affiliateCountries = useMemo(() => uniqueCountries(affiliates), [affiliates]);

  const toggleBulkStatus = (group, status) => {
    const setter = group === "advertiser" ? setBulkAdvertiserStatuses : setBulkAffiliateStatuses;
    setter((current) => (current.includes(status) ? current.filter((item) => item !== status) : [...current, status]));
  };

  const resolvedRecipients = useMemo(() => {
    const emails = new Set();

    if (selectedAdvertiserId) {
      const advertiser = advertisers.find((item) => String(item.id) === String(selectedAdvertiserId));
      if (advertiser?.email) emails.add(advertiser.email);
    }
    if (selectedAffiliateId) {
      const affiliate = affiliates.find((item) => String(item.id) === String(selectedAffiliateId));
      if (affiliate?.email) emails.add(affiliate.email);
    }

    if (bulkAdvertiserStatuses.length > 0) {
      advertisers
        .filter((advertiser) => bulkAdvertiserStatuses.includes(advertiser.status))
        .filter((advertiser) => !advertiserCountry || advertiser.country === advertiserCountry)
        .forEach((advertiser) => advertiser.email && emails.add(advertiser.email));
    }
    if (bulkAffiliateStatuses.length > 0) {
      affiliates
        .filter((affiliate) => bulkAffiliateStatuses.includes(affiliate.status))
        .filter((affiliate) => !affiliateCountry || affiliate.country === affiliateCountry)
        .forEach((affiliate) => affiliate.email && emails.add(affiliate.email));
    }

    customEmail
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .forEach((value) => emails.add(value));

    return Array.from(emails);
  }, [advertisers, affiliates, selectedAdvertiserId, selectedAffiliateId, bulkAdvertiserStatuses, bulkAffiliateStatuses, advertiserCountry, affiliateCountry, customEmail]);

  const applyTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    const template = templates.find((item) => String(item.id) === String(templateId));
    if (template) {
      setSubject(template.subject || "");
      setBody(template.body || "");
    }
  };

  const sendMailer = async () => {
    if (!subject.trim()) {
      alert("Please enter a subject.");
      return;
    }
    if (resolvedRecipients.length === 0) {
      alert("Please select an advertiser, affiliate, bulk group, or enter a custom email — no recipients resolved yet.");
      return;
    }
    if (schedule === "Schedule Later" && !scheduledOn) {
      alert("Please choose a schedule date/time.");
      return;
    }

    const payload = {
      advertiserId: selectedAdvertiserId ? Number(selectedAdvertiserId) : null,
      affiliateId: selectedAffiliateId ? Number(selectedAffiliateId) : null,
      bulkAdvertiserStatus: bulkAdvertiserStatuses.join(",") || null,
      bulkAffiliateStatus: bulkAffiliateStatuses.join(",") || null,
      advertiserCountry: advertiserCountry || null,
      affiliateCountry: affiliateCountry || null,
      recipients: resolvedRecipients.join(","),
      cc: cc.trim() || null,
      bcc: bcc.trim() || null,
      schedule,
      scheduledOn: schedule === "Schedule Later" && scheduledOn ? new Date(scheduledOn).toISOString() : null,
      templateId: selectedTemplateId ? Number(selectedTemplateId) : null,
      subject: subject.trim(),
      body,
      recipientCount: resolvedRecipients.length,
    };

    try {
      setSending(true);
      setLastResult(null);
      const response = await fetch(`${MAILER_LOGS_API}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Unable to send mailer");
      const result = await response.json();
      setLastResult(result);
    } catch {
      alert("Unable to reach the Mailer API. Please check the backend and try again.");
    } finally {
      setSending(false);
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

        <main className="mailer-page">
          <section className="mailer-card">
            <div className="mailer-toolbar">
              <h1><span aria-hidden="true">📧</span> Mailer</h1>
              <div className="mailer-toolbar-actions">
                <button type="button" className="mailer-button" onClick={() => navigate("/tools/mailer/templates")}>
                  <span aria-hidden="true">📄</span> Templates
                </button>
                <button type="button" className="mailer-button" onClick={() => setShowLogsModal(true)}>
                  <span aria-hidden="true">📋</span> Mailer Logs
                </button>
                <button type="button" className="mailer-button" onClick={() => setShowSmtpModal(true)}>
                  <span aria-hidden="true">📤</span> SMTP
                </button>
              </div>
            </div>

            <div className="mailer-target-grid">
              <div className="mailer-target-column">
                <label>Select Advertiser</label>
                <select value={selectedAdvertiserId} onChange={(event) => setSelectedAdvertiserId(event.target.value)} disabled={loadingDirectory}>
                  <option value="">{loadingDirectory ? "Loading advertisers…" : "Select Advertiser"}</option>
                  {advertisers.map((advertiser) => <option key={advertiser.id} value={advertiser.id}>{advertiser.id} ~ {personName(advertiser)}</option>)}
                </select>

                {BULK_STATUSES.map((status) => (
                  <label className="mailer-checkbox-row" key={`adv-${status}`}>
                    <input
                      type="checkbox"
                      checked={bulkAdvertiserStatuses.includes(status)}
                      onChange={() => toggleBulkStatus("advertiser", status)}
                    />
                    Bulk Advertisers : {status}
                  </label>
                ))}

                <label>Advertiser Country</label>
                <select value={advertiserCountry} onChange={(event) => setAdvertiserCountry(event.target.value)}>
                  <option value="">Select Country</option>
                  {advertiserCountries.map((country) => <option key={country} value={country}>{country}</option>)}
                </select>
              </div>

              <div className="mailer-target-column">
                <label>Select Affiliate</label>
                <select value={selectedAffiliateId} onChange={(event) => setSelectedAffiliateId(event.target.value)} disabled={loadingDirectory}>
                  <option value="">{loadingDirectory ? "Loading affiliates…" : "Select Affiliate"}</option>
                  {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {personName(affiliate)}</option>)}
                </select>

                {BULK_STATUSES.map((status) => (
                  <label className="mailer-checkbox-row" key={`aff-${status}`}>
                    <input
                      type="checkbox"
                      checked={bulkAffiliateStatuses.includes(status)}
                      onChange={() => toggleBulkStatus("affiliate", status)}
                    />
                    Bulk Affiliates : {status}
                  </label>
                ))}

                <label>Affiliate Country</label>
                <select value={affiliateCountry} onChange={(event) => setAffiliateCountry(event.target.value)}>
                  <option value="">Select Country</option>
                  {affiliateCountries.map((country) => <option key={country} value={country}>{country}</option>)}
                </select>
              </div>
            </div>

            <hr className="mailer-divider" />

            <div className="mailer-field">
              <label>Custom Email</label>
              <input placeholder="email@example.com,support@example.com" value={customEmail} onChange={(event) => setCustomEmail(event.target.value)} />
            </div>

            <div className="mailer-field">
              <label>CC</label>
              <input placeholder="cc@example.com,support@example.com" value={cc} onChange={(event) => setCc(event.target.value)} />
            </div>

            <div className="mailer-field">
              <label>BCC</label>
              <input placeholder="bcc@example.com,support@example.com" value={bcc} onChange={(event) => setBcc(event.target.value)} />
            </div>

            <div className="mailer-field">
              <label>Schedule</label>
              <select value={schedule} onChange={(event) => setSchedule(event.target.value)}>
                <option>Send Now</option>
                <option>Schedule Later</option>
              </select>
              {schedule === "Schedule Later" && (
                <input
                  type="datetime-local"
                  className="mailer-schedule-input"
                  value={scheduledOn}
                  onChange={(event) => setScheduledOn(event.target.value)}
                />
              )}
            </div>

            <div className="mailer-field">
              <label>Select Template</label>
              <select value={selectedTemplateId} onChange={(event) => applyTemplate(event.target.value)}>
                <option value="">Select Template</option>
                {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
              </select>
            </div>

            <div className="mailer-field">
              <label>subject</label>
              <input placeholder="Welcome Email" value={subject} onChange={(event) => setSubject(event.target.value)} />
            </div>

            <div className="mailer-field">
              <label>Body</label>
              <div className="mailer-editor">
                <div className="mailer-editor-toolbar">
                  {["📁", "↶", "↷", "❝❝", "B", "I", "U", "S", "🔗", "🖼", "📊", "≡"].map((icon, index) => (
                    <button type="button" key={index} onClick={() => {}}>{icon}</button>
                  ))}
                  <select disabled><option>Styles</option></select>
                  <select disabled><option>Format</option></select>
                </div>
                <textarea value={body} onChange={(event) => setBody(event.target.value)} />
              </div>
            </div>

            <div className="mailer-recipient-summary">
              {resolvedRecipients.length} recipient{resolvedRecipients.length === 1 ? "" : "s"} resolved
            </div>

            <div className="mailer-footer">
              <button type="button" className="mailer-ai-btn" onClick={() => alert("AI Rewrite is not connected yet.")}>
                <span aria-hidden="true">✨</span> AI Rewrite
              </button>
              <button type="button" className="mailer-send-btn" onClick={sendMailer} disabled={sending}>
                <span aria-hidden="true">🕐</span> {sending ? "Sending…" : "Send"}
              </button>
            </div>

            {lastResult && (
              <div className={`mailer-result-banner ${lastResult.status === "Sent" ? "success" : lastResult.status === "Failed" ? "error" : "info"}`}>
                Status: {lastResult.status}{lastResult.errorMessage ? ` — ${lastResult.errorMessage}` : ""}
              </div>
            )}
          </section>
        </main>
      </div>

      {showLogsModal && (
        <MailerLogsModal
          advertisers={advertisers}
          affiliates={affiliates}
          onClose={() => setShowLogsModal(false)}
        />
      )}

      {showSmtpModal && (
        <SmtpSettingsModal onClose={() => setShowSmtpModal(false)} />
      )}
    </div>
  );
}

function MailerLogsModal({ advertisers, affiliates, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const loadLogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(MAILER_LOGS_API, { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load mailer logs");
        const data = await response.json();
        setLogs(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setLogs([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadLogs();
    return () => controller.abort();
  }, []);

  const personLabel = (list, id) => {
    const person = list.find((item) => String(item.id) === String(id));
    return person ? personName(person) : id ? `#${id}` : "-";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="mailer-modal mailer-logs-modal" onClick={(event) => event.stopPropagation()}>
        <div className="mailer-modal-header">
          <h2><span aria-hidden="true">📋</span> Mailer Logs</h2>
          <button type="button" className="mailer-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="mailer-modal-body">
          <div className="mailer-logs-table-scroll">
            <table className="mailer-logs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Advertiser</th>
                  <th>Affiliate</th>
                  <th>Recipients</th>
                  <th>Subject</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Sent On</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="8" className="mailer-empty">Loading mailer logs…</td></tr>}
                {!loading && logs.length === 0 && <tr><td colSpan="8" className="mailer-empty">No Data available</td></tr>}
                {!loading && logs.map((log) => (
                  <tr key={log.id}>
                    <td>#{log.id}</td>
                    <td>{personLabel(advertisers, log.advertiserId)}</td>
                    <td>{personLabel(affiliates, log.affiliateId)}</td>
                    <td>{log.recipientCount}</td>
                    <td>{log.subject}</td>
                    <td>{log.schedule}</td>
                    <td>{log.status}</td>
                    <td>{log.sentOn ? new Date(log.sentOn).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmtpSettingsModal({ onClose }) {
  const [form, setForm] = useState({ id: null, host: "", port: 587, username: "", password: "", fromEmail: "", fromName: "", useSsl: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadActive = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${SMTP_API}/active`, { headers: { accept: "*/*" }, signal: controller.signal });
        if (response.ok) {
          const data = await response.json();
          setForm({
            id: data.id,
            host: data.host || "",
            port: data.port || 587,
            username: data.username || "",
            password: data.password || "",
            fromEmail: data.fromEmail || "",
            fromName: data.fromName || "",
            useSsl: data.useSsl ?? true,
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") { /* no settings configured yet */ }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadActive();
    return () => controller.abort();
  }, []);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const saveSettings = async () => {
    if (!form.host.trim()) {
      alert("Please enter the SMTP host.");
      return;
    }
    const payload = {
      host: form.host.trim(),
      port: Number(form.port) || 587,
      username: form.username.trim() || null,
      password: form.password || null,
      fromEmail: form.fromEmail.trim() || null,
      fromName: form.fromName.trim() || null,
      useSsl: form.useSsl,
    };
    try {
      setSaving(true);
      const response = await fetch(form.id ? `${SMTP_API}/${form.id}` : SMTP_API, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Unable to save SMTP settings");
      alert("SMTP settings saved.");
      onClose();
    } catch {
      alert("Unable to save SMTP settings. Please check the API and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="mailer-modal" onClick={(event) => event.stopPropagation()}>
        <div className="mailer-modal-header">
          <h2><span aria-hidden="true">📤</span> SMTP Settings</h2>
          <button type="button" className="mailer-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="mailer-modal-body">
          {loading ? (
            <p className="mailer-empty">Loading SMTP settings…</p>
          ) : (
            <>
              <div className="mailer-field">
                <label>Host</label>
                <input value={form.host} onChange={(event) => updateField("host", event.target.value)} placeholder="smtp.gmail.com" />
              </div>
              <div className="mailer-field">
                <label>Port</label>
                <input type="number" value={form.port} onChange={(event) => updateField("port", event.target.value)} />
              </div>
              <div className="mailer-field">
                <label>Username</label>
                <input value={form.username} onChange={(event) => updateField("username", event.target.value)} />
              </div>
              <div className="mailer-field">
                <label>Password</label>
                <input type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} />
              </div>
              <div className="mailer-field">
                <label>From Email</label>
                <input value={form.fromEmail} onChange={(event) => updateField("fromEmail", event.target.value)} />
              </div>
              <div className="mailer-field">
                <label>From Name</label>
                <input value={form.fromName} onChange={(event) => updateField("fromName", event.target.value)} />
              </div>
              <label className="mailer-checkbox-row">
                <input type="checkbox" checked={form.useSsl} onChange={(event) => updateField("useSsl", event.target.checked)} />
                Use SSL
              </label>

              <div className="mailer-modal-footer">
                <button type="button" className="mailer-send-btn" onClick={saveSettings} disabled={saving}>
                  {saving ? "Saving…" : "Save SMTP Settings"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
