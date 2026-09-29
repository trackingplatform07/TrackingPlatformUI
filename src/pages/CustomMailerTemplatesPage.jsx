import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/MailerPage.css";
import "../css/DefaultMailerTemplatePage.css";

const TEMPLATES_API = "https://localhost:7150/api/MailerTemplates";
const NEW_TAB_KEY = "__new__";

const emptyForm = { name: "", subject: "", body: "" };

export default function CustomMailerTemplatesPage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState(NEW_TAB_KEY);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(TEMPLATES_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load templates");
      const data = await response.json();
      setTemplates(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const selectTab = (key) => {
    setActiveKey(key);
    if (key === NEW_TAB_KEY) {
      setForm(emptyForm);
      return;
    }
    const template = templates.find((item) => String(item.id) === String(key));
    if (template) {
      setForm({ name: template.name || "", subject: template.subject || "", body: template.body || "" });
    }
  };

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    if (!form.name.trim()) {
      alert("Please enter name.");
      return;
    }
    const isNew = activeKey === NEW_TAB_KEY;
    try {
      setSaving(true);
      const response = await fetch(isNew ? TEMPLATES_API : `${TEMPLATES_API}/${activeKey}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({ name: form.name.trim(), subject: form.subject, body: form.body }),
      });
      if (!response.ok) throw new Error("Unable to save template");
      const saved = await response.json();
      await loadTemplates();
      setActiveKey(isNew ? String(saved.id ?? NEW_TAB_KEY) : activeKey);
      if (isNew) setForm(emptyForm);
      alert("Template saved.");
    } catch {
      alert("Unable to save the template. Please check the API and try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteActiveTemplate = async () => {
    if (activeKey === NEW_TAB_KEY) return;
    if (!window.confirm(`Delete template "${form.name}"?`)) return;
    try {
      const response = await fetch(`${TEMPLATES_API}/${activeKey}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to delete template");
      await loadTemplates();
      selectTab(NEW_TAB_KEY);
    } catch {
      alert("Unable to delete the template. Please check the API and try again.");
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
            <h1><span aria-hidden="true">{"{}"}</span> Custom Mailer Template</h1>
            <div className="mailer-toolbar-actions">
              <button type="button" className="mailer-button" onClick={() => navigate("/tools/mailer/templates")}>
                <span aria-hidden="true">{"{}"}</span> Default Templates
              </button>
              <button type="button" className="mailer-button" onClick={() => navigate("/tools/mailer")}>
                <span aria-hidden="true">📧</span> Mailer
              </button>
            </div>
          </section>

          <div className="default-template-tabs">
            <button
              type="button"
              className={`default-template-tab ${activeKey === NEW_TAB_KEY ? "active" : ""}`}
              onClick={() => selectTab(NEW_TAB_KEY)}
            >
              Create New Template
            </button>
            {templates.map((template) => (
              <button
                type="button"
                key={template.id}
                className={`default-template-tab ${String(activeKey) === String(template.id) ? "active" : ""}`}
                onClick={() => selectTab(String(template.id))}
              >
                {template.name}
              </button>
            ))}
          </div>

          <section className="mailer-card default-template-body">
            {loading ? (
              <p className="mailer-empty">Loading templates…</p>
            ) : (
              <>
                <div className="default-template-field">
                  <label>Name</label>
                  <input placeholder="Please enter name" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
                </div>

                <div className="default-template-field">
                  <label>Subject</label>
                  <input placeholder="Welcome Email" value={form.subject} onChange={(event) => updateField("subject", event.target.value)} />
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
                    <textarea value={form.body} onChange={(event) => updateField("body", event.target.value)} />
                  </div>
                </div>
              </>
            )}
          </section>

          <div className="default-template-footer">
            {activeKey !== NEW_TAB_KEY && (
              <button type="button" className="mailer-button" onClick={deleteActiveTemplate}>Delete Template</button>
            )}
            <button type="button" className="mailer-send-btn" onClick={submit} disabled={saving}>
              <span aria-hidden="true">🕐</span> {saving ? "Saving…" : "Submit"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
