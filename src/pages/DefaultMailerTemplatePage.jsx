import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/MailerPage.css";
import "../css/DefaultMailerTemplatePage.css";

const DEFAULT_TEMPLATES_API = "https://localhost:7150/api/DefaultMailerTemplates";

export default function DefaultMailerTemplatePage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState("");
  const [edits, setEdits] = useState({});
  const [resetAll, setResetAll] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(DEFAULT_TEMPLATES_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load templates");
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.items || data.data || [];
      setTemplates(list);
      setEdits(
        Object.fromEntries(list.map((template) => [template.templateKey, { subject: template.subject || "", body: template.body || "" }]))
      );
      if (list.length > 0 && !activeKey) setActiveKey(list[0].templateKey);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeTemplate = templates.find((template) => template.templateKey === activeKey);
  const activeEdit = edits[activeKey] || { subject: "", body: "" };

  const updateActiveField = (field, value) => {
    setEdits((current) => ({ ...current, [activeKey]: { ...current[activeKey], [field]: value } }));
  };

  const submit = async () => {
    try {
      setSaving(true);
      if (resetAll) {
        const response = await fetch(`${DEFAULT_TEMPLATES_API}/reset-all`, { method: "POST", headers: { accept: "*/*" } });
        if (!response.ok) throw new Error("Unable to reset templates");
        setResetAll(false);
        await loadTemplates();
        alert("All templates have been reset to their defaults.");
      } else {
        if (!activeKey) return;
        const response = await fetch(`${DEFAULT_TEMPLATES_API}/${activeKey}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", accept: "*/*" },
          body: JSON.stringify({ subject: activeEdit.subject, body: activeEdit.body }),
        });
        if (!response.ok) throw new Error("Unable to save template");
        await loadTemplates();
        alert("Template saved.");
      }
    } catch {
      alert("Unable to save the template. Please check the API and try again.");
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

        <main className="mailer-page">
          <section className="mailer-card default-template-header">
            <h1><span aria-hidden="true">{"{}"}</span> Default Mailer Template</h1>
            <div className="mailer-toolbar-actions">
              <button type="button" className="mailer-button" onClick={() => navigate("/tools/mailer/custom-templates")}>
                <span aria-hidden="true">{"{}"}</span> Custom Templates
              </button>
              <button type="button" className="mailer-button" onClick={() => navigate("/tools/mailer")}>
                <span aria-hidden="true">📧</span> Mailer
              </button>
            </div>
          </section>

          <div className="default-template-tabs">
            {templates.map((template) => (
              <button
                type="button"
                key={template.templateKey}
                className={`default-template-tab ${activeKey === template.templateKey ? "active" : ""}`}
                onClick={() => setActiveKey(template.templateKey)}
              >
                {template.label}
              </button>
            ))}
          </div>

          <section className="mailer-card default-template-body">
            {loading ? (
              <p className="mailer-empty">Loading templates…</p>
            ) : !activeTemplate ? (
              <p className="mailer-empty">No templates available.</p>
            ) : (
              <>
                <div className="default-template-field">
                  <label>Subject</label>
                  <input value={activeEdit.subject} onChange={(event) => updateActiveField("subject", event.target.value)} />
                </div>

                <div className="default-template-field">
                  <label>Body</label>
                  <div className="mailer-editor default-template-editor">
                    <div className="mailer-editor-toolbar">
                      {["📁", "↶", "↷", "❝❝", "B", "I", "U", "S", "🔗", "🖼", "📊", "≡"].map((icon, index) => (
                        <button type="button" key={index} onClick={() => {}}>{icon}</button>
                      ))}
                      <select disabled><option>Styles</option></select>
                      <select disabled><option>Format</option></select>
                    </div>
                    <textarea value={activeEdit.body} onChange={(event) => updateActiveField("body", event.target.value)} />
                  </div>
                </div>
              </>
            )}
          </section>

          <div className="default-template-footer">
            <label className="mailer-checkbox-row">
              <input type="checkbox" checked={resetAll} onChange={(event) => setResetAll(event.target.checked)} />
              Reset all Templates
            </label>
            <button type="button" className="mailer-send-btn" onClick={submit} disabled={saving}>
              <span aria-hidden="true">🕐</span> {saving ? "Saving…" : "Submit"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
