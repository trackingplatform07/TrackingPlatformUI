import React, { useMemo, useState } from "react";
import { FaChevronDown, FaEdit, FaExchangeAlt, FaGlobe, FaPuzzlePiece, FaSearch, FaSortAmountDown } from "react-icons/fa";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/SmartOffersPage.css";

const smartOffers = [
  { id: 26916, offerId: "22036077", name: "Smart Offer 26916", status: "active", sorting: "Random", subOffers: 0 },
  { id: 104, offerId: "21873471", name: "Smart Offer 104", status: "expired", sorting: "Random", subOffers: 0 },
  { id: 1095, offerId: "21477318", name: "Smart Offer 1095", status: "expired", sorting: "Random", subOffers: 2 },
];

export default function SmartOffersPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedId, setSelectedId] = useState(smartOffers[0].id);

  const filteredOffers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return smartOffers.filter((offer) => {
      if (activeTab === "active" && offer.status !== "active") return false;
      if (activeTab === "expired" && offer.status !== "expired") return false;
      if (!term) return true;
      return [offer.name, offer.offerId].some((value) => String(value).toLowerCase().includes(term));
    });
  }, [search, activeTab]);

  const selectedOffer = smartOffers.find((offer) => offer.id === selectedId) || smartOffers[0];

  const counts = {
    all: smartOffers.length,
    active: smartOffers.filter((offer) => offer.status === "active").length,
    expired: smartOffers.filter((offer) => offer.status === "expired").length,
  };

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="smart-offers-page">
          <section className="smart-offers-list-card">
            <div className="smart-offers-list-header">
              <h1><span className="smart-offers-icon" aria-hidden="true">◆</span> Smart Offers <span className="smart-offers-count">{smartOffers.length}</span></h1>
              <button type="button" className="smart-offers-new-btn">
                + New <FaChevronDown />
              </button>
            </div>

            <div className="smart-offers-search">
              <FaSearch aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Offers or IDs" aria-label="Search smart offers" />
            </div>

            <div className="smart-offers-tabs">
              <button type="button" className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>All {counts.all}</button>
              <button type="button" className={activeTab === "active" ? "active" : ""} onClick={() => setActiveTab("active")}>Active {counts.active}</button>
              <button type="button" className={activeTab === "expired" ? "active" : ""} onClick={() => setActiveTab("expired")}>Expired {counts.expired}</button>
            </div>

            <div className="smart-offers-items">
              {filteredOffers.length === 0 && <p className="smart-offers-empty">No smart offers found.</p>}
              {filteredOffers.map((offer) => (
                <button
                  type="button"
                  key={offer.id}
                  className={`smart-offer-item${offer.id === selectedOffer.id ? " selected" : ""}`}
                  onClick={() => setSelectedId(offer.id)}
                >
                  <span className={`smart-offer-dot ${offer.status}`} aria-hidden="true" />
                  <span className="smart-offer-item-body">
                    <span className="smart-offer-item-title">{offer.name}</span>
                    <span className="smart-offer-item-tags">
                      <span className="smart-offer-tag">#{offer.offerId}</span>
                      <span className="smart-offer-tag"><FaExchangeAlt /> {offer.sorting}</span>
                      <span className="smart-offer-tag"><FaPuzzlePiece /> {offer.subOffers} sub</span>
                      {offer.status === "expired" && <span className="smart-offer-badge">Expired</span>}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="smart-offer-detail-card">
            <div className="smart-offer-detail-header">
              <div className="smart-offer-breadcrumb">
                <span>Smart Offer</span>
                <span aria-hidden="true">›</span>
                <span className="smart-offer-breadcrumb-id">#{selectedOffer.offerId}</span>
              </div>
              <button type="button" className="smart-offer-options-btn">
                <span aria-hidden="true">☰</span> Options
              </button>
            </div>

            <div className="smart-offer-metrics">
              {[
                { label: "Today Clicks", value: "0" },
                { label: "Today Conv", value: "0" },
                { label: "CR", value: "0.00%" },
                { label: "EPC", value: "USD 0.00" },
                { label: "Sub Offers", value: `${selectedOffer.subOffers}/50` },
              ].map((metric) => (
                <div className="smart-offer-metric" key={metric.label}>
                  <span className="smart-offer-metric-label">{metric.label.toUpperCase()}</span>
                  <span className="smart-offer-metric-value">{metric.value}</span>
                </div>
              ))}
            </div>

            <div className="smart-offer-routing-card">
              <div className="smart-offer-routing-header">
                <div>
                  <h2>Routing &amp; Sub Offers</h2>
                  <p>Traffic split &amp; live performance</p>
                </div>
                <button type="button" className="smart-offer-edit-btn" onClick={() => alert("Editing routing & sub offers is not connected yet.")}>
                  <FaEdit /> Edit
                </button>
              </div>

              <div className="smart-offer-routing-filters">
                <span><FaSortAmountDown /> Sorting</span>
                <span className="smart-offer-filter-pill">{selectedOffer.sorting}</span>
                <span><FaGlobe /> Target Geo</span>
                <span className="smart-offer-filter-pill">All Countries</span>
              </div>

              <div className="smart-offer-routing-body">
                {selectedOffer.subOffers === 0 ? (
                  <p className="smart-offer-routing-empty">No sub Offers configured yet.</p>
                ) : (
                  <p className="smart-offer-routing-empty">{selectedOffer.subOffers} sub offer(s) configured.</p>
                )}
              </div>

              <div className="smart-offer-routing-footer">
                <span>All Countries · {selectedOffer.subOffers} active sub Offers</span>
                <span className="smart-offer-routing-total">Traffic totals 100%</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
