import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/CreateOfferPage.css";
import "../css/SuppressionListPage.css";

const SUPPRESSION_LISTS_API = "https://localhost:7150/api/SuppressionLists";
const OFFERS_API = "https://localhost:7150/api/Offers";

const buildEmptyForm = () => ({
  name: "",
  offerId: "",
  sourceType: "URL",
  url: "",
  unsubscribeUrl: "",
  subjectLines: "",
  fromLines: "",
});

export default function SuppressionListPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [view, setView] = useState("list");

  const [lists, setLists] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [offerFilter, setOfferFilter] = useState("");
  const [showEntries, setShowEntries] = useState(20);

  const [form, setForm] = useState(buildEmptyForm);

  useEffect(() => {
    const controller = new AbortController();

    const loadOffers = async () => {
      try {
        setOffersLoading(true);
        const response = await fetch(OFFERS_API, { headers: { accept: "*/*" }, signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load offers");
        const data = await response.json();
        setOffers(Array.isArray(data) ? data : data.items || data.data || []);
      } catch (error) {
        if (error.name !== "AbortError") setOffers([]);
      } finally {
        if (!controller.signal.aborted) setOffersLoading(false);
      }
    };

    loadOffers();
    return () => controller.abort();
  }, []);

  const loadLists = async () => {
    try {
      setListsLoading(true);
      setListError("");
      const response = await fetch(SUPPRESSION_LISTS_API, { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load suppression lists");
      const data = await response.json();
      setLists(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setListError("Unable to load suppression lists. Please check the API and try again.");
    } finally {
      setListsLoading(false);
    }
  };

  useEffect(() => {
    if (view === "list") loadLists();
  }, [view]);

  const offerLabel = (offerId) => {
    const offer = offers.find((item) => String(item.id) === String(offerId));
    return offer ? `${offer.id} ~ ${offer.offerName}` : offerId ? String(offerId) : "-";
  };

  const filteredLists = useMemo(() => {
    const term = search.trim().toLowerCase();
    return lists.filter((row) => {
      if (offerFilter && String(row.offerId) !== String(offerFilter)) return false;
      if (!term) return true;
      return [row.name, offerLabel(row.offerId)].some((value) => String(value || "").toLowerCase().includes(term));
    });
  }, [lists, search, offerFilter, offers]);

  const visibleLists = filteredLists.slice(0, Number(showEntries) || filteredLists.length);

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const openCreate = () => {
    setForm(buildEmptyForm());
    setEditingId(null);
    setView("form");
  };

  const openEdit = (row) => {
    setForm({
      name: row.name || "",
      offerId: row.offerId || "",
      sourceType: row.sourceType || "URL",
      url: row.url || "",
      unsubscribeUrl: row.unsubscribeUrl || "",
      subjectLines: row.subjectLines || "",
      fromLines: row.fromLines || "",
    });
    setEditingId(row.id);
    setView("form");
  };

  const deleteList = async (id) => {
    if (!window.confirm("Delete this suppression list?")) return;
    try {
      const response = await fetch(`${SUPPRESSION_LISTS_API}/${id}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to delete suppression list");
      await loadLists();
    } catch {
      alert("Unable to delete the suppression list. Please check the API and try again.");
    }
  };

  const submitForm = async () => {
    if (!form.name.trim()) {
      alert("Please enter a suppression list name.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        offerId: form.offerId ? Number(form.offerId) : 0,
        name: form.name.trim(),
        sourceType: form.sourceType,
        url: form.url,
        unsubscribeUrl: form.unsubscribeUrl,
        subjectLines: form.subjectLines,
        fromLines: form.fromLines,
      };

      const response = await fetch(
        editingId ? `${SUPPRESSION_LISTS_API}/${editingId}` : SUPPRESSION_LISTS_API,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", accept: "*/*" },
          body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
        }
      );
      if (!response.ok) throw new Error("Unable to save suppression list");
      setView("list");
    } catch {
      alert("Unable to save the suppression list. Please check the API and try again.");
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

        <main className="suppression-page">
          {view === "list" && (
            <div className="offer-form suppression-tab suppression-page-card">
              <div className="events-section-header">
                <h2><span aria-hidden="true">📧</span> Suppression List</h2>
                <div className="events-section-actions suppression-list-toolbar">
                  <button type="button" className="events-dark-btn" onClick={openCreate}>+ Add List</button>
                  <select value={offerFilter} onChange={(event) => setOfferFilter(event.target.value)} disabled={offersLoading}>
                    <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                    {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                  </select>
                  <div className="suppression-search">
                    <span aria-hidden="true">🔍</span>
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" aria-label="Search suppression lists" />
                  </div>
                  <label className="suppression-entries">Show
                    <input type="number" min="5" value={showEntries} onChange={(event) => setShowEntries(event.target.value)} aria-label="Suppression lists per page" />
                    entries
                  </label>
                </div>
              </div>

              <div className="events-table-wrap">
                <table className="events-table automation-table">
                  <thead>
                    <tr><th>Name</th><th>OfferID</th><th>File</th><th>Last Updated</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {listsLoading && (
                      <tr><td colSpan="5" className="automation-empty-cell">Loading suppression lists…</td></tr>
                    )}
                    {!listsLoading && listError && (
                      <tr><td colSpan="5" className="automation-empty-cell offer-save-error">{listError}</td></tr>
                    )}
                    {!listsLoading && !listError && visibleLists.length === 0 && (
                      <tr><td colSpan="5" className="automation-empty-cell">No data available</td></tr>
                    )}
                    {!listsLoading && visibleLists.map((row) => (
                      <tr key={row.id}>
                        <td><button type="button" className="suppression-link" onClick={() => openEdit(row)}>{row.name}</button></td>
                        <td>{offerLabel(row.offerId)}</td>
                        <td>{row.url ? <>{row.sourceType || "URL"} <span aria-hidden="true">⬆</span></> : "-"}</td>
                        <td>{new Date(row.modifiedOn || row.createdOn).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                        <td className="events-table-action-cell">
                          <button type="button" title="Edit" onClick={() => openEdit(row)}>✎</button>
                          <button type="button" title="Delete" className="automation-delete-btn" onClick={() => deleteList(row.id)}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!listsLoading && filteredLists.length > 0 && (
                <div className="suppression-pagination">
                  <span>Showing 1 to {visibleLists.length} of {filteredLists.length} entries</span>
                  <div className="suppression-pagination-buttons">
                    <button type="button" disabled>Previous</button>
                    <span className="suppression-page-number">1</span>
                    <button type="button" disabled>Next</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "form" && (
            <div className="offer-form suppression-tab suppression-page-card">
              <div className="events-section-header">
                <h2><span aria-hidden="true">📧</span> {editingId ? "Edit Suppression List" : "Create Suppression List"}</h2>
                <div className="events-section-actions">
                  <button type="button" className="events-dark-btn" onClick={() => setView("list")}>☰ Suppression List</button>
                </div>
              </div>

              <div className="events-settings-row">
                <div className="events-settings-field fallback-wide-field">
                  <label>Name</label>
                  <input type="text" placeholder="Suppression List Name" value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
                </div>
              </div>
              <div className="events-settings-row">
                <div className="events-settings-field fallback-wide-field">
                  <label>Offer</label>
                  <select value={form.offerId} onChange={(event) => updateForm("offerId", event.target.value)} disabled={offersLoading}>
                    <option value="">{offersLoading ? "Loading offers…" : "Select Offer"}</option>
                    {offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>)}
                  </select>
                </div>
              </div>

              <div className="events-section-divider" />

              <h2 className="fallback-section-title">Email Opt-out</h2>
              <div className="events-settings-row">
                <div className="events-settings-field fallback-wide-field">
                  <label>Suppression List</label>
                  <select value={form.sourceType} onChange={(event) => updateForm("sourceType", event.target.value)}>
                    <option>URL</option>
                    <option>File Upload</option>
                  </select>
                </div>
              </div>
              <div className="events-settings-row">
                <div className="events-settings-field fallback-wide-field">
                  <label>URL</label>
                  <input type="text" placeholder="Suppression File Download URL" value={form.url} onChange={(event) => updateForm("url", event.target.value)} />
                </div>
              </div>
              <div className="events-settings-row">
                <div className="events-settings-field fallback-wide-field">
                  <label>Unsubscribe URL</label>
                  <input type="text" placeholder="Unsubscribe URL" value={form.unsubscribeUrl} onChange={(event) => updateForm("unsubscribeUrl", event.target.value)} />
                </div>
              </div>

              <div className="events-section-divider" />

              <h2 className="fallback-section-title">Email Instructions</h2>
              <div className="events-settings-row fallback-textarea-row">
                <div className="events-settings-field fallback-wide-field fallback-textarea-field">
                  <label>Subject Lines</label>
                  <textarea placeholder="Subject lines" value={form.subjectLines} onChange={(event) => updateForm("subjectLines", event.target.value)} />
                </div>
              </div>
              <div className="events-settings-row fallback-textarea-row">
                <div className="events-settings-field fallback-wide-field fallback-textarea-field">
                  <label>From Lines</label>
                  <textarea placeholder="From lines" value={form.fromLines} onChange={(event) => updateForm("fromLines", event.target.value)} />
                </div>
              </div>

              <div className="suppression-submit-row">
                <button type="button" className="events-dark-btn" onClick={submitForm} disabled={saving}>{saving ? "Saving…" : "⊕ Submit"}</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
