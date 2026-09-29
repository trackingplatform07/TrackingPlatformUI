import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBolt, FaBullseye, FaChartBar, FaCheck, FaClock, FaDesktop, FaEdit, FaEllipsisV, FaEnvelope, FaFileImport, FaFilter, FaGift, FaGlobe, FaLink, FaList, FaLock, FaPlus, FaPlusCircle, FaRegSquare, FaSearch, FaShareAlt, FaSync, FaTags, FaTrash, FaUnlock, FaUserPlus, FaUsers } from "react-icons/fa";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/OffersLivePage.css";

const API_URL = "https://localhost:7150/api/Offers";

const isEnded = (status) => ["end", "ended"].includes(String(status || "").trim().toLowerCase());

const isLiveToday = (offer) => {
  const status = String(offer.status || "").trim().toLowerCase();
  if (isEnded(status) || status === "pending" || status === "rejected") return false;

  const now = new Date();
  const startDate = offer.startDate ? new Date(offer.startDate) : null;
  const endDate = offer.endDate ? new Date(offer.endDate) : null;

  if (startDate && startDate > now) return false;
  if (endDate && endDate < now) return false;

  return true;
};

const priceLabel = (price, currency) => {
  const numericPrice = Number(price || 0);
  return `${Number.isFinite(numericPrice) ? numericPrice : 0} ${currency || "-"}`;
};

