import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../css/PostbackPage.css";
import "../css/MobileAttributionPage.css";
import "../css/OfferSyncPage.css";

const TODAY_STATS = [
  { key: "synced", label: "Synced Offers", value: 0 },
  { key: "new", label: "New Offers", value: 0 },
  { key: "requests", label: "Sync Requests", value: 28 },
  { key: "failed", label: "Failed Sync", value: 0 },
];

const INTEGRATED_PARTNERS = [
  { name: "Offer18", color: "#f27f2c", style: "italic" },
  { name: "Avazu2.2", color: "#e0263e", style: "bold" },
  { name: "Cake", color: "#1a1a2e", style: "boxed" },
  { name: "8lions", color: "#b8860b", style: "serif" },
  { name: "Adeals", color: "#1f78d1", style: "bold" },
  { name: "Adgagaa", color: "#2f9e44", style: "bold" },
  { name: "AdinALL", color: "#f2b705", style: "bold" },
  { name: "Adknock", color: "#e8590c", style: "bold" },
  { name: "Admax", color: "#e03131", style: "bold" },
  { name: "Admile", color: "#f76707", style: "bold" },
  { name: "admobgeek", color: "#7048e8", style: "bold" },
  { name: "Adorca", color: "#1864ab", style: "bold" },
  { name: "Adperio", color: "#1f78d1", style: "bold" },
  { name: "Adwool", color: "#495057", style: "bold" },
  { name: "Affise", color: "#7c3aed", style: "bold" },
  { name: "Affle", color: "#f76707", style: "bold" },
  { name: "Afftrack", color: "#2b8a3e", style: "bold" },
  { name: "AlfaConverr", color: "#c92a2a", style: "bold" },
  { name: "Altrooz", color: "#6741d9", style: "bold" },
  { name: "Apetab", color: "#1098ad", style: "bold" },
  { name: "Appcoachs", color: "#0ca678", style: "bold" },
  { name: "AppFlood", color: "#1f78d1", style: "bold" },
  { name: "AppicMedia", color: "#e64980", style: "bold" },
  { name: "applift", color: "#e8590c", style: "bold" },
  { name: "Appsilon", color: "#495057", style: "bold" },
  { name: "Art of Click", color: "#e64980", style: "bold" },
  { name: "avazu", color: "#e0263e", style: "bold" },
  { name: "Baidu", color: "#d62828", style: "bold" },
  { name: "Batmobi", color: "#2f9e44", style: "bold" },
  { name: "Blue Track Media", color: "#495057", style: "bold" },
  { name: "Brusmedia", color: "#1971c2", style: "bold" },
  { name: "Bumper Mobi", color: "#f59f00", style: "bold" },
  { name: "Cauly", color: "#1c7ed6", style: "bold" },
  { name: "CpiTraffic", color: "#862e9c", style: "bold" },
  { name: "CurateMobile", color: "#0c8599", style: "bold" },
  { name: "Cygobel", color: "#495057", style: "bold" },
  { name: "DailybestApps", color: "#1f78d1", style: "bold" },
  { name: "Display.io", color: "#495057", style: "bold" },
  { name: "dofun", color: "#1971c2", style: "bold" },
  { name: "Dreamkmobi", color: "#868e96", style: "bold" },
  { name: "echo226", color: "#f59f00", style: "bold" },
  { name: "EverFlow", color: "#5f3dc4", style: "bold" },
  { name: "Fuseclick", color: "#1a1a2e", style: "bold" },
  { name: "GamesPipe", color: "#f76707", style: "bold" },
  { name: "Gazetm", color: "#495057", style: "bold" },
  { name: "Glispa", color: "#f2b705", style: "bold" },
  { name: "Glispa 1.1", color: "#f2b705", style: "bold" },
  { name: "Gmamobi", color: "#1c7ed6", style: "bold" },
  { name: "Gourdmobi", color: "#2f9e44", style: "bold" },
  { name: "Greenapp", color: "#2f9e44", style: "bold" },
  { name: "hangMyAds", color: "#e64980", style: "bold" },
  { name: "hasOffers", color: "#1f78d1", style: "bold" },
  { name: "heheMobi", color: "#0c8599", style: "bold" },
  { name: "heheMobi v4", color: "#0c8599", style: "bold" },
];

export default function OfferSyncPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState("");

  const filteredPartners = INTEGRATED_PARTNERS.filter((partner) =>
    partner.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="of-layout">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="of-main">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((value) => !value)}
        />

        <main className="mobile-attribution-page">
          <section className="offer-sync-header-card">
            <h1><span aria-hidden="true">⟳</span> Offer Sync</h1>
            <div className="offer-sync-header-actions">
              <input
                type="text"
                className="offer-sync-search"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="button" className="offer-sync-sync-logs-btn">
                <span aria-hidden="true">≡</span> Sync Logs
              </button>
            </div>
          </section>

          <h4 className="offer-sync-subtitle">Today Statistics</h4>
          <div className="offer-sync-stats-grid">
            {TODAY_STATS.map((stat) => (
              <div className="offer-sync-stat-card" key={stat.key}>
                <p className="offer-sync-stat-label">{stat.label}</p>
                <p className="offer-sync-stat-value">{stat.value}</p>
              </div>
            ))}
          </div>

          <h3 className="mobile-attribution-section-title offer-sync-section-heading">
            <span aria-hidden="true">⚡</span> Active API (1)
          </h3>
          <div className="offer-sync-partners-grid offer-sync-active-grid">
            <div className="mobile-attribution-card offer-sync-partner-card">
              <p className="mobile-attribution-card-name">Offer18</p>
              <div className="offer-sync-logo-badge logo-offer18">Offer18</div>
              <p className="offer-sync-partner-subname">Offer18</p>
              <div className="mobile-attribution-card-buttons">
                <button type="button" className="mobile-attribution-btn offer-sync-manage-btn">
                  Manage <span aria-hidden="true">▾</span>
                </button>
              </div>
            </div>
          </div>

          <h3 className="mobile-attribution-section-title offer-sync-section-heading">
            <span aria-hidden="true">🗂</span> Integrated Partners ({INTEGRATED_PARTNERS.length})
          </h3>
          <div className="offer-sync-partners-grid">
            {filteredPartners.length === 0 ? (
              <p className="offer-sync-no-results">No partners found.</p>
            ) : (
              filteredPartners.map((partner) => (
                <div className="mobile-attribution-card offer-sync-partner-card" key={partner.name}>
                  <div
                    className={`offer-sync-logo-badge offer-sync-logo-${partner.style}`}
                    style={{ color: partner.color }}
                  >
                    {partner.name}
                  </div>
                  <p className="offer-sync-partner-subname">{partner.name}</p>
                  <div className="mobile-attribution-card-buttons">
                    <button
                      type="button"
                      className="mobile-attribution-btn"
                      onClick={() => alert(`${partner.name} - Setup is not connected yet.`)}
                    >
                      <span aria-hidden="true">+</span> Setup
                    </button>
                    {partner.name === "Offer18" && (
                      <button type="button" className="mobile-attribution-btn offer-sync-manage-btn">
                        Manage <span aria-hidden="true">▾</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