const formatDateOnly = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function OffersLivePage() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");
  const [newCategoryRows, setNewCategoryRows] = useState([""]);
  const [editedCategoryIds, setEditedCategoryIds] = useState([]);
  const [categoryActionError, setCategoryActionError] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);

  const [showEventsModal, setShowEventsModal] = useState(false);
  const [eventGoals, setEventGoals] = useState([]);
  const [eventGoalsLoading, setEventGoalsLoading] = useState(false);
  const [eventGoalsError, setEventGoalsError] = useState("");
  const [newEventRows, setNewEventRows] = useState([{ token: "", eventName: "" }]);
  const [editedEventIds, setEditedEventIds] = useState([]);
  const [eventActionError, setEventActionError] = useState("");
  const [eventSaving, setEventSaving] = useState(false);

  const [showTopOffersModal, setShowTopOffersModal] = useState(false);
  const [topOffersView, setTopOffersView] = useState("list");
  const [topOffers, setTopOffers] = useState([]);
  const [topOffersLoading, setTopOffersLoading] = useState(false);
  const [topOffersSelectedId, setTopOffersSelectedId] = useState("");
  const [topOffersSaving, setTopOffersSaving] = useState(false);

  const [showMailerModal, setShowMailerModal] = useState(false);
  const [mailerSource, setMailerSource] = useState("top");
  const [affiliates, setAffiliates] = useState([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(false);
  const [mailerAffiliateId, setMailerAffiliateId] = useState("");
  const [mailerBulkApproved, setMailerBulkApproved] = useState(true);
  const [mailerEmails, setMailerEmails] = useState("");
  const [mailerSubject, setMailerSubject] = useState(
    () => `Top Offers Available - ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
  );
  const [mailerSending, setMailerSending] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLiveOffers() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(API_URL, {
          headers: { accept: "*/*" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load offers");

        const data = await response.json();
        const items = Array.isArray(data) ? data : data.items || data.data || [];
        setOffers(items.filter(isLiveToday));
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setOffers([]);
          setError("Unable to load live offers. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadLiveOffers();
    return () => controller.abort();
  }, []);

  const loadCategoriesForModal = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError("");
      const response = await fetch("https://localhost:7150/api/OfferCategories", { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load offer categories");
      const data = await response.json();
      setCategories((Array.isArray(data) ? data : data.items || data.data || []).filter((category) => category.isActive !== false));
    } catch {
      setCategoriesError("Unable to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const openCategoryModal = () => {
    setNewCategoryRows([""]);
    setEditedCategoryIds([]);
    setCategoryActionError("");
    setShowCategoryModal(true);
    loadCategoriesForModal();
  };

  const updateNewCategoryRow = (index, value) => {
    setNewCategoryRows((rows) => rows.map((row, rowIndex) => rowIndex === index ? value : row));
  };

  const updateExistingCategory = (id, offerCategoryName) => {
    setCategories((items) => items.map((category) => category.id === id ? { ...category, offerCategoryName } : category));
    setEditedCategoryIds((ids) => ids.includes(id) ? ids : [...ids, id]);
  };

  const saveNewCategories = async () => {
    const names = [...new Set(newCategoryRows.map((name) => name.trim()).filter(Boolean))];
    const changedCategories = categories.filter((category) => editedCategoryIds.includes(category.id));
    if (!names.length && !changedCategories.length) {
      setCategoryActionError("Enter a new category name or edit an existing category before saving.");
      return;
    }
    if (changedCategories.some((category) => !category.offerCategoryName.trim())) {
      setCategoryActionError("Category names cannot be empty.");
      return;
    }

    try {
      setCategorySaving(true);
      setCategoryActionError("");
      const now = new Date().toISOString();
      const createRequests = names.map(async (offerCategoryName) => {
        const response = await fetch("https://localhost:7150/api/OfferCategories", {
          method: "POST",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify({ id: 0, offerCategoryName, createdOn: now, createdBy: "string", modifiedOn: now, modifiedBy: "string", isActive: true }),
        });
        if (!response.ok) throw new Error("Unable to save categories");
      });
      const updateRequests = changedCategories.map(async (category) => {
        const response = await fetch(`https://localhost:7150/api/OfferCategories/${category.id}`, {
          method: "PUT",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify({
            id: category.id,
            offerCategoryName: category.offerCategoryName.trim(),
            createdOn: category.createdOn || now,
            createdBy: category.createdBy || "string",
            modifiedOn: now,
            modifiedBy: "string",
            isActive: category.isActive !== false,
          }),
        });
        if (!response.ok) throw new Error("Unable to update category");
      });
      await Promise.all([...createRequests, ...updateRequests]);
      setNewCategoryRows([""]);
      setEditedCategoryIds([]);
      await loadCategoriesForModal();
    } catch {
      setCategoryActionError("Unable to save categories. Please try again.");
    } finally {
      setCategorySaving(false);
    }
  };

  const deleteCategory = async (category) => {
    if (!window.confirm(`Delete the "${category.offerCategoryName}" category?`)) return;

    try {
      setCategoryActionError("");
      const response = await fetch(`https://localhost:7150/api/OfferCategories/${category.id}`, {
        method: "DELETE",
        headers: { accept: "*/*" },
      });
      if (!response.ok) throw new Error("Unable to delete category");
      setCategories((items) => items.filter((item) => item.id !== category.id));
    } catch {
      setCategoryActionError("Unable to delete category. Please try again.");
    }
  };

  const loadEventGoalsForModal = async () => {
    try {
      setEventGoalsLoading(true);
      setEventGoalsError("");
      const response = await fetch("https://localhost:7150/api/EventGoals", { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load event goals");
      const data = await response.json();
      setEventGoals((Array.isArray(data) ? data : data.items || data.data || []).filter((row) => row.isActive !== false));
    } catch {
      setEventGoalsError("Unable to load events");
    } finally {
      setEventGoalsLoading(false);
    }
  };

  const openEventsModal = () => {
    setNewEventRows([{ token: "", eventName: "" }]);
    setEditedEventIds([]);
    setEventActionError("");
    setShowEventsModal(true);
    loadEventGoalsForModal();
  };

  const updateNewEventRow = (index, field, value) => {
    setNewEventRows((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  };

  const updateExistingEventGoal = (id, field, value) => {
    setEventGoals((items) => items.map((row) => row.id === id ? { ...row, [field]: value } : row));
    setEditedEventIds((ids) => ids.includes(id) ? ids : [...ids, id]);
  };

  const saveEventGoals = async () => {
    const newRows = newEventRows.filter((row) => row.token.trim() || row.eventName.trim());
    const changedEvents = eventGoals.filter((row) => editedEventIds.includes(row.id));
    if (!newRows.length && !changedEvents.length) {
      setEventActionError("Enter a new event or edit an existing one before saving.");
      return;
    }
    if (changedEvents.some((row) => !row.token.trim() || !row.eventName.trim())) {
      setEventActionError("Event Token and Event Name cannot be empty.");
      return;
    }

    try {
      setEventSaving(true);
      setEventActionError("");
      const now = new Date().toISOString();
      const createRequests = newRows.map(async (row) => {
        const response = await fetch("https://localhost:7150/api/EventGoals", {
          method: "POST",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify({
            id: 0,
            offerId: null,
            eventName: row.eventName.trim(),
            token: row.token.trim(),
            multiConversion: "Allow",
            multiConversionIp: "Allow",
            approval: "Auto",
            createdOn: now,
            createdBy: "string",
            modifiedOn: now,
            modifiedBy: "string",
            isActive: true,
          }),
        });
        if (!response.ok) throw new Error("Unable to save events");
      });
      const updateRequests = changedEvents.map(async (row) => {
        const response = await fetch(`https://localhost:7150/api/EventGoals/${row.id}`, {
          method: "PUT",
          headers: { accept: "*/*", "Content-Type": "application/json" },
          body: JSON.stringify({
            id: row.id,
            offerId: row.offerId ?? null,
            eventName: row.eventName.trim(),
            token: row.token.trim(),
            multiConversion: row.multiConversion || "Allow",
            multiConversionIp: row.multiConversionIp || "Allow",
            approval: row.approval || "Auto",
            createdOn: row.createdOn || now,
            createdBy: row.createdBy || "string",
            modifiedOn: now,
            modifiedBy: "string",
            isActive: row.isActive !== false,
          }),
        });
        if (!response.ok) throw new Error("Unable to update event");
      });
      await Promise.all([...createRequests, ...updateRequests]);
      setNewEventRows([{ token: "", eventName: "" }]);
      setEditedEventIds([]);
      await loadEventGoalsForModal();
    } catch {
      setEventActionError("Unable to save events. Please try again.");
    } finally {
      setEventSaving(false);
    }
  };

  const loadTopOffers = async () => {
    try {
      setTopOffersLoading(true);
      const response = await fetch("https://localhost:7150/api/TopOffers", { headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to load top offers");
      const data = await response.json();
      setTopOffers(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setTopOffers([]);
    } finally {
      setTopOffersLoading(false);
    }
  };

  const openTopOffersModal = () => {
    setTopOffersView("list");
    setShowTopOffersModal(true);
    loadTopOffers();
  };

  const openAddTopOffer = () => {
    setTopOffersSelectedId("");
    setTopOffersView("add");
  };

  const submitTopOffer = async () => {
    if (!topOffersSelectedId) {
      alert("Please select an offer.");
      return;
    }
    if (topOffers.some((topOffer) => String(topOffer.offerId) === String(topOffersSelectedId))) {
      alert("This offer is already in the Top Offers list.");
      return;
    }

    try {
      setTopOffersSaving(true);
      const response = await fetch("https://localhost:7150/api/TopOffers", {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({ offerId: Number(topOffersSelectedId) }),
      });
      if (!response.ok) throw new Error("Unable to add top offer");
      await loadTopOffers();
      setTopOffersView("list");
    } catch {
      alert("Unable to add this offer to Top Offers. Please check the API and try again.");
    } finally {
      setTopOffersSaving(false);
    }
  };

  const removeTopOffer = async (id) => {
    if (!window.confirm("Remove this offer from Top Offers?")) return;
    try {
      const response = await fetch(`https://localhost:7150/api/TopOffers/${id}`, { method: "DELETE", headers: { accept: "*/*" } });
      if (!response.ok) throw new Error("Unable to remove top offer");
      await loadTopOffers();
    } catch {
      alert("Unable to remove this top offer. Please check the API and try again.");
    }
  };

  const topOfferSourceOffer = (topOffer) => offers.find((offer) => String(offer.id) === String(topOffer.offerId));

  const openMailerModal = (source = "top") => {
    if (source === "selected" && selectedIds.length === 0) {
      alert("Select at least one offer from the list first (use the row checkboxes).");
      return;
    }
    setMailerSource(source);
    setMailerAffiliateId("");
    setMailerBulkApproved(true);
    setMailerEmails("");
    setMailerSubject(
      source === "selected"
        ? `Offers Available - ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
        : `Top Offers Available - ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
    );
    setShowMailerModal(true);
    if (!affiliates.length) {
      (async () => {
        try {
          setAffiliatesLoading(true);
          const response = await fetch("https://localhost:7029/api/Affiliates", { headers: { accept: "*/*" } });
          if (!response.ok) throw new Error("Unable to load affiliates");
          const data = await response.json();
          setAffiliates(Array.isArray(data) ? data : data.items || data.data || []);
        } catch {
          setAffiliates([]);
        } finally {
          setAffiliatesLoading(false);
        }
      })();
    }
  };

  const affiliateName = (affiliate) =>
    [affiliate.firstName, affiliate.lastName].filter(Boolean).join(" ") || affiliate.companyName || "Unnamed Affiliate";

  const mailerSelectedOffers = useMemo(
    () => offers.filter((offer) => selectedIds.includes(offer.id)),
    [offers, selectedIds]
  );

  const sendMailer = async () => {
    if (mailerSource === "top" && !topOffers.length) {
      alert("Add at least one Top Offer before sending.");
      return;
    }
    if (mailerSource === "selected" && !mailerSelectedOffers.length) {
      alert("Select at least one offer from the list first (use the row checkboxes).");
      return;
    }
    if (!mailerAffiliateId && !mailerBulkApproved) {
      alert("Please select an affiliate or enable Bulk Affiliates : Approved.");
      return;
    }

    try {
      setMailerSending(true);
      const response = await fetch("https://localhost:7150/api/TopOfferMailerLogs", {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "*/*" },
        body: JSON.stringify({
          affiliateId: mailerAffiliateId ? Number(mailerAffiliateId) : null,
          bulkApproved: mailerBulkApproved,
          emails: mailerEmails.trim() || null,
          subject: mailerSubject.trim() || null,
          source: mailerSource === "selected" ? "SelectedOffers" : "TopOffers",
          topOfferIds: mailerSource === "top" ? topOffers.map((topOffer) => topOffer.id).join(",") : null,
          offerIds: mailerSource === "selected" ? mailerSelectedOffers.map((offer) => offer.id).join(",") : null,
        }),
      });
      if (!response.ok) throw new Error("Unable to save the mailer send");
      alert(`${mailerSource === "selected" ? "Offer" : "Top Offers"} mailer saved and queued for sending.`);
      setShowMailerModal(false);
    } catch {
      alert("Unable to save the mailer send. Please check the API and try again.");
    } finally {
      setMailerSending(false);
    }
  };

  const filteredOffers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return offers;
    return offers.filter((offer) =>
      [offer.id, offer.offerName, offer.appId, offer.externalOfferId, offer.offerType]
        .some((value) => String(value || "").toLowerCase().includes(term))
    );
  }, [offers, search]);

  const totalPages = Math.max(1, Math.ceil(filteredOffers.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const visibleOffers = filteredOffers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const updateSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const updateItemsPerPage = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const toggleOffer = (id) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const selectOffers = (predicate) => {
    setSelectedIds(filteredOffers.filter(predicate).map((offer) => offer.id));
    setOpenMenu(null);
  };

  const normalizedStatus = (offer) => String(offer.status || "").trim().toLowerCase();

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="live-offers-page">
          <section className="live-offers-card">
            <div className="live-offers-toolbar">
              <h1><FaBolt /> Offers</h1>
              <div className="live-offers-actions">
                <button type="button" className="live-offers-button primary" onClick={() => navigate("/offers/create")}><FaPlusCircle /> Create Offer</button>
                <button type="button" className="live-offers-button" onClick={openEventsModal}><FaBullseye /> Events</button>
                <button type="button" className="live-offers-button" onClick={openCategoryModal}><FaList /> Categories</button>
                <button type="button" className="live-offers-button" onClick={openTopOffersModal}><FaTags /> Top Offers</button>
                <button type="button" className="live-offers-button" onClick={() => openMailerModal("selected")}><FaEnvelope /> Offer Mailer</button>
                <button type="button" className="live-offers-button" onClick={() => navigate("/import")}><FaFileImport /> Import</button>
                <div className="live-offers-search">
                  <FaSearch aria-hidden="true" />
                  <input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search" aria-label="Search live offers" />
                </div>
                <label className="live-offers-entries">Show
                  <select value={itemsPerPage} onChange={(event) => updateItemsPerPage(event.target.value)} aria-label="Offers per page">
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                  entries
                </label>
                <button type="button" className="live-offers-filter" title="Live offers filter"><FaFilter /></button>
              </div>
            </div>

            <div className="live-offers-table-scroll">
              <table className="live-offers-table">
                <thead>
                  <tr>
                    <th className="live-offers-action-header">
                      <div className="live-offers-menu-wrapper">
                        <button
                          type="button"
                          className="live-offers-action-trigger"
                          aria-expanded={openMenu === "action"}
                          onClick={() => setOpenMenu(openMenu === "action" ? null : "action")}
                        >
                          Action <span aria-hidden="true">▼</span>
                        </button>

                        {openMenu === "action" && (
                          <div className="live-offers-action-dropdown">
                            <div className="live-offers-dropdown-section">
                              <div className="live-offers-dropdown-title">Select</div>
                              <button type="button" className="live-offers-dropdown-item" onClick={() => selectOffers(() => true)}>Select All</button>
                              <button type="button" className="live-offers-dropdown-item" onClick={() => selectOffers((offer) => normalizedStatus(offer) === "approved" || normalizedStatus(offer) === "approve")}>Select Approved</button>
                              <button type="button" className="live-offers-dropdown-item" onClick={() => selectOffers((offer) => normalizedStatus(offer) === "pending")}>Select Pending</button>
                              <button type="button" className="live-offers-dropdown-item" onClick={() => selectOffers((offer) => isEnded(normalizedStatus(offer)))}>Select Ended</button>
                            </div>

                            <div className="live-offers-dropdown-section">
                              <div className="live-offers-dropdown-title">Change Status</div>
                              <button type="button" className="live-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaCheck /> Approve</button>
                              <button type="button" className="live-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaClock /> Pending</button>
                              <button type="button" className="live-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaRegSquare /> End</button>
                            </div>

                            <div className="live-offers-dropdown-section">
                              <div className="live-offers-dropdown-title">Change Visibility</div>
                              <button type="button" className="live-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaGlobe /> Public</button>
                              <button type="button" className="live-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaUnlock /> Public + Approval</button>
                              <button type="button" className="live-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaLock /> Private</button>
                            </div>

                            <div className="live-offers-dropdown-section">
                              <button type="button" className="live-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaPlus /> Add to Top Offers</button>
                            </div>
                            <div className="live-offers-dropdown-section">
                              <button type="button" className="live-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaTrash /> Delete</button>
                              <span className="live-offers-dropdown-note">(Created/Inactive - last 15 days)</span>
                            </div>
                            <div className="live-offers-dropdown-section">
                              <button type="button" className="live-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaUserPlus /> Assign Affiliates</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </th>
                    <th>Logo</th>
                    <th>Offer</th>
                    <th>TargetGeo</th>
                    <th>Revenue</th>
                    <th>Payout</th>
                    <th>Status</th>
                    <th>Options</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="8" className="live-offers-message">Loading live offers…</td></tr>}
                  {!loading && error && <tr><td colSpan="8" className="live-offers-message error">{error}</td></tr>}
                  {!loading && !error && visibleOffers.length === 0 && <tr><td colSpan="8" className="live-offers-message">No data available</td></tr>}
                  {!loading && !error && visibleOffers.map((offer) => (
                    <tr key={offer.id}>
                      <td><input type="checkbox" checked={selectedIds.includes(offer.id)} onChange={() => toggleOffer(offer.id)} aria-label={`Select ${offer.offerName || `offer ${offer.id}`}`} /></td>
                      <td>
                        {offer.uploadLogo ? <img className="live-offers-logo" src={offer.uploadLogo} alt="" /> : <div className="live-offers-logo-placeholder" aria-hidden="true"><FaGift /></div>}
                      </td>
                      <td><button type="button" className="live-offers-name" onClick={() => navigate(`/offers/${offer.id}/edit`)}>{offer.id} : {offer.offerName || "Untitled offer"}</button></td>
                      <td><span className="live-offers-geo">◎</span> {offer.targetGeo || "All Countries"}</td>
                      <td>{priceLabel(offer.advertiserPrice, offer.advertiserCurrency)}</td>
                      <td>{priceLabel(offer.affiliatePrice, offer.affiliateCurrency || offer.advertiserCurrency)}</td>
                      <td><span className="live-offers-status">◎ Live</span></td>
                      <td>
                        <div className="live-offers-menu-wrapper">
                          <button
                            type="button"
                            className="live-offers-options"
                            title={`Options for ${offer.offerName || "offer"}`}
                            aria-label={`Options for ${offer.offerName || "offer"}`}
                            aria-expanded={openMenu === offer.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenMenu(openMenu === offer.id ? null : offer.id);
                            }}
                          >
                            <FaEllipsisV />
                          </button>

                          {openMenu === offer.id && (
                            <div className="live-offers-row-dropdown">
                              <button type="button" className="live-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaLink /> Affiliate Tracking URL</button>
                              <button type="button" className="live-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaChartBar /> Reports</button>
                              <button type="button" className="live-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaUsers /> Affiliates</button>
                              <button type="button" className="live-offers-dropdown-item" onClick={() => setOpenMenu(null)}><FaDesktop /> Advertiser Test Link</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && !error && filteredOffers.length > 0 && (
              <footer className="live-offers-pagination">
                <span>Showing {(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, filteredOffers.length)} of {filteredOffers.length}</span>
                <div>
                  <button type="button" disabled={page === 1} onClick={() => setCurrentPage((value) => value - 1)}>Previous</button>
                  <span>{page} / {totalPages}</span>
                  <button type="button" disabled={page === totalPages} onClick={() => setCurrentPage((value) => value + 1)}>Next</button>
                </div>
              </footer>
            )}
          </section>
        </main>
      </div>

      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content category-manager-modal" onClick={(event) => event.stopPropagation()}>
            <div className="category-manager-header">
              <h3>☰ <span>Offer Categories</span></h3>
              <button type="button" onClick={() => setShowCategoryModal(false)} aria-label="Close categories">×</button>
            </div>
            <div className="category-manager-table" role="region" aria-label="Offer categories">
              <div className="category-manager-table-head"><span>Category</span><span>Action</span></div>
              {categoriesLoading && <p className="category-manager-message">Loading categories…</p>}
              {!categoriesLoading && categories.map((category) => (
                <div className="category-manager-row" key={category.id}>
                  <input value={category.offerCategoryName} onChange={(event) => updateExistingCategory(category.id, event.target.value)} aria-label={`Category ${category.offerCategoryName}`} />
                  <button type="button" className="category-delete-button" onClick={() => deleteCategory(category)} aria-label={`Delete ${category.offerCategoryName}`}>▣</button>
                </div>
              ))}
              {!categoriesLoading && !categories.length && <p className="category-manager-message">No categories found.</p>}
              {newCategoryRows.map((name, index) => (
                <div className="category-manager-row category-manager-new-row" key={`new-${index}`}>
                  <button type="button" className="category-add-button" onClick={() => index === newCategoryRows.length - 1 && setNewCategoryRows((rows) => [...rows, ""])} aria-label="Add category row">+</button>
                  <input value={name} onChange={(event) => updateNewCategoryRow(index, event.target.value)} placeholder="Enter category name" aria-label={`New category ${index + 1}`} />
                </div>
              ))}
            </div>
            {(categoriesError || categoryActionError) && <p className="category-manager-error">{categoryActionError || categoriesError}</p>}
            <div className="category-manager-actions">
              <button type="button" className="category-submit-button" disabled={categorySaving} onClick={saveNewCategories}>{categorySaving ? "Saving…" : "◉ Submit"}</button>
            </div>
          </div>
        </div>
      )}

      {showEventsModal && (
        <div className="modal-overlay" onClick={() => setShowEventsModal(false)}>
          <div className="modal-content events-manager-modal" onClick={(event) => event.stopPropagation()}>
            <div className="category-manager-header">
              <h3>◈ <span>Offer Events/Goals</span></h3>
              <button type="button" onClick={() => setShowEventsModal(false)} aria-label="Close events">×</button>
            </div>
            <div className="events-manager-table" role="region" aria-label="Offer events and goals">
              <div className="events-manager-table-head"><span>Event Token</span><span>Event Name</span><span>Postback</span></div>
              {eventGoalsLoading && <p className="category-manager-message">Loading events…</p>}
              {!eventGoalsLoading && eventGoals.map((row) => (
                <div className="events-manager-row" key={row.id}>
                  <input value={row.token || ""} onChange={(event) => updateExistingEventGoal(row.id, "token", event.target.value)} aria-label={`Event token ${row.token}`} />
                  <input value={row.eventName || ""} onChange={(event) => updateExistingEventGoal(row.id, "eventName", event.target.value)} aria-label={`Event name ${row.eventName}`} />
                  <button type="button" className="events-manager-postback-btn" onClick={() => alert("Postback is not connected yet.")}>Postback</button>
                </div>
              ))}
              {!eventGoalsLoading && !eventGoals.length && <p className="category-manager-message">No events found.</p>}
              {newEventRows.map((row, index) => (
                <div className="events-manager-row events-manager-new-row" key={`new-${index}`}>
                  <button type="button" className="category-add-button" onClick={() => index === newEventRows.length - 1 && setNewEventRows((rows) => [...rows, { token: "", eventName: "" }])} aria-label="Add event row">+</button>
                  <input value={row.token} onChange={(event) => updateNewEventRow(index, "token", event.target.value)} placeholder="New Event Token" aria-label={`New event token ${index + 1}`} />
                  <input value={row.eventName} onChange={(event) => updateNewEventRow(index, "eventName", event.target.value)} placeholder="New Event Name" aria-label={`New event name ${index + 1}`} />
                </div>
              ))}
            </div>
            {(eventGoalsError || eventActionError) && <p className="category-manager-error">{eventActionError || eventGoalsError}</p>}
            <div className="category-manager-actions">
              <button type="button" className="category-submit-button" disabled={eventSaving} onClick={saveEventGoals}>{eventSaving ? "Saving…" : "◉ Submit"}</button>
            </div>
          </div>
        </div>
      )}

      {showTopOffersModal && (
        <div className="modal-overlay" onClick={() => setShowTopOffersModal(false)}>
          <div className="top-offers-modal" onClick={(event) => event.stopPropagation()}>
            <div className="top-offers-header">
              <h3><button type="button" className="top-offers-refresh" onClick={loadTopOffers} aria-label="Refresh"><FaSync /></button> Top Offers</h3>
              <div className="top-offers-header-actions">
                <button type="button" className="live-offers-button" onClick={openAddTopOffer}><FaPlus /> Add Offers</button>
                <button type="button" className="live-offers-button" onClick={() => openMailerModal("top")}><FaShareAlt /> Top Offers Mailer</button>
                <button type="button" className="top-offers-close" onClick={() => setShowTopOffersModal(false)} aria-label="Close">×</button>
              </div>
            </div>

            {topOffersView === "list" && (
              <div className="top-offers-body">
                {topOffersLoading && <p className="category-manager-message">Loading top offers…</p>}
                {!topOffersLoading && topOffers.length === 0 && <p className="category-manager-message">No top offers added yet.</p>}
                <div className="top-offers-grid">
                  {!topOffersLoading && topOffers.map((topOffer) => {
                    const offer = topOfferSourceOffer(topOffer);
                    return (
                      <div className="top-offer-card" key={topOffer.id}>
                        {offer?.uploadLogo ? <img src={offer.uploadLogo} alt="" /> : <div className="top-offer-card-logo-placeholder" aria-hidden="true"><FaGift /></div>}
                        <button type="button" className="top-offer-card-name" onClick={() => navigate(`/offers/${topOffer.offerId}/edit`)}>
                          {topOffer.offerId}: {offer?.offerName || "Unknown offer"}
                        </button>
                        <div className="top-offer-card-actions">
                          <button type="button" className="top-offer-card-edit" onClick={() => navigate(`/offers/${topOffer.offerId}/edit`)}><FaEdit /> Edit</button>
                          <button type="button" className="top-offer-card-remove" onClick={() => removeTopOffer(topOffer.id)}><FaTrash /> Remove</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {topOffersView === "add" && (
              <div className="top-offers-add-body">
                <label className="top-offers-add-label">Select Offer</label>
                <select value={topOffersSelectedId} onChange={(event) => setTopOffersSelectedId(event.target.value)} disabled={loading}>
                  <option value="">Select Offer</option>
                  {offers.filter((offer) => !topOffers.some((item) => String(item.offerId) === String(offer.id))).map((offer) => (
                    <option key={offer.id} value={offer.id}>{offer.id} ~ {offer.offerName}</option>
                  ))}
                </select>
                <button type="button" className="top-offers-submit" onClick={submitTopOffer} disabled={topOffersSaving}>
                  <span aria-hidden="true">🕐</span> {topOffersSaving ? "Saving…" : "Submit"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showMailerModal && (
        <div className="modal-overlay" onClick={() => setShowMailerModal(false)}>
          <div className="top-offers-modal mailer-modal" onClick={(event) => event.stopPropagation()}>
            <div className="top-offers-header">
              <h3>
                {mailerSource === "top" && <button type="button" className="top-offers-refresh" onClick={loadTopOffers} aria-label="Refresh"><FaSync /></button>}
                {mailerSource === "selected" ? <><FaEnvelope /> Offer Mailer</> : "Top Offers"}
              </h3>
              <div className="top-offers-header-actions">
                <button type="button" className="top-offers-close" onClick={() => setShowMailerModal(false)} aria-label="Close">×</button>
              </div>
            </div>

            <div className="mailer-body">
              <div className="mailer-field">
                <label>Select Affiliate</label>
                {mailerAffiliateId ? (
                  <span className="ctit-chip">
                    {(() => {
                      const affiliate = affiliates.find((item) => String(item.id) === String(mailerAffiliateId));
                      return affiliate ? affiliateName(affiliate) : mailerAffiliateId;
                    })()}
                    <button type="button" onClick={() => setMailerAffiliateId("")} aria-label="Clear affiliate">×</button>
                  </span>
                ) : (
                  <select value={mailerAffiliateId} onChange={(event) => setMailerAffiliateId(event.target.value)} disabled={affiliatesLoading}>
                    <option value="">{affiliatesLoading ? "Loading affiliates…" : "Select Affiliate"}</option>
                    {affiliates.map((affiliate) => <option key={affiliate.id} value={affiliate.id}>{affiliate.id} ~ {affiliateName(affiliate)}</option>)}
                  </select>
                )}
              </div>

              <label className="mailer-bulk-checkbox">
                <input type="checkbox" checked={mailerBulkApproved} onChange={(event) => setMailerBulkApproved(event.target.checked)} />
                Bulk Affiliates : Approved
              </label>

              <div className="mailer-field">
                <label>Custom Email</label>
                <div className="mailer-email-box">
                  <span className="ctit-chip mailer-url-chip">
                    https://demo40.offer18.com/m/#offers_top
                  </span>
                  <input
                    value={mailerEmails}
                    onChange={(event) => setMailerEmails(event.target.value)}
                    placeholder="email@example.com,support@example.com"
                  />
                </div>
              </div>

              <div className="mailer-field">
                <label>Subject</label>
                <input value={mailerSubject} onChange={(event) => setMailerSubject(event.target.value)} />
              </div>

              <div className="mailer-field">
                <label>Body</label>
                <div className="mailer-editor">
                  <div className="mailer-editor-toolbar" aria-hidden="true">
                    <span>↺</span><span>≡</span><span>❞</span><span className="mailer-toolbar-bold">B</span><span className="mailer-toolbar-italic">I</span><span className="mailer-toolbar-underline">U</span><span>S</span><span>🔗</span><span>⛔</span><span>🖼</span><span>▦</span><span>≡</span>
                    <span className="mailer-toolbar-dropdown">Styles ▾</span>
                    <span className="mailer-toolbar-dropdown">Format ▾</span>
                  </div>
                  <div className="mailer-editor-table-wrap">
                    <table className="mailer-editor-table">
                      <thead>
                        {mailerSource === "top" ? (
                          <tr>
                            <th>OfferID ~ OfferName</th>
                            <th>Description</th>
                            <th>KPI</th>
                            <th>TargetGeo</th>
                            <th>Payout</th>
                            <th>PreviewURL</th>
                            <th>StartDate - EndDate</th>
                          </tr>
                        ) : (
                          <tr>
                            <th>OfferID ~ OfferName</th>
                            <th>TargetGeo</th>
                            <th>Payout</th>
                            <th>StartDate - EndDate</th>
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {mailerSource === "top" && topOffers.map((topOffer) => {
                          const offer = topOfferSourceOffer(topOffer);
                          return (
                            <tr key={topOffer.id}>
                              <td>{topOffer.offerId} ~ {offer?.offerName || "Unknown offer"}</td>
                              <td>{topOffer.description || ""}</td>
                              <td>{topOffer.kpi || ""}</td>
                              <td className="mailer-editor-geo">{offer?.targetGeo || "All Countries"}</td>
                              <td>{offer ? `${Number(offer.affiliatePrice || 0)} ${offer.affiliateCurrency || offer.advertiserCurrency || ""}` : ""}</td>
                              <td>{topOffer.previewUrl || ""}</td>
                              <td>{formatDateOnly(offer?.startDate)} - {formatDateOnly(offer?.endDate)}</td>
                            </tr>
                          );
                        })}
                        {mailerSource === "selected" && mailerSelectedOffers.map((offer) => (
                          <tr key={offer.id}>
                            <td>{offer.id} ~ {offer.offerName}</td>
                            <td className="mailer-editor-geo">{offer.targetGeo || "All Countries"}</td>
                            <td>{`${Number(offer.affiliatePrice || 0)} ${offer.affiliateCurrency || offer.advertiserCurrency || ""}`}</td>
                            <td>{formatDateOnly(offer.startDate)} - {formatDateOnly(offer.endDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <button type="button" className="mailer-send-btn" onClick={sendMailer} disabled={mailerSending}>
                <span aria-hidden="true">🕐</span> {mailerSending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
